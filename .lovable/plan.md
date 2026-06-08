# AU Invite Hardening — Phase 3+ Status

## Shipped in this phase

### Phase 3 — Rate limits (foundation)
Shared helper `supabase/functions/_shared/au-rate-limit.ts` wraps the existing
`rate-limit-check` edge function and fail-open on infrastructure failure.
Returns user-safe messages ("Too many requests, try again in about N minutes.").

Wired into:
- `send-invite` — 10 / hour per (owner, account)
- `accept-invite` — 10 / hour per user, 20 / hour per IP
- `resend-invite` — 5 / hour per invite, 20 / hour per account
- `cancel-invite` / `update-authorized-user-role` / `revoke-authorized-user` — 30 / hour per account

### Phase 4 — Owner-action edge functions
All client writes to `invites` / `account_memberships` removed.

- `resend-invite` — owner-only; re-mints token hash, re-sends email, updates `resend_count` / `last_sent_at`.
- `cancel-invite` — owner-only; marks `status='canceled'` + `canceled_at`. Idempotent.
- `update-authorized-user-role` — owner-only; updates role + `role_changed_at`; cannot target owner row.
- `revoke-authorized-user` — owner-only; sets `status='revoked'` + `revoked_at`; calls `clear_last_used_account_if_revoked`; sends AU notice.

Shared email helper `supabase/functions/_shared/au-invite-email.ts` consolidates Resend usage and exposes `GENERIC_DELIVERY_ERROR` (`"Email could not be sent. Please try Resend."`) so no raw provider error reaches the UI.

### Phase 5 — Revocation cleanup
Migration added:
- `invites.canceled_at`
- `account_memberships.revoked_at`, `account_memberships.role_changed_at`
- `clear_last_used_account_if_revoked(_user_id, _account_id)` SECURITY DEFINER, service_role-only, swaps `profiles.last_used_account_id` back to the user's own account when their access is revoked.

`AccountContext` already filters `status='active'` and subscribes to realtime — verified, no change needed.

### Phase 6 — Notifications
- `sendInviteAcceptedOwnerEmail` — invoked post-commit from `accept-invite`.
- `sendAccessChangedEmail` — invoked from `revoke-authorized-user` and `update-authorized-user-role`.
- All failures swallowed and logged; never block the action.

### Phase 7 — Export / bulk download UI gating
`DownloadAllFilesButton` and `ExportAssetsButton` early-return `null` when
`useAccount().isOwner === false`. **Documented**: UI hiding is usability, not enforcement; the underlying composition still runs client-side. No server bulk-export endpoint exists today to harden. Follow-up: per-file download rate limiting / watermarking for read-only AUs.

### Frontend — `AuthorizedUsersTab.tsx`
- All mutations go through `supabase.functions.invoke('...')`; no `.from(...)` writes remain.
- New `handleResendInvite` with explicit Resend button per pending invite.
- All error toasts and inline messages are generic; raw errors stay in `console.error` / `last_delivery_error` / edge logs.

---

## Not yet shipped — Phase 8 (RLS lockdown)
Hold until we have explicit confirmation that no other code paths write to `invites` or `account_memberships` directly. Pre-flight:
- `rg "\.from\('invites'\)" src` should only show selects.
- `rg "\.from\('account_memberships'\)" src` should only show selects.

Then migration: drop INSERT/UPDATE/DELETE policies for `authenticated` on both tables, keep SELECT policies, writes via `service_role` only.

Approve to run the Phase 8 lockdown when ready.
