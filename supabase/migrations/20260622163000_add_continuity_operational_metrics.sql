CREATE OR REPLACE FUNCTION public.get_continuity_ops_report()
RETURNS TABLE (
  metric_key TEXT,
  metric_label TEXT,
  metric_value INTEGER,
  oldest_age_hours NUMERIC,
  newest_age_hours NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH continuity_disputes AS (
    SELECT
      owner_disputed_at AS started_at
    FROM public.account_continuity_requests
    WHERE owner_dispute_status = 'disputed'
  ),
  external_waiting AS (
    SELECT
      submitted_at AS started_at
    FROM public.external_account_assistance_requests
    WHERE status NOT IN ('denied', 'completed', 'archived')
  ),
  external_high_risk AS (
    SELECT
      submitted_at AS started_at
    FROM public.external_account_assistance_requests
    WHERE status NOT IN ('denied', 'completed', 'archived')
      AND risk_level IN ('elevated', 'critical')
  ),
  continuity_overdue AS (
    SELECT
      COALESCE(review_sla_due_at, created_at) AS started_at
    FROM public.account_continuity_requests
    WHERE review_sla_status = 'overdue'
      AND status IN ('submitted', 'under_review', 'needs_documentation', 'escalated')
  ),
  continuity_backlog AS (
    SELECT created_at AS started_at
    FROM public.account_continuity_requests
    WHERE status IN ('submitted', 'under_review', 'needs_documentation', 'escalated', 'approved', 'closure_waiting_period', 'ownership_transfer_pending')
  ),
  first_triage AS (
    SELECT
      r.id,
      r.created_at,
      MIN(a.created_at) AS triaged_at
    FROM public.account_continuity_requests r
    JOIN public.continuity_audit_logs a
      ON a.request_id = r.id
     AND a.action_type = 'status_changed'
     AND a.action_details->>'from' = 'submitted'
     AND COALESCE(a.action_details->>'to', '') <> 'submitted'
    WHERE r.created_at >= now() - interval '90 days'
    GROUP BY r.id, r.created_at
  ),
  triage_durations AS (
    SELECT EXTRACT(EPOCH FROM (triaged_at - created_at)) / 3600 AS duration_hours
    FROM first_triage
    WHERE triaged_at >= created_at
  ),
  dispute_durations AS (
    SELECT EXTRACT(EPOCH FROM (now() - started_at)) / 3600 AS duration_hours
    FROM continuity_disputes
    WHERE started_at IS NOT NULL
  ),
  closure_population AS (
    SELECT status, completed_at, waiting_period_starts_at, created_at
    FROM public.account_continuity_requests
    WHERE request_type IN ('account_closure', 'closure')
      AND COALESCE(waiting_period_starts_at, created_at) >= now() - interval '90 days'
      AND status IN ('closure_waiting_period', 'closure_completed', 'completed', 'archived')
  )
  SELECT
    'unresolved_owner_disputes'::TEXT,
    'Unresolved Owner Disputes'::TEXT,
    COUNT(*)::INTEGER,
    ROUND((EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 3600)::NUMERIC, 1),
    ROUND((EXTRACT(EPOCH FROM (now() - MAX(started_at))) / 3600)::NUMERIC, 1)
  FROM continuity_disputes
  UNION ALL
  SELECT
    'external_assistance_waiting'::TEXT,
    'External Assistance Waiting'::TEXT,
    COUNT(*)::INTEGER,
    ROUND((EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 3600)::NUMERIC, 1),
    ROUND((EXTRACT(EPOCH FROM (now() - MAX(started_at))) / 3600)::NUMERIC, 1)
  FROM external_waiting
  UNION ALL
  SELECT
    'high_risk_external_assistance'::TEXT,
    'High-Risk External Assistance'::TEXT,
    COUNT(*)::INTEGER,
    ROUND((EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 3600)::NUMERIC, 1),
    ROUND((EXTRACT(EPOCH FROM (now() - MAX(started_at))) / 3600)::NUMERIC, 1)
  FROM external_high_risk
  UNION ALL
  SELECT
    'overdue_continuity_reviews'::TEXT,
    'Overdue Continuity Reviews'::TEXT,
    COUNT(*)::INTEGER,
    ROUND((EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 3600)::NUMERIC, 1),
    ROUND((EXTRACT(EPOCH FROM (now() - MAX(started_at))) / 3600)::NUMERIC, 1)
  FROM continuity_overdue
  UNION ALL
  SELECT
    'continuity_review_backlog'::TEXT,
    'Review Backlog'::TEXT,
    COUNT(*)::INTEGER,
    ROUND((EXTRACT(EPOCH FROM (now() - MIN(started_at))) / 3600)::NUMERIC, 1),
    ROUND((EXTRACT(EPOCH FROM (now() - MAX(started_at))) / 3600)::NUMERIC, 1)
  FROM continuity_backlog
  UNION ALL
  SELECT
    'median_triage_time_hours'::TEXT,
    'Median Triage Time'::TEXT,
    COALESCE(ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_hours))::INTEGER, 0),
    NULL::NUMERIC,
    NULL::NUMERIC
  FROM triage_durations
  UNION ALL
  SELECT
    'median_dispute_age_hours'::TEXT,
    'Median Dispute Age'::TEXT,
    COALESCE(ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_hours))::INTEGER, 0),
    ROUND(MAX(duration_hours)::NUMERIC, 1),
    ROUND(MIN(duration_hours)::NUMERIC, 1)
  FROM dispute_durations
  UNION ALL
  SELECT
    'closure_completion_rate_90d'::TEXT,
    'Closure Completion Rate'::TEXT,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE status IN ('closure_completed', 'completed', 'archived') OR completed_at IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100)::INTEGER
    END,
    NULL::NUMERIC,
    NULL::NUMERIC
  FROM closure_population;
END;
$$;

REVOKE ALL ON FUNCTION public.get_continuity_ops_report() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_continuity_ops_report() TO authenticated, service_role;
