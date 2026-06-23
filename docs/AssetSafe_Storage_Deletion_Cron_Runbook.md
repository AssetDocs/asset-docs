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

For the full production rotation checklist, affected secrets, emergency triggers, and validation evidence, follow `docs/AssetSafe_Key_Rotation_Runbook.md`.

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

---

# Additional Cron Schedules (Data Lifecycle Sweepers)

Same key-handling rules apply: the `SUPABASE_SERVICE_ROLE_KEY` is pasted by the operator at schedule time and is **never** committed to git or written into a migration. All sweepers below authenticate via `x-internal-secret: <SUPABASE_SERVICE_ROLE_KEY>` and run with `verify_jwt = false` in `supabase/config.toml`.

Replace `<PROJECT_REF>` and `<SERVICE_ROLE_KEY>` per environment before running.

## process-retention-expirations — daily, dry-run by default

Purges retained tombstone-linked records once their retention window has elapsed. **Start in dry-run.** Only flip `dry_run` to `false` after a manual review confirms the candidate set.

```sql
select cron.schedule(
  'process-retention-expirations-prod',
  '15 3 * * *',  -- 03:15 UTC daily
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-retention-expirations',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-internal-secret','<SERVICE_ROLE_KEY>'
    ),
    body    := jsonb_build_object('dry_run', true)
  );
  $$
);
```

Promote to live purge by re-scheduling with `'dry_run', false`.

## process-account-closures — hourly

Finalizes scheduled account closures by invoking `delete-account`. Requires **both** headers — `Authorization: Bearer <service-role-key>` and `x-internal-secret: <service-role-key>`.

```sql
select cron.schedule(
  'process-account-closures-prod',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-account-closures',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'Authorization',    'Bearer <SERVICE_ROLE_KEY>',
      'x-internal-secret','<SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

## process-storage-usage-drift — hourly

Reconciles `storage_usage` ledger against actual bucket totals.

```sql
select cron.schedule(
  'process-storage-usage-drift-prod',
  '20 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-storage-usage-drift',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-internal-secret','<SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

## process-storage-orphans — daily, review-gated

**Conservative by design.** This sweeper only inserts rows into `storage_orphan_candidates`; it never deletes objects inline. Admin/dev review must set a candidate's `status = 'approved'` before the next run will enqueue a row in `storage_deletion_jobs` for the regular 5-minute sweeper to process.

```sql
select cron.schedule(
  'process-storage-orphans-prod',
  '40 4 * * *',  -- 04:40 UTC daily
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-storage-orphans',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-internal-secret','<SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

## scrub-old-support-pii - weekly, dry-run by default

Redacts free-text PII from `dev_support_issues` after closed issues pass the support retention window. Metadata such as type, priority, status, and timestamps remains for trend analysis.

Start in dry-run. Only flip `dry_run` to `false` after reviewing the eligible IDs.

```sql
select cron.schedule(
  'scrub-old-support-pii-prod',
  '25 5 * * 0',  -- 05:25 UTC Sundays
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/scrub-old-support-pii',
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-internal-secret','<SERVICE_ROLE_KEY>'
    ),
    body    := jsonb_build_object('dry_run', true, 'retention_days', 1095)
  );
  $$
);
```

Promote to live scrub by re-scheduling with `'dry_run', false`.

## Cron health visibility

`list-cron-job-health` exposes the latest run, duration, consecutive-failure count, and computed `health_status` (`ok | warn | page | failed | never_run`) per registered job. This is the source of truth for ops dashboards and pager rules — do not poll `cron.job_run_details` directly.

## Export audit & signed-URL window

- Browser account exports are now recorded in `account_export_audit` (one row per export assembly).
- Signed URLs minted during export assembly are valid for **15 minutes** — short enough to limit replay, long enough to assemble a multi-part ZIP.

## Local-only `supabase/config.toml` drift

Some local `config.toml` edits (gift flow, etc.) are intentionally not committed by the maintainer. When applying Lovable changes to `config.toml`, only the `[functions.*]` blocks for the new sweepers are touched; preserve any unrelated local edits during rebase.
