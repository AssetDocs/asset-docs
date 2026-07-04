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
| Production secret manager chosen | Accepted for MVP. Runtime/application secrets use Supabase Edge Function Secrets. Human/operator vault is 1Password for break-glass copies and rotation records. Primary owner is Michael Lewis. Backup owner is not formally assigned for MVP and should be assigned after launch or before broader rollout. | Approved by operator on 2026-07-04. `docs/AssetSafe_Production_Secret_Manager_Decision_Brief.md` remains the detailed operating brief. |
| Pre-launch vulnerability scan completed with no untriaged High/Critical findings | Deferred / Accepted MVP risk. Full staging environment plus active ZAP/Playwright scan evidence is deferred to P1 / pre-broad-launch hardening because staging is not yet provisioned. | Do not run active ZAP against production. Do not seed staging-style test accounts in production. Before broad launch, provision staging, seed role test accounts, run Playwright role-gate checks plus ZAP/manual auth-RLS checks, and confirm no untriaged High/Critical findings remain. |
| Incident contacts and escalation path confirmed | Accepted for MVP. Michael Lewis is the primary security / incident / platform owner. Backup owner is not formally assigned for MVP. `support@assetsafe.net` remains the support escalation inbox. A formal backup owner should be assigned after launch or before broader rollout. | Approved by operator on 2026-07-04. |
| Incident tabletop completed or scheduled before broad launch | Do not mark "completed" until the tabletop is run. For MVP, "scheduled" is acceptable only if date, participants, staging URL/project, scenario, and evidence location are recorded. | Fill `docs/AssetSafe_Security_Incident_Tabletop_Agenda.md` scheduling fields or attach completed evidence. |

## Recommended Contact Matrix

| Role | Recommended MVP owner | Backup | Notes |
|---|---|---|---|
| Incident Commander / Security Lead | Michael Lewis | Not formally assigned for MVP | Owns severity classification, containment decisions, and incident record |
| Platform Lead | Michael Lewis | Not formally assigned for MVP | Owns Supabase, Edge Functions, Storage, cron, and secret rotation actions |
| Support Lead | Michael Lewis / `support@assetsafe.net` | Not formally assigned for MVP | Owns user/support intake and status updates |
| Billing Lead | Michael Lewis | Not formally assigned for MVP | Owns Stripe Dashboard review, refunds/disputes, and billing evidence |
| Counsel / Legal Operator | Michael Lewis until counsel is named | Counsel TBD | Must be involved for breach notification, legal requests, and user notice wording |

## Vulnerability Scan MVP Deferral

Operator decision on 2026-07-04: defer the full staging environment plus active ZAP/Playwright scan evidence to P1 / pre-broad-launch hardening.

Compensating controls accepted for MVP:

- Dependency audit passed with 0 vulnerabilities.
- Production build passed.
- Supabase linter/security warnings have been reviewed/fixed or documented.
- RLS/security policies have been manually reviewed where applicable.
- MFA/step-up/vault protections have been tested.
- Billing/webhook flows have been tested.
- Dashboard-first monitoring is accepted for MVP.
- Incident response and secret manager decisions are accepted.

Constraints:

- Do not run active ZAP against production.
- Do not seed staging-style test accounts in production.

Requirement before broad launch:

1. Staging or dedicated non-production target identified.
2. Staging test accounts seeded for owner, Authorized User / full access, read-only, admin, and expired/read-only scenarios where available.
3. Playwright role-gate checks completed.
4. ZAP baseline and/or manual auth-RLS checks completed.
5. No untriaged High/Critical findings remain.
6. Any accepted Medium or Low findings have owner, rationale, and due date.

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

Closed after owner approval:

- Production secret manager chosen.
- Incident contacts and escalation path confirmed.

Still open until evidence exists:

- Incident tabletop completed or scheduled before broad launch.

Deferred / accepted MVP risk:

- Pre-launch vulnerability scan completed with no untriaged High/Critical findings.
