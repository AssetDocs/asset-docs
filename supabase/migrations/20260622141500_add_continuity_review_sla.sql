ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS review_sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_sla_basis TEXT,
  ADD COLUMN IF NOT EXISTS review_sla_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (review_sla_status IN ('not_started', 'on_track', 'due_soon', 'overdue', 'paused', 'met')),
  ADD COLUMN IF NOT EXISTS review_sla_met_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_sla_last_calculated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_account_continuity_requests_review_sla
  ON public.account_continuity_requests(review_sla_status, review_sla_due_at)
  WHERE status IN ('submitted', 'under_review', 'needs_documentation', 'escalated');

CREATE OR REPLACE FUNCTION public.refresh_continuity_review_sla()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  IF NOT (
    public.has_owner_workspace_access(auth.uid())
    OR public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_continuity_requests
  SET
    review_sla_due_at = CASE
      WHEN status = 'submitted' THEN created_at + interval '24 hours'
      WHEN status = 'needs_documentation' THEN updated_at + interval '48 hours'
      WHEN status = 'escalated'
        OR owner_dispute_status = 'disputed'
        OR COALESCE(risk_level, 'low') IN ('elevated', 'critical')
      THEN COALESCE(owner_disputed_at, updated_at, created_at) + interval '24 hours'
      WHEN status = 'under_review' THEN created_at + interval '72 hours'
      ELSE review_sla_due_at
    END,
    review_sla_basis = CASE
      WHEN status = 'submitted' THEN 'new_request_triage_1_business_day'
      WHEN status = 'needs_documentation' THEN 'documentation_followup_2_business_days'
      WHEN status = 'escalated'
        OR owner_dispute_status = 'disputed'
        OR COALESCE(risk_level, 'low') IN ('elevated', 'critical')
      THEN 'high_risk_or_dispute_same_business_day'
      WHEN status = 'under_review' THEN 'active_review_3_business_days'
      ELSE review_sla_basis
    END,
    review_sla_status = CASE
      WHEN status NOT IN ('submitted', 'under_review', 'needs_documentation', 'escalated') THEN 'met'
      WHEN (
        CASE
          WHEN status = 'submitted' THEN created_at + interval '24 hours'
          WHEN status = 'needs_documentation' THEN updated_at + interval '48 hours'
          WHEN status = 'escalated'
            OR owner_dispute_status = 'disputed'
            OR COALESCE(risk_level, 'low') IN ('elevated', 'critical')
          THEN COALESCE(owner_disputed_at, updated_at, created_at) + interval '24 hours'
          WHEN status = 'under_review' THEN created_at + interval '72 hours'
        END
      ) <= now() THEN 'overdue'
      WHEN (
        CASE
          WHEN status = 'submitted' THEN created_at + interval '24 hours'
          WHEN status = 'needs_documentation' THEN updated_at + interval '48 hours'
          WHEN status = 'escalated'
            OR owner_dispute_status = 'disputed'
            OR COALESCE(risk_level, 'low') IN ('elevated', 'critical')
          THEN COALESCE(owner_disputed_at, updated_at, created_at) + interval '24 hours'
          WHEN status = 'under_review' THEN created_at + interval '72 hours'
        END
      ) <= now() + interval '12 hours' THEN 'due_soon'
      ELSE 'on_track'
    END,
    review_sla_met_at = CASE
      WHEN status NOT IN ('submitted', 'under_review', 'needs_documentation', 'escalated')
      THEN COALESCE(review_sla_met_at, now())
      ELSE NULL
    END,
    review_sla_last_calculated_at = now(),
    updated_at = updated_at
  WHERE status IN (
    'submitted',
    'under_review',
    'needs_documentation',
    'escalated',
    'approved',
    'denied',
    'completed',
    'archived',
    'completed_memorialization',
    'completed_preservation',
    'closure_waiting_period',
    'closure_completed',
    'approved_export',
    'temporary_access_granted'
  );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_continuity_review_sla_status()
RETURNS TABLE (
  request_id UUID,
  status TEXT,
  risk_level TEXT,
  owner_dispute_status TEXT,
  review_sla_due_at TIMESTAMPTZ,
  review_sla_basis TEXT,
  review_sla_status TEXT,
  hours_until_due NUMERIC,
  hours_overdue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_owner_workspace_access(auth.uid())
    OR public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  PERFORM public.refresh_continuity_review_sla();

  RETURN QUERY
  SELECT
    r.id,
    r.status,
    COALESCE(r.risk_level, 'low'),
    r.owner_dispute_status,
    r.review_sla_due_at,
    r.review_sla_basis,
    r.review_sla_status,
    CASE
      WHEN r.review_sla_due_at IS NULL THEN NULL
      ELSE ROUND((EXTRACT(EPOCH FROM (r.review_sla_due_at - now())) / 3600)::NUMERIC, 1)
    END AS hours_until_due,
    CASE
      WHEN r.review_sla_due_at IS NULL OR r.review_sla_due_at > now() THEN NULL
      ELSE ROUND((EXTRACT(EPOCH FROM (now() - r.review_sla_due_at)) / 3600)::NUMERIC, 1)
    END AS hours_overdue
  FROM public.account_continuity_requests r
  WHERE r.status IN ('submitted', 'under_review', 'needs_documentation', 'escalated')
  ORDER BY
    CASE r.review_sla_status
      WHEN 'overdue' THEN 0
      WHEN 'due_soon' THEN 1
      WHEN 'on_track' THEN 2
      ELSE 3
    END,
    r.review_sla_due_at ASC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_continuity_review_sla() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_continuity_review_sla_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_continuity_review_sla() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_continuity_review_sla_status() TO authenticated, service_role;
