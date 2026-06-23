# Asset Safe Launch Operator Sign-Off Checklist

Status: launch operator checklist
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Support_Ops_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`
- `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md`
- `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md`

## Purpose

This checklist is the final operator-facing launch gate for the operational areas reviewed with Lovable.

Use it to record whether each remaining item is:

- `Accepted MVP` - current code/process is acceptable for launch.
- `Code required` - launch should wait for implementation.
- `Operator action required` - launch should wait for provider-console, legal, support, or owner action.
- `Deferred` - not required for current launch scope.

Do not mark launch ready until every P0 row has an owner, decision, evidence link, and date.

Use `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` to gather the query results, screenshots, tickets, and written approvals needed to fill the evidence column.

Use `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md` as the current first-pass classification. Final row decisions still belong to the operator.

## Decision Legend

| Decision | Meaning |
|---|---|
| `Accepted MVP` | Current manual/process posture is acceptable for launch |
| `Code required` | Engineering change is required before launch |
| `Operator action required` | Non-code setup/sign-off/evidence is required before launch |
| `Deferred` | Explicitly out of launch scope |

## P0 Sign-Off

| Area | Launch gate | Recommended decision | Owner | Evidence / ticket | Date |
|---|---|---|---|---|---|
| Billing | Monitor and repair `stripe_events.outcome = 'error'` | Operator action required |  |  |  |
| Billing | Manual Stripe Dashboard dispute handling accepted, or webhook handling built | Accepted MVP |  |  |  |
| Billing | Manual Stripe Dashboard refund handling accepted, or admin refund flow built | Accepted MVP |  |  |  |
| Billing | Single app-side dunning reminder accepted, or escalated dunning built | Accepted MVP |  |  |  |
| Billing | Receipt strategy chosen: Stripe, Asset Safe, or both | Operator action required |  |  |  |
| Billing | Trial reminder posture chosen before marketing trials | Operator action required |  |  |  |
| Billing | Gift payment-failure behavior verified | Operator action required |  |  |  |
| Billing | `check-payment-failures` and `expire-subscription-grace-periods-hourly` healthy | Operator action required |  |  |  |
| Data lifecycle | PITR enabled on production | Operator action required |  |  |  |
| Data lifecycle | PITR restore drill passed and signed off | Operator action required |  |  |  |
| Data lifecycle | Storage backup posture accepted | Operator action required |  |  |  |
| Data lifecycle | Bucket lifecycle policy accepted | Operator action required |  |  |  |
| Data lifecycle | Required data lifecycle cron health verified | Operator action required |  |  |  |
| Data lifecycle | Legal retention schedule reviewed | Operator action required |  |  |  |
| Continuity | Evidence retention for death/legal documents decided | Operator action required |  |  |  |
| Continuity | Second-review rules for high-risk continuity cases decided | Operator action required |  |  |  |
| Continuity | 30-day continuity closure bypass authority decided | Operator action required |  |  |  |
| Continuity | Continuity tabletop completed or scheduled before broad launch | Operator action required |  |  |  |
| Support | `support@assetsafe.net` owner and backup named | Operator action required |  |  |  |
| Support | Support tiers, SLA targets, and escalation paths accepted | Operator action required |  |  |  |
| Support | Account recovery confirmed as audited-review only | Accepted MVP |  |  |  |
| Support | No write-capable impersonation for launch | Accepted MVP |  |  |  |
| Monitoring | External alert routing chosen: dashboard-only, email, Slack, or pager | Operator action required |  |  |  |
| Monitoring | First real cron successes reviewed after scheduling | Operator action required |  |  |  |
| Security | Production secret manager chosen | Operator action required |  |  |  |
| Security | Pre-launch vulnerability scan completed with no untriaged High/Critical findings | Operator action required |  |  |  |
| Security | Incident contacts and escalation path confirmed | Operator action required |  |  |  |
| Security | Incident tabletop completed or scheduled before broad launch | Operator action required |  |  |  |
| Legal/compliance | Terms and Privacy active version approved | Operator action required |  |  |  |
| Legal/compliance | DSAR/privacy request intake path approved | Operator action required |  |  |  |
| Legal/compliance | DMCA/content complaint intake path approved | Operator action required |  |  |  |
| Legal/compliance | Legal request intake path approved | Operator action required |  |  |  |
| Growth | MVP activation/churn metrics accepted | Accepted MVP |  |  |  |
| Workspace | Manual-review-only ownership transfer posture accepted | Accepted MVP |  |  |  |
| Workspace | Authorized User over-limit downgrade posture accepted | Accepted MVP |  |  |  |
| Mobile | App-store launch deferred, or native build/privacy-label gate completed | Deferred |  |  |  |

## P1 First 30 Days

| Area | Follow-up | Recommended decision | Owner | Evidence / ticket | Date |
|---|---|---|---|---|---|
| Data lifecycle | Review managed export performance after real large-account exports | Accepted MVP |  |  |  |
| Monitoring | Add external Slack/email routing if dashboard-only review is too quiet | Deferred |  |  |  |
| Monitoring | Review storage usage drift alert volume | Accepted MVP |  |  |  |
| Support | Review support backlog and manual-review SLA behavior | Accepted MVP |  |  |  |
| Continuity | Review first continuity dispute/evidence-retention cases | Accepted MVP |  |  |  |
| Growth | Review funnel drop-off, churn reasons, and support friction | Accepted MVP |  |  |  |

## P2 Quarter 1

| Area | Follow-up | Recommended decision | Owner | Evidence / ticket | Date |
|---|---|---|---|---|---|
| Data lifecycle | Provider-level storage lifecycle rules for temp/quarantine prefixes | Deferred |  |  |  |
| Data lifecycle | Secondary object snapshots or cross-region storage replication | Deferred |  |  |  |
| Security/billing | Dual-secret verification for Stripe and Resend webhooks | Deferred |  |  |  |
| Security | External pen test before enterprise/broad launch | Deferred |  |  |  |
| Growth | Referral or affiliate program decision | Deferred |  |  |  |
| Mobile | App-store release path, if desired | Deferred |  |  |  |

## Final Launch Decision

Complete this section only after every P0 row above has a decision and evidence.

| Item | Value |
|---|---|
| Launch decision |  |
| Launch scope |  |
| Accepted MVP risks |  |
| Code-required blockers remaining |  |
| Operator-action blockers remaining |  |
| Final approver |  |
| Approval date |  |
