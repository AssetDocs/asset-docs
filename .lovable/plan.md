## Plan: Security Ops launch evidence templates

Draft two new docs under `docs/`. No code changes. No staging credentials handled by me — the docs include date-holder fields the operator fills in.

### 1. `docs/AssetSafe_Security_Incident_Tabletop_Agenda.md`

Sections:
- **Purpose & launch gate** — completes the P0 "Incident tabletop completed or scheduled" row in `AssetSafe_Launch_Operator_Signoff_Checklist.md`.
- **Logistics fields (date-holder)** — scheduled date, time, location/video link, facilitator, note-taker.
- **Roles** — Incident Commander, Platform Lead, Support Lead, Counsel/Operator, Observer(s); attendee table with name/role/present.
- **Launch scenario** — *Private storage object exposure*: signed-URL leak of a user's Legacy Locker document; scoped injects at 0/15/30/45 min.
- **60-minute agenda** — 0–5 kickoff, 5–15 detection & triage, 15–30 containment (key rotation, bucket audit, `x-internal-secret` rotation ref → `AssetSafe_Key_Rotation_Runbook.md`), 30–40 comms (support macros, user notice, counsel review), 40–50 eradication/recovery, 50–60 debrief.
- **Evidence to capture** — timeline log, decisions log, artifacts (screenshots, query results), comms drafts, action items.
- **Pass/fail criteria** — Sev classification within 15 min; IC named; containment path executed against staging; user-comms draft produced; all P0 runbooks referenced were reachable; no undefined ownership gaps.
- **Follow-up action table** — action / owner / due / status / evidence link.
- **Sign-off table** — outcome (pass / pass-with-actions / fail), approver, date, link to evidence bundle.
- **Cross-refs** — Security Incident Response, Key Rotation, Vulnerability Scan, Data Lifecycle External Controls, Support Ops runbooks.

### 2. `docs/AssetSafe_Production_Secret_Manager_Decision_Brief.md`

Sections:
- **Purpose & launch gate** — completes the P0 "Production secret manager chosen" row.
- **Scope** — what secrets are in scope (Stripe, Resend, `assetsafe_secret_keys` / internal cron secret, Supabase service-role fallback, third-party API keys) and out of scope (per-user vault keys).
- **Current state** — Supabase Edge Function Secrets in use today; recent rotation evidence in `AssetSafe_Launch_Evidence_Run_2026_07_01.md`.
- **Options comparison table** — Supabase Edge Function Secrets / Vault, 1Password, AWS Secrets Manager, Doppler — columns: fit, cost, access control, audit log, rotation support, break-glass, integration effort, MVP suitability.
- **Recommendation for MVP** — Supabase Edge Function Secrets as system of record + 1Password as human-accessible break-glass / owner-of-record vault; revisit at enterprise scale (AWS SM or Doppler) once team > 2 or SOC 2 audit begins.
- **Access owner / backup owner fields** — date-holder table (primary owner, backup owner, effective date).
- **Rotation calendar ownership** — who owns quarterly rotation cadence + links to `AssetSafe_Key_Rotation_Runbook.md`.
- **Emergency access process** — break-glass steps, who approves, how it's logged.
- **Accepted risks** — e.g., Supabase secrets lack per-secret versioning UI; mitigations documented.
- **Final decision / sign-off table** — chosen tool, owner, backup, rotation cadence, next review date, approver, date.

### Follow-up (not in this plan)
The staging-URL / test-account / ZAP-permission questions are addressed inside the tabletop doc's launch-gate section as prerequisites; actually collecting those values is an operator action, not an edit I can make.

Approve and I'll write both files.
