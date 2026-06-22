CREATE TABLE IF NOT EXISTS public.storage_bucket_lifecycle_policies (
  bucket TEXT PRIMARY KEY,
  data_class TEXT NOT NULL,
  expected_public BOOLEAN NOT NULL DEFAULT false,
  retention_rule TEXT NOT NULL,
  cleanup_owner TEXT NOT NULL CHECK (
    cleanup_owner IN (
      'app_sweeper',
      'admin_review',
      'bucket_lifecycle',
      'provider_backup',
      'manual_operator'
    )
  ),
  lifecycle_days INTEGER CHECK (lifecycle_days IS NULL OR lifecycle_days > 0),
  launch_required BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_bucket_lifecycle_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view storage bucket lifecycle policies"
  ON public.storage_bucket_lifecycle_policies;
CREATE POLICY "Dev workspace can view storage bucket lifecycle policies"
  ON public.storage_bucket_lifecycle_policies
  FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can manage storage bucket lifecycle policies"
  ON public.storage_bucket_lifecycle_policies;
CREATE POLICY "Dev workspace can manage storage bucket lifecycle policies"
  ON public.storage_bucket_lifecycle_policies
  FOR ALL
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_storage_bucket_lifecycle_policies_updated_at
  ON public.storage_bucket_lifecycle_policies;
CREATE TRIGGER update_storage_bucket_lifecycle_policies_updated_at
  BEFORE UPDATE ON public.storage_bucket_lifecycle_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.storage_bucket_lifecycle_policies TO authenticated;
GRANT ALL ON public.storage_bucket_lifecycle_policies TO service_role;

INSERT INTO public.storage_bucket_lifecycle_policies (
  bucket,
  data_class,
  expected_public,
  retention_rule,
  cleanup_owner,
  lifecycle_days,
  launch_required,
  notes
) VALUES
  (
    'photos',
    'user_property_media',
    false,
    'Retain while account is active; delete during account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Primary photo bucket used by property files and galleries.'
  ),
  (
    'videos',
    'user_property_media',
    false,
    'Retain while account is active; delete during account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Primary video bucket used by property files and galleries.'
  ),
  (
    'documents',
    'user_documents',
    false,
    'Retain while account is active; delete during account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Default private document bucket for receipts, notes, recipes, and miscellaneous uploads.'
  ),
  (
    'floor-plans',
    'user_property_media',
    false,
    'Retain while account is active; delete during account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Private property floor plan bucket.'
  ),
  (
    'contact-attachments',
    'vip_contact_attachments',
    false,
    'Retain while account is active; delete during contact/account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Attachments associated with VIP Contacts.'
  ),
  (
    'memory-safe',
    'family_archive_media',
    false,
    'Retain while account is active; delete during account hard-delete or approved orphan cleanup.',
    'app_sweeper',
    NULL,
    true,
    'Memory Safe media and document uploads.'
  ),
  (
    'continuity-documents',
    'continuity_case_documents',
    false,
    'Retain for continuity case lifetime plus applicable legal hold/audit retention.',
    'admin_review',
    NULL,
    true,
    'Legacy Admin and continuity review documents; deletion should remain review-gated.'
  ),
  (
    'external-assistance-docs',
    'support_assistance_documents',
    false,
    'Retain for support workflow lifetime; scrub or delete according to support PII retention policy.',
    'admin_review',
    NULL,
    true,
    'External assistance/support evidence documents.'
  ),
  (
    'exports',
    'generated_export_bundles',
    false,
    'Delete generated account export bundles 7 days after creation or when expired.',
    'app_sweeper',
    7,
    true,
    'Managed export bundles downloaded through download-account-export-bundle.'
  )
ON CONFLICT (bucket) DO UPDATE SET
  data_class = EXCLUDED.data_class,
  expected_public = EXCLUDED.expected_public,
  retention_rule = EXCLUDED.retention_rule,
  cleanup_owner = EXCLUDED.cleanup_owner,
  lifecycle_days = EXCLUDED.lifecycle_days,
  launch_required = EXCLUDED.launch_required,
  notes = EXCLUDED.notes,
  updated_at = now();

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
  notes TEXT
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
    policy.notes
  FROM public.storage_bucket_lifecycle_policies policy
  LEFT JOIN storage.buckets bucket
    ON bucket.id::TEXT = policy.bucket
  ORDER BY policy.launch_required DESC, policy.bucket ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_storage_bucket_lifecycle_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_storage_bucket_lifecycle_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_bucket_lifecycle_status() TO service_role;
