-- Enforce continuity export TTL and download caps at the database boundary.
-- Client/browser-generated account exports are still immediate downloads; this
-- covers server-authorized continuity exports that persist authorization state.

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
