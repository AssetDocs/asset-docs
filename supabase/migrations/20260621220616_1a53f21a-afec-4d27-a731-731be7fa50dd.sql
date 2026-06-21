-- ===== 20260621120000_add_deleted_account_tombstone_refs.sql =====
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS former_user_id_hash text,
  ADD COLUMN IF NOT EXISTS deletion_status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS deletion_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retention_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

UPDATE public.deleted_accounts
SET
  email_hash = COALESCE(email_hash, encode(extensions.digest(lower(email), 'sha256'), 'hex')),
  former_user_id_hash = COALESCE(
    former_user_id_hash,
    CASE
      WHEN original_user_id IS NULL THEN NULL
      ELSE encode(extensions.digest(original_user_id::text, 'sha256'), 'hex')
    END
  )
WHERE email_hash IS NULL
  OR (original_user_id IS NOT NULL AND former_user_id_hash IS NULL);

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_email_hash
  ON public.deleted_accounts(email_hash);

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_retention_expires_at
  ON public.deleted_accounts(retention_expires_at)
  WHERE retention_expires_at IS NOT NULL;

ALTER TABLE public.subscribers
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.payment_events
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.user_activity_logs
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.checkout_fulfillments
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.checkout_session_audit
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.subscription_cancellations
  ALTER COLUMN owner_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.account_closure_requests
  ALTER COLUMN owner_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.account_deletion_requests
  ALTER COLUMN account_owner_id DROP NOT NULL,
  ALTER COLUMN requester_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.legal_agreement_signatures
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

