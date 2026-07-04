# Asset Safe Monitoring Launch Decision Memo

Status: recommended launch decisions
Owner: Asset Safe operator / platform owner
Related docs:
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`

## Purpose

This memo converts the remaining Monitoring P0 launch gates into explicit MVP operating decisions. It covers alert routing, cron health review, and what should happen when dashboard health moves from `ok` to `warn`, `failed`, `page`, or `never_run`.

## Current Evidence

The July 1 launch evidence run verified all eight lifecycle cron jobs as healthy after the internal-secret rotation and cron rescheduling work:

| Job | Health | Last status | Consecutive failures | Last error |
|---|---|---|---:|---|
| `process-account-closures` | `ok` | `succeeded` | `0` | `null` |
| `process-expired-exports` | `ok` | `succeeded` | `0` | `null` |
| `process-retention-expirations` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-deletion-jobs` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-orphans` | `ok` | `succeeded` | `0` | `null` |
| `process-storage-usage-drift` | `ok` | `succeeded` | `0` | `null` |
| `quarterly-restore-drill-reminder` | `ok` | `succeeded` | `0` | `null` |
| `scrub-old-support-pii` | `ok` | `succeeded` | `0` | `null` |

Evidence source: `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`.

## Recommended MVP Decisions

| Launch gate | Recommended decision | Evidence / implementation basis |
|---|---|---|
| External alert routing chosen | Dashboard-first monitoring is accepted for MVP, with Michael Lewis / support owner responsible for daily launch-week review. Use Admin Monitoring, Admin Database, Admin Billing Stripe Webhook Health, Resend dashboard, Supabase Edge Function logs, and SQL health queries as the source of truth. Use `support@assetsafe.net` as the human escalation inbox for user-impacting issues. Keep Slack/pager as P1 unless configured and tested before launch. | `monitoring_alert_policies` exists for routing policy records. Admin surfaces exist for cron, database/storage, Stripe webhook health, and email deliverability. |
| First real cron successes reviewed after scheduling | Accept as complete. The July 1 evidence run showed all eight lifecycle jobs `ok` / `succeeded`, `consecutive_failures=0`, and `last_error=null`. | `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`. |

## MVP Routing Policy

Recommended launch posture:

1. During launch week, review Admin Monitoring and critical operational dashboards at least once daily.
2. Treat `health_status = 'page'`, repeated `failed`, or launch-critical `never_run` rows as same-day operator action.
3. Treat `health_status = 'warn'` as a daily review item unless it affects account deletion, exports, billing, email delivery, or security.
4. Use `support@assetsafe.net` as the human escalation inbox for user-impacting issues until Slack/pager routing is configured.
5. Use Supabase logs, Resend dashboard, Stripe Dashboard, and SQL evidence queries for root-cause review.
6. If launch traffic increases or dashboard-only review becomes too quiet, configure Slack/email/pager routing as P1.
7. Revisit dashboard-first monitoring after launch traffic begins or within 30 days, whichever comes first.

## Alert Severity Matrix

| Signal | MVP severity | Action |
|---|---|---|
| Lifecycle cron `ok` / `succeeded` | Healthy | Routine review only |
| Lifecycle cron `warn` with no user impact | Warning | Review during daily ops pass |
| Lifecycle cron `failed`, `page`, or repeated failures | High | Same-day investigation |
| `process-account-closures`, `process-expired-exports`, or billing/email health failure | High | Same-day investigation and user-impact assessment |
| Stripe webhook errors or replay backlog | High | Billing operator review |
| Resend webhook boot/auth failure or deliverability complaint spike | High | Platform/support review |
| Security-relevant alert, suspicious admin activity, or data exposure signal | Critical | Open incident response runbook |

## Verification Queries

### Lifecycle Cron Health

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

### Monitoring Alert Policies

```sql
select
  monitor_key,
  display_name,
  owner_label,
  warning_channel,
  page_channel,
  warning_rule,
  page_rule,
  enabled
from public.monitoring_alert_policies
order by monitor_key;
```

## Sign-Off Recommendation

If the operator accepts dashboard-first MVP monitoring:

- External alert routing chosen: `Accepted MVP`
- First real cron successes reviewed after scheduling: `Accepted MVP`

If dashboard-first monitoring is rejected, choose and configure one external destination before launch:

- email to `support@assetsafe.net`
- Slack ops channel
- pager/on-call service
