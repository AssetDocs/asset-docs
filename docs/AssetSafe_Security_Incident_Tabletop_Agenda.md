# Asset Safe Security Incident Tabletop — Agenda & Evidence Template

Status: launch security operations template
Owner: Security Lead / Operator
Companion docs:
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Support_Ops_Runbook.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`

## Purpose

This template drives a 60-minute pre-launch security incident tabletop and captures the evidence required to close the P0 row **"Incident tabletop completed or scheduled before broad launch"** in `AssetSafe_Launch_Operator_Signoff_Checklist.md`.

Do not run destructive actions against production during the exercise. All containment steps are walked through against staging or in a dry-run/read-only fashion.

## Launch Gate Prerequisites

Fill these in before scheduling. If any row is blank, the tabletop cannot start.

| Item | Value |
|---|---|
| Staging app URL |  |
| Staging Supabase project ref (must ≠ `leotcbfpqiekgkgumecn`) |  |
| Non-production data only? (Y/N) |  |
| Active ZAP scanning permitted against staging? (Y/N) |  |
| Test accounts available (Owner / Authorized User / Contributor-Viewer / Admin / Expired / Deletion-hold) |  |
| Incident Response Runbook reviewed by attendees? (Y/N) |  |

## Logistics

| Field | Value |
|---|---|
| Scheduled date |  |
| Start time / timezone |  |
| Duration | 60 minutes |
| Location / video link |  |
| Facilitator |  |
| Note-taker |  |
| Evidence bundle location (Drive/ticket link) |  |

## Roles & Attendees

| Role | Name | Contact | Present (Y/N) |
|---|---|---|---|
| Incident Commander (IC) |  |  |  |
| Platform Lead (Supabase / edge functions / storage) |  |  |  |
| Support Lead (`support@assetsafe.net`) |  |  |  |
| Counsel / Operator |  |  |  |
| Observer(s) |  |  |  |

## Launch Scenario — Private Storage Object Exposure

**Setup.** A support ticket reports that a signed URL for a Legacy Locker document uploaded by User A was received by an unrelated inbox. The URL still resolves. Ticket arrived at T+0.

**Assumptions in scope for staging walkthrough.**
- Staging `legacy-locker` bucket is private and mirrors production policy.
- Staging owns the same `assetsafe_secret_keys` / cron secret pattern and edge functions as production.
- No production PII is used; test account IDs only.

**Injects.**

| Time | Inject | Expected surface |
|---|---|---|
| T+0 | Support ticket with the leaked signed URL | Support Lead triages, pages IC |
| T+15 | Second report: same recipient received a second unrelated user's URL | Escalate to Sev 1; suspect signed-URL generation path, not a one-off share |
| T+30 | Log review shows an edge function invoked with an old `x-internal-secret` value | Rotate internal cron secret per `AssetSafe_Key_Rotation_Runbook.md`; check for service-role fallback abuse |
| T+45 | Counsel asks whether affected users must be notified within 72h | Comms path executes; user-notice draft produced |

## 60-Minute Agenda

| Time | Segment | Owner | Output |
|---|---|---|---|
| 0–5 | Kickoff, scenario read-in, role confirmation | Facilitator | Attendee list confirmed |
| 5–15 | Detection & triage — classify severity, name IC, open incident record | IC / Support Lead | Sev classification + incident ID |
| 15–30 | Containment walkthrough — bucket policy audit, signed-URL TTL review, rotate `assetsafe_secret_keys`, revoke suspect sessions (ref: Key Rotation + Security Incident Response runbooks) | Platform Lead | Containment checklist executed against staging |
| 30–40 | Communications — support macro, in-app notice, user email draft, counsel review of 72h notification obligation | Support Lead + Counsel | Draft user notice + support macro captured |
| 40–50 | Eradication & recovery — confirm no further leaked URLs resolve, verify cron health, plan post-incident scan (ref: Vulnerability Scan Runbook) | Platform Lead | Recovery checklist + follow-up scan scheduled |
| 50–60 | Debrief — what worked, what didn't, action items, sign-off | Facilitator / IC | Action table + sign-off row completed |

## Evidence To Capture

Attach each artifact to the evidence bundle link above.

- Timeline log (event, time, actor, source).
- Decisions log (decision, decider, rationale).
- Screenshots or query results used during containment (redact user data).
- Rotated secret evidence — reference only; never paste secret values.
- Draft user notice and support macro text.
- Follow-up ticket IDs.

## Pass / Fail Criteria

The tabletop passes only if **all** are true:

- Sev classification made within 15 minutes of first inject.
- Incident Commander named and acknowledged before T+15.
- Containment path executed end-to-end against staging (bucket audit + secret rotation walkthrough + session revocation) without an undefined ownership gap.
- User communication draft produced and reviewed by Counsel/Operator.
- Every runbook referenced during the exercise was reachable and current.
- No P0 step required a decision by a person not present or not backed up.

Any single failure → outcome is `pass-with-actions` or `fail`, with actions recorded below.

## Follow-Up Actions

| # | Action | Owner | Due | Status | Evidence link |
|---|---|---|---|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |

## Sign-Off

| Item | Value |
|---|---|
| Outcome (`pass` / `pass-with-actions` / `fail`) |  |
| Next tabletop due (recommend quarterly) |  |
| Evidence bundle link |  |
| Approver (Security Lead / Operator) |  |
| Approval date |  |

Once signed off, update the matching row in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` with the approver, date, and evidence link.
