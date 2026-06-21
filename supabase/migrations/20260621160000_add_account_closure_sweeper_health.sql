CREATE INDEX IF NOT EXISTS idx_account_closure_requests_due_scheduled
  ON public.account_closure_requests(deletion_scheduled_date)
  WHERE status = 'scheduled'
    AND owner_user_id IS NOT NULL;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'process-account-closures',
  'Executes matured scheduled account closures through the delete-account pipeline',
  60,
  120,
  180
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
