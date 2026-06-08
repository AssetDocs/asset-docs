# AU Invite Hardening — Phase 3+ Build Plan

Scope: rate limits, owner-action edge functions, revocation cleanup, export owner checks, notifications, RLS lockdown. Phase 1+2 already shipped.

---

## Phase 3 — Rate Limits (foundation)

Reuse existing `rate_limits` table + `rate-limit-check` edge function (already in repo, IP/user-based, 15-min window).

Apply in this order so subsequent endpoints inherit it:

- `send-invite` — 10 invites / hour per `(account_id, owner user_id)`.
- `resend-invite` — 5 resends / hour per `invite_id`; 20 / hour per `account_id`.
- `accept-invite` — 10 attempts / hour per IP and per `user_id` (mitigates token guessing on top of hash).
- `cancel-invite` / `update-authorized-user-role` / `revoke-authorized-user` — 30 / hour per `account_id` (loose, just to block runaway scripts).

Each function calls `rate-limit-check` first; on 429 it returns a user-safe "Too many requests, try again in N minutes." Detailed reasons stay in logs.

---

## Phase 4 — Owner-Action Edge Functions

All write paths to `invites` and `account_memberships` move server-side. Frontend (`AuthorizedUsersTab.tsx`) switches to `supabase.functions.invoke(...)`.

### 4.1 `resend-invite`
Body: `{ inviteId }`. Verifies JWT → `is_account_owner(uid, invite.account_id)` → `can_send_au_invite(account_id)` → rate limit. Only valid for `status='pending'`. Bumps `resend_count`, `last_sent_at`. Resends via Resend; on failure sets `delivery_status='failed'`, keeps row, returns 200 with safe message.

### 4.2 `cancel-invite`
Body: `{ inviteId }`. Owner-only. Sets `invites.status='canceled'`, `canceled_at=now()`. Logs to `user_activity_logs`. Idempotent (no-op if not pending).

### 4.3 `update-authorized-user-role`
Body: `{ membershipId, role: 'read_only' | 'full_access' }`. Owner-only. Cannot target the owner row. Updates `account_memberships.role`. Logs activity. RLS sees new role immediately.

### 4.4 `revoke-authorized-user`
Body: `{ membershipId }`. Owner-only. Sets `status='revoked'`, `revoked_at=now()`. Calls `force-signout` for that user (best-effort, non-fatal) so AccountContext re-resolves. Triggers AU revoked notification (Phase 6).

### 4.5 Frontend wiring
`AuthorizedUsersTab.tsx`:
- Replace direct `.from('invites')` / `.from('account_memberships')` writes with `functions.invoke('resend-invite' | 'cancel-invite' | 'update-authorized-user-role' | 'revoke-authorized-user')`.
- Sanitize delivery-failure messaging — UI shows only `"Email could not be sent. Please try Resend."` regardless of underlying provider error. Raw error stays in `last_delivery_error` and edge logs only.
- Same scrub applied to invite-creation failure path in `handleInvite`.

---

## Phase 5 — Revocation Cleanup

In `revoke-authorized-user` and inside the `update-authorized-user-role` path (when downgrading), add a SECURITY DEFINER helper `clear_last_used_account_if_revoked(_user_id, _account_id)`:
- If `profiles.last_used_account_id = _account_id` AND user has no other active membership for that account → set `last_used_account_id = (their own account_id)`.
- Insert `user_activity_logs` row: `account_access_changed` with `{ account_id, action: 'revoked' | 'role_changed', new_role? }`.

Frontend:
- `AccountContext` already filters to `active` memberships — verify and add explicit `.eq('status','active')` if missing.
- Subscribe to `account_memberships` realtime for the current user; on revoke event, force a context refresh and route to the user's own account.

---

## Phase 6 — Notifications

Two new transactional emails via Resend (`@assetsafe.net` sender, per project rule):

- `notify-owner-invite-accepted` — fired post-commit from `accept-invite`. To: account owner. Body names the new AU + role.
- `notify-au-access-changed` — fired from `revoke-authorized-user` and `update-authorized-user-role`. To: affected AU. Body explains revoke or role change. Plain-text fallback included.

Respect `notification_preferences` master email toggle. Failures are logged, never block the action.

---

## Phase 7 — Export / Bulk Download Server Checks

Audit + harden:
- `ExportService.exportCompleteAssetSummary` and `downloadAssetsZip` are client-side compositions; document that AUs may still read individual files via RLS. UI hides the buttons for non-owners.
- Any server endpoint that performs bulk export (search for `export` / `download-all` in `supabase/functions/`) gets an `is_account_owner(uid, account_id)` check up front. If none exist server-side today, note that and skip — no new endpoint introduced this phase.
- Follow-up TODO logged: evaluate per-file download rate limiting / watermarking for read-only AUs.

---

## Phase 8 — RLS Lockdown (last)

Only after Phase 4 ships and the frontend no longer writes to these tables directly:

- `invites`: drop any `INSERT/UPDATE/DELETE` policies granted to `authenticated`. Keep `SELECT` policies (owner sees account's invites; invitee sees their own by `lower(email)`). Writes via `service_role` only (edge functions).
- `account_memberships`: same — keep `SELECT` for members of the account; writes via `service_role` only.

Pre-flight `read_query` to list current policies and any remaining client writes via `rg` before dropping.

---

## Technical Notes

- All new edge functions: zod input validation, CORS headers from `npm:@supabase/supabase-js@2/cors`, `getClaims()` JWT verification, owner check via existing `is_account_owner` RPC, rate-limit call before mutation.
- All user-facing error strings are generic; raw provider/PG errors only in `console.error` and `last_delivery_error`.
- Migration in Phase 5 only (`clear_last_used_account_if_revoked` helper + any missing `canceled_at` / `revoked_at` columns on `invites` / `account_memberships`); pre-check with `read_query` first.
- Migration in Phase 8 for RLS policy changes.

---

## Execution Order

1. Phase 3 (rate-limit wiring, no new endpoints yet — wired into existing `send-invite` + `accept-invite`).
2. Phase 4 + Phase 5 together (new endpoints + revocation cleanup + frontend rewire + UI error sanitization).
3. Phase 6 (notifications).
4. Phase 7 (export audit).
5. Phase 8 (RLS lockdown migration) — last, after confirming no client writes remain via `rg`.

Approve to begin Phase 3.
