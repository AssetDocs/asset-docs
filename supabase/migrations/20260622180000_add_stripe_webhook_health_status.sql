CREATE INDEX IF NOT EXISTS idx_stripe_events_outcome_created
  ON public.stripe_events(outcome, created_at DESC);

CREATE OR REPLACE VIEW public.stripe_webhook_health_status AS
WITH stats AS (
  SELECT
    COUNT(*)::INTEGER AS total_events,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '24 hours')::INTEGER AS events_24h,
    COUNT(*) FILTER (WHERE outcome = 'pending')::INTEGER AS pending_events,
    MIN(created_at) FILTER (WHERE outcome = 'pending') AS oldest_pending_at,
    MAX(created_at) AS latest_event_at,
    MAX(processed_at) FILTER (WHERE outcome IN ('success', 'skipped', 'error')) AS latest_processed_at,
    COUNT(*) FILTER (
      WHERE outcome = 'error'
        AND created_at >= now() - interval '24 hours'
    )::INTEGER AS error_events_24h
  FROM public.stripe_events
),
latest_error AS (
  SELECT
    stripe_event_id,
    event_type,
    created_at,
    error_message,
    outcome
  FROM public.stripe_events
  WHERE outcome = 'error'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  'stripe-webhook'::TEXT AS monitor_name,
  'Stripe webhook processing lag and error monitor'::TEXT AS description,
  stats.total_events,
  stats.events_24h,
  stats.pending_events,
  stats.oldest_pending_at,
  CASE
    WHEN stats.oldest_pending_at IS NULL THEN NULL
    ELSE floor(EXTRACT(EPOCH FROM (now() - stats.oldest_pending_at)) / 60)::INTEGER
  END AS oldest_pending_minutes,
  stats.latest_event_at,
  stats.latest_processed_at,
  stats.error_events_24h,
  latest_error.stripe_event_id AS latest_error_event_id,
  latest_error.event_type AS latest_error_event_type,
  latest_error.created_at AS latest_error_at,
  latest_error.error_message AS latest_error_message,
  CASE
    WHEN stats.total_events = 0 THEN 'no_events'
    WHEN stats.oldest_pending_at IS NOT NULL
      AND stats.oldest_pending_at < now() - interval '30 minutes'
      THEN 'page'
    WHEN stats.error_events_24h >= 5 THEN 'page'
    WHEN stats.oldest_pending_at IS NOT NULL
      AND stats.oldest_pending_at < now() - interval '10 minutes'
      THEN 'warn'
    WHEN stats.error_events_24h > 0 THEN 'warn'
    ELSE 'ok'
  END AS health_status
FROM stats
LEFT JOIN latest_error ON true;

ALTER VIEW public.stripe_webhook_health_status SET (security_invoker = true);

GRANT SELECT ON public.stripe_webhook_health_status TO authenticated;
