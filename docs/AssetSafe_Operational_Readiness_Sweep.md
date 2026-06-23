# Asset Safe Operational Readiness Sweep

Status: launch readiness tracker
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Scope: Lovable operational areas 1-10

## Purpose

This sweep summarizes the current status of the ten operational areas originally flagged for under-specification: Billing, Data Lifecycle, Continuity, Support, Monitoring, Security, Compliance, Growth, Multi-account/Workspace, and Mobile.

The goal is to separate remaining engineering gaps from operator/legal/provider-console actions. A feature is not launch-ready merely because code exists; the launch gate is complete only when the required evidence is recorded.

## Executive Summary

| Area | Readiness | Remaining launch posture |
|---|---|---|
| 1. Billing & revenue operations | Mostly ready | Launch decisions are centralized; webhook replay/repair and Stripe Dashboard settings need owner evidence |
| 2. Data lifecycle & retention | Mostly ready | Production cron health, restore drill, legal retention sign-off remain |
| 3. Continuity & legacy edge cases | Mostly ready | Counsel/operator decisions remain for evidence retention and second-review rules |
| 4. Support & ops tooling | Mostly ready | Support tier/SLA ownership should be formalized before launch |
| 5. Monitoring, alerting & on-call | Mostly ready | External routing/paging and first real cron successes still need evidence |
| 6. Security operations | Mostly ready | Secret manager choice, scan evidence, and incident tabletop remain |
| 7. Compliance & legal ops | Mostly ready | Counsel/operator sign-off and intake ownership remain |
| 8. Growth / product ops | Ready for MVP | Product owner must accept activation/churn/referral priorities |
| 9. Multi-account / workspace ops | Ready for MVP | Manual review posture accepted; automation can wait |
| 10. Mobile / Capacitor ops | Ready as deferred app-store launch | Store launch blocked until native build path and privacy labels are signed off |

## P0 Launch Gates

These should be completed or explicitly accepted before broad production launch.

| Gate | Source doc | Owner | Evidence |
|---|---|---|---|
| Run and sign off PITR restore drill | `docs/AssetSafe_Backup_Restore_Runbook.md` | Operator | Passed `restore_drill_runs` row and sign-off |
| Verify data lifecycle cron health | `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` | Operator / Platform | `cron_job_health_status` rows after first scheduled runs |
| Confirm storage backup posture | `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` | Operator | Written decision: provider replication only vs secondary copy |
| Confirm legal retention schedule | `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` | Operator / Legal | Counsel/operator sign-off |
| Confirm Terms/Privacy active version | `docs/AssetSafe_Terms_Privacy_Update_Runbook.md` | Operator / Legal | Active version and consent evidence |
| Confirm DSAR/privacy intake path | `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md` | Operator / Legal | Support routing and response owner |
| Confirm DMCA/content complaint path | `docs/AssetSafe_DMCA_Takedown_Runbook.md` | Operator / Legal | Intake, evidence, and notice workflow |
| Confirm legal request intake path | `docs/AssetSafe_Legal_Request_Runbook.md` | Operator / Legal | Restricted intake and counsel escalation path |
| Run vulnerability scan and triage High/Critical findings | `docs/AssetSafe_Vulnerability_Scan_Runbook.md` | Security / Platform | ZAP/dependency/secret-scan results |
| Choose production secret manager | `docs/AssetSafe_Key_Rotation_Runbook.md` | Operator / Platform | Named system and access owner |
| Confirm incident contacts and tabletop | `docs/AssetSafe_Security_Incident_Response_Runbook.md` | Security / Operator | Contact list and tabletop notes |
| Confirm support ownership/SLA | `docs/AssetSafe_Support_Ops_Runbook.md` | Operator | Named support owner, backup, and response targets |

## P0 Engineering Or Product Decisions

These are not just operator checkboxes; they may require product or code changes if the launch posture is not accepted.

| Item | Current posture | Recommended launch decision |
|---|---|---|
| Stripe disputes | Billing doc identifies `charge.dispute.created/closed` as unhandled | Follow `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`: accept manual Stripe Dashboard handling for MVP or build webhook handling |
| Refunds | Manual Stripe Dashboard refunds with no app-side refund edge function | Follow `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`: accept manual refund ops for MVP or build admin refund/audit flow |
| Dunning escalation | Single payment reminder exists; no day-3/day-5/day-7 campaign | Follow `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`: accept single-reminder MVP or add escalated dunning |
| Trial reminders | Columns exist but cron/function path is stale | Follow `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`: remove trial promise or restore scheduled reminders |
| Webhook secret rotation | Runbook exists; dual-secret support is future hardening | Accept short maintenance-window rotation or add dual-secret verification |
| Receipt duplication | Stripe and app receipt paths may both send receipts | Choose receipt source in `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md` |
| Gift payment failures | Gift subscriptions should not pollute normal dunning state | Verify behavior using `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md` or add explicit gift filter |

## P1 First 30 Days

| Item | Source | Owner |
|---|---|---|
| Review managed export performance after real large-account exports | Data lifecycle | Platform |
| Add external Slack/email routing where admin-only monitoring is too quiet | Monitoring | Platform / Operator |
| Review storage usage drift alert volume | Data lifecycle / Monitoring | Platform |
| Validate cancellation/churn reason quality | Growth ops | Product |
| Confirm support backlog and manual-review SLA behavior | Support / Admin | Operator |
| Review continuity dispute and evidence-retention cases after first real use | Continuity | Operator / Legal |

## P2 Quarter 1

