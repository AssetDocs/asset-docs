# Asset Safe Launch Evidence Collection Runbook

Status: launch evidence runbook
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Launch_Code_Workqueue.md`
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Launch_Evidence_SQL.sql`

## Purpose

This runbook tells the operator what evidence to collect before filling in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.

For database-backed evidence, use `docs/AssetSafe_Launch_Evidence_SQL.sql` as the read-only SQL bundle.

Evidence can be:

- Supabase SQL query result.
- Supabase dashboard screenshot.
- Stripe dashboard screenshot.
- Admin panel screenshot.
- Support/legal/security ticket link.
- Counsel/operator written approval.
- Provider settings export.

Do not paste secrets, service-role keys, tokens, private user files, legal documents, MFA codes, or full payment details into launch notes.

## Evidence Folder

Create one restricted launch evidence folder or ticket and store:

- Date collected.
- Collector.
- Environment: production project `leotcbfpqiekgkgumecn`.
- Query text or dashboard path.
- Screenshot/export.
- Decision: accepted, code required, operator action pending, or deferred.

Recommended naming:

```text
launch-evidence-2026-06-23/
  01-billing/
  02-data-lifecycle/
  03-continuity/
  04-support/
  05-monitoring/
  06-security/
  07-legal-compliance/
  08-growth-workspace-mobile/
```

## 1. Billing Evidence

### Stripe webhook errors

Run:

```sql
select
  stripe_event_id,
  event_type,
  outcome,
  created_at,
  processed_at
from public.stripe_events
where outcome = 'error'
order by created_at desc;
```

Evidence:

- Query result showing no unresolved errors, or ticket links for each unresolved error.
- Named owner for the daily check.
- Decision on whether manual repair is accepted for MVP.

### Stripe skipped-event review

Run:

```sql
select
  event_type,
  outcome,
  count(*) as event_count,
  max(created_at) as latest_seen
from public.stripe_events
where created_at > now() - interval '7 days'
group by event_type, outcome
order by latest_seen desc;
```

Evidence:

- Query result.
- Note that disputes/refunds are manual Dashboard review for MVP or marked `Code required`.

### Billing manual review queue

Run:

```sql
select
  id,
  stripe_session_id,
  email,
  status,
  manual_review_reason,
  created_at
from public.checkout_fulfillments
where status in ('manual_review', 'fulfilled_email_failed')
order by created_at asc;
```

Evidence:

- Query result or Admin Billing Manual Review screenshot.
- Any open rows have owner and next action.

### Stripe dashboard settings

Collect screenshots or written notes for:

- Billing retry/smart retry settings.
- Stripe-hosted receipt settings.
- Refund policy/process owner.
- Dispute notification/review owner.
- Whether free trials are enabled or not marketed.

Evidence:

- Stripe Dashboard screenshots.
- Launch decision for receipt source: Stripe, Asset Safe, or both.
- Launch decision for manual refunds/disputes.

### Gift payment-failure verification

Collect:

- Test or production-safe evidence that gift checkout metadata is present.
- Admin gift view screenshot showing gift subscriptions are distinguishable.
- Result of a review confirming gift-only payment failures do not drive normal dunning.

If this cannot be verified, mark `BILL-06` in `docs/AssetSafe_Launch_Code_Workqueue.md` as `Code required`.

## 2. Data Lifecycle Evidence

### PITR enabled

Collect:

- Supabase project settings screenshot showing PITR is enabled.
- Current recovery window.

Evidence:

- Screenshot or settings export.

### Restore drill

Run:

```sql
select
  id,
  environment,
  drill_type,
  status,
  restore_point_at,
  completed_at,
  rpo_minutes,
  rto_minutes,
  db_smoke_passed,
  storage_smoke_passed,
  auth_smoke_passed,
  edge_smoke_passed,
  signed_url_smoke_passed,
  approved_by_user_id,
  findings,
  follow_up_actions
from public.restore_drill_runs
where status = 'passed'
order by completed_at desc
limit 1;
```

Evidence:

- Query result with all smoke checks true.
- Sign-off screenshot from Admin Restore Drills, if available.
- Ticket for any follow-up actions.

### Storage bucket posture

Run:

```sql
select
  id,
  name,
  public,
  created_at,
  updated_at
from storage.buckets
order by id;
```

