-- Let account owners finish their own managed export bundle uploads.
-- The download path remains gated by consume_account_export_bundle.

CREATE OR REPLACE FUNCTION public.mark_account_export_bundle_ready(
  p_audit_id UUID,
  p_storage_bucket TEXT,
  p_storage_path TEXT,
  p_bundle_file_name TEXT,
  p_bundle_size_bytes BIGINT DEFAULT NULL,
  p_bundle_sha256 TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_export_audit audit
    WHERE audit.id = p_audit_id
      AND (
        public.is_service_role()
        OR public.has_dev_workspace_access(v_user_id)
        OR audit.user_id = v_user_id
        OR public.is_account_owner(v_user_id, audit.account_id)
      )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_export_audit
  SET
    status = CASE WHEN p_error_message IS NULL THEN 'ready' ELSE 'failed' END,
    storage_bucket = COALESCE(NULLIF(p_storage_bucket, ''), storage_bucket),
    storage_path = COALESCE(NULLIF(p_storage_path, ''), storage_path),
    bundle_file_name = COALESCE(NULLIF(p_bundle_file_name, ''), bundle_file_name),
    bundle_size_bytes = p_bundle_size_bytes,
    bundle_sha256 = p_bundle_sha256,
    completed_at = CASE WHEN p_error_message IS NULL THEN now() ELSE completed_at END,
    error_message = CASE WHEN p_error_message IS NULL THEN NULL ELSE left(p_error_message, 1000) END,
    updated_at = now()
  WHERE id = p_audit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'account_export_audit_not_found' USING ERRCODE = '22023';
  END IF;

  RETURN p_audit_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_account_export_bundle_ready(UUID, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_account_export_bundle_ready(UUID, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT)
  TO authenticated, service_role;

DROP POLICY IF EXISTS "Account owners can upload managed export bundles"
  ON storage.objects;
CREATE POLICY "Account owners can upload managed export bundles"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exports'
    AND EXISTS (
      SELECT 1
      FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (
          audit.user_id = auth.uid()
          OR public.is_account_owner(auth.uid(), audit.account_id)
        )
    )
  );

DROP POLICY IF EXISTS "Account owners can update managed export bundles"
  ON storage.objects;
CREATE POLICY "Account owners can update managed export bundles"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exports'
    AND EXISTS (
      SELECT 1
      FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (
          audit.user_id = auth.uid()
          OR public.is_account_owner(auth.uid(), audit.account_id)
        )
    )
  )
  WITH CHECK (
    bucket_id = 'exports'
    AND EXISTS (
      SELECT 1
      FROM public.account_export_audit audit
      WHERE audit.storage_bucket = storage.objects.bucket_id::TEXT
        AND audit.storage_path = storage.objects.name
        AND audit.status IN ('requested', 'generating')
        AND (
          audit.user_id = auth.uid()
          OR public.is_account_owner(auth.uid(), audit.account_id)
        )
    )
  );
