CREATE TABLE IF NOT EXISTS public.cron_job_health (
  job_name TEXT PRIMARY KEY,
  description TEXT,
  expected_interval_minutes INTEGER NOT NULL CHECK (expected_interval_minutes > 0),
  warn_after_minutes INTEGER NOT NULL CHECK (warn_after_minutes > 0),
  page_after_minutes INTEGER NOT NULL CHECK (page_after_minutes > 0),
  last_started_at TIMESTAMPTZ,
  last_succeeded_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_duration_ms INTEGER CHECK (last_duration_ms IS NULL OR last_duration_ms >= 0),
  last_status TEXT NOT NULL DEFAULT 'never_run'
    CHECK (last_status IN ('never_run', 'running', 'succeeded', 'failed')),
  last_error TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  last_result JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (warn_after_minutes <= page_after_minutes)
);

ALTER TABLE public.cron_job_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can view cron job health"
  ON public.cron_job_health;
CREATE POLICY "Dev workspace can view cron job health"
  ON public.cron_job_health
  FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_cron_job_health_updated_at
  ON public.cron_job_health;
CREATE TRIGGER update_cron_job_health_updated_at
  BEFORE UPDATE ON public.cron_job_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.record_cron_job_started(p_job_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cron_job_health
  SET
    last_started_at = now(),
    last_status = 'running',
    last_error = NULL,
    updated_at = now()
  WHERE job_name = p_job_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_cron_job_result(
  p_job_name TEXT,
  p_status TEXT,
  p_duration_ms INTEGER DEFAULT NULL,
  p_result JSONB DEFAULT '{}'::JSONB,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('succeeded', 'failed') THEN
    RAISE EXCEPTION 'unsupported cron job status: %', p_status;
  END IF;

  UPDATE public.cron_job_health
  SET
    last_succeeded_at = CASE WHEN p_status = 'succeeded' THEN now() ELSE last_succeeded_at END,
    last_failed_at = CASE WHEN p_status = 'failed' THEN now() ELSE last_failed_at END,
    last_duration_ms = p_duration_ms,
    last_status = p_status,
    last_error = CASE
      WHEN p_status = 'failed' THEN left(COALESCE(p_error, 'cron_job_failed'), 1000)
      ELSE NULL
    END,
    consecutive_failures = CASE
      WHEN p_status = 'failed' THEN consecutive_failures + 1
      ELSE 0
    END,
    last_result = COALESCE(p_result, '{}'::JSONB),
    updated_at = now()
  WHERE job_name = p_job_name;
END;
$$;

CREATE OR REPLACE VIEW public.cron_job_health_status AS
SELECT
  h.*,
  CASE
    WHEN h.last_status = 'never_run' THEN 'never_run'
    WHEN h.last_status = 'failed' THEN 'failed'
    WHEN h.last_succeeded_at IS NULL THEN 'never_run'
    WHEN h.last_succeeded_at < now() - make_interval(mins => h.page_after_minutes) THEN 'page'
    WHEN h.last_succeeded_at < now() - make_interval(mins => h.warn_after_minutes) THEN 'warn'
    ELSE 'ok'
  END AS health_status,
  CASE
    WHEN h.last_succeeded_at IS NULL THEN NULL
    ELSE floor(EXTRACT(EPOCH FROM (now() - h.last_succeeded_at)) / 60)::INTEGER
  END AS minutes_since_success
FROM public.cron_job_health h;

ALTER VIEW public.cron_job_health_status SET (security_invoker = true);

GRANT SELECT ON public.cron_job_health TO authenticated;
GRANT SELECT ON public.cron_job_health_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_cron_job_started(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_cron_job_result(TEXT, TEXT, INTEGER, JSONB, TEXT) TO service_role;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES
  ('check-gift-reminders', 'Daily gift expiration reminder sweeper', 1440, 1560, 1800),
  ('check-gift-deliveries', 'Scheduled gift delivery email sweeper', 60, 120, 180),
  ('check-payment-failures', 'Daily billing dunning and failed-payment reminder sweeper', 1440, 1560, 1800),
  ('check-grace-period-expiry', 'Legacy Locker recovery grace-period expiry sweeper', 60, 120, 180),
  ('expire-subscription-grace-periods-hourly', 'Database cron job that expires billing grace periods', 60, 120, 180),
  ('process-storage-deletion-jobs', 'Storage object deletion outbox worker', 5, 30, 60),
  ('process-retention-expirations', 'Deleted-account retention expiration sweeper', 1440, 1560, 1800),
  ('notify-manual-review-backlog', 'Daily manual review backlog notifier', 1440, 1560, 1800)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
