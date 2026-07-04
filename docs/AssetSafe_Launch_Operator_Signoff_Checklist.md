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
| Billing | Monitor and repair `stripe_events.outcome = 'error'` | Accepted MVP: daily launch-week review, then 2-3x weekly if stable | `support@assetsafe.net` / billing operator | Admin Billing > Stripe Webhook Health plus SQL checks for `outcome='error'` and 7-day event volume both ran successfully | 2026-07-03 |
| Billing | Manual Stripe Dashboard dispute handling accepted, or webhook handling built | Accepted MVP: webhook review evidence built; Stripe evidence submission remains manual |  | `stripe trigger charge.dispute.created` verified `stripe_dispute_reviews` + `dev_support_issues` evidence |  |
| Billing | Manual Stripe Dashboard refund handling accepted, or admin refund flow built | Accepted MVP: manual Stripe Dashboard refunds with support-ticket and webhook evidence |  | `stripe trigger charge.refunded` verified `stripe_refund_reviews` + `dev_support_issues`; real refunds still require refund ID, amount, reason, approver, and access decision in support issue |  |
| Billing | Single app-side dunning reminder accepted, or escalated dunning built | Accepted MVP | `support@assetsafe.net` / billing operator | Stripe Smart Retries enabled: 8 retries over up to 2 weeks; Stripe failed-payment emails disabled intentionally; Asset Safe app-side notice accepted | 2026-07-03 |
| Billing | Receipt strategy chosen: Stripe, Asset Safe, or both | Accepted MVP: Asset Safe receipts only | `support@assetsafe.net` / billing operator | Stripe customer receipt emails disabled; Asset Safe receipt idempotency verified through `subscription_email_events.idempotency_key` duplicate-skip test | 2026-07-03 |
| Billing | Trial reminder posture chosen before marketing trials | Accepted MVP: no free trials offered for launch |  | User-facing trial copy removed; no `check-trial-reminders` rebuild required unless trials are reintroduced |  |
| Billing | Gift payment-failure behavior verified | Accepted MVP with evidence |  | `docs/AssetSafe_Gift_Payment_Failure_Verification.md`; gift failed/expired events and `check-gift-deliveries` cron evidence captured |  |
| Billing | `check-payment-failures` and `expire-subscription-grace-periods-hourly` healthy | Accepted MVP | `support@assetsafe.net` / billing operator | `check-payment-failures-daily` active with daily succeeded runs; `expire-subscription-grace-periods-hourly` active with recent hourly succeeded runs | 2026-07-03 |
| Data lifecycle | PITR enabled on production | Operator action required |  |  |  |
| Data lifecycle | PITR restore drill passed and signed off | Operator action required |  |  |  |
| Data lifecycle | Storage backup posture accepted | Operator action required |  |  |  |
| Data lifecycle | Bucket lifecycle policy accepted | Accepted MVP | Asset Safe operator / platform | Admin Database Bucket Lifecycle Policies evidence captured; `exports` bucket private; `floor-plans` accepted as not launch-required on 2026-06-24; managed export round trip succeeded in `docs/AssetSafe_Launch_Evidence_Run_2026_06_29.md` | 2026-07-03 |
| Data lifecycle | Required data lifecycle cron health verified | Accepted MVP | Asset Safe operator / platform | `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`: all 8 lifecycle jobs `ok`/`succeeded`, `consecutive_failures=0`, `last_error=null` | 2026-07-03 |
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

## Evidence Progress Snapshot - 2026-06-28 / 2026-07-01

This section records evidence gathered during launch-readiness work without replacing the operator sign-off rows above. Final launch decisions still require an owner, evidence link, and date in the P0 table.

| Area | Gate | Current evidence status | Remaining action |
|---|---|---|---|
| Data lifecycle | Required lifecycle cron health | Final evidence captured in `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`; all 8 lifecycle jobs returned `ok` / `succeeded` with `consecutive_failures=0` and `last_error=null` | Closed in P0 sign-off row |
| Data lifecycle | Private export bucket and managed export round trip | `exports` bucket confirmed private; `process-expired-exports` returned HTTP `200` after `20260622113000_expire_account_export_bundles.sql` and schema reload; real **Export Account Archive** round trip succeeded with evidence in `docs/AssetSafe_Launch_Evidence_Run_2026_06_29.md` | Keep 7-day TTL expiry as follow-up evidence unless pre-launch expiry proof is required |
| Data lifecycle | Account closure sweeper | `process-account-closures` returned HTTP `200` after `delete-account` was updated to use Storage API prefix scans | Keep the 207/500 failure and fix evidence with the launch evidence note |
| Monitoring | First real cron successes | Latest lifecycle health evidence in `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md` confirms all 8 lifecycle jobs healthy after cadence windows elapsed; stale 401 rows identified as pre-rotation failures | Keep routine dashboard review cadence active |
| Security | Production internal cron secret rotation | Fresh `sb_secret_...` internal secret was installed in Edge Function Secrets; docs now require `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`; all lifecycle cron jobs were recreated | Choose and record the approved long-term production secret manager and access owner |
| Security | Key rotation runbook | `docs/AssetSafe_Key_Rotation_Runbook.md` updated for Supabase secret API keys, lowercase secret support, static cron headers, `cron.job.command` exposure warning, and current schema-safe validation queries | Decide when to remove legacy service-role fallback from `isAuthorizedInternalCall(req)` |
| Security | Incident / scan readiness | Runbooks exist: `docs/AssetSafe_Security_Incident_Response_Runbook.md`, `docs/AssetSafe_Vulnerability_Scan_Runbook.md`, `docs/AssetSafe_Audit_Log_Retention_Runbook.md`; Resend webhook recovery and clean dependency audit/build evidence captured in `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md` | Run staging ZAP/manual auth scan, triage High/Critical findings, and schedule/complete incident tabletop |
| Legal/compliance | DSAR, DMCA, legal request, Terms/Privacy paths | Runbooks exist and are indexed in `docs/AssetSafe_Launch_Packet_Index.md` | Counsel/operator approval still required for each intake path and active public version |
| Support | Support/account recovery posture | Account recovery remains audited-review only; support ops runbook exists | Name `support@assetsafe.net` owner/backup and accept SLA/escalation matrix |
| Billing | Manual billing ops posture | Replay, gift failure, dispute, refund, receipt idempotency, no-trial posture, Stripe error review cadence, Smart Retries, and Asset Safe receipt source are implemented/tested/decided | Record named billing backup owner if desired |

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
