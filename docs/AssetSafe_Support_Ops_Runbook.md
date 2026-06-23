# Asset Safe Support & Ops Tooling Runbook

Status: launch operations runbook
Owner: Asset Safe operator / Support lead
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Billing_Revenue_Operations.md`
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`
- `docs/AssetSafe_Legal_Request_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Continuity_Legacy_Operations.md`
- `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`

## Purpose

This runbook defines how Asset Safe handles support intake, support SLAs, manual-review queues, account recovery, read-only support debugging, escalation, and support PII retention.

Support is allowed to help users understand and recover access to their accounts. Support must not bypass authentication, MFA, account ownership, Authorized User boundaries, billing ownership, deletion state, continuity freezes, legal holds, or security incident controls.

## Support Surfaces

| Surface | Purpose | Notes |
|---|---|---|
| `support@assetsafe.net` | Primary user-facing support intake | Must be monitored by a named owner and backup |
| Customer support widget / Ask Ashley | Basic user questions and triage | Escalate account-specific issues to human review |
| Admin Dev Workspace support issues | Internal support queue | Backed by `dev_support_issues` |
| Admin Support PII report | PII scrub and retention monitoring | Backed by `support_pii_scrub_runs` and `scrub-old-support-pii` |
| Admin Billing Manual Review | Gift/checkout fulfillment recovery | Backed by `checkout_fulfillments` and overrides |
| Admin Continuity Workspace | Legacy Admin and continuity cases | High-impact manual review only |
| Admin Monitoring | Cron, webhook, email, and alert routing | Use for support-impacting incidents |

## Support Tiers

The database supports `standard`, `priority`, and `vip` support tiers on `dev_support_issues`.

Default tier mapping:

| Tier | Typical users | Support channel |
|---|---|---|
| `standard` | Free/trial/basic paid users | Email/support queue |
| `priority` | Higher paid plans or users with paid priority support | Priority email and faster triage |
| `vip` | Business-owner-approved escalations, high-value accounts, severe continuity/billing/security cases | Named owner review |

Tier affects queue order, not authorization. A VIP support issue still cannot bypass security, legal, billing, or continuity gates.

## Priority And SLA Targets

The current SLA trigger uses issue priority to set first-response and resolution targets.

| Priority | First response | Resolution target | Escalation rule |
|---|---:|---:|---|
| `critical` | 1 hour | 8 hours | Auto-escalated |
| `high` | 4 hours | 1 business day | Escalate if sensitive or due soon |
| `medium` | 1 day | 3 days | Normal queue |
| `low` | 2 days | 7 days | Normal queue |

Resolution target means "resolved, handed off, or explicitly waiting on user/provider/legal." It does not require unsafe action before verification is complete.

If a support issue cannot be resolved within target because it depends on counsel, Stripe, Supabase, user identity verification, or a store/provider review, mark the issue with the external blocker and update the user with a safe status message.

## Severity Classification

| Scenario | Default priority | Escalation |
|---|---|---|
| User cannot log in but has email/MFA backup path | `medium` | Support lead if paid user is blocked > 1 business day |
| Paying customer locked out with lost MFA or backup codes | `high` | Account recovery review |
| Lost email plus lost MFA | `critical` | Support lead + security review |
| Billing failed, duplicate charge, refund request | `high` | Billing owner |
| Chargeback/dispute, suspected fraud | `critical` | Billing owner + security/legal as needed |
| Account deletion/export/privacy request | `high` | Privacy/legal path |
| Continuity, death, incapacity, executor, or ownership request | `critical` | Continuity reviewer + legal/operator |
| Security report, unauthorized access, suspected data exposure | `critical` | Incident response |
| Product question or how-to | `low` or `medium` | Normal support |

## Intake Requirements

Every support issue should include:

- Requester name and email.
- Account email, if different.
- User/account ID when known.
- Role: owner, Authorized User, Legacy Admin, Recovery Delegate, external requester, or unknown.
- Support type and priority.
- Short summary.
- Affected workflow.
- Whether billing, legal, privacy, security, continuity, or deletion is implicated.
- Whether the user is currently locked out.
- Any safe reproduction steps.

Do not paste passwords, MFA codes, backup recovery codes, full card numbers, government IDs, legal documents, private file contents, signed URLs, magic links, or access tokens into support notes.

## Escalation Paths

| Issue type | Escalate to | Trigger |
|---|---|---|
| Billing/refund/chargeback | Billing owner | Refund request, duplicate charge, Stripe dispute, failed fulfillment |
| Account recovery | Support lead + security reviewer | Lost MFA, lost backup codes, lost email, suspected takeover |
| Security incident | Security lead | Unauthorized access, data exposure, credential leak, suspicious admin activity |
| Legal request | Legal/operator | Subpoena, warrant, preservation, civil discovery |
| Privacy request | Legal/operator | DSAR, deletion, correction, opt-out, authorized agent |
| Continuity | Continuity reviewer | Death, incapacity, executor, ownership transfer, memorialization |
| Data deletion/export | Privacy/legal or data lifecycle owner | Account deletion, export failure, retained evidence question |
| Mobile app issue | Mobile release owner | App-store build, mobile-only auth/export/billing issue |

If more than one category applies, use the most restrictive path. Security, legal, privacy, and continuity constraints override ordinary support convenience.

## Read-Only Support Debugging

Support may inspect account context only when there is a legitimate support reason. Account-level review must be logged in `support_access_reviews` when available.

Default policy:

- Scope is `read_only_support_context`.
- Access expires after 4 hours by default.
- Reason must be specific and at least 10 characters.
- Support must not change data while acting under read-only review.
- Support must not browse unrelated private files or records.
- Support must complete or cancel the review when finished.

