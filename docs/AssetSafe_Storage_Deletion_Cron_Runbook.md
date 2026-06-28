# Runbook: Data Lifecycle Cron Schedules

**Owner:** Platform / Ops
**Primary function:** `supabase/functions/process-storage-deletion-jobs`
**Auth model:** Public Edge Function endpoints (`verify_jwt = false`) protected by an `x-internal-secret` header. The header must match the AssetSafe internal cron secret stored in Supabase Edge Function Secrets as `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`.

The cron schedule embeds the internal secret in `pg_cron` job SQL. Keep that value out of git, migrations, screenshots, and chat transcripts. Operators run these commands from an authenticated Supabase SQL Editor session.

## Prerequisites

- Target Edge Functions are deployed.
- `pg_cron` and `pg_net` are enabled:

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;
```

- You have the current internal cron secret from the approved secret manager / Supabase Edge Function secret source.
- The `exports` bucket exists and is private before enabling `process-expired-exports`.

## Safe Verification

Do not select or screenshot `cron.job.command`; it contains the embedded `x-internal-secret` value.

Use this instead:

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname in (
  'process-storage-deletion-jobs-prod',
  'process-expired-exports',
  'process-account-closures-prod',
  'process-storage-usage-drift-prod',
  'process-storage-orphans-prod',
  'process-retention-expirations-prod',
  'scrub-old-support-pii-prod',
  'quarterly-restore-drill-reminder'
)
order by jobname;
```

Check function responses here:

```sql
select
  id,
  status_code,
  timed_out,
  error_msg,
  created,
  left(content, 500) as content_preview
from net._http_response
order by id desc
limit 20;
```

Expected: current rows return `status_code = 200`. Old `401` rows indicate stale pre-rotation calls and do not matter once newer rows are healthy.

## Schedule: Storage Deletion Jobs

```sql
select cron.schedule(
  'process-storage-deletion-jobs-prod',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-storage-deletion-jobs',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
```

## Schedule: Expired Exports

Requires `public.expire_account_export_bundles(p_dry_run, p_limit)` from migration `20260622113000_expire_account_export_bundles.sql`.

```sql
select cron.schedule(
  'process-expired-exports',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-expired-exports',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := jsonb_build_object('dry_run', false, 'min_age_hours', 24, 'limit', 1000)
  );
  $$
);
```

## Schedule: Account Closures

Finalizes scheduled account closures by invoking `delete-account`. The cron path authenticates with `x-internal-secret`.

```sql
select cron.schedule(
  'process-account-closures-prod',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-account-closures',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
```

## Schedule: Storage Usage Drift

```sql
select cron.schedule(
  'process-storage-usage-drift-prod',
  '20 * * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-storage-usage-drift',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
```

## Schedule: Storage Orphans

This sweeper inserts rows into `storage_orphan_candidates`; it does not delete objects inline. Approved candidates are later queued into `storage_deletion_jobs`.

```sql
select cron.schedule(
  'process-storage-orphans-prod',
  '40 4 * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-storage-orphans',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
```

## Schedule: Retention Expirations

Start in dry-run. Only flip `dry_run` to `false` after manual review confirms the candidate set.

```sql
select cron.schedule(
  'process-retention-expirations-prod',
  '15 3 * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-retention-expirations',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := jsonb_build_object('dry_run', true)
  );
  $$
);
```

## Schedule: Support PII Scrub

Start in dry-run. Only flip `dry_run` to `false` after reviewing eligible issue IDs.

```sql
select cron.schedule(
  'scrub-old-support-pii-prod',
  '25 5 * * 0',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/scrub-old-support-pii',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := jsonb_build_object('dry_run', true, 'retention_days', 1095)
  );
  $$
);
```

## Schedule: Restore Drill Reminder

```sql
select cron.schedule(
  'quarterly-restore-drill-reminder',
  '0 15 1 * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/quarterly-restore-drill-reminder',
    headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb,
    body    := jsonb_build_object('due_after_days', 90)
  );
  $$
);
```

## Rotate The Internal Cron Secret

1. Create a fresh internal secret value.
2. Update Supabase Edge Function Secrets with the new value under `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`.
3. Deploy affected Edge Functions if the auth helper changed.
4. Unschedule all affected cron jobs.
5. Recreate the schedules with the new value in `x-internal-secret`.
6. Confirm new `net._http_response` rows return `200`.
7. Confirm `cron_job_health_status` returns to `ok` after each schedule's expected run window.

Unschedule block:

```sql
select cron.unschedule('process-storage-deletion-jobs-prod');
select cron.unschedule('process-expired-exports');
select cron.unschedule('process-account-closures-prod');
select cron.unschedule('process-storage-usage-drift-prod');
select cron.unschedule('process-storage-orphans-prod');
select cron.unschedule('process-retention-expirations-prod');
select cron.unschedule('scrub-old-support-pii-prod');
select cron.unschedule('quarterly-restore-drill-reminder');
```

If a job is already absent, Supabase may return `could not find valid entry`; verify active jobs first with the Safe Verification query.

## Cron Health

```sql
select
  job_name,
  health_status,
  last_status,
  last_started_at,
  last_succeeded_at,
  last_failed_at,
  consecutive_failures,
  last_error
from public.cron_job_health_status
where job_name in (
  'process-account-closures',
  'process-expired-exports',
  'process-storage-deletion-jobs',
  'process-storage-orphans',
  'process-storage-usage-drift',
  'process-retention-expirations',
  'scrub-old-support-pii',
  'quarterly-restore-drill-reminder'
)
order by job_name;
```

`page` with `last_status = 'succeeded'` and `consecutive_failures = 0` usually means the success is stale relative to the configured expected interval. Re-check after the next scheduled window before treating it as a function failure.
