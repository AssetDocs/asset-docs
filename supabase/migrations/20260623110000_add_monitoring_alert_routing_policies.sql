CREATE TABLE IF NOT EXISTS public.monitoring_alert_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_key TEXT NOT NULL UNIQUE,
  monitor_label TEXT NOT NULL,
  owner_team TEXT NOT NULL DEFAULT 'Platform / Ops',
  warning_channel TEXT NOT NULL DEFAULT 'ops_email'
    CHECK (warning_channel IN ('admin_dashboard', 'ops_email', 'slack', 'pager')),
  page_channel TEXT NOT NULL DEFAULT 'ops_email'
    CHECK (page_channel IN ('admin_dashboard', 'ops_email', 'slack', 'pager')),
  warn_rule TEXT NOT NULL,
  page_rule TEXT NOT NULL,
  runbook_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.monitoring_alert_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view monitoring alert policies"
  ON public.monitoring_alert_policies;
CREATE POLICY "Dev workspace can view monitoring alert policies"
  ON public.monitoring_alert_policies
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can manage monitoring alert policies"
  ON public.monitoring_alert_policies;
CREATE POLICY "Dev workspace can manage monitoring alert policies"
  ON public.monitoring_alert_policies
  FOR ALL
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_monitoring_alert_policies_updated_at
  ON public.monitoring_alert_policies;
CREATE TRIGGER update_monitoring_alert_policies_updated_at
  BEFORE UPDATE ON public.monitoring_alert_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON public.monitoring_alert_policies FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.monitoring_alert_policies TO authenticated;
GRANT ALL ON public.monitoring_alert_policies TO service_role;

INSERT INTO public.monitoring_alert_policies (
  monitor_key,
  monitor_label,
  owner_team,
  warning_channel,
  page_channel,
  warn_rule,
  page_rule,
  runbook_url
) VALUES
  (
    'cron_job_health',
    'Cron Job Health',
    'Platform / Ops',
    'ops_email',
    'pager',
    'Any cron_job_health_status row enters warn, failed, or never_run outside launch validation windows.',
    'Any cron_job_health_status row enters page, or a launch-critical cron has consecutive failures.',
    'docs/AssetSafe_Storage_Deletion_Cron_Runbook.md'
  ),
  (
    'stripe_webhook_health',
    'Stripe Webhook Health',
    'Billing / Ops',
    'ops_email',
    'pager',
    'Pending Stripe webhook older than 10 minutes or any Stripe processing errors in 24h.',
    'Pending Stripe webhook older than 30 minutes or 5+ Stripe processing errors in 24h.',
    'docs/AssetSafe_Billing_Revenue_Operations.md'
  ),
  (
    'email_deliverability',
    'Email Deliverability',
    'Platform / Ops',
    'ops_email',
    'pager',
    'Complaint > 0, bounce rate >= 5% with at least 20 sent/delivered events, or 10+ delayed events in 24h.',
    '3+ complaints in 24h or bounce rate >= 10% with at least 20 sent/delivered events.',
    'docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md'
  ),
  (
    'edge_function_health',
    'Edge Function Health',
    'Platform / Ops',
    'ops_email',
    'pager',
    'Any function failure in the last hour or 24h failure rate >= 5% with at least 20 invocations.',
    '5+ function failures in the last hour or 24h failure rate >= 10% with at least 20 invocations.',
    'docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md'
  )
ON CONFLICT (monitor_key) DO UPDATE
SET
  monitor_label = EXCLUDED.monitor_label,
  owner_team = EXCLUDED.owner_team,
  warning_channel = EXCLUDED.warning_channel,
  page_channel = EXCLUDED.page_channel,
  warn_rule = EXCLUDED.warn_rule,
  page_rule = EXCLUDED.page_rule,
  runbook_url = EXCLUDED.runbook_url,
  enabled = true,
  updated_at = now();
