# Asset Safe Restore Drill Reminder Cron Runbook

Status: launch operations runbook
Function: `quarterly-restore-drill-reminder`
Schedule: monthly check; sends only when no passed drill is recorded in the last 90 days

## Purpose

This cron does not perform a restore. It checks `restore_drill_runs` and reminds operators when a quarterly PITR restore drill is due.

The actual restore remains a human-operated Supabase dashboard task documented in `docs/AssetSafe_Backup_Restore_Runbook.md`.

## Required Secrets

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESTORE_DRILL_REMINDER_EMAILS`, comma-separated

If `RESTORE_DRILL_REMINDER_EMAILS` is absent, the function falls back to `ADMIN_BACKLOG_EMAILS`.

## Install Cron

Run this in Supabase SQL editor after deployment. Replace `<PROJECT_REF>` and `<INTERNAL_SECRET>` at execution time; do not commit secrets.

```sql
select cron.schedule(
  'quarterly-restore-drill-reminder',
  '0 15 1 * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.functions.supabase.co/quarterly-restore-drill-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', '<INTERNAL_SECRET>'
    ),
    body := jsonb_build_object('due_after_days', 90)
  );
  $$
);
```

## Smoke Test

```sql
select net.http_post(
  url := 'https://<PROJECT_REF>.functions.supabase.co/quarterly-restore-drill-reminder',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-internal-secret', '<INTERNAL_SECRET>'
  ),
  body := jsonb_build_object('dry_run', true, 'force', true)
);
```

Expected result:

- HTTP 200
- JSON status `dry_run_due`
- `cron_job_health.job_name='quarterly-restore-drill-reminder'` shows a recent successful run

## Operations Notes

- A passed row in `restore_drill_runs` resets the 90-day due window.
- Planned or in-progress drill rows are included in the reminder email.
- The reminder records failures when recipients or Resend are missing, so cron health surfaces configuration drift.
