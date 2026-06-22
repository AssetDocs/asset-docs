CREATE TABLE IF NOT EXISTS public.support_pii_scrub_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL
    CHECK (status IN ('succeeded', 'failed')),
  dry_run BOOLEAN NOT NULL DEFAULT true,
  retention_days INTEGER NOT NULL CHECK (retention_days >= 30),
  cutoff_at TIMESTAMPTZ NOT NULL,
  eligible_count INTEGER NOT NULL DEFAULT 0 CHECK (eligible_count >= 0),
  scrubbed_count INTEGER NOT NULL DEFAULT 0 CHECK (scrubbed_count >= 0),
  issue_ids UUID[] NOT NULL DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_pii_scrub_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view support pii scrub runs"
  ON public.support_pii_scrub_runs;
CREATE POLICY "Dev workspace can view support pii scrub runs"
  ON public.support_pii_scrub_runs
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

REVOKE ALL ON public.support_pii_scrub_runs FROM anon, authenticated;
GRANT SELECT ON public.support_pii_scrub_runs TO authenticated;
GRANT ALL ON public.support_pii_scrub_runs TO service_role;

CREATE INDEX IF NOT EXISTS idx_support_pii_scrub_runs_completed
  ON public.support_pii_scrub_runs(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_pii_scrub_runs_status
  ON public.support_pii_scrub_runs(status, completed_at DESC);
