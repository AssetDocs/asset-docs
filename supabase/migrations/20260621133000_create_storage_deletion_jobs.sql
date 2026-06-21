-- Durable storage deletion outbox for account deletion and orphan cleanup.
-- Jobs are service-role only; user-facing retry for ordinary file rows still
-- uses the existing pending_delete columns and secure-delete-file flow.

CREATE TABLE IF NOT EXISTS public.storage_deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  object_path text NOT NULL,
  source text,
  source_table text,
  owner_user_id uuid,
  account_id uuid,
  deleted_account_id uuid REFERENCES public.deleted_accounts(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  processing_started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT storage_deletion_jobs_unique_deleted_account_object
    UNIQUE (bucket, object_path, deleted_account_id)
);

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_retry
  ON public.storage_deletion_jobs(status, next_attempt_at)
  WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_deleted_account_id
  ON public.storage_deletion_jobs(deleted_account_id)
  WHERE deleted_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_storage_deletion_jobs_owner_user_id
  ON public.storage_deletion_jobs(owner_user_id)
  WHERE owner_user_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_storage_deletion_jobs_updated_at
  ON public.storage_deletion_jobs;

CREATE TRIGGER update_storage_deletion_jobs_updated_at
  BEFORE UPDATE ON public.storage_deletion_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.storage_deletion_jobs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.storage_deletion_jobs FROM anon, authenticated;
GRANT ALL ON public.storage_deletion_jobs TO service_role;