| Item | Source | Owner |
|---|---|---|
| Provider-level storage lifecycle rules for temp/quarantine prefixes | Data lifecycle | Platform |
| Secondary object snapshots or cross-region storage replication | Data lifecycle | Platform / Operator |
| Dual-secret webhook verification for Stripe and Resend | Security / Billing | Platform |
| External pen test before enterprise/broad launch | Security | Security / Operator |
| Referral or affiliate program decision | Growth ops | Product |
| Mobile app-store launch path, if desired | Mobile ops | Mobile release owner |

## Area Detail

### 1. Billing & Revenue Operations

Primary docs:

- `docs/AssetSafe_Billing_Revenue_Operations.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Launch_Code_Workqueue.md`

Covered:

- Payment failure/grace-period lifecycle.
- Subscription/account status state machine.
- Stripe event map and ignored-event list.
- Entitlements vs legacy mirrors.
- Billing-relevant cron inventory.

Remaining:

- Record owner acceptance for manual dispute/refund operations or build the replacement code.
- Record owner acceptance for single-reminder dunning.
- Choose receipt strategy.
- Verify gift payment failures do not affect normal subscriber dunning state.
- Monitor and repair `stripe_events.outcome = 'error'`.

### 2. Data Lifecycle & Retention

Primary docs:

- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Backup_Restore_Runbook.md`
- `docs/AssetSafe_Storage_Deletion_Cron_Runbook.md`

Covered:

- Tombstone-based deletion/anonymization model.
- Closure/deletion state machines.
- Storage deletion jobs and orphan reconciliation.
- Managed export TTL/download caps.
- Restore drill ledger and cron health.

Remaining:

- Run and sign off the first PITR restore drill.
- Verify production cron health after first real scheduled runs.
- Record storage backup posture and bucket lifecycle decisions.
- Complete legal retention schedule sign-off.

### 3. Continuity & Legacy Edge Cases

Primary docs:

- `docs/AssetSafe_Continuity_Legacy_Operations.md`
- `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md`

Covered:

- Legacy Admin request types.
- Evidence matrix.
- Competing-request conflict policy.
- Owner dispute freeze behavior.
- Heartbeat as a review signal only.
- Continuity tabletop scenarios.

Remaining:

- Decide whether high-risk continuity cases require second-reviewer sign-off.
- Decide exact retention policy for uploaded death/legal documents.
- Decide who may bypass the 30-day continuity closure waiting period.
- Run tabletop before broad launch.

### 4. Support & Ops Tooling

Covered in current app/admin work:

- Account recovery support issue type.
- Recovery scenario fields and admin review status controls.
- Manual-review posture for sensitive recovery work.
- Support SLA tracking, support access review logging, and support PII scrub monitoring.

Remaining:

- Name support owner and backup.
- Define escalation path from support to legal/security/billing.
- Accept the support tier, SLA, read-only review, and account-recovery policies in `docs/AssetSafe_Support_Ops_Runbook.md`.

### 5. Monitoring, Alerting & On-Call

Covered:

- `monitoring_alert_policies` table and Admin Monitoring alert routing card.
- Cron health rows and runbook checks.
- Resend webhook deliverability event intake.
- Data lifecycle/admin health panels.

Remaining:

- Verify first real successes for newly scheduled cron jobs.
- Decide external routing destination: email, Slack, pager, or manual dashboard review.
- Confirm who receives warnings vs pages.

### 6. Security Operations

Primary docs:

- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`

Covered:

- Secret rotation cadence and emergency rotation.
- Incident severity and containment playbooks.
- Vulnerability scan cadence.
- Audit evidence retention and export controls.

Remaining:

- Choose approved production secret manager.
- Run pre-launch scan and triage findings.
- Run incident tabletop.
- Decide whether to add dual-secret webhook support before launch or defer.

### 7. Compliance & Legal Ops

Primary docs:

- `docs/AssetSafe_Legal_Request_Runbook.md`
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`
- `docs/AssetSafe_DMCA_Takedown_Runbook.md`
- `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`

Covered:

- Law enforcement/civil legal request intake.
- Privacy request handling and DSAR-style timelines.
- DMCA/content takedown flow.
- Terms/Privacy update and re-consent process.

Remaining:

- Counsel/operator sign-off on each intake path.
- Decide authorized-agent and denial/extension authority.
- Confirm active Terms/Privacy version and material-change notice path.

### 8. Growth / Product Ops

Primary doc: `docs/AssetSafe_Growth_Product_Ops_Runbook.md`

Covered:

- Activation funnel and event taxonomy.
- Churn reason capture and win-back posture.
- Referral/affiliate deferral.
- In-app messaging/changelog rules.

Remaining:

- Product owner accepts MVP activation metric.
- Review post-launch funnel/churn data.
- Decide referral/affiliate program later.

### 9. Multi-account / Workspace Ops

Primary doc: `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`

Covered:

- Ownership transfer outside continuity.
- Authorized User over-limit posture after downgrade.
- Cross-account audit visibility.
- Manual review and support routing.

Remaining:

- Operator accepts manual-review-only ownership transfer posture.
- Review AU over-limit incidents after launch.

### 10. Mobile / Capacitor Ops

Primary doc: `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md`

Covered:

- Current Capacitor posture.
- Release channels and app-store launch gate.
- Update/OTA policy.
- Mobile session and security rules.
- QA matrix and support fields.

Remaining:

- No app-store launch until native source/build path is reproducible.
- Store privacy labels and legal links must be signed off before submission.
- Mobile remains deferred unless the operator chooses to package and submit.

## Recommended Next Fix

Support & Ops Tooling is centralized in `docs/AssetSafe_Support_Ops_Runbook.md`.

Billing & Revenue launch policy is centralized in `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`.

The remaining launch gates are centralized in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`. The highest-value next pass is for the operator to fill in owners/evidence and mark any `Code required` items that must block launch.

Conditional developer prompts for any items marked `Code required` are centralized in `docs/AssetSafe_Launch_Code_Workqueue.md`.
