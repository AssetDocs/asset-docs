-- ===== 20260622100000_add_server_managed_account_export_bundles.sql =====
ALTER TABLE public.account_export_audit
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'exports',
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS bundle_file_name TEXT,
  ADD COLUMN IF NOT EXISTS bundle_size_bytes BIGINT CHECK (bundle_size_bytes IS NULL OR bundle_size_bytes >= 0),
  ADD COLUMN IF NOT EXISTS bundle_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS download_limit INTEGER NOT NULL DEFAULT 5 CHECK (download_limit BETWEEN 1 AND 50),
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMPTZ;

DO $mig$
DECLARE v_constraint_name TEXT;
BEGIN
  SELECT conname INTO v_constraint_name FROM pg_constraint
  WHERE conrelid = 'public.account_export_audit'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%export_type%' LIMIT 1;
  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.account_export_audit DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $mig$;

ALTER TABLE public.account_export_audit
  ADD CONSTRAINT account_export_audit_export_type_check
  CHECK (export_type IN ('complete_asset_summary', 'asset_summary_pdf', 'asset_zip', 'server_bundle'));

DO $mig$
DECLARE v_constraint_name TEXT;
BEGIN
  SELECT conname INTO v_constraint_name FROM pg_constraint
  WHERE conrelid = 'public.account_export_audit'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%' LIMIT 1;
  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.account_export_audit DROP CONSTRAINT %I', v_constraint_name);
  END IF;
END $mig$;

ALTER TABLE public.account_export_audit
  ADD CONSTRAINT account_export_audit_status_check
  CHECK (status IN ('started', 'succeeded', 'failed', 'requested', 'generating', 'ready', 'expired', 'exhausted'));

CREATE INDEX IF NOT EXISTS idx_account_export_audit_ready_expiry
  ON public.account_export_audit(expires_at) WHERE status = 'ready';
CREATE INDEX IF NOT EXISTS idx_account_export_audit_ready_downloads
  ON public.account_export_audit(download_count, download_limit) WHERE status = 'ready';

