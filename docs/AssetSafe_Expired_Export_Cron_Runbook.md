# Asset Safe Expired Export Cron Runbook

Status: deployment runbook, no embedded secret
Function: `process-expired-exports`
Cadence: hourly

## Purpose

`process-expired-exports` performs two cleanup tasks:

1. Calls `expire_continuity_export_authorizations()` so expired continuity export grants stop working.
2. Removes stale objects from the configured export storage bucket(s), defaulting to `exports`, when objects are older than 24 hours.

The function records health in `cron_job_health` as `process-expired-exports`.

## Storage Bucket Prerequisite

Create a private `exports` bucket before enabling the cron. Do this through the Supabase Storage UI or an approved storage API path, not through a SQL migration, because the Lovable migration runner blocks direct `storage.buckets` writes.

## Manual Smoke Test

Invoke the function with a dry run before enabling cron:

```sql
select net.http_post(
  url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-expired-exports',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-internal-secret', '<SUPABASE_SERVICE_ROLE_KEY>'
  ),
  body := jsonb_build_object(
    'dry_run', true,
    'min_age_hours', 24,
    'limit', 100
  )
);
```

Expected result:

- HTTP 200.
- `cron_job_health.job_name='process-expired-exports'` shows a recent run.
- Response includes `expired_authorizations` and per-bucket scan counts.

## Schedule Hourly

Create or replace the cron job after the function has been deployed:

```sql
select cron.unschedule('process-expired-exports')
where exists (
  select 1 from cron.job where jobname = 'process-expired-exports'
);

select cron.schedule(
  'process-expired-exports',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-expired-exports',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', '<SUPABASE_SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object(
      'dry_run', false,
      'min_age_hours', 24,
      'limit', 1000
    )
  );
  $$
);
```

Verify the schedule:

```sql
select jobid, schedule, jobname, active
from cron.job
where jobname = 'process-expired-exports';
```

## Post-Bucket Verification

After the private `exports` bucket exists and the cron is scheduled:

1. Trigger one managed account export from the app with **Export Account Archive**.
2. Confirm `account_export_audit` has a managed bundle row with `storage_bucket='exports'`, a non-null `storage_path`, and status `ready` or `exhausted` after download.
3. Confirm Admin Export Audit shows `bucket private`.
4. After the first scheduled cron run, confirm `cron_job_health_status.job_name='process-expired-exports'` has `last_status='succeeded'` and a non-null `last_succeeded_at`.

## Configuration

Optional function environment variables:

- `EXPORT_SWEEP_BUCKETS`: comma-separated bucket names. Default: `exports`.
- `EXPORT_SWEEP_MIN_AGE_HOURS`: default object age before removal. Default: `24`.

Request body values override environment defaults for one invocation.
