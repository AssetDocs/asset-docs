# Asset Safe Support Launch Decision Memo

Status: recommended launch decisions
Owner: Asset Safe operator / support lead
Related docs:
- `docs/AssetSafe_Support_Ops_Runbook.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Continuity_Launch_Decision_Memo.md`

## Purpose

This memo converts the remaining Support P0 launch gates into explicit MVP operating decisions. It is intended for owner/operator approval and final checklist closure.

## Recommended MVP Decisions

| Launch gate | Recommended decision | Evidence / implementation basis |
|---|---|---|
| `support@assetsafe.net` owner and backup named | Assign `support@assetsafe.net` to the Asset Safe operator/company owner as primary owner. Assign one named backup support operator before public launch. Backup must have access to the mailbox, admin support queue, Stripe Dashboard read/review access, and escalation contacts. | `docs/AssetSafe_Support_Ops_Runbook.md` defines `support@assetsafe.net` as primary intake and requires a named owner/backup. |
| Support tiers, SLA targets, and escalation paths accepted | Accept the runbook SLA matrix for MVP: critical first response 1 hour / resolution target 8 hours; high 4 hours / 1 business day; medium 1 day / 3 days; low 2 days / 7 days. Support tiers are `standard`, `priority`, and `vip`; tiers affect queue order only and do not bypass security, legal, billing, continuity, deletion, or privacy gates. | `dev_support_issues` supports `support_tier`, SLA status, first-response due dates, resolution due dates, and escalation fields. `docs/AssetSafe_Support_Ops_Runbook.md` defines escalation paths. |
| Account recovery confirmed as audited-review only | Accept audited-review only. Support may approve, reject, or complete a recovery review, but no support issue automatically resets MFA, changes email, bypasses auth, grants ownership, exports files, or removes legal/continuity/deletion holds. | `dev_support_issues` includes `account_recovery`, recovery scenarios, identity/billing/action status columns, and admin review UI. No function is documented as bypassing auth or resetting MFA from a support issue. |
| No write-capable impersonation for launch | Accept no write-capable impersonation for launch. Support uses admin panels, audit logs, support access reviews, provider dashboards, and user-provided screenshots. Any future view-as-user feature must be read-only, audited, expiring, and blocked from high-impact actions. | `docs/AssetSafe_Support_Ops_Runbook.md` prohibits write-capable impersonation at launch. `support_access_reviews` provides logged read-only support inspection workflow. |

## Owner And Backup Record

Fill this section before final owner sign-off.

| Role | Name / account | Access confirmed | Notes |
|---|---|---|---|
| Primary support owner |  |  | Owns `support@assetsafe.net`, daily queue review, and user-facing response quality |
| Backup support owner |  |  | Must be able to cover urgent support during primary unavailability |
| Billing escalation owner |  |  | Handles refunds, disputes, failed payments, and Stripe Dashboard actions |
| Security escalation owner |  |  | Handles suspected unauthorized access, account recovery risk, and incident escalation |
| Legal/privacy escalation owner |  |  | Handles DSAR, DMCA, legal requests, deletion disputes, and legal holds |
| Continuity escalation owner |  |  | Handles death/incapacity/Legacy Admin/Recovery Delegate escalations |

## MVP Support Operating Policy

1. Review `support@assetsafe.net` and the admin support queue at least daily during launch week.
2. Critical/high support issues should be reviewed the same business day.
3. Account recovery is a documented review workflow, not an auth bypass.
4. Support must not request or store passwords, MFA codes, backup codes, full card numbers, private file contents, signed URLs, magic links, or government IDs unless a separate legal/security workflow explicitly requires it.
5. Support must use the most restrictive escalation path when billing, security, legal, privacy, continuity, deletion, or ownership issues overlap.
6. Any account-level support inspection should be logged as a `support_access_reviews` row when available.
7. Support PII scrubber health should be reviewed with the routine cron health checks.

## Verification Queries

Use these queries to collect launch evidence after the decisions are accepted.

### Support SLA Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'dev_support_issues'
  and column_name in (
    'support_tier',
    'sla_status',
    'first_response_due_at',
    'resolution_due_at',
    'escalated_at',
    'escalation_reason'
  )
order by column_name;
```

### Account Recovery Review Columns

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'dev_support_issues'
  and column_name in (
    'recovery_scenario',
    'identity_verification_status',
    'billing_verification_status',
    'recovery_action_status',
    'recovery_action_notes',
    'recovery_completed_at'
  )
order by column_name;
```

### Open Support Backlog

```sql
select
  type,
  priority,
  status,
  sla_status,
  count(*) as issue_count,
  min(resolution_due_at) as earliest_resolution_due_at
from public.dev_support_issues
where status in ('new', 'investigating', 'in_progress')
group by type, priority, status, sla_status
order by earliest_resolution_due_at nulls last;
```

### Support Access Review Table

```sql
select to_regclass('public.support_access_reviews') as support_access_reviews_table;
```

## Sign-Off Recommendation

After the owner/backup record is filled:

- `support@assetsafe.net` owner and backup named: `Accepted MVP`
- Support tiers, SLA targets, and escalation paths accepted: `Accepted MVP`
- Account recovery confirmed as audited-review only: `Accepted MVP`
- No write-capable impersonation for launch: `Accepted MVP`
