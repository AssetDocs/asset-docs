INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
)
VALUES (
  'process-expired-exports',
  'Expires continuity export authorizations and removes stale export bucket objects',
  60,
  90,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
