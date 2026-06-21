CREATE TABLE IF NOT EXISTS public.restore_drill_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL DEFAULT 'prod'
    CHECK (environment IN ('prod', 'staging', 'scratch', 'local')),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'passed', 'failed', 'cancelled')),
  drill_type TEXT NOT NULL DEFAULT 'pitr_to_scratch'
    CHECK (drill_type IN ('pitr_to_scratch', 'logical_backup_restore', 'full_app_restore')),
  source_project_ref TEXT,
  target_project_ref TEXT,
  restore_point_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rpo_minutes INTEGER CHECK (rpo_minutes IS NULL OR rpo_minutes >= 0),
  rto_minutes INTEGER CHECK (rto_minutes IS NULL OR rto_minutes >= 0),
  db_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  storage_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  auth_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  edge_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  signed_url_smoke_passed BOOLEAN NOT NULL DEFAULT false,
  findings TEXT[] NOT NULL DEFAULT '{}',
  follow_up_actions TEXT[] NOT NULL DEFAULT '{}',
  runbook_version TEXT NOT NULL DEFAULT '2026-06-21',
  operator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

ALTER TABLE public.restore_drill_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can view restore drill runs"
  ON public.restore_drill_runs
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can create restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can create restore drill runs"
  ON public.restore_drill_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can update restore drill runs"
  ON public.restore_drill_runs;
CREATE POLICY "Dev workspace can update restore drill runs"
  ON public.restore_drill_runs
  FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_restore_drill_runs_updated_at
  ON public.restore_drill_runs;
CREATE TRIGGER update_restore_drill_runs_updated_at
  BEFORE UPDATE ON public.restore_drill_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_restore_drill_runs_status_created
  ON public.restore_drill_runs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restore_drill_runs_completed
  ON public.restore_drill_runs(completed_at DESC)
  WHERE completed_at IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.restore_drill_runs TO authenticated;
GRANT ALL ON public.restore_drill_runs TO service_role;