Acceptable reasons:

- User-reported billing, auth, export, deletion, storage, or continuity issue.
- Security incident triage.
- Legal/privacy request processing.
- Manual review queue investigation.
- Launch readiness smoke test with an internal/test account.

Unacceptable reasons:

- Curiosity.
- Debugging unrelated users.
- Product analytics review without aggregation.
- Reviewing private files where metadata would answer the question.

## Admin Impersonation / View-As-User

Asset Safe should not add write-capable impersonation for launch.

If a future view-as-user feature is added, it must be:

- Read-only by default.
- Explicitly logged with admin user, target user, reason, timestamp, and expiry.
- Clearly visually labeled as support/admin context.
- Blocked for high-impact actions: billing changes, deletion, export, MFA/email change, Authorized User changes, continuity actions, legal hold changes, and ownership transfer.
- Restricted to approved support/admin roles.
- Reviewable in audit logs.

Until then, support should use admin panels, audit logs, provider dashboards, and user-provided screenshots rather than impersonation.

## Account Recovery Workflow

The support issue type `account_recovery` supports:

- `lost_mfa`
- `lost_backup_codes`
- `lost_email_access`
- `lost_mfa_and_backup_codes`
- `lost_email_and_mfa`
- `other`

It also tracks:

- `identity_verification_status`
- `billing_verification_status`
- `recovery_action_status`
- `recovery_action_notes`
- `recovery_completed_at`

Default rule: support review can approve a recovery action, but no support issue should automatically reset MFA, change email, bypass auth, or grant account ownership.

### Verification Requirements

| Scenario | Minimum verification |
|---|---|
| Lost MFA only, user has email and backup codes | Use normal self-service recovery where possible |
| Lost MFA and backup codes, user controls email | Verify email control plus billing/account facts |
| Lost email access, user still has MFA/session | Verify active session, billing/account facts, and ownership |
| Lost email and MFA | Senior review; verify billing, identity, account history, and fraud risk |
| Authorized User requests owner account recovery | Do not recover owner account; route to owner or legal/continuity path |
| Legacy Admin/delegate requests access | Route to continuity/recovery delegate workflow, not ordinary support reset |

Identity evidence should be minimized. Do not collect government ID unless the operator/legal process explicitly requires it for a high-risk recovery.

### Recovery Actions

Allowed after review:

- Guide user through normal auth provider recovery.
- Confirm whether backup codes or MFA reset options exist.
- Mark recovery request approved/rejected/completed in the support issue.
- Escalate to security/legal/continuity when authority is disputed.

Not allowed through ordinary support:

- Reset MFA without documented approval path.
- Change account email without verified authority.
- Give an Authorized User owner permissions.
- Remove a legal hold, continuity freeze, or deletion block.
- Export data to an unverified requester.
- Disclose private file contents as proof of account ownership.

## Manual Review Backlog

Manual review queues include:

- Billing checkout fulfillment review.
- Account recovery support issues.
- Continuity request queue.
- Privacy/legal/DMCA intake.
- Storage orphan/deletion review.
- Support PII scrub review.

Daily operating check:

1. Review overdue `dev_support_issues`.
2. Review critical/high issues due within the next business day.
3. Review billing manual-review rows.
4. Review continuity high-risk/disputed cases.
5. Review data lifecycle cron health for support-impacting failures.
6. Confirm `notify-manual-review-backlog` and `scrub-old-support-pii` health.

Recommended query:

```sql
select
  id,
  type,
  priority,
  support_tier,
  status,
  sla_status,
  first_response_due_at,
  resolution_due_at,
  escalated_at,
  recovery_scenario
from public.dev_support_issues
where status in ('new', 'investigating', 'in_progress')
order by
  case priority
    when 'critical' then 1
    when 'high' then 2
    when 'medium' then 3
    else 4
  end,
  resolution_due_at nulls last;
```

## Support PII Retention

Support records are retained for trend analysis and support history, but free-text PII should be scrubbed after closure according to the support retention policy.

Controls:

- `scrub-old-support-pii` redacts free-text PII from closed support issues after the retention window.
- `support_pii_scrub_runs` records scrubber history.
- Admin Support PII report surfaces eligible rows and scrub health.

Default support note rules:

- Keep notes factual and minimal.
- Use account IDs, Stripe IDs, provider event IDs, and ticket links rather than sensitive free text.
- Do not store legal documents, ID images, card data, passwords, MFA codes, or private file contents in support notes.
- Link to restricted evidence systems when evidence must be retained.

## User Communications

Support messages should:

- Be clear about what support can and cannot do.
- Avoid promising access, deletion, refunds, or legal outcomes before review.
- Avoid disclosing security signals that could help an attacker.
- Provide a next expected update time when review will take longer than the SLA target.
- Use transactional/legal notice paths when the issue involves billing, privacy, security, deletion, or continuity.

For incidents, use the approved incident support brief from `docs/AssetSafe_Security_Incident_Response_Runbook.md`.

## Launch Gate

Before launch, confirm:

- `support@assetsafe.net` has a named owner and backup.
- Support tiers and SLA targets are accepted.
- Account recovery is audited-review only.
- No write-capable impersonation exists for launch.
- Read-only support access review is logged when account-level inspection is needed.
- Manual-review backlog ownership is assigned.
- Support PII scrubber cron is scheduled and health is visible.
- Support has escalation paths for billing, legal, privacy, security, continuity, deletion/export, and mobile.
- Support knows not to collect or store unnecessary sensitive evidence in support notes.

