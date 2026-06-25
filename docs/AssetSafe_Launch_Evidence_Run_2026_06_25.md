# Asset Safe Launch Evidence Run - 2026-06-25

Status: cron scheduling evidence update
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Evidence_Run_2026_06_24.md`
- `docs/AssetSafe_Launch_Evidence_SQL.sql`
- `docs/AssetSafe_Storage_Deletion_Cron_Runbook.md`
- `docs/AssetSafe_Expired_Export_Cron_Runbook.md`
- `docs/AssetSafe_Restore_Drill_Reminder_Cron_Runbook.md`

## Summary

The data-lifecycle cron scheduling gap identified on 2026-06-24 has been closed at the scheduler layer.

Operator evidence confirms:

- `process-storage-usage-drift-prod` exists in `cron.job`, is active, and uses schedule `20 * * * *`.
- `public.cron_job_health_status` reports `process-storage-usage-drift` as `ok`.
- `process-storage-usage-drift` has `last_status = succeeded`.
- `last_started_at` and `last_succeeded_at` are populated.
- `last_failed_at`, `last_error`, and consecutive failures are clear.

## Scheduled Lifecycle Jobs

Operator reported the following production cron schedule job IDs:

| Job name | Job ID |
|---|---:|
| `process-storage-deletion-jobs-prod` | 12 |
| `process-expired-exports` | 13 |
| `process-account-closures-prod` | 14 |
| `process-storage-usage-drift-prod` | 10 |
| `process-storage-orphans-prod` | 16 |
| `process-retention-expirations-prod` | 17 |
| `scrub-old-support-pii-prod` | 18 |
| `quarterly-restore-drill-reminder` | 19 |

## Classification

`process-storage-usage-drift` is no longer a launch blocker.

The remaining cron evidence item is to confirm the other lifecycle jobs report successful first runs in `public.cron_job_health_status` after their scheduled windows occur. Dry-run jobs may remain operationally pending until the owner approves promotion from dry-run to live execution.

## Follow-Up Verification

After the remaining schedules have had a chance to run, capture:

```sql
select
  job_name,
  health_status,
  last_status,
  last_started_at,
  last_succeeded_at,
  last_failed_at,
  consecutive_failures,
  last_error,
  last_result
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

Also retain scheduler evidence:

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

## Security Note

The service-role key used for cron scheduling must not be committed to git or retained in launch evidence. If the key was exposed outside the Supabase SQL editor during setup, rotate it and recreate the affected cron schedules with the rotated key.
