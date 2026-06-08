# AU Invite Hardening — Phase 1 + 2 (Approved)

Scope: invite creation + acceptance only. Phases 3–9 follow in a later pass.

---

## Phase 1 — Schema & Atomic Acceptance

### 1.1 Migration

**`invites`**
- `expires_at` — ensure default `now() + interval '7 days'`.
- Add `delivery_status text not null default 'not_sent'` with CHECK in `('not_sent','sent','failed')`.
- Add `delivered_at timestamptz`, `last_delivery_error text`, `last_sent_at timestamptz`, `resend_count int not null default 0`.
- Add `accepted_at timestamptz` if the column does not already exist. `accept_invite_atomic` sets it to `now()` on success. Memberships keep their own `accepted_at` as well — both are written in the same transaction.
- Standardize invite statuses to `pending | accepted | expired | canceled`. Backfill any legacy `revoked` invite rows → `canceled` (read_query first to confirm count).
- Unique partial index: one `pending` invite per `(account_id, lower(email))`.

**`account_memberships`**
- Statuses stay `active | revoked`.
- Ensure unique constraint `(account_id, user_id)`.

### 1.2 SECURITY DEFINER functions

- `can_send_au_invite(_account_id uuid) returns boolean` — blocks `deleted`, `scheduled_for_deletion`, `inactive`, `expired_read_only`, and any other unavailable `account_status`; also requires the owner still holds the `trusted_contacts` entitlement.

- `can_accept_au_invite(_account_id uuid) returns boolean` — explicitly blocks `deleted`, `scheduled_for_deletion`, `inactive`, `expired_read_only`, and any future status flagged unavailable. Does **not** re-check `trusted_contacts` (entitlement loss blocks new sends/resends but does not retroactively void a pending invite as long as the account itself is writable).

- `accept_invite_atomic(_token_hash text, _user_id uuid, _user_email text) returns jsonb`
  - **Does not read `auth.users`.** The edge function authenticates the JWT via Supabase Auth, then passes `user.id` and `user.email` (both derived from the verified session, never from the client body) into the RPC.
  - Single transaction:
    1. `SELECT ... FROM invites WHERE token_hash = _token_hash FOR UPDATE`.
    2. Verify `status = 'pending'` and `expires_at > now()`. If expired, set `status = 'expired'` and raise.
    3. `can_accept_au_invite(invite.account_id)` must be true.
    4. `lower(_user_email) = lower(invite.email)` or raise.
    5. `INSERT INTO account_memberships(...) VALUES (..., _user_id, ...) ON CONFLICT (account_id, user_id) DO UPDATE` → reactivate revoked rows, set `role = invite.role`, `status = 'active'`, `accepted_at = now()`, `email = invite.email`.
    6. `UPDATE invites SET status = 'accepted', accepted_at = now()`.
    7. `UPDATE profiles SET last_used_account_id = invite.account_id WHERE user_id = _user_id`. **Nothing else** — `password_set` and `onboarding_complete` stay under the auth/password-setup flow.
    8. `INSERT INTO user_activity_logs (...)` (`invite_accepted`).
  - Any exception rolls back the entire transaction.

### 1.3 `accept-invite` edge function rewrite
- Verify JWT → derive `user.id`, `user.email` from Supabase Auth.
- Hash the raw token → call `accept_invite_atomic(tokenHash, user.id, user.email)`.
- Post-commit, non-fatal: admin email-confirm if needed; owner "invite accepted" email deferred to Phase 7.
- Map RPC error codes to user-safe HTTP responses (expired / mismatch / blocked-account / already-used).

---

## Phase 2 — `send-invite` Rewrite + Frontend Wiring

### 2.1 `send-invite`
Body: `{ accountId: uuid, email: string, role: 'read_only' | 'full_access' }`.
- Auth required; verify `is_account_owner(auth.uid(), accountId)` (no `.single()` on `owner_user_id`).
- `can_send_au_invite(accountId)` must be true.
- Zod-validate role and email; lowercase email before insert/lookup.
- Duplicate `pending` invite blocked by the unique partial index → return clear "Already pending — use Resend".
- Insert invite with `delivery_status = 'not_sent'`, then send via Resend.
  - Success → update `delivery_status = 'sent'`, `delivered_at = now()`, `last_sent_at = now()` → return `{ success: true, inviteCreated: true, delivery_status: 'sent' }`.
  - Failure → update `delivery_status = 'failed'`, `last_delivery_error = <message>`, **keep the invite row intact**, return HTTP 200 with `{ success: true, inviteCreated: true, delivery_status: 'failed', error: <user-safe> }`.

### 2.2 `AuthorizedUsersTab.tsx`
- Pass `accountId` from `useAccount()` into `send-invite`.
- Render status badges from `(invites.status, invites.delivery_status)`:
  - `pending + sent` → "Pending"
  - `pending + failed` → "Email failed — Resend" (CTA visible)
  - `pending + not_sent` → "Sending…"
  - `accepted` / `expired` / `canceled` / membership `revoked` → respective badges.
- Surface the delivery-failure message inline on the new-invite form.
- No changes to role-change / revoke / cancel paths in this phase — those move to dedicated edge functions in Phase 4.

---

## Execution Notes
- Phase 1 migration ships first (read_query for legacy `revoked` invites before backfill).
- Phase 1.3 + Phase 2 ship together once types regenerate.
- After this pair lands, pause for review before Phase 3+ (rate limits, owner-action edge functions, export server-side checks, RLS lockdown, notifications, UX polish, tests).

Approve to begin build.
