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
  FROM continuity_overdue;
END;
$$;

REVOKE ALL ON FUNCTION public.get_continuity_ops_report() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_continuity_ops_report() TO authenticated, service_role;