If available, also run:

```sql
select *
from public.get_storage_bucket_lifecycle_status()
order by bucket;
```

Evidence:

- Bucket list showing `exports` exists and is private.
- Bucket lifecycle policy status screenshot from Admin Database.
- Written decision: provider replication only, scheduled snapshot, or cross-region replication.

### Data lifecycle cron health

Run:

```sql
select
  job_name,
  health_status,
  last_status,
  last_succeeded_at,
  minutes_since_success,
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
  'quarterly-restore-drill-reminder',
  'check-payment-failures'
)
order by job_name;
```

Evidence:

- Query result.
- Admin screenshots for any warning/critical rows.
- Owner/ticket for any warning/critical state.

## 3. Continuity Evidence

Collect:

- Operator/counsel decision on retention of uploaded death/legal documents.
- Operator/counsel decision on second-review rules for high-risk continuity cases.
- Operator/counsel decision on who may bypass 30-day continuity closure waiting period.
- Continuity tabletop notes or scheduled date.

Evidence:

- Signed decision note or ticket.
- Continuity tabletop notes.
- Link to `docs/AssetSafe_Continuity_Legacy_Operations.md` and any accepted deviations.

## 4. Support Evidence

Collect:

- Named owner and backup for `support@assetsafe.net`.
- Accepted support tiers and SLA targets.
- Escalation owner for billing, legal, privacy, security, continuity, deletion/export, and mobile.
- Confirmation that account recovery remains audited-review only.
- Confirmation that no write-capable impersonation is enabled for launch.

Run:

```sql
select
  type,
  priority,
  status,
  count(*) as issue_count,
  min(created_at) as oldest_issue_created_at
from public.dev_support_issues
where status in ('new', 'investigating', 'in_progress')
group by type, priority, status
order by oldest_issue_created_at nulls last;
```

Evidence:

- Support owner/backup note.
- Admin Dev Workspace screenshot.
- Query result showing backlog posture.
- Support PII scrubber cron health from the cron query above.

## 5. Monitoring Evidence

Collect:

- Decision on routing: dashboard-only, email, Slack, pager, or hybrid.
- Admin Monitoring screenshot showing alert policies.
- Cron health evidence from the lifecycle query.
- Resend webhook/deliverability evidence after first events.

If alert policies are available:

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

Evidence:

- Query result or Admin Monitoring screenshot.
- Written owner decision for warning vs page route.

## 6. Security Evidence

Collect:

- Approved production secret manager and access owner.
- Pre-launch vulnerability scan result.
- Secret scan/dependency audit result.
- Incident contact list.
- Incident tabletop notes or scheduled date.
- Decision on dual-secret webhook support: accepted deferred or code-required.

Evidence:

- Security scan report.
- Ticket showing High/Critical findings are resolved, accepted, or marked code-required.
- Secret manager decision note.
- Incident tabletop notes.

## 7. Legal And Compliance Evidence

Collect:

- Current Terms and Privacy active version approval.
- DSAR/privacy request intake approval.
- DMCA/content complaint intake approval.
- Legal request intake approval.
- Retention schedule approval.
- Authorized-agent, denial, and extension authority decisions.

Evidence:

- Counsel/operator approval note.
- Links to final public Terms/Privacy text.
- Admin/legal version screenshot or query result where available.
- Support routing note.

## 8. Growth, Workspace, And Mobile Evidence

Collect:

- Product owner acceptance of MVP activation/churn metrics.
- Operator acceptance of manual-review-only ownership transfer posture.
- Operator acceptance of Authorized User over-limit downgrade posture.
- Mobile decision: app-store launch deferred or native build/privacy labels completed.

Evidence:

- Product/ops decision note.
- Link to `docs/AssetSafe_Growth_Product_Ops_Runbook.md`.
- Link to `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`.
- Link to `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md`.

## Final Evidence Review

Before marking the sign-off checklist complete:

1. Every P0 row has an owner.
2. Every P0 row has a decision.
3. Every `Operator action required` row has evidence.
4. Every `Code required` row has a linked work item from `docs/AssetSafe_Launch_Code_Workqueue.md`.
5. Every `Accepted MVP` row has an accepted risk note.
6. Every `Deferred` row has a scope note.
7. Final approver signs and dates `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.
