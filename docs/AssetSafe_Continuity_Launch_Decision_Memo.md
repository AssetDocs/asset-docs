# Asset Safe Continuity Launch Decision Memo

Status: recommended launch decisions
Owner: Asset Safe operator / continuity reviewer
Related docs:
- `docs/AssetSafe_Continuity_Legacy_Operations.md`
- `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`

## Purpose

This memo converts the remaining continuity P0 launch gates into explicit MVP operating decisions. It does not replace legal review. Use it as the operator/counsel review packet for closing the Continuity rows in the launch sign-off checklist.

## Recommended MVP Decisions

| Launch gate | Recommended decision | Evidence / implementation basis |
|---|---|---|
| Evidence retention for death/legal documents decided | Accept review-gated retention. Retain continuity legal/death documents for the case lifetime plus applicable audit/legal-hold retention. Do not auto-purge continuity documents through ordinary account deletion. Reviewers must classify each uploaded document with retention category, review status, expiration when applicable, and legal hold when needed. | `continuity-documents` bucket lifecycle policy says retain for continuity case lifetime plus applicable legal hold/audit retention. `continuity_documents` includes retention review status, category, expiration, hold, reviewer, and notes. |
| Second-review rules for high-risk continuity cases decided | Require senior reviewer approval for high-impact actions: data export, temporary access with download/export, preservation, memorialization, account closure, ownership transfer, conflict resolution that allows a high-impact action, owner-dispute freeze removal, and suspicious/fraudulent document cases. | `AssetSafe_Continuity_Legacy_Operations.md` already treats high-impact actions as senior-review actions. Admin surfaces and RPCs include freeze, conflict, execution guard, and senior-review labels. |
| 30-day continuity closure bypass authority decided | Default: do not bypass the 30-calendar-day waiting period. Bypass is allowed only for senior reviewer / ownership administrator action when legally required or owner-protective, with written reason, supporting evidence, and audit log entry. No bypass is allowed while owner dispute, active freeze, or unresolved competing request remains. | `bypass_waiting_period` records reason, timestamp, and reviewer. `enforce_continuity_execution_guard` blocks execution while disputes, freezes, unresolved conflicts, or waiting periods remain. |
| Continuity tabletop completed or scheduled before broad launch | Schedule one tabletop before broad continuity launch. For MVP launch, accept "scheduled" only if date, owner, participants, staging account, and follow-up owner are recorded. | `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md` defines scenarios, pass criteria, and evidence capture. |

## Document Retention Policy

Recommended launch posture:

1. Store uploaded continuity documents in the private `continuity-documents` bucket.
2. Treat death certificates, executor documents, power of attorney, guardianship, court orders, physician statements, and IDs as restricted continuity evidence.
3. Keep documents review-gated and admin/continuity-reviewer only.
4. Require reviewers to set one of these retention categories when reviewing a document:
   - `case_evidence`
   - `legal_authority`
   - `identity_verification`
   - `fraud_or_dispute`
   - `not_needed`
5. Apply legal hold for disputed, suspicious, fraudulent, court/law-enforcement, estate-conflict, or owner-disputed cases.
6. Do not delete suspicious or disputed documents just because the document is rejected; retain as evidence under restricted access.
7. Where counsel later approves minimization, replace long-term plaintext document retention with retained metadata plus a restricted evidence record.

## Second-Review Matrix

| Scenario | Minimum reviewer requirement |
|---|---|
| Temporary access without export/download | Continuity reviewer; senior reviewer if elevated risk |
| Temporary access with export/download | Senior reviewer |
| Data export | Senior reviewer |
| Preservation hold | Senior reviewer |
| Memorialization | Senior reviewer |
| Account closure | Senior reviewer plus 30-day waiting period unless legally bypassed |
| Ownership transfer | Senior reviewer |
| Competing requester conflict | Senior reviewer before any high-impact action |
| Owner dispute resolution | Continuity reviewer may record resolution; senior reviewer required before freeze removal |
| Suspicious/fraudulent document | Senior reviewer before case can proceed |

## 30-Day Closure Bypass Rules

Default rule: the 30-day continuity closure waiting period is mandatory.

Allowed bypass reasons:

- Court order or comparable legal instruction requires faster closure.
- Confirmed owner request or owner-protective action requires faster closure.
- Security/legal risk makes waiting materially harmful, and the decision is documented.

Required before bypass:

- Senior reviewer or ownership administrator approval.
- Written reason in the bypass workflow.
- Evidence attached or referenced in continuity notes.
- No unresolved owner dispute.
- No active continuity freeze.
- No unresolved competing request.
- Audit log entry created.

Disallowed bypass reasons:

- Convenience.
- Requester pressure without legal authority.
- Missing documents.
- Ambiguous owner status.
- Active dispute or unresolved conflict.

## Tabletop Scheduling Record

Use this section when the owner/operator schedules the drill.

| Field | Value |
|---|---|
| Scheduled date/time |  |
| Continuity reviewer |  |
| Senior reviewer |  |
| Support/operator participant |  |
| Engineering observer |  |
| Legal/counsel observer, if any |  |
| Staging account / case IDs |  |
| Follow-up owner |  |
| Completion evidence link |  |

## Verification Queries

Use these queries to collect launch evidence after the decisions are accepted.

### Continuity Document Retention Fields

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'continuity_documents'
  and column_name in (
    'retention_category',
    'retention_expires_at',
    'retention_hold',
    'retention_review_status',
    'retention_review_notes',
    'retention_reviewed_by',
    'retention_reviewed_at'
  )
order by column_name;
```

### Continuity Guardrails

```sql
select
  routine_name,
  routine_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in (
    'bypass_waiting_period',
    'enforce_continuity_execution_guard',
    'get_continuity_ops_report',
    'apply_account_freeze',
    'remove_account_freeze'
  )
order by routine_name;
```

### Current Continuity Risk Backlog

```sql
select *
from public.get_continuity_ops_report()
order by metric_key;
```

## Sign-Off Recommendation

If the operator accepts the defaults above and schedules the tabletop, the Continuity P0 rows can be closed as:

- Evidence retention for death/legal documents decided: `Accepted MVP`
- Second-review rules for high-risk continuity cases decided: `Accepted MVP`
- 30-day continuity closure bypass authority decided: `Accepted MVP`
- Continuity tabletop completed or scheduled before broad launch: `Accepted MVP` once the scheduling record is filled
