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
