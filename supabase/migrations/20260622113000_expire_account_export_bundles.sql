CREATE OR REPLACE FUNCTION public.expire_account_export_bundles(
  p_limit INTEGER DEFAULT 1000,
  p_dry_run BOOLEAN DEFAULT false
)
RETURNS TABLE (
  audit_id UUID,
  storage_bucket TEXT,
  storage_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_service_role() THEN
    RAISE EXCEPTION 'service_role_required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT
      audit.id,
      audit.storage_bucket,
      audit.storage_path
    FROM public.account_export_audit audit
    WHERE audit.storage_path IS NOT NULL
      AND audit.expires_at IS NOT NULL
      AND audit.expires_at <= now()
      AND audit.status IN ('ready', 'requested', 'generating')
    ORDER BY audit.expires_at ASC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 1000), 5000))
  ),
  updated AS (
    UPDATE public.account_export_audit audit
    SET
      status = CASE WHEN p_dry_run THEN audit.status ELSE 'expired' END,
      updated_at = CASE WHEN p_dry_run THEN audit.updated_at ELSE now() END
    FROM candidates
    WHERE audit.id = candidates.id
    RETURNING candidates.id, candidates.storage_bucket, candidates.storage_path
  )
  SELECT
    updated.id,
    updated.storage_bucket,
    updated.storage_path
  FROM updated;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_account_export_bundles(INTEGER, BOOLEAN)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_account_export_bundles(INTEGER, BOOLEAN)
  TO service_role;
