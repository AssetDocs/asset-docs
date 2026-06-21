-- Retention-expiration support for tombstoned accounts.
-- The deleted_accounts tombstone remains as the permanent minimal reference;
-- this purges/unlinks retained operational records only after explicit
-- retention_expires_at and only when legal_hold is false.

ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retention_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS retention_purged_at timestamptz,
  ADD COLUMN IF NOT EXISTS retention_purge_status text NOT NULL DEFAULT 'not_due'
    CHECK (retention_purge_status IN ('not_due', 'eligible', 'purged', 'legal_hold'));

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_retention_due
  ON public.deleted_accounts(retention_expires_at)
  WHERE retention_expires_at IS NOT NULL
    AND retention_purged_at IS NULL;

CREATE OR REPLACE FUNCTION public.process_deleted_account_retention(
  p_dry_run boolean DEFAULT true,
  p_limit integer DEFAULT 100
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500);
  v_ids uuid[];
  v_id uuid;
  v_counts jsonb := '{}'::jsonb;
  v_deleted integer;
  v_unlinked integer;
BEGIN
  SELECT COALESCE(array_agg(id ORDER BY retention_expires_at ASC), ARRAY[]::uuid[])
    INTO v_ids
    FROM (
      SELECT id, retention_expires_at
      FROM public.deleted_accounts
      WHERE retention_expires_at IS NOT NULL
        AND retention_expires_at <= now()
        AND retention_purged_at IS NULL
        AND legal_hold IS NOT TRUE
      ORDER BY retention_expires_at ASC
      LIMIT v_limit
    ) due;

  IF p_dry_run THEN
    SELECT jsonb_build_object(
      'dry_run', true,
      'eligible_tombstones', COALESCE(array_length(v_ids, 1), 0),
      'tombstone_ids', COALESCE(to_jsonb(v_ids), '[]'::jsonb),
      'legal_hold_tombstones',
        (SELECT count(*) FROM public.deleted_accounts
         WHERE retention_expires_at IS NOT NULL
           AND retention_expires_at <= now()
           AND retention_purged_at IS NULL
           AND legal_hold IS TRUE)
    ) INTO v_counts;
    RETURN v_counts;
  END IF;

  v_counts := jsonb_build_object(
    'dry_run', false,
    'eligible_tombstones', COALESCE(array_length(v_ids, 1), 0)
  );

  FOREACH v_id IN ARRAY v_ids LOOP
    DELETE FROM public.payment_events WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{payment_events}', to_jsonb(COALESCE((v_counts->>'payment_events')::integer, 0) + v_deleted), true);

    DELETE FROM public.subscribers WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{subscribers}', to_jsonb(COALESCE((v_counts->>'subscribers')::integer, 0) + v_deleted), true);

    DELETE FROM public.user_activity_logs WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{user_activity_logs}', to_jsonb(COALESCE((v_counts->>'user_activity_logs')::integer, 0) + v_deleted), true);

    DELETE FROM public.checkout_fulfillments WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{checkout_fulfillments}', to_jsonb(COALESCE((v_counts->>'checkout_fulfillments')::integer, 0) + v_deleted), true);

    DELETE FROM public.checkout_session_audit WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{checkout_session_audit}', to_jsonb(COALESCE((v_counts->>'checkout_session_audit')::integer, 0) + v_deleted), true);

    DELETE FROM public.subscription_cancellations WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{subscription_cancellations}', to_jsonb(COALESCE((v_counts->>'subscription_cancellations')::integer, 0) + v_deleted), true);

    DELETE FROM public.account_closure_requests WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{account_closure_requests}', to_jsonb(COALESCE((v_counts->>'account_closure_requests')::integer, 0) + v_deleted), true);

    DELETE FROM public.account_deletion_requests WHERE deleted_account_id = v_id;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{account_deletion_requests}', to_jsonb(COALESCE((v_counts->>'account_deletion_requests')::integer, 0) + v_deleted), true);

    UPDATE public.gift_subscriptions
      SET purchaser_deleted_account_id = NULL
      WHERE purchaser_deleted_account_id = v_id;
    GET DIAGNOSTICS v_unlinked = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{gift_purchaser_links_unlinked}', to_jsonb(COALESCE((v_counts->>'gift_purchaser_links_unlinked')::integer, 0) + v_unlinked), true);

    UPDATE public.gift_subscriptions
      SET recipient_deleted_account_id = NULL
      WHERE recipient_deleted_account_id = v_id;
    GET DIAGNOSTICS v_unlinked = ROW_COUNT;
    v_counts := jsonb_set(v_counts, '{gift_recipient_links_unlinked}', to_jsonb(COALESCE((v_counts->>'gift_recipient_links_unlinked')::integer, 0) + v_unlinked), true);

    UPDATE public.deleted_accounts
      SET retention_purged_at = now(),
          retention_purge_status = 'purged'
      WHERE id = v_id;
  END LOOP;

  UPDATE public.deleted_accounts
    SET retention_purge_status = 'legal_hold'
    WHERE retention_expires_at IS NOT NULL
      AND retention_expires_at <= now()
      AND retention_purged_at IS NULL
      AND legal_hold IS TRUE;

  RETURN v_counts;
END $$;

REVOKE ALL ON FUNCTION public.process_deleted_account_retention(boolean, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_deleted_account_retention(boolean, integer)
  TO service_role;
