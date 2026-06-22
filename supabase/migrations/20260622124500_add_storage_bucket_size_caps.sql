ALTER TABLE public.storage_bucket_lifecycle_policies
  ADD COLUMN IF NOT EXISTS max_bucket_bytes BIGINT CHECK (max_bucket_bytes IS NULL OR max_bucket_bytes > 0),
  ADD COLUMN IF NOT EXISTS alert_threshold_ratio NUMERIC NOT NULL DEFAULT 0.9
    CHECK (alert_threshold_ratio > 0 AND alert_threshold_ratio <= 1);

UPDATE public.storage_bucket_lifecycle_policies
SET
  max_bucket_bytes = CASE bucket
    WHEN 'photos' THEN 2199023255552       -- 2 TB
    WHEN 'videos' THEN 5497558138880       -- 5 TB
    WHEN 'documents' THEN 2199023255552    -- 2 TB
    WHEN 'floor-plans' THEN 536870912000   -- 500 GB
    WHEN 'contact-attachments' THEN 268435456000 -- 250 GB
    WHEN 'memory-safe' THEN 2199023255552  -- 2 TB
    WHEN 'continuity-documents' THEN 268435456000 -- 250 GB
    WHEN 'external-assistance-docs' THEN 107374182400 -- 100 GB
    WHEN 'exports' THEN 107374182400       -- 100 GB
    ELSE max_bucket_bytes
  END,
  alert_threshold_ratio = 0.9,
  updated_at = now()
WHERE bucket IN (
  'photos',
  'videos',
  'documents',
  'floor-plans',
  'contact-attachments',
  'memory-safe',
  'continuity-documents',
  'external-assistance-docs',
  'exports'
);

CREATE OR REPLACE FUNCTION public.get_storage_bucket_lifecycle_status()
RETURNS TABLE (
  bucket TEXT,
  data_class TEXT,
  expected_public BOOLEAN,
  actual_public BOOLEAN,
  bucket_exists BOOLEAN,
  public_matches BOOLEAN,
  lifecycle_days INTEGER,
  cleanup_owner TEXT,
  launch_required BOOLEAN,
  retention_rule TEXT,
  notes TEXT,
  max_bucket_bytes BIGINT,
  alert_threshold_ratio NUMERIC,
  actual_total_bytes BIGINT,
  cap_usage_ratio NUMERIC,
  within_size_cap BOOLEAN,
  size_alert BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF NOT (
    public.is_service_role()
    OR public.has_dev_workspace_access(v_user_id)
  ) THEN
    RAISE EXCEPTION 'Not authorized to inspect storage bucket lifecycle status';
  END IF;

  RETURN QUERY
  WITH bucket_usage AS (
    SELECT
      objects.bucket_id::TEXT AS bucket_id,
      COALESCE(
        SUM(
          CASE
            WHEN objects.metadata->>'size' ~ '^[0-9]+$'
            THEN (objects.metadata->>'size')::BIGINT
            ELSE 0
          END
        ),
        0
      )::BIGINT AS total_bytes
    FROM storage.objects
    GROUP BY objects.bucket_id
  )
  SELECT
    policy.bucket,
    policy.data_class,
    policy.expected_public,
    bucket.public AS actual_public,
    bucket.id IS NOT NULL AS bucket_exists,
    bucket.id IS NOT NULL AND bucket.public = policy.expected_public AS public_matches,
    policy.lifecycle_days,
    policy.cleanup_owner,
    policy.launch_required,
    policy.retention_rule,
    policy.notes,
    policy.max_bucket_bytes,
    policy.alert_threshold_ratio,
    COALESCE(usage.total_bytes, 0)::BIGINT AS actual_total_bytes,
    CASE
      WHEN policy.max_bucket_bytes IS NULL THEN NULL
      ELSE ROUND(COALESCE(usage.total_bytes, 0)::NUMERIC / policy.max_bucket_bytes::NUMERIC, 4)
    END AS cap_usage_ratio,
    CASE
      WHEN policy.max_bucket_bytes IS NULL THEN true
      ELSE COALESCE(usage.total_bytes, 0) <= policy.max_bucket_bytes
    END AS within_size_cap,
    CASE
      WHEN policy.max_bucket_bytes IS NULL THEN false
      ELSE COALESCE(usage.total_bytes, 0)::NUMERIC >= (policy.max_bucket_bytes::NUMERIC * policy.alert_threshold_ratio)
    END AS size_alert
  FROM public.storage_bucket_lifecycle_policies policy
  LEFT JOIN storage.buckets bucket
    ON bucket.id::TEXT = policy.bucket
  LEFT JOIN bucket_usage usage
    ON usage.bucket_id = policy.bucket
  ORDER BY policy.launch_required DESC, policy.bucket ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_storage_bucket_lifecycle_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_storage_bucket_lifecycle_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_bucket_lifecycle_status() TO service_role;
