ALTER TABLE public.dev_support_issues
  ADD COLUMN IF NOT EXISTS pii_scrubbed_at timestamptz,
  ADD COLUMN IF NOT EXISTS pii_scrub_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_pii_scrub_due
  ON public.dev_support_issues(updated_at)
  WHERE status IN ('resolved', 'wont_fix')
    AND pii_scrubbed_at IS NULL;

INSERT INTO public.cron_job_health (
  job_name,
  description,
  expected_interval_minutes,
  warn_after_minutes,
  page_after_minutes
) VALUES (
  'scrub-old-support-pii',
  'Weekly scrubber that redacts free-text PII from closed support issues after retention',
  10080,
  11520,
  12960
)
ON CONFLICT (job_name) DO UPDATE
SET
  description = EXCLUDED.description,
  expected_interval_minutes = EXCLUDED.expected_interval_minutes,
  warn_after_minutes = EXCLUDED.warn_after_minutes,
  page_after_minutes = EXCLUDED.page_after_minutes,
  updated_at = now();
