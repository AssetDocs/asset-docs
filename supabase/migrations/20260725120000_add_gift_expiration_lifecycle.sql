ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS expired_at timestamptz;

ALTER TABLE public.entitlements
  DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE public.entitlements
  ADD CONSTRAINT valid_status
  CHECK (status IN ('active', 'past_due', 'canceled', 'inactive', 'trialing', 'expired'));

ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS expiration_30_day_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS expiration_15_day_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS expiration_3_day_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS expiration_day_email_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_entitlements_gift_expiration_due
  ON public.entitlements (expires_at)
  WHERE entitlement_source = 'gift' AND status IN ('active', 'trialing');

CREATE OR REPLACE FUNCTION public.claim_due_gift_expiration_notices(p_limit integer DEFAULT 100)
RETURNS TABLE (
  gift_id uuid,
  notice_type text,
  recipient_email text,
  recipient_first_name text,
  purchaser_email text,
  expiration_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS MATERIALIZED (
    SELECT
      gs.id AS gift_id,
      gs.recipient_email,
      COALESCE(NULLIF(p.first_name, ''), NULLIF(gs.recipient_name, ''), split_part(gs.recipient_email, '@', 1), 'there') AS recipient_first_name,
      gs.purchaser_email,
      e.expires_at AS expiration_date,
      CASE
        WHEN e.expires_at <= now()
          AND gs.expiration_day_email_sent_at IS NULL
          THEN 'expiration_day'
        WHEN e.expires_at > now()
          AND e.expires_at <= now() + interval '3 days'
          AND gs.expiration_3_day_email_sent_at IS NULL
          THEN 'three_day'
        WHEN e.expires_at > now() + interval '3 days'
          AND e.expires_at <= now() + interval '15 days'
          AND gs.expiration_15_day_email_sent_at IS NULL
          THEN 'fifteen_day'
        WHEN e.expires_at > now() + interval '15 days'
          AND e.expires_at <= now() + interval '30 days'
          AND gs.expiration_30_day_email_sent_at IS NULL
          THEN 'thirty_day'
        ELSE NULL
      END AS notice_type
    FROM public.entitlements e
    JOIN public.gift_subscriptions gs
      ON e.source_event_id = 'gift:' || gs.id::text
    LEFT JOIN public.profiles p
      ON p.user_id = e.user_id
    WHERE COALESCE(e.entitlement_source, '') = 'gift'
      AND e.expires_at IS NOT NULL
      AND e.expires_at <= now() + interval '30 days'
      AND gs.redemption_status = 'redeemed'
      AND gs.recipient_email IS NOT NULL
      AND COALESCE(gs.payment_status, '') = 'paid'
      AND gs.refunded_at IS NULL
      AND gs.cancelled_at IS NULL
      AND gs.manually_voided_at IS NULL
      AND (
        e.status IN ('active', 'trialing')
        OR (e.status = 'expired' AND e.expires_at <= now())
      )
    ORDER BY e.expires_at ASC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500))
    FOR UPDATE OF gs SKIP LOCKED
  ),
  claimed AS (
    UPDATE public.gift_subscriptions gs
    SET
      expiration_30_day_email_sent_at = CASE
        WHEN c.notice_type = 'thirty_day' THEN now()
        ELSE gs.expiration_30_day_email_sent_at
      END,
      expiration_15_day_email_sent_at = CASE
        WHEN c.notice_type = 'fifteen_day' THEN now()
        ELSE gs.expiration_15_day_email_sent_at
      END,
      expiration_3_day_email_sent_at = CASE
        WHEN c.notice_type = 'three_day' THEN now()
        ELSE gs.expiration_3_day_email_sent_at
      END,
      expiration_day_email_sent_at = CASE
        WHEN c.notice_type = 'expiration_day' THEN now()
        ELSE gs.expiration_day_email_sent_at
      END,
      updated_at = now()
    FROM candidates c
    WHERE gs.id = c.gift_id
      AND c.notice_type IS NOT NULL
    RETURNING
      c.gift_id,
      c.notice_type,
      c.recipient_email,
      c.recipient_first_name,
      c.purchaser_email,
      c.expiration_date
  )
  SELECT
    claimed.gift_id,
    claimed.notice_type,
    claimed.recipient_email,
    claimed.recipient_first_name,
    claimed.purchaser_email,
    claimed.expiration_date
  FROM claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_gift_entitlements(p_limit integer DEFAULT 250)
RETURNS TABLE (
  user_id uuid,
  gift_id uuid,
  purchaser_email text,
  recipient_email text,
  expiration_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH expired AS MATERIALIZED (
    SELECT
      e.user_id,
      e.expires_at AS expiration_date,
      gs.id AS gift_id,
      gs.purchaser_email,
      gs.recipient_email
    FROM public.entitlements e
    JOIN public.gift_subscriptions gs
      ON e.source_event_id = 'gift:' || gs.id::text
    WHERE COALESCE(e.entitlement_source, '') = 'gift'
      AND e.status IN ('active', 'trialing')
      AND e.expires_at IS NOT NULL
      AND e.expires_at <= now()
      AND COALESCE(gs.payment_status, '') = 'paid'
      AND gs.redemption_status = 'redeemed'
    ORDER BY e.expires_at ASC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 250), 1000))
    FOR UPDATE OF e SKIP LOCKED
  ),
  entitlement_updates AS (
    UPDATE public.entitlements e
    SET
      status = 'expired',
      subscription_status = 'expired',
      billing_status = 'expired',
      expired_at = COALESCE(e.expired_at, now()),
      updated_at = now()
    FROM expired x
    WHERE e.user_id = x.user_id
      AND COALESCE(e.entitlement_source, '') = 'gift'
      AND e.status IN ('active', 'trialing')
    RETURNING e.user_id
  ),
  profile_updates AS (
    UPDATE public.profiles p
    SET
      account_status = 'expired_read_only',
      plan_status = 'canceled',
      current_period_end = x.expiration_date,
      updated_at = now()
    FROM expired x
    JOIN entitlement_updates eu ON eu.user_id = x.user_id
    WHERE p.user_id = x.user_id
      AND COALESCE(p.account_status, 'active') NOT IN ('deletion_requested', 'scheduled_for_deletion', 'deleted')
    RETURNING p.user_id
  ),
  subscriber_updates AS (
    UPDATE public.subscribers s
    SET
      subscribed = false,
      subscription_tier = 'free',
      subscription_end = x.expiration_date,
      updated_at = now()
    FROM expired x
    JOIN entitlement_updates eu ON eu.user_id = x.user_id
    WHERE s.user_id = x.user_id
    RETURNING s.user_id
  )
  SELECT
    x.user_id,
    x.gift_id,
    x.purchaser_email,
    x.recipient_email,
    x.expiration_date
  FROM expired x
  JOIN entitlement_updates eu ON eu.user_id = x.user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_due_gift_expiration_notices(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_gift_entitlements(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_gift_expiration_notices(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_gift_entitlements(integer) TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'expire-gift-entitlements',
  'Daily gift subscription expiration and reminder sweeper',
  1440,
  1560,
  1800
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

NOTIFY pgrst, 'reload schema';
