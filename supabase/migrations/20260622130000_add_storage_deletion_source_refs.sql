ALTER TABLE public.storage_deletion_jobs
  ADD COLUMN IF NOT EXISTS source_record_id UUID;

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_source_record
  ON public.storage_deletion_jobs(source_table, source_record_id)
  WHERE source_record_id IS NOT NULL;
