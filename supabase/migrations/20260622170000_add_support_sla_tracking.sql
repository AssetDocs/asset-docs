ALTER TABLE public.dev_support_issues
  ADD COLUMN IF NOT EXISTS support_tier TEXT NOT NULL DEFAULT 'standard'
    CHECK (support_tier IN ('standard', 'priority', 'vip')),
  ADD COLUMN IF NOT EXISTS first_response_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_status TEXT NOT NULL DEFAULT 'on_track'
    CHECK (sla_status IN ('on_track', 'due_soon', 'overdue', 'met', 'missed')),
  ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

CREATE OR REPLACE FUNCTION public.support_first_response_interval(p_priority public.dev_support_priority)
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_priority
    WHEN 'critical' THEN interval '1 hour'
    WHEN 'high' THEN interval '4 hours'
    WHEN 'medium' THEN interval '1 day'
    ELSE interval '2 days'
  END;
$$;

CREATE OR REPLACE FUNCTION public.support_resolution_interval(p_priority public.dev_support_priority)
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_priority
    WHEN 'critical' THEN interval '8 hours'
    WHEN 'high' THEN interval '1 day'
    WHEN 'medium' THEN interval '3 days'
    ELSE interval '7 days'
  END;
$$;

CREATE OR REPLACE FUNCTION public.set_dev_support_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_created_at TIMESTAMPTZ := COALESCE(NEW.created_at, now());
BEGIN
  IF TG_OP = 'INSERT'
    OR NEW.priority IS DISTINCT FROM OLD.priority
    OR NEW.first_response_due_at IS NULL
    OR NEW.resolution_due_at IS NULL
  THEN
    NEW.first_response_due_at := v_created_at + public.support_first_response_interval(NEW.priority);
    NEW.resolution_due_at := v_created_at + public.support_resolution_interval(NEW.priority);
  END IF;

  IF NEW.status IN ('investigating', 'in_progress', 'resolved', 'wont_fix')
    AND NEW.first_responded_at IS NULL
  THEN
    NEW.first_responded_at := now();
  END IF;

  IF NEW.status IN ('resolved', 'wont_fix') AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := now();
  END IF;

  IF NEW.status IN ('resolved', 'wont_fix') THEN
    NEW.sla_status := CASE
      WHEN NEW.resolution_due_at IS NULL OR COALESCE(NEW.resolved_at, now()) <= NEW.resolution_due_at THEN 'met'
      ELSE 'missed'
    END;
  ELSIF NEW.resolution_due_at IS NOT NULL AND now() > NEW.resolution_due_at THEN
    NEW.sla_status := 'overdue';
  ELSIF NEW.resolution_due_at IS NOT NULL AND now() > NEW.resolution_due_at - interval '6 hours' THEN
    NEW.sla_status := 'due_soon';
  ELSE
    NEW.sla_status := 'on_track';
  END IF;

  IF NEW.priority = 'critical' AND NEW.escalated_at IS NULL THEN
    NEW.escalated_at := now();
    NEW.escalation_reason := COALESCE(NEW.escalation_reason, 'Critical support issue');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_dev_support_sla_trigger ON public.dev_support_issues;
CREATE TRIGGER set_dev_support_sla_trigger
  BEFORE INSERT OR UPDATE ON public.dev_support_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_dev_support_sla();

UPDATE public.dev_support_issues
SET updated_at = updated_at;

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_sla
  ON public.dev_support_issues(sla_status, resolution_due_at)
  WHERE status IN ('new', 'investigating', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_escalated
  ON public.dev_support_issues(escalated_at DESC)
  WHERE escalated_at IS NOT NULL;
