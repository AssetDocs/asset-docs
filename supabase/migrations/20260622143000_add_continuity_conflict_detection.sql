ALTER TABLE public.account_continuity_requests
  DROP CONSTRAINT IF EXISTS account_continuity_requests_status_check;

ALTER TABLE public.account_continuity_requests
  ADD CONSTRAINT account_continuity_requests_status_check
  CHECK (status IN (
    'submitted',
    'under_review',
    'needs_documentation',
    'escalated',
    'approved',
    'denied',
    'declined',
    'completed',
    'archived',
    'completed_memorialization',
    'completed_preservation',
    'closure_waiting_period',
    'closure_completed',
    'approved_export',
    'temporary_access_granted',
    'ownership_transfer_pending',
    'draft',
    'additional_info_requested'
  ));

ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS conflict_status TEXT NOT NULL DEFAULT 'none'
    CHECK (conflict_status IN ('none', 'potential_conflict', 'resolved')),
  ADD COLUMN IF NOT EXISTS conflict_group_id UUID,
  ADD COLUMN IF NOT EXISTS conflicting_request_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  ADD COLUMN IF NOT EXISTS conflict_detected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS conflict_resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS conflict_resolved_by UUID,
  ADD COLUMN IF NOT EXISTS conflict_resolution_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_account_continuity_requests_conflicts
  ON public.account_continuity_requests(conflict_status, account_id, conflict_detected_at)
  WHERE conflict_status = 'potential_conflict';

CREATE OR REPLACE FUNCTION public.refresh_continuity_request_conflicts()
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

  WITH active_requests AS (
    SELECT id, account_id
    FROM public.account_continuity_requests
    WHERE status IN ('submitted', 'under_review', 'needs_documentation', 'escalated', 'approved', 'ownership_transfer_pending')
  ),
  conflict_candidates AS (
    SELECT
      r.id,
      r.account_id,
      array_agg(o.id ORDER BY o.id) FILTER (WHERE o.id <> r.id) AS other_request_ids
    FROM active_requests r
    JOIN active_requests o ON o.account_id = r.account_id
    GROUP BY r.id, r.account_id
    HAVING COUNT(*) > 1
  ),
  marked AS (
    UPDATE public.account_continuity_requests r
    SET
      conflict_status = 'potential_conflict',
      conflict_group_id = COALESCE(r.conflict_group_id, r.account_id),
      conflicting_request_ids = COALESCE(c.other_request_ids, ARRAY[]::UUID[]),
      conflict_detected_at = COALESCE(r.conflict_detected_at, now()),
      risk_flags = COALESCE(r.risk_flags, '{}'::jsonb) || jsonb_build_object('competing_continuity_request', true),
      risk_level = CASE
        WHEN COALESCE(r.risk_level, 'low') IN ('low', 'moderate') THEN 'elevated'
        ELSE r.risk_level
      END,
      review_sla_status = CASE WHEN r.review_sla_status = 'not_started' THEN 'due_soon' ELSE r.review_sla_status END,
      review_sla_last_calculated_at = now(),
      updated_at = r.updated_at
    FROM conflict_candidates c
    WHERE r.id = c.id
      AND r.conflict_status <> 'resolved'
      AND (
        r.conflict_status <> 'potential_conflict'
        OR r.conflicting_request_ids IS DISTINCT FROM COALESCE(c.other_request_ids, ARRAY[]::UUID[])
      )
    RETURNING r.id
  ),
  cleared AS (
    UPDATE public.account_continuity_requests r
    SET
      conflict_status = CASE WHEN r.conflict_status = 'potential_conflict' THEN 'none' ELSE r.conflict_status END,
      conflicting_request_ids = ARRAY[]::UUID[],
      risk_flags = COALESCE(r.risk_flags, '{}'::jsonb) - 'competing_continuity_request',
      updated_at = r.updated_at
    WHERE r.conflict_status = 'potential_conflict'
      AND NOT EXISTS (
        SELECT 1 FROM conflict_candidates c WHERE c.id = r.id
      )
    RETURNING r.id
  )
  SELECT COUNT(*)::INTEGER INTO v_updated
  FROM (
    SELECT id FROM marked
    UNION ALL
    SELECT id FROM cleared
  ) changed;

  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_continuity_request_conflict(
  _request_id UUID,
  _resolution_notes TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Requires Continuity Reviewer permission' USING ERRCODE = '42501';
  END IF;
  IF _resolution_notes IS NULL OR length(trim(_resolution_notes)) < 10 THEN
    RAISE EXCEPTION 'Conflict resolution notes are required';
  END IF;

  SELECT id, account_id INTO v_request
  FROM public.account_continuity_requests
  WHERE id = _request_id
  FOR UPDATE;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Continuity request not found';
  END IF;

  UPDATE public.account_continuity_requests
  SET
    conflict_status = 'resolved',
    conflict_resolved_at = now(),
    conflict_resolved_by = auth.uid(),
    conflict_resolution_notes = _resolution_notes,
    updated_at = now()
  WHERE id = _request_id;

  PERFORM public.log_continuity_event(
    _request_id,
    'continuity_conflict_resolved',
    'Competing continuity request conflict reviewed',
    jsonb_build_object('resolution_notes', _resolution_notes),
    v_request.account_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_continuity_execution_guard(_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  SELECT owner_dispute_status, freeze_status, waiting_period_starts_at, scheduled_execution_at,
         waiting_period_bypassed_at, account_id, conflict_status
    INTO r FROM public.account_continuity_requests WHERE id = _request_id;

  IF r.owner_dispute_status = 'disputed' THEN
    RAISE EXCEPTION 'Execution blocked: owner has disputed this request';
  END IF;
  IF r.freeze_status = 'active' THEN
    RAISE EXCEPTION 'Execution blocked: an active freeze is in place';
  END IF;
  IF r.conflict_status = 'potential_conflict' THEN
    RAISE EXCEPTION 'Execution blocked: competing continuity requests require conflict review';
  END IF;
  IF r.scheduled_execution_at IS NOT NULL AND r.scheduled_execution_at > now() AND r.waiting_period_bypassed_at IS NULL THEN
    RAISE EXCEPTION 'Execution blocked: waiting period has not elapsed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_continuity_request_conflicts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_continuity_request_conflict(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_continuity_request_conflicts() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_continuity_request_conflict(UUID, TEXT) TO authenticated, service_role;
