# Asset Safe Production Secret Manager — Decision Brief

Status: launch security operations decision brief
Owner: Security Lead / Operator
Companion docs:
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`

## Purpose

This brief closes the P0 row **"Production secret manager chosen"** in `AssetSafe_Launch_Operator_Signoff_Checklist.md`. It records the tool choice, owners, rotation cadence, break-glass process, and accepted risks for how Asset Safe stores and rotates production credentials.

## Scope

**In scope (production credentials this decision governs):**
- Stripe live secret + webhook signing secret
- Resend API key + `RESEND_WEBHOOK_SECRET`
- `assetsafe_secret_keys` / `ASSETSAFE_SECRET_KEYS` (internal cron `x-internal-secret`)
- Supabase `SUPABASE_SERVICE_ROLE_KEY` (legacy fallback)
- Any third-party API keys used by edge functions (email, analytics, AI providers)
- OAuth/provider client secrets

**Out of scope:**
- Per-user vault encryption keys (owned by the user, never held centrally)
- Supabase publishable/anon key (public by design)
- Local `.env` values populated automatically by Lovable

## Current State (2026-07-01)

- All production secrets live in **Supabase Edge Function Secrets**.
- Rotation of `assetsafe_secret_keys` has been executed end-to-end; evidence in `docs/AssetSafe_Launch_Evidence_Run_2026_07_01.md`.
- Rotation process is documented in `docs/AssetSafe_Key_Rotation_Runbook.md`.
- No dedicated human-accessible vault, break-glass owner, or backup owner is formally named.

## Options Compared

| Criterion | Supabase Edge Function Secrets | 1Password | AWS Secrets Manager | Doppler |
|---|---|---|---|---|
| Read at runtime by edge functions | Native (`Deno.env.get`) | Requires sync/CI | Requires SDK or sync | Native CLI/agent sync |
| Human access UI | Basic | Excellent | Console | Good |
| Per-secret audit log | Limited | Yes | Yes (CloudTrail) | Yes |
| Versioning / rollback | No native UI | Item history | Yes | Yes |
| Rotation tooling | Manual, runbook-driven | Manual, human vault | Automatic (some services) | Scheduled rotation |
| Break-glass / shared access | Weak (Supabase org roles) | Strong (shared vaults) | IAM-gated | Team roles |
| Cost at MVP scale | $0 (included) | ~$8/user/mo | Low ($ per secret) | Free tier + paid |
| Integration effort now | None (already in use) | Low (owner vault only) | Medium (SDK or sync job) | Medium (agent + CI wiring) |
| MVP suitability | High | High (as companion) | Medium (over-scoped) | Medium (over-scoped) |

## Recommendation

**For MVP launch:** keep **Supabase Edge Function Secrets** as the runtime system of record, and add **1Password** as the human-accessible shared vault for break-glass copies and rotation records.

Rationale:
- Runtime already reads from Supabase secrets; no code migration required.
- 1Password gives named owner/backup access, item history, and a place to record rotation dates without exposing values in tickets or docs.
- AWS Secrets Manager and Doppler are appropriate at enterprise scale (multi-env pipelines, automated rotation, SOC 2 audit prep) but add integration surface Asset Safe does not need at MVP.

**Trigger to revisit:** any of — team > 2 operators, SOC 2 audit begins, first customer contractually requires a named enterprise secret manager, or a Sev 1 secret-exposure incident occurs.

## Owners

| Role | Person | Effective date |
|---|---|---|
| Primary access owner |  |  |
| Backup access owner |  |  |
| Rotation calendar owner |  |  |
| Break-glass approver |  |  |

## Rotation Calendar

- Cadence: quarterly, plus event-driven per `AssetSafe_Key_Rotation_Runbook.md`.
- Owner: see table above.
- Evidence: each rotation logged in a dated `docs/AssetSafe_Launch_Evidence_Run_YYYY_MM_DD.md`.
- Next scheduled rotation date:  ________

## Emergency (Break-Glass) Access

1. Requestor pages the primary access owner (backup owner if primary is unavailable).
2. Break-glass approver authorizes the access in writing (ticket, chat, or email — retained).
3. Owner shares the specific secret via 1Password shared vault (never chat, email body, or ticket).
4. If the secret must be used to authorize a rotation, follow `AssetSafe_Key_Rotation_Runbook.md`.
5. All break-glass events are logged with: date, requestor, approver, secret name (not value), reason, and follow-up action.
6. Any break-glass event triggers an out-of-cycle review at the next weekly ops check.

## Accepted Risks

- Supabase Edge Function Secrets do not expose per-secret version history; rollback requires re-entering the prior value from 1Password.
- No automated rotation for third-party keys at MVP; cadence depends on the human owner.
- 1Password is human-only; a compromise of the owner's 1Password account is a Sev 1 event and triggers the Security Incident Response runbook.
- Legacy `SUPABASE_SERVICE_ROLE_KEY` fallback in `isAuthorizedInternalCall(req)` remains until removed; tracked separately in the key rotation runbook.

## Final Decision & Sign-Off

| Item | Value |
|---|---|
| Chosen runtime store | Supabase Edge Function Secrets |
| Chosen human vault | 1Password |
| Primary owner |  |
| Backup owner |  |
| Rotation cadence | Quarterly + event-driven |
| Next review date |  |
| Approver (Security Lead / Operator) |  |
| Approval date |  |

Once signed off, update the matching row in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` with approver, date, and a link to this brief.
