# Asset Safe Audit Log Retention Runbook

Status: launch security operations runbook
Owner: Security Lead / Platform
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Legal_Request_Runbook.md`

## Purpose

This runbook defines how Asset Safe retains, reviews, exports, and protects audit evidence. It covers operational audit logs, user activity logs, continuity audit logs, export audit rows, billing/webhook evidence, and maintenance/incident evidence.

The goal is tamper-evident operations for launch: audit records should be append-first, deletion should be restricted to documented retention sweepers, access should be limited to approved operators, and any suspicious mutation should trigger incident response.

## Audit Evidence Classes

| Evidence class | Tables or systems | Default retention | Access |
|---|---|---:|---|
| Security/admin audit | `audit_logs` | 7 years | Dev workspace/admin only |
| User activity | `user_activity_logs` | 2 years, anonymized on deletion | Owner-scoped where exposed; admin for security review |
| Continuity audit | `continuity_audit_logs`, continuity reviewer notes | 7 years or legal hold | Continuity reviewers/admin |
| Continuity email audit | `continuity_email_audit_log`, provider message IDs | 7 years or legal hold | Continuity reviewers/admin |
| Export audit | `account_export_audit`, `continuity_export_forensics` | 7 years for audit rows; bundles expire per export TTL | Owner for own rows where allowed; admin for review |
| Billing/webhook evidence | `stripe_events`, `payment_events`, `checkout_session_audit`, `checkout_fulfillments` | 2 to 7 years per retention matrix | Billing/Ops/admin |
| Maintenance and restore evidence | `system_maintenance_windows`, `restore_drill_runs` | 7 years recommended | Dev workspace/admin |
| Provider audit logs | Supabase, Stripe, Resend, GitHub | Provider-dependent; export for incidents | Security Lead / provider admins |

Legal hold overrides the default retention window. Do not purge, anonymize further, or redact legal-hold evidence without counsel/operator approval.

## Access Rules

Minimum launch access model:

- Routine audit review is limited to dev workspace/admin users.
- Continuity audit records are limited to continuity reviewers and senior reviewers where product surfaces distinguish those roles.
- Billing audit evidence is limited to Billing / Ops and admin users.
- Support may receive summaries, not raw audit exports, unless approved for a specific case.
- Legal/counsel exports require an incident, subpoena/law-enforcement request, dispute, user request, or owner-approved legal review.

Operators must not browse audit logs out of curiosity. Every raw audit review should have a support ticket, incident ticket, legal request, continuity case, billing dispute, or launch checklist item.

## Tamper-Evidence Posture

Launch posture:

1. Audit tables are treated as append-first evidence.
2. Direct updates/deletes are not part of normal operations.
3. Retention deletion is performed only by documented sweepers or approved maintenance scripts.
4. Admin actions that alter legal hold, deletion, restore, continuity, or billing state should create separate audit evidence.
5. Incident responders preserve screenshots, query outputs, provider log links, and relevant IDs before cleanup.

Recommended hardening after launch:

- Add hash chaining for high-value audit rows.
- Export daily audit snapshots to external immutable storage.
- Enable provider-native log drains where available.
- Add an admin audit export workflow with recorded requester, approver, reason, and output hash.

Until those hardening items exist, tamper-evidence depends on RLS, restricted service-role access, provider logs, migration history, backups/PITR, and incident evidence capture.

## Quarterly Audit Review

Run quarterly and after Sev 1 or Sev 2 incidents.

1. Confirm RLS remains enabled on audit tables.
2. Confirm broad `anon` access does not exist for audit tables.
3. Confirm only intended admin/dev workspace policies allow cross-user audit visibility.
4. Confirm retention windows in `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`, `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`, and public Terms/Privacy text still match.
5. Confirm `process-retention-expirations` and `scrub-old-support-pii` cron health is current.
6. Review suspicious audit gaps: sudden drops in volume, missing expected admin events, or unexpected updates/deletes.
7. Record review date, reviewer, findings, and follow-up tickets.

## Evidence Queries

Recent security/admin audit:

```sql
select created_at, user_id, action, resource_type, resource_id, metadata
from public.audit_logs
order by created_at desc
limit 100;
```

Recent activity by user:

```sql
select created_at, user_id, action, resource_type, resource_id, metadata
from public.user_activity_logs
where user_id = '<user-id>'
order by created_at desc
limit 100;
```

Recent account exports:

```sql
select id, user_id, export_type, status, started_at, completed_at, expires_at, download_count, download_limit
from public.account_export_audit
order by started_at desc
limit 100;
```

Maintenance windows:

```sql
select id, status, reason, starts_at, ends_at, created_by, ended_by, metadata
from public.system_maintenance_windows
order by starts_at desc
limit 50;
```

Restore drills:

```sql
select id, environment, drill_type, status, restore_point_at, completed_at, rpo_minutes, rto_minutes
from public.restore_drill_runs
order by created_at desc
limit 50;
```

Retention sweeper health:

```sql
select job_name, health_status, last_status, last_succeeded_at, consecutive_failures, last_error
from public.cron_job_health_status
where job_name in ('process-retention-expirations', 'scrub-old-support-pii')
order by job_name;
```

## Audit Export Procedure

Use this procedure for legal requests, incident response, support escalations, billing disputes, or continuity disputes. For subpoenas, warrants, court orders, preservation requests, or law-enforcement requests, follow `docs/AssetSafe_Legal_Request_Runbook.md` first.

1. Open an export ticket with requester, approver, reason, scope, and deadline.
2. Define the minimum necessary scope: user/account ID, date range, tables, and event types.
3. Run read-only queries from Supabase SQL Editor or approved admin tooling.
4. Save output in the approved restricted evidence location.
5. Record:
   - Query used.
   - Export timestamp.
   - Operator.
   - Row count.
   - File name/location.
   - Hash of the exported file when practical.
6. Share only with approved recipients.
7. Apply legal hold if the export relates to litigation, law enforcement, chargeback/dispute, continuity dispute, or security incident.

Do not email raw audit exports unless counsel/operator approves the channel.

## Suspicious Mutation Response

Treat any unexplained audit deletion, update, timestamp gap, policy broadening, or service-role misuse as a security incident.

Immediate steps:

1. Stop further cleanup jobs if they may be involved.
2. Preserve current table counts, recent rows, provider logs, and migration history.
3. Activate maintenance mode if writes could deepen harm or destroy evidence.
4. Rotate credentials if service-role or admin access may be compromised.
5. Follow `docs/AssetSafe_Security_Incident_Response_Runbook.md`.
6. Use PITR/backup comparison if needed to reconstruct missing evidence.

## Launch Gate

Do not mark audit-log readiness complete until:

- Retention windows are documented and match public/legal policy.
- Admin access to audit evidence is role-limited.
- Retention sweepers are scheduled or documented with manual fallback.
- Security incident responders know where audit evidence lives.
- Audit export procedure is documented.
- Any missing tamper-evidence hardening is recorded as a post-launch follow-up, not silently ignored.
