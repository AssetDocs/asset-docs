CREATE OR REPLACE FUNCTION public.consume_account_export_bundle(
  p_audit_id UUID
)
RETURNS TABLE (
  audit_id UUID,
  account_id UUID,
  storage_bucket TEXT,
  storage_path TEXT,
  bundle_file_name TEXT,
  signed_url_ttl_seconds INTEGER,
  expires_at TIMESTAMPTZ,
  download_count INTEGER,
  download_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_export public.account_export_audit%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT *
  INTO v_export
  FROM public.account_export_audit
  WHERE id = p_audit_id
  FOR UPDATE;

  IF v_export.id IS NULL THEN
    RAISE EXCEPTION 'account_export_bundle_not_found' USING ERRCODE = '22023';
  END IF;

  IF NOT (
    public.has_dev_workspace_access(v_user_id)
    OR v_export.user_id = v_user_id
    OR public.is_account_owner(v_user_id, v_export.account_id)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;

  IF v_export.status <> 'ready' THEN
    RAISE EXCEPTION 'account_export_bundle_not_ready' USING ERRCODE = '22023';
  END IF;

  IF v_export.storage_bucket IS NULL OR v_export.storage_path IS NULL THEN
    RAISE EXCEPTION 'account_export_bundle_missing_storage' USING ERRCODE = '22023';
  END IF;

  IF v_export.expires_at IS NULL OR v_export.expires_at <= now() THEN
    UPDATE public.account_export_audit
    SET status = 'expired', updated_at = now()
    WHERE id = v_export.id;
    RAISE EXCEPTION 'account_export_bundle_expired' USING ERRCODE = '22023';
  END IF;

  IF v_export.download_count >= v_export.download_limit THEN
    UPDATE public.account_export_audit
    SET status = 'exhausted', updated_at = now()
    WHERE id = v_export.id;
    RAISE EXCEPTION 'account_export_download_limit_reached' USING ERRCODE = '22023';
  END IF;

  UPDATE public.account_export_audit audit
  SET
    download_count = v_export.download_count + 1,
    last_downloaded_at = now(),
    status = CASE
      WHEN v_export.download_count + 1 >= v_export.download_limit THEN 'exhausted'
      ELSE audit.status
    END,
    updated_at = now()
  WHERE audit.id = v_export.id
  RETURNING * INTO v_export;

  audit_id := v_export.id;
  account_id := v_export.account_id;
  storage_bucket := v_export.storage_bucket;
  storage_path := v_export.storage_path;
  bundle_file_name := v_export.bundle_file_name;
  signed_url_ttl_seconds := COALESCE(v_export.signed_url_ttl_seconds, 900);
  expires_at := v_export.expires_at;
  download_count := v_export.download_count;
  download_limit := v_export.download_limit;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_account_export_bundle(UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_account_export_bundle(UUID)
  TO authenticated;
