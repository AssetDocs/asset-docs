-- Allow legitimately re-created/live auth users to sign in even when an older
-- account under the same email remains retained as a deleted-account tombstone.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.is_deleted_account_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  WITH normalized AS (
    SELECT lower(trim(p_email)) AS email
  )
  SELECT EXISTS (
    SELECT 1
    FROM public.deleted_accounts da
    CROSS JOIN normalized n
    WHERE (
      lower(da.email) = n.email
      OR da.email_hash = encode(extensions.digest(n.email, 'sha256'), 'hex')
    )
  )
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users au
    CROSS JOIN normalized n
    WHERE lower(au.email) = n.email
  );
$$;

REVOKE ALL ON FUNCTION public.is_deleted_account_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_deleted_account_email(text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.is_deleted_account_email(text) IS
  'Blocks reuse of deleted-account emails unless a live auth.users row already exists for that email. Keeps deletion tombstones while allowing legitimately re-created accounts to sign in.';

-- Extend the existing hourly billing sweeper so period-ended cancel-at-period-end
-- entitlements cannot remain active after Stripe cancellation completes.
CREATE OR REPLACE FUNCTION public.expire_grace_periods()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  grace_profiles_affected integer := 0;
  canceled_entitlements_affected integer := 0;
  canceled_profiles_affected integer := 0;
BEGIN
  UPDATE public.profiles
  SET account_status = 'expired_read_only',
      updated_at = now()
  WHERE account_status = 'active'
    AND grace_period_ends_at IS NOT NULL
    AND grace_period_ends_at < now();
  GET DIAGNOSTICS grace_profiles_affected = ROW_COUNT;

  WITH stale_entitlements AS (
    UPDATE public.entitlements
    SET status = 'canceled',
        subscription_status = 'canceled',
        cancel_at_period_end = false,
        updated_at = now()
    WHERE cancel_at_period_end = true
      AND current_period_end IS NOT NULL
      AND current_period_end < now()
      AND status = 'active'
    RETURNING user_id
  ),
  stale_profiles AS (
    UPDATE public.profiles p
    SET account_status = 'expired_read_only',
        plan_status = 'canceled',
        updated_at = now()
    FROM stale_entitlements se
    WHERE p.user_id = se.user_id
      AND p.account_status NOT IN ('deletion_requested', 'scheduled_for_deletion', 'deleted')
    RETURNING p.user_id
  )
  SELECT
    (SELECT count(*) FROM stale_entitlements),
    (SELECT count(*) FROM stale_profiles)
  INTO canceled_entitlements_affected, canceled_profiles_affected;

  RETURN grace_profiles_affected + canceled_entitlements_affected + canceled_profiles_affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_grace_periods() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_grace_periods() TO service_role;

COMMENT ON FUNCTION public.expire_grace_periods() IS
  'Flips billing grace profiles and period-ended cancel-at-period-end entitlements to expired/canceled read-only states. Invoked hourly by pg_cron job "expire-subscription-grace-periods-hourly".';

-- One-time backfill for the stale-entitlement class, including the known
-- michaeljlewis2@gmail.com case if still stale at migration time.
SELECT public.expire_grace_periods();

NOTIFY pgrst, 'reload schema';