CREATE OR REPLACE FUNCTION public.create_account_export_bundle_request(
  p_export_type TEXT DEFAULT 'server_bundle',
  p_file_count INTEGER DEFAULT NULL,
  p_signed_url_ttl_seconds INTEGER DEFAULT 900,
  p_download_limit INTEGER DEFAULT 5,
  p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS TABLE (audit_id UUID, storage_bucket TEXT, storage_path TEXT, expires_at TIMESTAMPTZ, download_limit INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_user_id UUID := auth.uid();
  v_account_id UUID;
  v_audit_id UUID := gen_random_uuid();
  v_expires_at TIMESTAMPTZ := now() + interval '7 days';
  v_storage_bucket TEXT := 'exports';
  v_storage_path TEXT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000'; END IF;
  IF COALESCE(p_download_limit, 5) < 1 OR COALESCE(p_download_limit, 5) > 50 THEN
    RAISE EXCEPTION 'download_limit_out_of_range' USING ERRCODE = '22023'; END IF;
  IF COALESCE(p_signed_url_ttl_seconds, 900) < 60 OR COALESCE(p_signed_url_ttl_seconds, 900) > 3600 THEN
    RAISE EXCEPTION 'signed_url_ttl_out_of_range' USING ERRCODE = '22023'; END IF;
  SELECT id INTO v_account_id FROM public.accounts
    WHERE owner_user_id = v_user_id ORDER BY created_at ASC LIMIT 1;
  IF v_account_id IS NULL THEN RAISE EXCEPTION 'account_not_found' USING ERRCODE = '22023'; END IF;
  v_storage_path := v_account_id::TEXT || '/' || v_audit_id::TEXT || '/asset-safe-export-' ||
    to_char(now(), 'YYYY-MM-DD') || '.zip';
  INSERT INTO public.account_export_audit (
    id, user_id, account_id, export_type, status, file_count, signed_url_ttl_seconds,
    metadata, storage_bucket, storage_path, bundle_file_name, expires_at, download_limit
  ) VALUES (
    v_audit_id, v_user_id, v_account_id, COALESCE(p_export_type, 'server_bundle'),
    'requested', p_file_count, COALESCE(p_signed_url_ttl_seconds, 900),
    COALESCE(p_metadata, '{}'::JSONB), v_storage_bucket, v_storage_path,
    split_part(v_storage_path, '/', 3), v_expires_at, COALESCE(p_download_limit, 5)
  );
  audit_id := v_audit_id; storage_bucket := v_storage_bucket; storage_path := v_storage_path;
  expires_at := v_expires_at; download_limit := COALESCE(p_download_limit, 5);
  RETURN NEXT;
END;
$fn$;

REVOKE ALL ON FUNCTION public.create_account_export_bundle_request(TEXT, INTEGER, INTEGER, INTEGER, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_account_export_bundle_request(TEXT, INTEGER, INTEGER, INTEGER, JSONB) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_account_export_bundle(p_audit_id UUID)
RETURNS TABLE (audit_id UUID, account_id UUID, storage_bucket TEXT, storage_path TEXT,
  bundle_file_name TEXT, signed_url_ttl_seconds INTEGER, expires_at TIMESTAMPTZ,
  download_count INTEGER, download_limit INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_user_id UUID := auth.uid();
  v_export public.account_export_audit%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000'; END IF;
  SELECT * INTO v_export FROM public.account_export_audit WHERE id = p_audit_id FOR UPDATE;
  IF v_export.id IS NULL THEN RAISE EXCEPTION 'account_export_bundle_not_found' USING ERRCODE = '22023'; END IF;
  IF NOT (public.has_dev_workspace_access(v_user_id) OR v_export.user_id = v_user_id
       OR public.is_account_owner(v_user_id, v_export.account_id)) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501'; END IF;
  IF v_export.status <> 'ready' THEN RAISE EXCEPTION 'account_export_bundle_not_ready' USING ERRCODE = '22023'; END IF;
  IF v_export.storage_bucket IS NULL OR v_export.storage_path IS NULL THEN
    RAISE EXCEPTION 'account_export_bundle_missing_storage' USING ERRCODE = '22023'; END IF;
  IF v_export.expires_at IS NULL OR v_export.expires_at <= now() THEN
    UPDATE public.account_export_audit SET status = 'expired', updated_at = now() WHERE id = v_export.id;
    RAISE EXCEPTION 'account_export_bundle_expired' USING ERRCODE = '22023'; END IF;
  IF v_export.download_count >= v_export.download_limit THEN
    UPDATE public.account_export_audit SET status = 'exhausted', updated_at = now() WHERE id = v_export.id;
    RAISE EXCEPTION 'account_export_download_limit_reached' USING ERRCODE = '22023'; END IF;
  UPDATE public.account_export_audit SET
    download_count = download_count + 1, last_downloaded_at = now(),
    status = CASE WHEN download_count + 1 >= download_limit THEN 'exhausted' ELSE status END,
    updated_at = now()
  WHERE id = v_export.id RETURNING * INTO v_export;
  audit_id := v_export.id; account_id := v_export.account_id;
  storage_bucket := v_export.storage_bucket; storage_path := v_export.storage_path;
  bundle_file_name := v_export.bundle_file_name;
  signed_url_ttl_seconds := COALESCE(v_export.signed_url_ttl_seconds, 900);
  expires_at := v_export.expires_at; download_count := v_export.download_count;
  download_limit := v_export.download_limit; RETURN NEXT;
END;
$fn$;

REVOKE ALL ON FUNCTION public.consume_account_export_bundle(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_account_export_bundle(UUID) TO authenticated;

-- ===== 20260622103000_allow_owner_managed_export_uploads.sql =====
CREATE OR REPLACE FUNCTION public.mark_account_export_bundle_ready(
  p_audit_id UUID, p_storage_bucket TEXT, p_storage_path TEXT, p_bundle_file_name TEXT,
  p_bundle_size_bytes BIGINT DEFAULT NULL, p_bundle_sha256 TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE v_user_id UUID := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.account_export_audit audit
    WHERE audit.id = p_audit_id
      AND (public.is_service_role() OR public.has_dev_workspace_access(v_user_id)
           OR audit.user_id = v_user_id OR public.is_account_owner(v_user_id, audit.account_id))
  ) THEN RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501'; END IF;
  UPDATE public.account_export_audit SET
    status = CASE WHEN p_error_message IS NULL THEN 'ready' ELSE 'failed' END,
    storage_bucket = COALESCE(NULLIF(p_storage_bucket, ''), storage_bucket),
    storage_path = COALESCE(NULLIF(p_storage_path, ''), storage_path),
    bundle_file_name = COALESCE(NULLIF(p_bundle_file_name, ''), bundle_file_name),
    bundle_size_bytes = p_bundle_size_bytes, bundle_sha256 = p_bundle_sha256,
    completed_at = CASE WHEN p_error_message IS NULL THEN now() ELSE completed_at END,
    error_message = CASE WHEN p_error_message IS NULL THEN NULL ELSE left(p_error_message, 1000) END,
    updated_at = now()
  WHERE id = p_audit_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'account_export_audit_not_found' USING ERRCODE = '22023'; END IF;
  RETURN p_audit_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public.mark_account_export_bundle_ready(UUID, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_account_export_bundle_ready(UUID, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT) TO authenticated, service_role;

DROP POLICY IF EXISTS "Account owners can upload managed export bundles" ON storage.objects;
CREATE POLICY "Account owners can upload managed export bundles" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'exports' AND EXISTS (
      SELECT 1 FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (audit.user_id = auth.uid() OR public.is_account_owner(auth.uid(), audit.account_id))
    )
  );

DROP POLICY IF EXISTS "Account owners can update managed export bundles" ON storage.objects;
CREATE POLICY "Account owners can update managed export bundles" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'exports' AND EXISTS (
      SELECT 1 FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (audit.user_id = auth.uid() OR public.is_account_owner(auth.uid(), audit.account_id))
    )
  ) WITH CHECK (
    bucket_id = 'exports' AND EXISTS (
      SELECT 1 FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (audit.user_id = auth.uid() OR public.is_account_owner(auth.uid(), audit.account_id))
    )
  );

-- ===== 20260622110000_create_dashboard_resume_activities.sql =====
CREATE TABLE IF NOT EXISTS public.dashboard_resume_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  workspace_context TEXT NOT NULL CHECK (workspace_context IN ('owned', 'shared')),
  activity_type TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_resume_activities_label_length CHECK (char_length(activity_label) BETWEEN 1 AND 120),
  CONSTRAINT dashboard_resume_activities_route_length CHECK (char_length(destination_route) BETWEEN 1 AND 300)
);

GRANT SELECT, INSERT, DELETE ON public.dashboard_resume_activities TO authenticated;
GRANT ALL ON public.dashboard_resume_activities TO service_role;

ALTER TABLE public.dashboard_resume_activities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_dashboard_resume_user_account_created
  ON public.dashboard_resume_activities(user_id, account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_resume_account_created
  ON public.dashboard_resume_activities(account_id, created_at DESC);

DROP POLICY IF EXISTS "Users can view own dashboard resume activity" ON public.dashboard_resume_activities;
CREATE POLICY "Users can view own dashboard resume activity" ON public.dashboard_resume_activities
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.account_memberships membership
      WHERE membership.account_id = dashboard_resume_activities.account_id
        AND membership.user_id = auth.uid() AND membership.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert own dashboard resume activity" ON public.dashboard_resume_activities;
CREATE POLICY "Users can insert own dashboard resume activity" ON public.dashboard_resume_activities
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.account_memberships membership
      WHERE membership.account_id = dashboard_resume_activities.account_id
        AND membership.user_id = auth.uid() AND membership.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can delete own dashboard resume activity" ON public.dashboard_resume_activities;
CREATE POLICY "Users can delete own dashboard resume activity" ON public.dashboard_resume_activities
  FOR DELETE TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE public.dashboard_resume_activities IS
  'Sanitized per-user dashboard resume metadata. Stores navigation labels only, never vault contents or private notes.';