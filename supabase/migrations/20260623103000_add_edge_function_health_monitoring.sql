CREATE TABLE IF NOT EXISTS public.edge_function_invocation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  invocation_id TEXT,
  status TEXT NOT NULL
    CHECK (status IN ('started', 'succeeded', 'failed')),
  status_code INTEGER CHECK (status_code IS NULL OR status_code BETWEEN 100 AND 599),
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0),
  error_type TEXT,
  error_message TEXT,
  request_path TEXT,
  actor_user_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_function_invocation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view edge function invocation events"
  ON public.edge_function_invocation_events;
CREATE POLICY "Dev workspace can view edge function invocation events"
  ON public.edge_function_invocation_events
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_edge_function_invocation_events_function
  ON public.edge_function_invocation_events(function_name, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_edge_function_invocation_events_status
  ON public.edge_function_invocation_events(status, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_edge_function_invocation_events_invocation
  ON public.edge_function_invocation_events(invocation_id)
  WHERE invocation_id IS NOT NULL;

REVOKE ALL ON public.edge_function_invocation_events FROM anon;
GRANT SELECT ON public.edge_function_invocation_events TO authenticated;
GRANT ALL ON public.edge_function_invocation_events TO service_role;

CREATE OR REPLACE VIEW public.edge_function_health_status AS
WITH per_function AS (
  SELECT
    function_name,
    COUNT(*) FILTER (WHERE occurred_at >= now() - interval '24 hours')::INTEGER AS invocations_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '24 hours'
        AND status = 'failed'
    )::INTEGER AS failures_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '1 hour'
        AND status = 'failed'
    )::INTEGER AS failures_1h,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms)
      FILTER (
        WHERE occurred_at >= now() - interval '24 hours'
          AND duration_ms IS NOT NULL
      )::INTEGER AS p95_duration_ms_24h,
    MAX(occurred_at) AS latest_invocation_at,
    MAX(occurred_at) FILTER (WHERE status = 'failed') AS latest_failure_at
  FROM public.edge_function_invocation_events
  GROUP BY function_name
),
latest_failure AS (
  SELECT DISTINCT ON (function_name)
    function_name,
    error_type,
    error_message,
    status_code,
    occurred_at
  FROM public.edge_function_invocation_events
  WHERE status = 'failed'
  ORDER BY function_name, occurred_at DESC
)
SELECT
  p.function_name,
  p.invocations_24h,
  p.failures_24h,
  p.failures_1h,
  CASE
    WHEN p.invocations_24h = 0 THEN NULL
    ELSE round((p.failures_24h::NUMERIC / p.invocations_24h::NUMERIC) * 100, 2)
  END AS failure_rate_24h,
  p.p95_duration_ms_24h,
  p.latest_invocation_at,
  p.latest_failure_at,
  latest_failure.error_type AS latest_error_type,
  latest_failure.error_message AS latest_error_message,
  latest_failure.status_code AS latest_error_status_code,
  CASE
    WHEN p.invocations_24h = 0 THEN 'no_events'
    WHEN p.failures_1h >= 5 THEN 'page'
    WHEN p.invocations_24h >= 20
      AND (p.failures_24h::NUMERIC / NULLIF(p.invocations_24h, 0)) >= 0.10
      THEN 'page'
    WHEN p.failures_1h > 0 THEN 'warn'
    WHEN p.invocations_24h >= 20
      AND (p.failures_24h::NUMERIC / NULLIF(p.invocations_24h, 0)) >= 0.05
      THEN 'warn'
    ELSE 'ok'
  END AS health_status
FROM per_function p
LEFT JOIN latest_failure ON latest_failure.function_name = p.function_name;

ALTER VIEW public.edge_function_health_status SET (security_invoker = true);

GRANT SELECT ON public.edge_function_health_status TO authenticated;

COMMENT ON TABLE public.edge_function_invocation_events IS
  'Normalized edge function invocation/event sink for error budget and health monitoring.';
