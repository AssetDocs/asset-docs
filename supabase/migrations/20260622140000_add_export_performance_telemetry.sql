ALTER TABLE public.account_export_audit
  ADD COLUMN IF NOT EXISTS export_duration_ms INTEGER CHECK (export_duration_ms IS NULL OR export_duration_ms >= 0),
  ADD COLUMN IF NOT EXISTS bundle_bytes_per_second NUMERIC CHECK (bundle_bytes_per_second IS NULL OR bundle_bytes_per_second >= 0),
  ADD COLUMN IF NOT EXISTS performance_alert BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_account_export_audit_performance_alert
  ON public.account_export_audit(performance_alert, started_at DESC)
  WHERE performance_alert = true;

UPDATE public.account_export_audit
SET
  export_duration_ms = GREATEST(
    0,
    FLOOR(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::INTEGER
  ),
  bundle_bytes_per_second = CASE
    WHEN bundle_size_bytes IS NOT NULL
      AND completed_at IS NOT NULL
      AND completed_at > started_at
    THEN ROUND((bundle_size_bytes::NUMERIC / EXTRACT(EPOCH FROM (completed_at - started_at)))::NUMERIC, 2)
    ELSE NULL
  END,
  performance_alert = CASE
    WHEN completed_at IS NOT NULL
      AND (
        completed_at - started_at >= interval '10 minutes'
        OR COALESCE(bundle_size_bytes, 0) >= 1073741824
      )
    THEN true
    ELSE performance_alert
  END
WHERE completed_at IS NOT NULL
  AND export_duration_ms IS NULL;

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
  v_started_at TIMESTAMPTZ;
  v_completed_at TIMESTAMPTZ := now();
  v_duration_ms INTEGER;
  v_bytes_per_second NUMERIC;
  v_performance_alert BOOLEAN;
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

  SELECT started_at
  INTO v_started_at
  FROM public.account_export_audit
  WHERE id = p_audit_id;

  IF v_started_at IS NULL THEN
    RAISE EXCEPTION 'account_export_audit_not_found' USING ERRCODE = '22023';
  END IF;

  v_duration_ms := GREATEST(
    0,
    FLOOR(EXTRACT(EPOCH FROM (v_completed_at - v_started_at)) * 1000)::INTEGER
  );

  v_bytes_per_second := CASE
    WHEN p_bundle_size_bytes IS NOT NULL AND v_duration_ms > 0
    THEN ROUND((p_bundle_size_bytes::NUMERIC / (v_duration_ms::NUMERIC / 1000))::NUMERIC, 2)
    ELSE NULL
  END;

  v_performance_alert := (
    v_duration_ms >= 10 * 60 * 1000
    OR COALESCE(p_bundle_size_bytes, 0) >= 1073741824
  );

  UPDATE public.account_export_audit
  SET
    status = CASE WHEN p_error_message IS NULL THEN 'ready' ELSE 'failed' END,
    storage_bucket = COALESCE(NULLIF(p_storage_bucket, ''), storage_bucket),
    storage_path = COALESCE(NULLIF(p_storage_path, ''), storage_path),
    bundle_file_name = COALESCE(NULLIF(p_bundle_file_name, ''), bundle_file_name),
    bundle_size_bytes = p_bundle_size_bytes,
    bundle_sha256 = p_bundle_sha256,
    completed_at = v_completed_at,
    export_duration_ms = v_duration_ms,
    bundle_bytes_per_second = v_bytes_per_second,
    performance_alert = v_performance_alert,
    error_message = CASE WHEN p_error_message IS NULL THEN NULL ELSE left(p_error_message, 1000) END,
    updated_at = v_completed_at
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
