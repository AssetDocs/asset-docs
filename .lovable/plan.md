
# Phase A — Read-only audit (v7, approved)

Phases B/C/D specs are locked per v7 and remain gated as previously agreed. This plan covers only Phase A execution.

## Scope

Read-only investigation. No schema changes, no code changes, no migrations, no edge function deploys. Deliverable is a single findings document at `/mnt/documents/Phase_A_Audit_Findings.md` that resolves the gating questions blocking B, C, and D.

## Audit checklist

1. **Calendar ownership model** — inspect `calendar_events`, `calendar_event_attachments`, and related RLS to determine owner-only vs workspace scope. Drives Phase B framing, C4 Realtime filter, and D-1 sync scope.

2. **Asset Values ownership model** — confirm whether `properties`, `items`, and `property_files.item_values` are personal (`user_id`) or workspace (`account_id`). Drives the C5 RPC signature (always `SECURITY DEFINER`, `SET search_path = public, pg_temp`, `REVOKE EXECUTE ... FROM PUBLIC`, `GRANT EXECUTE ... TO authenticated`, cursor pagination, never accepts `target_user_id`).

3. **Cascade map** — document FK and cascade behavior for `property_files`, `damage_reports`, `paint_codes`, `calendar_event_attachments` on property deletion, to size C6's `secure-delete-property` orchestration.

4. **`PropertyAllAssets.tsx:146` voice-note leak** — confirm whether Secure Vault voice notes can surface in the property profile view, and the exact query path.

5. **`PropertyForm.tsx` stub** — confirm current state and any unreachable branches.

6. **Per-tool RLS classification** — list each Insights & Tools surface and classify its RLS model (owner-only vs workspace, anon exposure, service-role usage).

7. **`useAssetValues` query cost** — measure representative-account behavior of the three parallel `.select(...).eq('user_id', ...)` calls in `src/hooks/useAssetValues.ts` to size C5 (pagination, RPC).

8. **`video_folders` usage** — confirm whether anything subscribes Realtime to it and what the real ownership column is, so C4 uses a real predicate.

## Deliverable

`/mnt/documents/Phase_A_Audit_Findings.md` with one section per item above, each containing:

- the question,
- evidence (file paths + line numbers, table/policy/FK names, query plans where relevant),
- the answer,
- the downstream decision it unblocks in B/C/D.

## Out of scope for Phase A

- No file edits.
- No migrations.
- No edge function deploys.
- No RLS or grant changes.
- No vault/MFA changes, no Legacy Locker / Digital Access / Recovery Delegate changes, no AU permission changes.

## Locked specs carried into later phases (for reference only — not executed here)

- **Phase B** (post-A): `src/lib/calendarExport.ts` with CRLF, RFC 5545 escaping, 75-octet folding, UTC `DTSTAMP`, stable opaque UID `<eventId>@assetsafe.net`, exclusive multi-day all-day `DTEND = finalDay + 1`, no HTML, no account/billing/vault data, every provider URL param encoded, Yahoo falls back to `.ics`, no ORGANIZER unless a verified organizer email exists.
- **Phase C** (item-by-item, C5 finalized post-A): C1–C9 per v3; C4 Realtime filter uses real ownership column; C6 ships `secure-delete-property` orchestration + shared `secureDeleteFileById` + `REVOKE DELETE ON public.properties FROM authenticated`; FK flip to RESTRICT deferred.
- **Phase D** (gated): RESTRICT + transactional delete-and-enqueue; `get_my_calendar_connections()` returns no token bytes; Google `…/calendar.events` + `access_type=offline` + `prompt=consent`; Microsoft `offline_access`; revocation parity; canonical AES-GCM envelope (`ciphertext ‖ 16-byte auth tag` in one bytea per token + separate `_iv bytea`, AAD = `(user_id, provider, connection_id, token_kind)`, `encryption_version` + `encryption_key_version` always populated); hardened `enqueue_calendar_sync`; provider 404 = idempotent success + audit row (90-day retention); Realtime uses real ownership column; `calendar_sync_queue`, D-0 `timestamptz` migration, PKCE + bound state, save never blocks on provider; per-token co-presence + status-tied envelope + refresh-token preservation; pre-call status re-check + best-effort in-memory token zeroing; `connection_status NOT NULL` + allowed-status `CHECK` constraint; **status set is `pending` / `active` / `reauth_required` / `revoked` only — no `error`**; transient network / rate-limit / 5xx failures live on `calendar_sync_queue` job `status` / `retry_count` / `next_attempt_at` / `last_error_class` / `last_error_at`; connection stays `active` while a usable token envelope remains; workers may call providers only for `active` connections; `invalid_grant` → `reauth_required` (token envelopes cleared in the same UPDATE); `revoked` reserved for explicit disconnect or confirmed provider revocation; TOCTOU language honest — local `revoked`/`reauth_required` does not by itself invalidate the provider token, the pre-call re-check minimizes but cannot eliminate the database-to-provider race, provider rejection is a possible outcome not a guaranteed compensating control; token zeroization is best-effort defense-in-depth; any future status constraint / enum change / `NOT NULL` on `connection_status` must run a preflight `SELECT connection_status, count(*) ... GROUP BY 1`, include an explicit data-fix step for any out-of-set or NULL values, and document both before applying.

Once the user clicks "Implement plan", the agent will switch to build mode and execute Phase A only.
