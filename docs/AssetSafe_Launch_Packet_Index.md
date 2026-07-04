# Asset Safe Launch Packet Index

Status: launch packet index
Date: 2026-06-23
Owner: Asset Safe operator / project owner

## Start Here

| Step | Document | Purpose |
|---|---|---|
| 1 | `docs/AssetSafe_Launch_Handoff.md` | Explains who uses each launch doc and what should or should not be built |
| 2 | `docs/AssetSafe_Operational_Readiness_Sweep.md` | Summarizes readiness across Lovable's operational areas 1-10 |
| 3 | `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` | Final P0/P1/P2 decision and approval sheet |
| 4 | `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` | Exact SQL queries, screenshots, tickets, and approvals needed for sign-off |
| 5 | `docs/AssetSafe_Launch_Code_Workqueue.md` | Conditional Lovable/dev prompts for rows marked `Code required` |
| 6 | `docs/AssetSafe_Lovable_Launch_Readiness_Prompt.md` | Copy-paste prompt for Lovable coordination |
| 7 | `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md` | Lovable's first-pass P0 classification and evidence list |
| 8 | `docs/AssetSafe_Launch_Evidence_SQL.sql` | Read-only SQL bundle for database-backed launch evidence |
| 9 | `docs/AssetSafe_Launch_Evidence_Run_2026_06_23.md` | First evidence-pass result summary and follow-ups |
| 10 | `docs/AssetSafe_Launch_Evidence_Run_2026_06_24.md` | Second evidence-pass result summary and follow-ups |
| 11 | `docs/AssetSafe_Launch_Evidence_Run_2026_06_28.md` | Lifecycle cron secret rotation and cron recovery evidence |
| 12 | `docs/AssetSafe_Launch_Evidence_Run_2026_06_29.md` | Managed account export round-trip verification |
| 13 | `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md` | Security operations: lifecycle cron health and Resend webhook recovery |

## Operator Flow

1. Read `docs/AssetSafe_Launch_Handoff.md`.
2. Open `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.
3. Use `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` to gather evidence for each P0 row.
4. Run `docs/AssetSafe_Launch_Evidence_SQL.sql` for database-backed evidence.
5. Mark each row as `Accepted MVP`, `Operator action required`, `Code required`, or `Deferred`.
6. Send only `Code required` rows to Lovable using `docs/AssetSafe_Launch_Code_Workqueue.md`.
7. Use `docs/AssetSafe_Lovable_Launch_Readiness_Prompt.md` if Lovable should help classify rows before code work begins.
8. Use `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md` as the current first-pass classification.
9. Record final approval in the sign-off checklist.

## Area Runbooks

| Area | Primary document |
|---|---|
| Billing & revenue | `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md` |
| Data lifecycle & retention | `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md` |
| Continuity & legacy edge cases | `docs/AssetSafe_Continuity_Legacy_Operations.md`; launch decisions: `docs/AssetSafe_Continuity_Launch_Decision_Memo.md` |
| Support & ops tooling | `docs/AssetSafe_Support_Ops_Runbook.md`; launch decisions: `docs/AssetSafe_Support_Launch_Decision_Memo.md` |
| Monitoring & alerting | `docs/AssetSafe_Operational_Readiness_Sweep.md`; launch decisions: `docs/AssetSafe_Monitoring_Launch_Decision_Memo.md` |
| Security operations | `docs/AssetSafe_Security_Incident_Response_Runbook.md` |
| Compliance & legal ops | `docs/AssetSafe_Legal_Request_Runbook.md` |
| Growth / product ops | `docs/AssetSafe_Growth_Product_Ops_Runbook.md` |
| Multi-account / workspace ops | `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md` |
| Mobile / Capacitor ops | `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md` |

## Supporting Runbooks

| Topic | Document |
|---|---|
| Backup and restore | `docs/AssetSafe_Backup_Restore_Runbook.md` |
| Storage deletion cron | `docs/AssetSafe_Storage_Deletion_Cron_Runbook.md` |
| Expired export cron | `docs/AssetSafe_Expired_Export_Cron_Runbook.md` |
| Restore drill reminder cron | `docs/AssetSafe_Restore_Drill_Reminder_Cron_Runbook.md` |
| Key rotation | `docs/AssetSafe_Key_Rotation_Runbook.md` |
| Vulnerability scanning | `docs/AssetSafe_Vulnerability_Scan_Runbook.md` |
| Monitoring launch decision memo | `docs/AssetSafe_Monitoring_Launch_Decision_Memo.md` |
| Audit log retention | `docs/AssetSafe_Audit_Log_Retention_Runbook.md` |
| Support launch decision memo | `docs/AssetSafe_Support_Launch_Decision_Memo.md` |
| Privacy / DSAR requests | `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md` |
| DMCA / takedown | `docs/AssetSafe_DMCA_Takedown_Runbook.md` |
| Terms / privacy updates | `docs/AssetSafe_Terms_Privacy_Update_Runbook.md` |
| Continuity incident tabletop | `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md` |
| Continuity launch decision memo | `docs/AssetSafe_Continuity_Launch_Decision_Memo.md` |

## Launch Rule

The launch packet is complete only when every P0 row in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` has:

- owner,
- decision,
- evidence link,
- date,
- accepted risk or blocker note.

If a P0 row is marked `Code required`, launch readiness depends on the corresponding item in `docs/AssetSafe_Launch_Code_Workqueue.md` being implemented, deployed, and verified.
