# Asset Safe Launch Operator Sign-Off Checklist

Status: launch operator checklist
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Continuity_Launch_Decision_Memo.md`
- `docs/AssetSafe_Support_Ops_Runbook.md`
- `docs/AssetSafe_Support_Launch_Decision_Memo.md`
- `docs/AssetSafe_Monitoring_Launch_Decision_Memo.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Security_Launch_Decision_Memo.md`
- `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md`
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
| Data lifecycle | PITR enabled on production | Accepted MVP - 7-day PITR enabled; 14-day target deferred to P1 | Michael Lewis / platform owner | `docs/AssetSafe_Data_Lifecycle_External_Controls_MVP_Signoff.md`: 7-day PITR accepted for MVP due to cost; daily backups and manual export/restore runbook remain fallback; upgrade to 14-day PITR is tracked as P1 / broader-launch item | 2026-07-05 |
| Data lifecycle | PITR restore drill passed and signed off | Operator action required | Michael Lewis / platform owner | Open until scheduled or completed. For limited MVP, a scheduled drill is acceptable; before broad launch, a completed restore drill is preferred. `docs/AssetSafe_Data_Lifecycle_External_Controls_MVP_Signoff.md` records 7-day PITR accepted for MVP and 14-day PITR deferred to P1. Drill execution should follow `docs/AssetSafe_Backup_Restore_Runbook.md`. | 2026-07-05 |
| Data lifecycle | Storage backup posture accepted | Accepted MVP | Michael Lewis / platform owner | `docs/AssetSafe_Data_Lifecycle_External_Controls_MVP_Signoff.md`: Supabase managed DB backups + PITR for Postgres and Supabase Storage provider-managed durability/replication for objects accepted for MVP; no secondary app-managed object backup for MVP; post-launch secondary object snapshot / cross-region replication review tracked as P1/Q1 follow-up | 2026-07-05 |
| Data lifecycle | Bucket lifecycle policy accepted | Accepted MVP | Asset Safe operator / platform | Admin Database Bucket Lifecycle Policies evidence captured; `exports` bucket private; `floor-plans` accepted as not launch-required on 2026-06-24; managed export round trip succeeded in `docs/AssetSafe_Launch_Evidence_Run_2026_06_29.md` | 2026-07-03 |
| Data lifecycle | Required data lifecycle cron health verified | Accepted MVP | Asset Safe operator / platform | `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`: all 8 lifecycle jobs `ok`/`succeeded`, `consecutive_failures=0`, `last_error=null` | 2026-07-03 |
| Data lifecycle | Legal retention schedule reviewed | Accepted MVP — counsel review pending | Michael Lewis | `docs/AssetSafe_Data_Lifecycle_External_Controls_MVP_Signoff.md`: retention matrix and closure/deletion boundary matrix accepted for MVP; legal hold overrides deletion/anonymization/expiration sweepers; billing/Stripe evidence retained 7 years tombstone-linked; plaintext email in legal evidence remains access-restricted and minimized unless counsel advises otherwise | 2026-07-05 |
| Continuity | Evidence retention for death/legal documents decided | Accepted MVP | Asset Safe operator / continuity reviewer | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md`: retain death/legal/continuity request evidence for 7 years after resolution unless counsel advises otherwise; legal hold overrides; ordinary account deletion must not auto-purge before retention expiry | 2026-07-03 |
| Continuity | Second-review rules for high-risk continuity cases decided | Accepted MVP | Asset Safe operator / senior reviewer | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md`: senior review required for death/legal authority, access transfer, vault export, disputed request, suspicious/fraudulent document, ownership transfer, and high-impact continuity actions | 2026-07-03 |
| Continuity | 30-day continuity closure bypass authority decided | Accepted MVP | Asset Safe operator / senior reviewer / company owner | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md`: bypass only by senior reviewer, senior operator, or company owner with documented justification; blocked while dispute, freeze, or unresolved conflict remains | 2026-07-03 |
| Continuity | Continuity tabletop completed or scheduled before broad launch | Accepted MVP | Asset Safe operator / continuity reviewer | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md` and `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md`: one tabletop required before broad continuity launch; record scenario, participants, outcome, and follow-up actions | 2026-07-03 |
| Support | `support@assetsafe.net` owner and backup named | Accepted MVP | Michael Lewis | `docs/AssetSafe_Support_Launch_Decision_Memo.md`: Michael Lewis is primary owner for `support@assetsafe.net`; backup support owner is not formally assigned for MVP, and Michael retains responsibility for backup coverage until assigned | 2026-07-03 |
| Support | Support tiers, SLA targets, and escalation paths accepted | Accepted MVP | Michael Lewis | `docs/AssetSafe_Support_Launch_Decision_Memo.md`: SLA/escalation matrix accepted for MVP; high-risk account access, billing dispute, legal/continuity, security, deletion/export, and privacy issues require escalation by category | 2026-07-03 |
| Support | Account recovery confirmed as audited-review only | Accepted MVP | Asset Safe operator / support lead | `docs/AssetSafe_Support_Launch_Decision_Memo.md`; `dev_support_issues` supports `account_recovery`, recovery scenarios, identity/billing/action review statuses; support issue review does not automatically reset MFA, change email, bypass auth, grant ownership, or export data | 2026-07-03 |
| Support | No write-capable impersonation for launch | Accepted MVP | Asset Safe operator / support lead | `docs/AssetSafe_Support_Launch_Decision_Memo.md` and `docs/AssetSafe_Support_Ops_Runbook.md`: no write-capable impersonation for launch; account-level inspection uses admin panels, audit logs, provider dashboards, screenshots, and logged `support_access_reviews` when available | 2026-07-03 |
| Monitoring | External alert routing chosen: dashboard-only, email, Slack, or pager | Accepted MVP | Michael Lewis / support owner | `docs/AssetSafe_Monitoring_Launch_Decision_Memo.md`: dashboard-first monitoring accepted for MVP; Michael/support owner reviews Admin Monitoring and critical dashboards daily during launch week; `support@assetsafe.net` is escalation inbox; Slack/pager deferred to P1 unless configured/tested before launch; revisit within 30 days or after launch traffic begins | 2026-07-04 |
| Monitoring | First real cron successes reviewed after scheduling | Accepted MVP | Asset Safe operator / platform owner | `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`: all 8 lifecycle jobs returned `ok` / `succeeded`, `consecutive_failures=0`, and `last_error=null` after first scheduled runs and internal-secret rotation | 2026-07-04 |
| Security | Production secret manager chosen | Accepted MVP | Michael Lewis | `docs/AssetSafe_Security_Launch_Decision_Memo.md`: runtime/application secrets use Supabase Edge Function Secrets; human/operator vault is 1Password; Michael Lewis is primary owner; backup owner not formally assigned for MVP and should be assigned after launch or before broader rollout | 2026-07-04 |
| Security | Pre-launch vulnerability scan completed with no untriaged High/Critical findings | Deferred / Accepted MVP risk | Michael Lewis | Staging environment is not yet provisioned; no active ZAP scan will run against production and no staging-style test accounts will be seeded in production. Compensating controls: dependency audit passed with 0 vulnerabilities, production build passed, Supabase linter/security warnings reviewed/fixed or documented, RLS/security policies manually reviewed where applicable, MFA/step-up/vault protections tested, billing/webhook flows tested, dashboard-first monitoring accepted, and incident response / secret manager decisions accepted. Before broad launch: provision staging, seed role test accounts, run Playwright role-gate checks plus ZAP/manual auth-RLS checks, and confirm no untriaged High/Critical findings remain. See `docs/AssetSafe_Vulnerability_Scan_Evidence_Pending.md`. | 2026-07-04 |
| Security | Incident contacts and escalation path confirmed | Accepted MVP | Michael Lewis | `docs/AssetSafe_Security_Launch_Decision_Memo.md`: Michael Lewis is primary security / incident / platform owner; backup owner not formally assigned for MVP; `support@assetsafe.net` remains support escalation inbox | 2026-07-04 |
| Security | Incident tabletop completed or scheduled before broad launch | Operator action required | Michael Lewis / security owner | Open until scheduled with date/time, participants, scenario, owner, and evidence location, or completed with tabletop evidence. MVP scenario: suspected unauthorized access or exposed storage object affecting user asset documents. Completion before broad launch is preferred. See `docs/AssetSafe_Security_Incident_Tabletop_Agenda.md` and `docs/AssetSafe_Security_Launch_Decision_Memo.md`. | 2026-07-05 |
| Legal/compliance | Terms and Privacy active version approved | Accepted MVP - owner approved; counsel review pending/recommended | Michael Lewis | `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md` and `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`: owner-approved active MVP versions required before accepting real users; material future changes require classification, versioning, notice, and re-consent decision | 2026-07-05 |
| Legal/compliance | DSAR/privacy request intake path approved | Accepted MVP | Michael Lewis / support owner | `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md` and `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`: manual intake through `support@assetsafe.net`; identity/authority verification, request logging, export/delete workflow, retention exceptions, and legal-hold checks required | 2026-07-05 |
| Legal/compliance | DMCA/content complaint intake path approved | Accepted MVP | Michael Lewis / support owner | `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md` and `docs/AssetSafe_DMCA_Takedown_Runbook.md`: manual intake through `support@assetsafe.net`; operator review, evidence logging, access restriction/quarantine when needed, and counsel escalation for formal DMCA/counter-notice or disputed legal issues | 2026-07-05 |
| Legal/compliance | Legal request intake path approved | Accepted MVP | Michael Lewis / legal reviewer | `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md` and `docs/AssetSafe_Legal_Request_Runbook.md`: manual intake through `support@assetsafe.net`; counsel required for subpoenas, law enforcement, court orders, preservation demands, disclosure decisions, and breach/privacy notice questions; legal hold overrides cleanup | 2026-07-05 |
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
| Security | Production internal cron secret rotation | Fresh `sb_secret_...` internal secret was installed in Edge Function Secrets; docs now require `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS`; all lifecycle cron jobs were recreated | Closed in P0 sign-off row; runtime/application secrets use Supabase Edge Function Secrets and human/operator vault is 1Password |
| Security | Key rotation runbook | `docs/AssetSafe_Key_Rotation_Runbook.md` updated for Supabase secret API keys, lowercase secret support, static cron headers, `cron.job.command` exposure warning, and current schema-safe validation queries | Decide when to remove legacy service-role fallback from `isAuthorizedInternalCall(req)` |
| Security | Incident / scan readiness | Runbooks exist: `docs/AssetSafe_Security_Incident_Response_Runbook.md`, `docs/AssetSafe_Vulnerability_Scan_Runbook.md`, `docs/AssetSafe_Audit_Log_Retention_Runbook.md`; Resend webhook recovery and clean dependency audit/build evidence captured in `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md` | Run staging ZAP/manual auth scan, triage High/Critical findings, and schedule/complete incident tabletop |
| Security | Launch decision packet | `docs/AssetSafe_Security_Launch_Decision_Memo.md` separates accepted MVP decisions from evidence-required items: secret manager and incident contacts are accepted; vulnerability scan is deferred as accepted MVP risk pending staging; tabletop stays open until scheduled/completed evidence exists | Complete tabletop scheduling/evidence before broad launch; complete staging scan evidence before broad launch / P1 hardening |
| Monitoring | Launch decision packet | `docs/AssetSafe_Monitoring_Launch_Decision_Memo.md` defines approved dashboard-first MVP monitoring, daily launch-week review, escalation thresholds, and follow-up external routing choices | Closed in P0 sign-off rows |
| Legal/compliance | DSAR, DMCA, legal request, Terms/Privacy paths | Runbooks exist and are indexed in `docs/AssetSafe_Launch_Packet_Index.md`; owner approval recorded in `docs/AssetSafe_Legal_Privacy_MVP_Decision_Memo.md` | Closed in P0 sign-off rows for MVP; counsel review remains pending/recommended where applicable |
| Support | Support/account recovery posture | Account recovery remains audited-review only; support ops runbook exists | Closed in P0 sign-off rows; Michael Lewis is primary `support@assetsafe.net` owner and backup owner remains a P1/broader-rollout follow-up |
| Support | Launch decision packet | `docs/AssetSafe_Support_Launch_Decision_Memo.md` defines approved MVP defaults for mailbox ownership, backup coverage, support tiers, SLA targets, escalation paths, audited account recovery, and no write-capable impersonation | Closed in P0 sign-off rows |
| Billing | Manual billing ops posture | Replay, gift failure, dispute, refund, receipt idempotency, no-trial posture, Stripe error review cadence, Smart Retries, and Asset Safe receipt source are implemented/tested/decided | Record named billing backup owner if desired |
| Continuity | Launch decision packet | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md` defines approved MVP defaults for evidence retention, senior review, 30-day closure bypass, and tabletop scheduling | Closed in P0 sign-off rows |

