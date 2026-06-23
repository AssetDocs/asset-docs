CREATE TABLE IF NOT EXISTS public.email_deliverability_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'resend'
    CHECK (provider IN ('resend', 'supabase_auth', 'manual')),
  provider_event_id TEXT,
  provider_message_id TEXT,
  event_type TEXT NOT NULL,
  email_stream TEXT,
  recipient_email_hash TEXT,
  recipient_domain TEXT,
  from_email TEXT,
  subject TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

REVOKE ALL ON public.email_deliverability_events FROM anon;
GRANT SELECT ON public.email_deliverability_events TO authenticated;
GRANT ALL ON public.email_deliverability_events TO service_role;

ALTER TABLE public.email_deliverability_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view email deliverability events"
  ON public.email_deliverability_events;
CREATE POLICY "Dev workspace can view email deliverability events"
  ON public.email_deliverability_events
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE UNIQUE INDEX IF NOT EXISTS uniq_email_deliverability_provider_event
  ON public.email_deliverability_events(provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_deliverability_events_occurred
  ON public.email_deliverability_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_deliverability_events_type_occurred
  ON public.email_deliverability_events(event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_deliverability_events_domain
  ON public.email_deliverability_events(recipient_domain, occurred_at DESC)
  WHERE recipient_domain IS NOT NULL;

CREATE OR REPLACE VIEW public.email_deliverability_health_status AS
WITH stats AS (
  SELECT
    COUNT(*) FILTER (WHERE occurred_at >= now() - interval '24 hours')::INTEGER AS events_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '24 hours'
        AND event_type IN ('email.sent', 'email.delivered', 'sent', 'delivered')
    )::INTEGER AS sent_or_delivered_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '24 hours'
        AND event_type IN ('email.bounced', 'bounced', 'bounce')
    )::INTEGER AS bounced_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '24 hours'
        AND event_type IN ('email.complained', 'complained', 'complaint', 'spam_complaint')
    )::INTEGER AS complained_24h,
    COUNT(*) FILTER (
      WHERE occurred_at >= now() - interval '24 hours'
        AND event_type IN ('email.delivery_delayed', 'delivery_delayed', 'delayed')
    )::INTEGER AS delayed_24h,
    MAX(occurred_at) AS latest_event_at
  FROM public.email_deliverability_events
),
latest_problem AS (
  SELECT event_type, recipient_domain, occurred_at
  FROM public.email_deliverability_events
  WHERE event_type IN ('email.bounced', 'bounced', 'bounce', 'email.complained', 'complained', 'complaint', 'spam_complaint')
  ORDER BY occurred_at DESC
  LIMIT 1
)
SELECT
  'email-deliverability'::TEXT AS monitor_name,
  'Email bounce, complaint, and delay monitor'::TEXT AS description,
  stats.events_24h,
  stats.sent_or_delivered_24h,
  stats.bounced_24h,
  stats.complained_24h,
  stats.delayed_24h,
  CASE WHEN stats.sent_or_delivered_24h = 0 THEN NULL
    ELSE round((stats.bounced_24h::NUMERIC / stats.sent_or_delivered_24h::NUMERIC) * 100, 2) END AS bounce_rate_24h,
  CASE WHEN stats.sent_or_delivered_24h = 0 THEN NULL
    ELSE round((stats.complained_24h::NUMERIC / stats.sent_or_delivered_24h::NUMERIC) * 100, 2) END AS complaint_rate_24h,
  stats.latest_event_at,
  latest_problem.event_type AS latest_problem_event_type,
  latest_problem.recipient_domain AS latest_problem_domain,
  latest_problem.occurred_at AS latest_problem_at,
  CASE
    WHEN stats.events_24h = 0 THEN 'no_events'
    WHEN stats.complained_24h >= 3 THEN 'page'
    WHEN stats.sent_or_delivered_24h >= 20
      AND (stats.bounced_24h::NUMERIC / NULLIF(stats.sent_or_delivered_24h, 0)) >= 0.10 THEN 'page'
    WHEN stats.complained_24h > 0 THEN 'warn'
    WHEN stats.sent_or_delivered_24h >= 20
      AND (stats.bounced_24h::NUMERIC / NULLIF(stats.sent_or_delivered_24h, 0)) >= 0.05 THEN 'warn'
    WHEN stats.delayed_24h >= 10 THEN 'warn'
    ELSE 'ok'
  END AS health_status
FROM stats
LEFT JOIN latest_problem ON true;

ALTER VIEW public.email_deliverability_health_status SET (security_invoker = true);
GRANT SELECT ON public.email_deliverability_health_status TO authenticated;

COMMENT ON TABLE public.email_deliverability_events IS
  'Normalized deliverability event sink for Resend/Supabase Auth email webhooks. Store hashes/domains rather than plaintext recipients.';