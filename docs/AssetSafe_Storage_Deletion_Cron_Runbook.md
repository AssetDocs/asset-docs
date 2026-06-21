# Runbook: Schedule `process-storage-deletion-jobs`

**Owner:** Platform / Ops
**Function:** `supabase/functions/process-storage-deletion-jobs`
**Auth model:** Public endpoint (`verify_jwt = false`) protected by an `x-internal-secret` header that must equal `SUPABASE_SERVICE_ROLE_KEY`.
**Why this is a manual runbook, not a migration:** the schedule embeds the service-role key in `pg_cron` job SQL. We deliberately keep that out of git history and out of automated migrations. Operators run this once per environment, from an authenticated Supabase SQL editor session.

---

## 1. Prerequisites

- Function `process-storage-deletion-jobs` is deployed and reachable at:
  `https://<PROJECT_REF>.supabase.co/functions/v1/process-storage-deletion-jobs`
- Extensions enabled in the target project (one-time, safe to re-run):
  ```sql
  create extension if not exists pg_cron with schema extensions;
  create extension if not exists pg_net  with schema extensions;
  ```
- You have the project's `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
  **Never** paste it into a migration file, a chat, or a committed `.sql` file.

## 2. Environments

| Env     | Project ref           | Cron name                              | Cadence       |
| ------- | --------------------- | -------------------------------------- | ------------- |
| prod    | `leotcbfpqiekgkgumecn`| `process-storage-deletion-jobs-prod`   | `*/5 * * * *` |
| staging | _fill in_             | `process-storage-deletion-jobs-staging`| `*/5 * * * *` |

5-minute cadence is the default; adjust per ops policy.

## 3. Schedule the job

Run in the **Supabase SQL Editor** for the target project (authenticated session — do NOT script this through CI or commit it):

```sql
select cron.schedule(
  'process-storage-deletion-jobs-prod',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-storage-deletion-jobs',
    headers := jsonb_build_object(
      'Content-Type',      'application/json',
      'x-internal-secret', '<PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

Verify:

```sql
select jobid, schedule, jobname, active
from cron.job
where jobname = 'process-storage-deletion-jobs-prod';
```

## 4. Rotate the secret

When `SUPABASE_SERVICE_ROLE_KEY` is rotated, the cron job's embedded header becomes stale and the function will return 401. Re-run:

```sql
select cron.unschedule('process-storage-deletion-jobs-prod');
-- then re-run the cron.schedule(...) block in section 3 with the new key
```

## 5. Pause / resume / remove

```sql
-- pause
update cron.job set active = false where jobname = 'process-storage-deletion-jobs-prod';
-- resume
update cron.job set active = true  where jobname = 'process-storage-deletion-jobs-prod';
-- remove
select cron.unschedule('process-storage-deletion-jobs-prod');
```

## 6. Observability

- Recent invocations: `select * from cron.job_run_details where jobid = <id> order by start_time desc limit 20;`
- Function logs: Supabase Dashboard → Edge Functions → `process-storage-deletion-jobs` → Logs.
- Expected response: `200` with a JSON summary of jobs processed. `401` means the header secret no longer matches the current service-role key — re-run section 4.

## 7. Manual invocation (smoke test)

```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: $SUPABASE_SERVICE_ROLE_KEY" \
  https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/process-storage-deletion-jobs
```
