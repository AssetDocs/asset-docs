# Asset Safe Security Launch Decision Memo

Status: recommended launch decisions
Owner: Asset Safe operator / security lead
Related docs:
- `docs/AssetSafe_Production_Secret_Manager_Decision_Brief.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Security_Incident_Tabletop_Agenda.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`

## Purpose

This memo summarizes the remaining Security P0 launch gates and separates owner decisions from evidence that must still be collected.

## Current Security Evidence

Already evidenced:

- Production internal cron secret rotation completed and lifecycle cron jobs recovered.
- `assetsafe_secret_keys` / `ASSETSAFE_SECRET_KEYS` support exists for Edge Function internal authorization.
- Resend webhook boot error was fixed and deployed.
- Dependency audit passed with `0 vulnerabilities` after package updates.
- Production build passed after dependency updates.
- Security runbooks exist for key rotation, incident response, vulnerability scanning, and audit-log retention.

Primary evidence source: `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`.

## Recommended MVP Decisions

| Launch gate | Recommended decision | Evidence / action required |
|---|---|---|
| Production secret manager chosen | Accept Supabase Edge Function Secrets as the runtime secret store for MVP, with 1Password as the human-accessible vault for break-glass copies and rotation records. Primary owner should be Michael Lewis unless another security lead is named. Backup owner remains pending unless assigned. | Approve and fill `docs/AssetSafe_Production_Secret_Manager_Decision_Brief.md`. |
| Pre-launch vulnerability scan completed with no untriaged High/Critical findings | Do not close yet. Dependency audit/build evidence is complete, but staging ZAP/manual auth-RLS abuse checks still need evidence. | Run staging scan/manual checks per `docs/AssetSafe_Vulnerability_Scan_Runbook.md`; no untriaged High/Critical findings may remain. |
| Incident contacts and escalation path confirmed | Accept Michael Lewis as Incident Commander / Security Lead for MVP unless another owner is named. Use `support@assetsafe.net` as the support intake/escalation inbox. Counsel/operator escalation remains Michael unless counsel is separately named. | Approve the contact matrix below. |
| Incident tabletop completed or scheduled before broad launch | Do not mark "completed" until the tabletop is run. For MVP, "scheduled" is acceptable only if date, participants, staging URL/project, scenario, and evidence location are recorded. | Fill `docs/AssetSafe_Security_Incident_Tabletop_Agenda.md` scheduling fields or attach completed evidence. |

## Recommended Contact Matrix

| Role | Recommended MVP owner | Backup | Notes |
|---|---|---|---|
| Incident Commander / Security Lead | Michael Lewis | Not formally assigned for MVP | Owns severity classification, containment decisions, and incident record |
| Platform Lead | Michael Lewis | Not formally assigned for MVP | Owns Supabase, Edge Functions, Storage, cron, and secret rotation actions |
| Support Lead | Michael Lewis / `support@assetsafe.net` | Not formally assigned for MVP | Owns user/support intake and status updates |
| Billing Lead | Michael Lewis | Not formally assigned for MVP | Owns Stripe Dashboard review, refunds/disputes, and billing evidence |
| Counsel / Legal Operator | Michael Lewis until counsel is named | Counsel TBD | Must be involved for breach notification, legal requests, and user notice wording |

## Vulnerability Scan Evidence Required

Minimum before closing the scan row:

1. Staging or dedicated non-production target identified.
2. ZAP baseline or equivalent passive scan completed.
3. Manual auth/RLS abuse checks completed for owner, Authorized User, contributor/viewer, admin, and expired/read-only scenarios relevant to launch.
4. GitHub/secret-scanning alerts reviewed.
5. Dependency audit evidence attached.
6. No untriaged High/Critical findings remain.
7. Any accepted Medium or lower risk has owner/date/rationale.

## Incident Tabletop Evidence Required

Minimum before closing or scheduling the tabletop row:

1. Scheduled date/time or completed date/time.
2. Participants and roles.
3. Staging app URL and staging Supabase project ref, or written reason for a dry-run-only tabletop.
4. Scenario used.
5. Outcome: `pass`, `pass-with-actions`, or `fail`.
6. Follow-up actions, owner, and due date.
7. Evidence bundle/ticket link.

## Sign-Off Recommendation

Can close after owner approval:

- Production secret manager chosen.
- Incident contacts and escalation path confirmed.

Keep open until evidence exists:

- Pre-launch vulnerability scan completed with no untriaged High/Critical findings.
- Incident tabletop completed or scheduled before broad launch.
