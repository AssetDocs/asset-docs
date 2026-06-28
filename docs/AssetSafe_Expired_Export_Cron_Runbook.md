# Asset Safe Expired Export Cron Runbook

Status: deployment runbook, no embedded secret
Function: `process-expired-exports`
Cadence: hourly

## Purpose

`process-expired-exports` performs three cleanup tasks:

1. Calls `expire_continuity_export_authorizations()` so expired continuity export grants stop working.
2. Calls `expire_account_export_bundles()` so managed account export audit rows flip to `expired` after `expires_at`.
3. Removes expired managed bundle objects plus stale objects from configured export storage buckets, defaulting to `exports`, when objects are older than 24 hours.

The function records health in `cron_job_health` as `process-expired-exports`.

## Prerequisites

- Private Supabase Storage bucket `exports` exists.
- Migration `20260622113000_expire_account_export_bundles.sql` has been applied.
- PostgREST schema cache has been reloaded after the migration, for example:

```sql
notify pgrst, 'reload schema';
```

- The AssetSafe internal cron secret is stored in Supabase Edge Function Secrets as `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`.

## Manual Smoke Test

Invoke the function with a dry run before enabling cron:

```sql
select net.http_post(
  url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-expired-exports',
  headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
  body := jsonb_build_object(
    'dry_run', true,
    'min_age_hours', 24,
    'limit', 100
  )
) as request_id;
```

Check the returned ID:

```sql
select
  id,
  status_code,
  timed_out,
  error_msg,
  created,
  left(content, 2000) as content_preview
from net._http_response
where id = <REQUEST_ID>;
```

Expected result:

- HTTP `200`.
- `cron_job_health.job_name='process-expired-exports'` shows a recent run.
- Response includes export authorization and account export bundle counts.

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
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body := jsonb_build_object(
      'dry_run', false,
      'min_age_hours', 24,
      'limit', 1000
    )
  );
  $$
);
```

Verify the schedule without exposing the embedded secret:

```sql
select jobid, schedule, jobname, active
from cron.job
where jobname = 'process-expired-exports';
```

Do not select or screenshot `cron.job.command`; it contains the embedded `x-internal-secret` value.

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