| Area | Follow-up | Recommended decision | Owner | Evidence / ticket | Date |
|---|---|---|---|---|---|
| Security | Provision staging and complete active scan evidence before broad launch | Required before broad launch / P1 hardening | Michael Lewis / platform owner | Provision separate staging Supabase project and staging app URL, seed role test accounts, run Playwright role-gate checks plus ZAP/manual auth-RLS checks, and confirm no untriaged High/Critical findings remain. Do not active-scan production. | 2026-07-04 |
| Data lifecycle | Review managed export performance after real large-account exports | Accepted MVP |  |  |  |
| Data lifecycle | Upgrade PITR from 7-day MVP window to 14-day broader-launch target | Required P1 / broader-launch review | Michael Lewis / platform owner | Deferred with owner approval due to cost; revisit when usage, revenue, or risk level justifies the additional PITR and compute cost | 2026-07-05 |
| Monitoring | Add external Slack/email routing if dashboard-only review is too quiet | Deferred |  |  |  |
| Monitoring | Review storage usage drift alert volume | Accepted MVP |  |  |  |
| Support | Review support backlog and manual-review SLA behavior | Accepted MVP |  |  |  |
| Continuity | Review first continuity dispute/evidence-retention cases | Accepted MVP |  |  |  |
| Growth | Review funnel drop-off, churn reasons, and support friction | Accepted MVP |  |  |  |

## P2 Quarter 1

| Area | Follow-up | Recommended decision | Owner | Evidence / ticket | Date |
|---|---|---|---|---|---|
| Data lifecycle | Provider-level storage lifecycle rules for temp/quarantine prefixes | Deferred |  |  |  |
| Data lifecycle | Secondary object snapshots or cross-region storage replication | Required P1/Q1 review | Michael Lewis / platform owner | Review scheduled object snapshots vs cross-region replication after MVP; storage backup posture accepted for MVP without a secondary app-managed object copy | 2026-07-05 |
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
