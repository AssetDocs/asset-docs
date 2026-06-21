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
select cron.unschedule('process-expired-exports-hourly')
where exists (
  select 1 from cron.job where jobname = 'process-expired-exports-hourly'
);

select cron.schedule(
  'process-expired-exports-hourly',
  '12 * * * *',
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

## Configuration

Optional function environment variables:

- `EXPORT_SWEEP_BUCKETS`: comma-separated bucket names. Default: `exports`.
- `EXPORT_SWEEP_MIN_AGE_HOURS`: default object age before removal. Default: `24`.

Request body values override environment defaults for one invocation.
