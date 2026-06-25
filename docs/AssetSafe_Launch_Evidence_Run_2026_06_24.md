# Asset Safe Launch Evidence Run - 2026-06-24

Status: second evidence pass
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Evidence_SQL.sql`
- `docs/AssetSafe_Launch_Evidence_Run_2026_06_23.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md`

## Summary

The second database evidence pass confirms most corrected queries now run. No item is promoted to `Code required` from this pass alone.

The remaining launch evidence gaps are operational:

- Cron health rows still show `NULL` / `never_run`.
- Storage lifecycle status requires authorized dev/admin workspace access.
- Monitoring alert policy query needed a column correction.
- Provider/legal/security screenshots and approvals are still needed.

## Results

| Evidence item | Result | Classification |
|---|---|---|
| `stripe_events.outcome = 'error'` | Query succeeded | Evidence accepted for current pass |
| 7-day Stripe event summary | Query succeeded | Evidence accepted for current pass |
| Billing manual checkout review | Query succeeded | Evidence accepted for current pass |
| Restore drill query | Query succeeded with corrected columns | Evidence accepted if smoke checks/sign-off evidence are present in returned row |
| Storage bucket list | Query succeeded; `public = false` reported | Evidence accepted for current pass, confirm bucket ID/screenshots |
| Storage lifecycle status | Failed with `Not authorized to inspect storage bucket lifecycle status` | Operator action required |
| Cron health | Rows report `NULL` values / `never_run` | Operator action required |
| Support backlog query | Query succeeded with corrected base columns | Evidence accepted for current pass |
| Monitoring alert policies | Failed because query used old `severity` column | Query bundle corrected |
| Email deliverability events | Query succeeded | Evidence accepted for current pass if expected webhook events are present |
| User consent evidence | Query succeeded; includes `subscription_checkout_post_payment` / `subscription_checkout` for `michael@maaemedia.com` | Evidence accepted for current pass |

## Actions From This Pass

### Admin Database Screenshot Evidence

Screenshot reviewed: `C:\Users\Micha\Downloads\Screenshot_24-6-2026_21283_getassetsafe.com.jpeg`.

Observed:

- Admin Database panel can display Bucket Lifecycle Policies.
- `exports` bucket is present and marked `private`.
- Most launch-required buckets are marked `private`.
- `floor-plans` is marked `missing`.
- Database Health reports:
  - `Storage usage drift cron job needs attention`
  - `Required storage bucket missing`
- Storage Usage Drift panel shows:
  - `Last success: -`
  - `Minutes since success: -`
  - `High drift rows: 0`

Evidence classification:

- Storage lifecycle visibility through Admin UI: evidence accepted.
- Bucket lifecycle launch gate: still `Operator action required` because `floor-plans` is missing.
- Storage usage drift cron health: still `Operator action required` because the job has not reported a successful run.

### Query Bundle Fix

`docs/AssetSafe_Launch_Evidence_SQL.sql` now queries `monitoring_alert_policies` using the actual columns:

- `monitor_key`
- `monitor_label`
- `owner_team`
- `warning_channel`
- `page_channel`
- `warn_rule`
- `page_rule`
- `runbook_url`
- `enabled`
- `updated_at`

### Re-run Needed

Re-run:

```sql
select
  monitor_key,
  monitor_label,
  owner_team,
  warning_channel,
  page_channel,
  warn_rule,
  page_rule,
  runbook_url,
  enabled,
  updated_at
from public.monitoring_alert_policies
order by monitor_key;
```

For storage lifecycle status, re-run as a user with `has_dev_workspace_access(auth.uid()) = true`, or capture the Admin Database panel screenshot instead:

```sql
select *
from public.get_storage_bucket_lifecycle_status()
order by bucket;
```

## Current Launch Classification

No `Code required` item is triggered yet.

Rows that remain `Operator action required`:

- Cron jobs must show real successful runs, not `never_run`.
- Storage lifecycle status has Admin UI evidence, but the missing `floor-plans` bucket must be resolved or explicitly removed from launch-required policy.
- Monitoring alert policy evidence must be re-run with corrected columns.
- PITR, Stripe settings, gift behavior, support ownership, legal approvals, vulnerability scan, and incident/tabletop evidence still need non-SQL evidence.

## Immediate Operator Actions

1. Create the missing `floor-plans` bucket as private in Supabase Storage, or update `storage_bucket_lifecycle_policies` if `floor-plans` is not launch-required.
2. Run or wait for `process-storage-usage-drift` until the Admin Database panel shows a real last success.
3. Re-run the cron health SQL after the scheduled jobs fire.

## Notes

The `cron_job_health_status` result is the most important open operational item from the SQL evidence. Until the required jobs show successful runs, launch readiness should remain incomplete even if no code work is required.