ALTER TABLE public.user_consents
  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  ADD COLUMN IF NOT EXISTS email_hash text,
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_subscribers_deleted_account_id ON public.subscribers(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_deleted_account_id ON public.payment_events(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_deleted_account_id ON public.audit_logs(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_deleted_account_id ON public.user_activity_logs(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_checkout_fulfillments_deleted_account_id ON public.checkout_fulfillments(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_checkout_session_audit_deleted_account_id ON public.checkout_session_audit(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_subscription_cancellations_deleted_account_id ON public.subscription_cancellations(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_account_closure_requests_deleted_account_id ON public.account_closure_requests(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_deleted_account_id ON public.account_deletion_requests(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_deleted_account_id ON public.gift_subscriptions(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_legal_agreement_signatures_deleted_account_id ON public.legal_agreement_signatures(deleted_account_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_deleted_account_id ON public.user_consents(deleted_account_id);

-- ===== 20260621133000_create_storage_deletion_jobs.sql =====
CREATE TABLE IF NOT EXISTS public.storage_deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  object_path text NOT NULL,
  source text,
  source_table text,
  owner_user_id uuid,
  account_id uuid,
  deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  processing_started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT storage_deletion_jobs_unique_deleted_account_object
    UNIQUE (bucket, object_path, deleted_account_id)
);

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_retry
  ON public.storage_deletion_jobs(status, next_attempt_at)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_deleted_account_id
  ON public.storage_deletion_jobs(deleted_account_id)
  WHERE deleted_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_owner_user_id
  ON public.storage_deletion_jobs(owner_user_id)
  WHERE owner_user_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_storage_deletion_jobs_updated_at
  ON public.storage_deletion_jobs;

CREATE TRIGGER update_storage_deletion_jobs_updated_at
  BEFORE UPDATE ON public.storage_deletion_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.storage_deletion_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.storage_deletion_jobs FROM anon, authenticated;
GRANT ALL ON public.storage_deletion_jobs TO service_role;

-- ===== 20260621143000_enforce_export_ttl_download_caps.sql =====
UPDATE public.continuity_export_authorizations
SET expires_at = authorized_at + interval '7 days'
WHERE expires_at IS NULL
  AND status = 'active';

ALTER TABLE public.continuity_export_authorizations
  ALTER COLUMN download_limit SET DEFAULT 5,
  ADD CONSTRAINT continuity_export_authorizations_download_limit_range
    CHECK (download_limit IS NULL OR download_limit BETWEEN 1 AND 50),
  ADD CONSTRAINT continuity_export_authorizations_download_count_nonnegative
    CHECK (download_count >= 0),
  ADD CONSTRAINT continuity_export_authorizations_expires_after_authorized
    CHECK (expires_at IS NULL OR expires_at > authorized_at);

CREATE INDEX IF NOT EXISTS idx_export_auth_active_expiry
  ON public.continuity_export_authorizations(expires_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_export_auth_active_downloads
  ON public.continuity_export_authorizations(download_count, download_limit)
  WHERE status = 'active' AND download_limit IS NOT NULL;

CREATE OR REPLACE FUNCTION public.authorize_continuity_export(
  _request_id UUID,
  _scope JSONB,
  _expires_at TIMESTAMPTZ,
  _download_limit INTEGER DEFAULT NULL,
  _sensitive_areas_included BOOLEAN DEFAULT false,
  _internal_reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_account UUID;
  v_id UUID;
  v_expires_at TIMESTAMPTZ := COALESCE(_expires_at, now() + interval '7 days');
  v_download_limit INTEGER := COALESCE(_download_limit, 5);
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;

  IF v_expires_at <= now() THEN
    RAISE EXCEPTION 'export_expiration_must_be_future' USING ERRCODE = '22023';
  END IF;

  IF v_expires_at > now() + interval '30 days' THEN
    RAISE EXCEPTION 'export_expiration_exceeds_30_days' USING ERRCODE = '22023';
  END IF;

  IF v_download_limit < 1 OR v_download_limit > 50 THEN
    RAISE EXCEPTION 'download_limit_out_of_range' USING ERRCODE = '22023';
  END IF;

  PERFORM public.enforce_continuity_execution_guard(_request_id);
  SELECT account_id INTO v_account FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'request_not_found'; END IF;

  INSERT INTO public.continuity_export_authorizations(
    request_id,
    account_id,
    authorized_by_admin_id,
    expires_at,
    scope,
    download_limit,
    sensitive_areas_included,
    internal_reason
  )
  VALUES (
    _request_id,
    v_account,
    auth.uid(),
    v_expires_at,
    COALESCE(_scope, '[]'::jsonb),
    v_download_limit,
    _sensitive_areas_included,
    _internal_reason
  )
  RETURNING id INTO v_id;

  UPDATE public.account_continuity_requests
    SET status = 'approved_export', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(
    _request_id,
    'export_authorized',
    'Continuity export authorized',
    jsonb_build_object(
      'authorization_id', v_id,
      'scope', COALESCE(_scope, '[]'::jsonb),
      'expires_at', v_expires_at,
      'download_limit', v_download_limit,
      'sensitive', _sensitive_areas_included
    ),
    v_account
  );

  RETURN v_id;
END $$;

REVOKE EXECUTE ON FUNCTION public.authorize_continuity_export(uuid, jsonb, timestamptz, integer, boolean, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.authorize_continuity_export(uuid, jsonb, timestamptz, integer, boolean, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_continuity_export_authorization(
  _authorization_id UUID,
  _file_name TEXT DEFAULT NULL,
  _file_hash TEXT DEFAULT NULL,
  _file_size_bytes BIGINT DEFAULT NULL,
  _ip_address INET DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
) RETURNS TABLE (
  authorization_id UUID,
  request_id UUID,
  account_id UUID,
  scope JSONB,
  sensitive_areas_included BOOLEAN,
  expires_at TIMESTAMPTZ,
  download_count INTEGER,
  download_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_auth public.continuity_export_authorizations%ROWTYPE;
  v_downloaded_by UUID := auth.uid();
BEGIN
  IF v_downloaded_by IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_auth
    FROM public.continuity_export_authorizations
    WHERE id = _authorization_id
    FOR UPDATE;

  IF v_auth.id IS NULL THEN
    RAISE EXCEPTION 'export_authorization_not_found' USING ERRCODE = '22023';
  END IF;

  IF NOT (
    public.has_dev_workspace_access(v_downloaded_by)
    OR public.is_account_owner(v_downloaded_by, v_auth.account_id)
    OR public.is_active_legacy_admin(v_downloaded_by, v_auth.account_id)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;

  IF v_auth.status <> 'active' THEN
    RAISE EXCEPTION 'export_authorization_not_active' USING ERRCODE = '22023';
  END IF;

  IF v_auth.expires_at IS NULL OR v_auth.expires_at <= now() THEN
    UPDATE public.continuity_export_authorizations
      SET status = 'expired'
      WHERE id = v_auth.id;
    RAISE EXCEPTION 'export_authorization_expired' USING ERRCODE = '22023';
  END IF;

  IF v_auth.download_limit IS NOT NULL AND v_auth.download_count >= v_auth.download_limit THEN
    UPDATE public.continuity_export_authorizations
      SET status = 'exhausted'
      WHERE id = v_auth.id;
    RAISE EXCEPTION 'export_download_limit_reached' USING ERRCODE = '22023';
  END IF;

  UPDATE public.continuity_export_authorizations
    SET download_count = download_count + 1,
        status = CASE
          WHEN download_limit IS NOT NULL AND download_count + 1 >= download_limit THEN 'exhausted'
          ELSE status
        END
    WHERE id = v_auth.id
    RETURNING * INTO v_auth;

  INSERT INTO public.continuity_export_forensics(
    request_id,
    account_id,
    export_type,
    exported_sections,
    file_name,
    file_hash,
    file_size_bytes,
    requested_by,
    approved_by,
    downloaded_by,
    downloaded_at,
    ip_address,
    user_agent
  )
  VALUES (
    v_auth.request_id,
    v_auth.account_id,
    'continuity',
    v_auth.scope,
    _file_name,
    _file_hash,
    _file_size_bytes,
    v_downloaded_by,
    v_auth.authorized_by_admin_id,
    v_downloaded_by,
    now(),
    _ip_address,
    _user_agent
  );

  authorization_id := v_auth.id;
  request_id := v_auth.request_id;
  account_id := v_auth.account_id;
  scope := v_auth.scope;
  sensitive_areas_included := v_auth.sensitive_areas_included;
  expires_at := v_auth.expires_at;
  download_count := v_auth.download_count;
  download_limit := v_auth.download_limit;
  RETURN NEXT;
END $$;

REVOKE EXECUTE ON FUNCTION public.consume_continuity_export_authorization(uuid, text, text, bigint, inet, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_continuity_export_authorization(uuid, text, text, bigint, inet, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_continuity_export_authorizations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.continuity_export_authorizations
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

REVOKE EXECUTE ON FUNCTION public.expire_continuity_export_authorizations()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_continuity_export_authorizations()
  TO service_role;

-- ===== 20260621150000_add_deleted_account_retention_sweeper.sql =====
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

-- ===== 20260621153000_create_cron_job_health.sql =====
CREATE TABLE IF NOT EXISTS public.cron_job_health (
  job_name TEXT PRIMARY KEY,
  description TEXT,
  expected_interval_minutes INTEGER NOT NULL CHECK (expected_interval_minutes > 0),
  warn_after_minutes INTEGER NOT NULL CHECK (warn_after_minutes > 0),
  page_after_minutes INTEGER NOT NULL CHECK (page_after_minutes > 0),
  last_started_at TIMESTAMPTZ,
  last_succeeded_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_duration_ms INTEGER CHECK (last_duration_ms IS NULL OR last_duration_ms >= 0),
  last_status TEXT NOT NULL DEFAULT 'never_run'
    CHECK (last_status IN ('never_run', 'running', 'succeeded', 'failed')),
  last_error TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  last_result JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (warn_after_minutes <= page_after_minutes)
);

ALTER TABLE public.cron_job_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view cron job health"
  ON public.cron_job_health;
CREATE POLICY "Dev workspace can view cron job health"
  ON public.cron_job_health
  FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_cron_job_health_updated_at
  ON public.cron_job_health;
CREATE TRIGGER update_cron_job_health_updated_at
  BEFORE UPDATE ON public.cron_job_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.record_cron_job_started(p_job_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cron_job_health
  SET
    last_started_at = now(),
    last_status = 'running',
    last_error = NULL,
    updated_at = now()
  WHERE job_name = p_job_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_cron_job_result(
  p_job_name TEXT,
  p_status TEXT,
  p_duration_ms INTEGER DEFAULT NULL,
  p_result JSONB DEFAULT '{}'::JSONB,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('succeeded', 'failed') THEN
    RAISE EXCEPTION 'unsupported cron job status: %', p_status;
  END IF;

  UPDATE public.cron_job_health
  SET
    last_succeeded_at = CASE WHEN p_status = 'succeeded' THEN now() ELSE last_succeeded_at END,
    last_failed_at = CASE WHEN p_status = 'failed' THEN now() ELSE last_failed_at END,
    last_duration_ms = p_duration_ms,
    last_status = p_status,
    last_error = CASE
      WHEN p_status = 'failed' THEN left(COALESCE(p_error, 'cron_job_failed'), 1000)
      ELSE NULL
    END,
    consecutive_failures = CASE
      WHEN p_status = 'failed' THEN consecutive_failures + 1
      ELSE 0
    END,
    last_result = COALESCE(p_result, '{}'::JSONB),
    updated_at = now()
  WHERE job_name = p_job_name;
END;
$$;

CREATE OR REPLACE VIEW public.cron_job_health_status AS
SELECT
  h.*,
  CASE
    WHEN h.last_status = 'never_run' THEN 'never_run'
    WHEN h.last_status = 'failed' THEN 'failed'
    WHEN h.last_succeeded_at IS NULL THEN 'never_run'
    WHEN h.last_succeeded_at < now() - make_interval(mins => h.page_after_minutes) THEN 'page'
    WHEN h.last_succeeded_at < now() - make_interval(mins => h.warn_after_minutes) THEN 'warn'
    ELSE 'ok'
  END AS health_status,
  CASE
    WHEN h.last_succeeded_at IS NULL THEN NULL
    ELSE floor(EXTRACT(EPOCH FROM (now() - h.last_succeeded_at)) / 60)::INTEGER
  END AS minutes_since_success
FROM public.cron_job_health h;

ALTER VIEW public.cron_job_health_status SET (security_invoker = true);

GRANT SELECT ON public.cron_job_health TO authenticated;
GRANT SELECT ON public.cron_job_health_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_cron_job_started(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_cron_job_result(TEXT, TEXT, INTEGER, JSONB, TEXT) TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES
  ('check-gift-reminders', 'Daily gift expiration reminder sweeper', 1440, 1560, 1800),
  ('check-gift-deliveries', 'Scheduled gift delivery email sweeper', 60, 120, 180),
  ('check-payment-failures', 'Daily billing dunning and failed-payment reminder sweeper', 1440, 1560, 1800),
  ('check-grace-period-expiry', 'Legacy Locker recovery grace-period expiry sweeper', 60, 120, 180),
  ('expire-subscription-grace-periods-hourly', 'Database cron job that expires billing grace periods', 60, 120, 180),
  ('process-storage-deletion-jobs', 'Storage object deletion outbox worker', 5, 30, 60),
  ('process-retention-expirations', 'Deleted-account retention expiration sweeper', 1440, 1560, 1800),
  ('notify-manual-review-backlog', 'Daily manual review backlog notifier', 1440, 1560, 1800)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

-- ===== 20260621160000_add_account_closure_sweeper_health.sql =====
CREATE INDEX IF NOT EXISTS idx_account_closure_requests_due_scheduled
  ON public.account_closure_requests(deletion_scheduled_date)
  WHERE status = 'scheduled'
    AND owner_user_id IS NOT NULL;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'process-account-closures',
  'Executes matured scheduled account closures through the delete-account pipeline',
  60,
  120,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

-- ===== 20260621163000_create_account_export_audit.sql =====
CREATE TABLE IF NOT EXISTS public.account_export_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_id UUID,
  export_type TEXT NOT NULL DEFAULT 'complete_asset_summary'
    CHECK (export_type IN ('complete_asset_summary', 'asset_summary_pdf', 'asset_zip')),
  status TEXT NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'succeeded', 'failed')),
  file_count INTEGER CHECK (file_count IS NULL OR file_count >= 0),
  signed_url_ttl_seconds INTEGER CHECK (signed_url_ttl_seconds IS NULL OR signed_url_ttl_seconds > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_export_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own account export audit"
  ON public.account_export_audit;
CREATE POLICY "Users can view own account export audit"
  ON public.account_export_audit
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dev workspace can view account export audit"
  ON public.account_export_audit;
CREATE POLICY "Dev workspace can view account export audit"
  ON public.account_export_audit
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_account_export_audit_updated_at
  ON public.account_export_audit;
CREATE TRIGGER update_account_export_audit_updated_at
  BEFORE UPDATE ON public.account_export_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_account_export_audit_user_started
  ON public.account_export_audit(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_account_export_audit_status_started
  ON public.account_export_audit(status, started_at DESC);

GRANT SELECT ON public.account_export_audit TO authenticated;
GRANT ALL ON public.account_export_audit TO service_role;

CREATE OR REPLACE FUNCTION public.log_account_export_audit(
  p_export_type TEXT DEFAULT 'complete_asset_summary',
  p_status TEXT DEFAULT 'started',
  p_file_count INTEGER DEFAULT NULL,
  p_signed_url_ttl_seconds INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_account_id UUID;
  v_audit_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_status NOT IN ('started', 'succeeded', 'failed') THEN
    RAISE EXCEPTION 'invalid_export_status' USING ERRCODE = '22023';
  END IF;

  SELECT id
  INTO v_account_id
  FROM public.accounts
  WHERE owner_user_id = v_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO public.account_export_audit (
    user_id,
    account_id,
    export_type,
    status,
    file_count,
    signed_url_ttl_seconds,
    completed_at,
    error_message,
    metadata
  )
  VALUES (
    v_user_id,
    v_account_id,
    COALESCE(p_export_type, 'complete_asset_summary'),
    p_status,
    p_file_count,
    p_signed_url_ttl_seconds,
    CASE WHEN p_status IN ('succeeded', 'failed') THEN now() ELSE NULL END,
    CASE WHEN p_status = 'failed' THEN left(COALESCE(p_error_message, 'export_failed'), 1000) ELSE NULL END,
    COALESCE(p_metadata, '{}'::JSONB)
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_account_export_audit(TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_account_export_audit(TEXT, TEXT, INTEGER, INTEGER, TEXT, JSONB)
  TO authenticated;

-- ===== 20260621170000_add_storage_usage_reconciliation.sql =====
CREATE TABLE IF NOT EXISTS public.storage_usage_reconciliation_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_drift_bytes BIGINT NOT NULL DEFAULT 0,
  last_drift_ratio NUMERIC NOT NULL DEFAULT 0,
  last_corrected BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_usage_reconciliation_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view storage usage reconciliation state"
  ON public.storage_usage_reconciliation_state;
CREATE POLICY "Dev workspace can view storage usage reconciliation state"
  ON public.storage_usage_reconciliation_state
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_storage_usage_reconciliation_state_updated_at
  ON public.storage_usage_reconciliation_state;
CREATE TRIGGER update_storage_usage_reconciliation_state_updated_at
  BEFORE UPDATE ON public.storage_usage_reconciliation_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.storage_usage_reconciliation_state TO authenticated;
GRANT ALL ON public.storage_usage_reconciliation_state TO service_role;

CREATE OR REPLACE FUNCTION public.reconcile_storage_usage_drift(
  p_limit INTEGER DEFAULT 100,
  p_min_absolute_bytes BIGINT DEFAULT 52428800,
  p_min_relative_ratio NUMERIC DEFAULT 0.05
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_before_bytes BIGINT;
  v_after_bytes BIGINT;
  v_before_files BIGINT;
  v_after_files BIGINT;
  v_delta_bytes BIGINT;
  v_relative_ratio NUMERIC;
  v_checked INTEGER := 0;
  v_corrected INTEGER := 0;
  v_total_delta_bytes BIGINT := 0;
  v_drift_events JSONB := '[]'::JSONB;
BEGIN
  FOR v_user IN
    WITH usage_rollup AS (
      SELECT
        user_id,
        SUM(total_size_bytes)::BIGINT AS current_bytes,
        SUM(file_count)::BIGINT AS current_files,
        MIN(last_calculated_at) AS oldest_calculated_at
      FROM public.storage_usage
      GROUP BY user_id
    )
    SELECT
      p.user_id,
      COALESCE(u.current_bytes, 0)::BIGINT AS current_bytes,
      COALESCE(u.current_files, 0)::BIGINT AS current_files,
      LEAST(
        COALESCE(u.oldest_calculated_at, 'infinity'::TIMESTAMPTZ),
        COALESCE(s.last_reconciled_at, 'infinity'::TIMESTAMPTZ)
      ) AS last_checked_at
    FROM public.profiles p
    LEFT JOIN usage_rollup u ON u.user_id = p.user_id
    LEFT JOIN public.storage_usage_reconciliation_state s ON s.user_id = p.user_id
    WHERE COALESCE(p.account_status, 'active') <> 'deleted'
    ORDER BY last_checked_at ASC NULLS FIRST, p.user_id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 1000)
  LOOP
    v_checked := v_checked + 1;
    v_before_bytes := v_user.current_bytes;
    v_before_files := v_user.current_files;

    SELECT
      COALESCE(SUM(total_size_bytes), 0)::BIGINT,
      COALESCE(SUM(file_count), 0)::BIGINT
    INTO v_after_bytes, v_after_files
    FROM public.calculate_user_storage_usage(v_user.user_id);

    v_delta_bytes := v_after_bytes - v_before_bytes;
    v_relative_ratio := CASE
      WHEN GREATEST(v_before_bytes, v_after_bytes) = 0 THEN 0
      ELSE abs(v_delta_bytes)::NUMERIC / GREATEST(v_before_bytes, v_after_bytes)::NUMERIC
    END;

    PERFORM public.update_user_storage_usage(v_user.user_id);

    IF abs(v_delta_bytes) >= p_min_absolute_bytes
       OR v_relative_ratio >= p_min_relative_ratio THEN
      v_corrected := v_corrected + 1;
      v_total_delta_bytes := v_total_delta_bytes + v_delta_bytes;

      v_drift_events := v_drift_events || jsonb_build_array(jsonb_build_object(
        'user_id', v_user.user_id,
        'before_bytes', v_before_bytes,
        'after_bytes', v_after_bytes,
        'delta_bytes', v_delta_bytes,
        'before_files', v_before_files,
        'after_files', v_after_files,
        'relative_ratio', v_relative_ratio
      ));

      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        old_values,
        new_values
      )
      VALUES (
        v_user.user_id,
        'storage_usage_drift_corrected',
        'storage_usage',
        jsonb_build_object(
          'total_size_bytes', v_before_bytes,
          'file_count', v_before_files
        ),
        jsonb_build_object(
          'total_size_bytes', v_after_bytes,
          'file_count', v_after_files,
          'delta_bytes', v_delta_bytes,
          'relative_ratio', v_relative_ratio
        )
      );
    END IF;

    INSERT INTO public.storage_usage_reconciliation_state (
      user_id,
      last_reconciled_at,
      last_drift_bytes,
      last_drift_ratio,
      last_corrected
    )
    VALUES (
      v_user.user_id,
      now(),
      v_delta_bytes,
      v_relative_ratio,
      abs(v_delta_bytes) >= p_min_absolute_bytes OR v_relative_ratio >= p_min_relative_ratio
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      last_reconciled_at = EXCLUDED.last_reconciled_at,
      last_drift_bytes = EXCLUDED.last_drift_bytes,
      last_drift_ratio = EXCLUDED.last_drift_ratio,
      last_corrected = EXCLUDED.last_corrected,
      updated_at = now();
  END LOOP;

  RETURN jsonb_build_object(
    'checked', v_checked,
    'corrected', v_corrected,
    'total_delta_bytes', v_total_delta_bytes,
    'drift_events', v_drift_events
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_storage_usage_drift(INTEGER, BIGINT, NUMERIC)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_storage_usage_drift(INTEGER, BIGINT, NUMERIC)
  TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'process-storage-usage-drift',
  'Recomputes storage_usage rollups and records material drift corrections',
  60,
  120,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

-- ===== 20260621173000_add_storage_orphan_reconciliation.sql =====
CREATE TABLE IF NOT EXISTS public.storage_orphan_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  object_path TEXT NOT NULL,
  object_size_bytes BIGINT,
  object_created_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate', 'approved', 'queued', 'ignored', 'resolved')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, object_path)
);

ALTER TABLE public.storage_orphan_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view storage orphan candidates"
  ON public.storage_orphan_candidates;
CREATE POLICY "Dev workspace can view storage orphan candidates"
  ON public.storage_orphan_candidates
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can update storage orphan candidates"
  ON public.storage_orphan_candidates;
CREATE POLICY "Dev workspace can update storage orphan candidates"
  ON public.storage_orphan_candidates
  FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_storage_orphan_candidates_updated_at
  ON public.storage_orphan_candidates;
CREATE TRIGGER update_storage_orphan_candidates_updated_at
  BEFORE UPDATE ON public.storage_orphan_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_storage_orphan_candidates_status_seen
  ON public.storage_orphan_candidates(status, last_seen_at DESC);

GRANT SELECT, UPDATE ON public.storage_orphan_candidates TO authenticated;
GRANT ALL ON public.storage_orphan_candidates TO service_role;

CREATE OR REPLACE FUNCTION public.reconcile_storage_orphans(
  p_limit INTEGER DEFAULT 500,
  p_min_age INTERVAL DEFAULT interval '7 days',
  p_queue_approved BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_found INTEGER := 0;
  v_resolved INTEGER := 0;
  v_queued INTEGER := 0;
BEGIN
  CREATE TEMP TABLE referenced_storage_objects (
    bucket TEXT NOT NULL,
    object_path TEXT NOT NULL,
    PRIMARY KEY (bucket, object_path)
  ) ON COMMIT DROP;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT bucket_name, file_path FROM public.property_files
  WHERE bucket_name IS NOT NULL AND file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT bucket_name, file_path FROM public.legacy_locker_files
  WHERE bucket_name IS NOT NULL AND file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'documents', audio_path FROM public.legacy_locker_voice_notes
  WHERE audio_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'documents', file_path FROM public.voice_note_attachments
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'documents', receipt_path FROM public.receipts
  WHERE receipt_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'documents', file_path FROM public.user_documents
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'memory-safe', file_path FROM public.memory_safe_items
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT COALESCE(bucket_name, 'documents'), file_path FROM public.family_recipes
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT COALESCE(bucket_name, 'documents'), file_path FROM public.notes_traditions
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'contact-attachments', file_path FROM public.vip_contact_attachments
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'photos', swatch_image_path FROM public.paint_codes
  WHERE swatch_image_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT 'documents', file_path FROM public.calendar_event_attachments
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  INSERT INTO referenced_storage_objects(bucket, object_path)
  SELECT COALESCE(bucket_name, 'documents'), file_path FROM public.user_notes
  WHERE file_path IS NOT NULL
  ON CONFLICT DO NOTHING;

  WITH orphan_objects AS (
    SELECT
      o.bucket_id::TEXT AS bucket,
      o.name::TEXT AS object_path,
      CASE
        WHEN (o.metadata->>'size') ~ '^[0-9]+$' THEN (o.metadata->>'size')::BIGINT
        ELSE NULL
      END AS object_size_bytes,
      o.created_at
    FROM storage.objects o
    LEFT JOIN referenced_storage_objects r
      ON r.bucket = o.bucket_id::TEXT
      AND r.object_path = o.name::TEXT
    WHERE r.object_path IS NULL
      AND o.name IS NOT NULL
      AND o.name NOT LIKE '.emptyFolderPlaceholder%'
      AND o.created_at <= now() - COALESCE(p_min_age, interval '7 days')
      AND NOT EXISTS (
        SELECT 1
        FROM public.storage_deletion_jobs j
        WHERE j.bucket = o.bucket_id::TEXT
          AND j.object_path = o.name::TEXT
          AND j.status IN ('pending', 'processing', 'failed')
      )
    ORDER BY o.created_at ASC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 500), 1), 5000)
  ),
  upserted AS (
    INSERT INTO public.storage_orphan_candidates (
      bucket,
      object_path,
      object_size_bytes,
      object_created_at,
      last_seen_at,
      status,
      resolved_at
    )
    SELECT
      bucket,
      object_path,
      object_size_bytes,
      created_at,
      now(),
      'candidate',
      NULL
    FROM orphan_objects
    ON CONFLICT (bucket, object_path) DO UPDATE
    SET
      object_size_bytes = EXCLUDED.object_size_bytes,
      object_created_at = EXCLUDED.object_created_at,
      last_seen_at = now(),
      status = CASE
        WHEN public.storage_orphan_candidates.status = 'resolved' THEN 'candidate'
        ELSE public.storage_orphan_candidates.status
      END,
      resolved_at = CASE
        WHEN public.storage_orphan_candidates.status = 'resolved' THEN NULL
        ELSE public.storage_orphan_candidates.resolved_at
      END,
      updated_at = now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_found FROM upserted;

  WITH resolved AS (
    UPDATE public.storage_orphan_candidates c
    SET
      status = 'resolved',
      resolved_at = now(),
      updated_at = now()
    WHERE c.status IN ('candidate', 'approved', 'queued')
      AND NOT EXISTS (
        SELECT 1
        FROM storage.objects o
        WHERE o.bucket_id::TEXT = c.bucket
          AND o.name::TEXT = c.object_path
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_resolved FROM resolved;

  IF p_queue_approved THEN
    WITH approved AS (
      SELECT c.*
      FROM public.storage_orphan_candidates c
      WHERE c.status = 'approved'
        AND NOT EXISTS (
          SELECT 1
          FROM public.storage_deletion_jobs j
          WHERE j.bucket = c.bucket
            AND j.object_path = c.object_path
            AND j.status IN ('pending', 'processing', 'failed')
        )
      ORDER BY c.approved_at ASC NULLS LAST, c.first_seen_at ASC
      LIMIT LEAST(GREATEST(COALESCE(p_limit, 500), 1), 5000)
    ),
    queued_jobs AS (
      INSERT INTO public.storage_deletion_jobs (
        bucket,
        object_path,
        source,
        source_table,
        status,
        next_attempt_at
      )
      SELECT
        bucket,
        object_path,
        'storage_orphan_reconciliation',
        'storage_orphan_candidates',
        'pending',
        now()
      FROM approved
      RETURNING bucket, object_path
    ),
    marked AS (
      UPDATE public.storage_orphan_candidates c
      SET
        status = 'queued',
        queued_at = now(),
        updated_at = now()
      FROM queued_jobs j
      WHERE c.bucket = j.bucket
        AND c.object_path = j.object_path
      RETURNING c.id
    )
    SELECT COUNT(*) INTO v_queued FROM marked;
  END IF;

  RETURN jsonb_build_object(
    'found_orphans', v_found,
    'resolved_candidates', v_resolved,
    'queued_approved', v_queued,
    'min_age_seconds', EXTRACT(EPOCH FROM COALESCE(p_min_age, interval '7 days'))::BIGINT
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_storage_orphans(INTEGER, INTERVAL, BOOLEAN)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_storage_orphans(INTEGER, INTERVAL, BOOLEAN)
  TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'process-storage-orphans',
  'Detects unreferenced storage objects and queues approved candidates for deletion',
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

-- ===== 20260621180000_create_restore_drill_runs.sql =====
CREATE TABLE IF NOT EXISTS public.restore_drill_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL DEFAULT 'prod'
    CHECK (environment IN ('prod', 'staging', 'scratch', 'local')),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'passed', 'failed', 'cancelled')),
  drill_type TEXT NOT NULL DEFAULT 'pitr_to_scratch'
    CHECK (drill_type IN ('pitr_to_scratch', 'logical_backup_restore', 'full_app_restore')),
  source_project_ref TEXT,
  target_project_ref TEXT,
  restore_point_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rpo_minutes INTEGER CHECK (rpo_minutes IS NULL OR rpo_minutes >= 0),
  rto_minutes INTEGER CHECK (rto_minutes IS NULL OR rto_minutes >= 0),
  db_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  storage_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  auth_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  edge_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  signed_url_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  findings TEXT[] NOT NULL DEFAULT '{}',
  follow_up_actions TEXT[] NOT NULL DEFAULT '{}',
  runbook_version TEXT NOT NULL DEFAULT '2026-06-21',
  operator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

ALTER TABLE public.restore_drill_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can view restore drill runs"
  ON public.restore_drill_runs
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can create restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can create restore drill runs"
  ON public.restore_drill_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can update restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can update restore drill runs"
  ON public.restore_drill_runs
  FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_restore_drill_runs_updated_at
  ON public.restore_drill_runs;
CREATE TRIGGER update_restore_drill_runs_updated_at
  BEFORE UPDATE ON public.restore_drill_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_restore_drill_runs_status_created
  ON public.restore_drill_runs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restore_drill_runs_completed
  ON public.restore_drill_runs(completed_at DESC)
  WHERE completed_at IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.restore_drill_runs TO authenticated;
GRANT ALL ON public.restore_drill_runs TO service_role;

-- ===== 20260621183000_add_system_maintenance_mode.sql =====
CREATE TABLE IF NOT EXISTS public.system_maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  reason text NOT NULL,
  message text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS idx_system_maintenance_windows_active
  ON public.system_maintenance_windows (status, starts_at DESC)
  WHERE status IN ('scheduled', 'active');

ALTER TABLE public.system_maintenance_windows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can read maintenance windows"
  ON public.system_maintenance_windows;
CREATE POLICY "Dev workspace can read maintenance windows"
  ON public.system_maintenance_windows
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can manage maintenance windows"
  ON public.system_maintenance_windows;
CREATE POLICY "Dev workspace can manage maintenance windows"
  ON public.system_maintenance_windows
  FOR ALL
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_system_maintenance_windows_updated_at
  ON public.system_maintenance_windows;
CREATE TRIGGER update_system_maintenance_windows_updated_at
  BEFORE UPDATE ON public.system_maintenance_windows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.system_maintenance_windows TO authenticated;
GRANT ALL ON public.system_maintenance_windows TO service_role;

CREATE OR REPLACE FUNCTION public.is_system_maintenance_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.system_maintenance_windows smw
    WHERE smw.status = 'active'
      AND smw.starts_at <= now()
      AND (smw.ends_at IS NULL OR smw.ends_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.is_system_maintenance_active() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_system_maintenance_active() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_active_maintenance_mode()
RETURNS TABLE (
  is_active boolean,
  id uuid,
  reason text,
  message text,
  started_at timestamptz,
  ends_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    true,
    smw.id,
    smw.reason,
    smw.message,
    smw.starts_at,
    smw.ends_at
  FROM public.system_maintenance_windows smw
  WHERE smw.status = 'active'
    AND smw.starts_at <= now()
    AND (smw.ends_at IS NULL OR smw.ends_at > now())
  ORDER BY smw.starts_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      false,
      NULL::uuid,
      NULL::text,
      NULL::text,
      NULL::timestamptz,
      NULL::timestamptz;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_maintenance_mode() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_maintenance_mode() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.activate_maintenance_mode(
  p_reason text,
  p_message text DEFAULT NULL,
  p_ends_at timestamptz DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  ) THEN
    RAISE EXCEPTION 'Only dev workspace users can activate maintenance mode'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(trim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Maintenance reason is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_ends_at IS NOT NULL AND p_ends_at <= now() THEN
    RAISE EXCEPTION 'Maintenance end time must be in the future'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.system_maintenance_windows (
    status,
    reason,
    message,
    ends_at,
    created_by,
    metadata
  )
  VALUES (
    'active',
    trim(p_reason),
    NULLIF(trim(p_message), ''),
    p_ends_at,
    auth.uid(),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_maintenance_mode(text, text, timestamptz, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_maintenance_mode(text, text, timestamptz, jsonb) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.end_maintenance_mode(p_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  ) THEN
    RAISE EXCEPTION 'Only dev workspace users can end maintenance mode'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.system_maintenance_windows smw
  SET
    status = 'ended',
    ends_at = now(),
    ended_by = auth.uid(),
    updated_at = now()
  WHERE smw.status = 'active'
    AND smw.starts_at <= now()
    AND (smw.ends_at IS NULL OR smw.ends_at > now())
    AND (p_id IS NULL OR smw.id = p_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.end_maintenance_mode(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_maintenance_mode(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_owner_account_writable(_owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    NOT public.is_system_maintenance_active()
    AND COALESCE((
      SELECT COALESCE(p.account_status, 'active') NOT IN (
        'expired_read_only',
        'deletion_requested',
        'scheduled_for_deletion',
        'deleted',
        'inactive'
      )
      FROM public.profiles p
      WHERE p.user_id = _owner_user_id
    ), false);
$$;

REVOKE ALL ON FUNCTION public.is_owner_account_writable(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner_account_writable(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_account_write_state(p_account_id uuid)
RETURNS TABLE (
  account_id uuid,
  owner_user_id uuid,
  owner_account_status text,
  is_read_only boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_user_id uuid;
  v_status text;
  v_maintenance_active boolean;
BEGIN
  SELECT a.owner_user_id
    INTO v_owner_user_id
  FROM public.accounts a
  JOIN public.account_memberships m
    ON m.account_id = a.id
   AND m.user_id = auth.uid()
   AND m.status = 'active'
  WHERE a.id = p_account_id;

  IF v_owner_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(p.account_status, 'active')
    INTO v_status
  FROM public.profiles p
  WHERE p.user_id = v_owner_user_id;

  v_maintenance_active := public.is_system_maintenance_active();

  RETURN QUERY
  SELECT
    p_account_id,
    v_owner_user_id,
    COALESCE(v_status, 'active'),
    v_maintenance_active
      OR COALESCE(v_status, 'active') IN (
        'expired_read_only',
        'deletion_requested',
        'scheduled_for_deletion',
        'deleted',
        'inactive'
      );
END;
$$;

REVOKE ALL ON FUNCTION public.get_account_write_state(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_account_write_state(uuid) TO authenticated;

-- ===== 20260621190000_add_expired_export_sweeper_health.sql =====
INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
)
VALUES (
  'process-expired-exports',
  'Expires continuity export authorizations and removes stale export bucket objects',
  60,
  90,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

-- ===== 20260621193000_add_deleted_account_signup_guard.sql =====
CREATE OR REPLACE FUNCTION public.is_deleted_account_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.deleted_accounts da
    WHERE lower(da.email) = lower(trim(p_email))
       OR da.email_hash = encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex')
  );
$$;

REVOKE ALL ON FUNCTION public.is_deleted_account_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_deleted_account_email(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  account_num TEXT;
  new_account_id UUID;
  owner_first_name TEXT;
BEGIN
  IF public.is_deleted_account_email(NEW.email) THEN
    RAISE EXCEPTION 'account_reuse_blocked'
      USING ERRCODE = '23514';
  END IF;

  account_num := 'AS' || LPAD(nextval('account_number_seq')::TEXT, 6, '0');
  owner_first_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'first_name'), '');

  INSERT INTO public.profiles (user_id, first_name, last_name, account_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    account_num
  );

  INSERT INTO public.accounts (owner_user_id, account_name)
  VALUES (NEW.id, COALESCE(owner_first_name || '''s Account', 'My Account'))
  RETURNING id INTO new_account_id;

  INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
  VALUES (new_account_id, NEW.id, 'owner', 'active', now());

  RETURN NEW;
END;
$function$;

-- ===== 20260621194500_add_restore_drill_reminder_health.sql =====
INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'quarterly-restore-drill-reminder',
  'Quarterly restore drill due-date reminder',
  43200,
  44640,
  46080
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();

-- ===== 20260621200000_add_account_closure_legal_hold.sql =====
ALTER TABLE public.account_closure_requests
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_hold_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_hold_released_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_account_closure_requests_legal_hold
  ON public.account_closure_requests(legal_hold, deletion_scheduled_date)
  WHERE status = 'scheduled';

CREATE OR REPLACE FUNCTION public.apply_account_closure_legal_hold(
  p_closure_request_id uuid,
  p_reason text
)
RETURNS public.account_closure_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.account_closure_requests;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_closure_requests
  SET
    legal_hold = true,
    legal_hold_reason = NULLIF(trim(p_reason), ''),
    legal_hold_applied_at = now(),
    legal_hold_applied_by = auth.uid(),
    legal_hold_released_at = NULL,
    legal_hold_released_by = NULL,
    updated_at = now()
  WHERE id = p_closure_request_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'closure_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_account_closure_legal_hold(
  p_closure_request_id uuid
)
RETURNS public.account_closure_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.account_closure_requests;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_closure_requests
  SET
    legal_hold = false,
    legal_hold_released_at = now(),
    legal_hold_released_by = auth.uid(),
    updated_at = now()
  WHERE id = p_closure_request_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'closure_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_deleted_account_legal_hold(
  p_deleted_account_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS public.deleted_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.deleted_accounts;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.deleted_accounts
  SET
    legal_hold = true,
    retention_purge_status = 'legal_hold'
  WHERE id = p_deleted_account_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'deleted_account_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  )
  VALUES (
    auth.uid(),
    'deleted_account_legal_hold_applied',
    'deleted_accounts',
    p_deleted_account_id,
    jsonb_build_object('reason', NULLIF(trim(COALESCE(p_reason, '')), ''))
  );

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_deleted_account_legal_hold(
  p_deleted_account_id uuid
)
RETURNS public.deleted_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.deleted_accounts;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.deleted_accounts
  SET
    legal_hold = false,
    retention_purge_status = CASE
      WHEN retention_purged_at IS NOT NULL THEN 'purged'
      WHEN retention_expires_at IS NOT NULL AND retention_expires_at <= now() THEN 'eligible'
      ELSE 'not_due'
    END
  WHERE id = p_deleted_account_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'deleted_account_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id
  )
  VALUES (
    auth.uid(),
    'deleted_account_legal_hold_released',
    'deleted_accounts',
    p_deleted_account_id
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_account_closure_legal_hold(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_account_closure_legal_hold(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_deleted_account_legal_hold(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_deleted_account_legal_hold(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.apply_account_closure_legal_hold(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_account_closure_legal_hold(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_deleted_account_legal_hold(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_deleted_account_legal_hold(uuid) TO authenticated;

-- ===== 20260621201500_add_support_pii_scrub.sql =====
ALTER TABLE public.dev_support_issues
  ADD COLUMN IF NOT EXISTS pii_scrubbed_at timestamptz,
  ADD COLUMN IF NOT EXISTS pii_scrub_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_pii_scrub_due
  ON public.dev_support_issues(updated_at)
  WHERE status IN ('resolved', 'wont_fix')
    AND pii_scrubbed_at IS NULL;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'scrub-old-support-pii',
  'Weekly scrubber that redacts free-text PII from closed support issues after retention',
  10080,
  11520,
  12960
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
