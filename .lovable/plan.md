# Legacy Admin ↔ delegate_user_id Mirror Integrity

## Root cause (verified before any change)

Live state, single active Legacy Admin account `35f0a6a4…`:

- owner `2e62a796…`, Legacy Admin `4df74d1f…`, assigned `2026-05-24 16:09`
- `legacy_locker` row for that owner: **does not exist at all** (no row, not a NULL column on an existing row)

So the mismatch is not stale data and not a pre-RPC assignment. `assign_legacy_admin` does write the mirror
(`UPDATE public.legacy_locker SET delegate_user_id = _user_id WHERE user_id = v_owner`), but that owner has never
created a Secure Vault / Legacy Locker row, so the update matched zero rows and silently no-opped.

Enforcement that already exists and was confirmed:

| Guarantee | Status |
|---|---|
| assign sets mirror (when locker row exists) | present in `assign_legacy_admin` |
| clear nulls mirror | present in `clear_legacy_admin` |
| reassign revokes prior grants/requests before new admin activates | present via `revoke_legacy_admin_recovery_artifacts` |
| AU downgrade/revoke clears designation + mirror + artifacts | present in `enforce_legacy_admin_eligibility` trigger |
| locker row created later seeds current Legacy Admin | present: `BEFORE INSERT trg_seed_legacy_locker_legacy_admin` |
| direct client writes to `delegate_user_id` blocked | present: `trg_validate_legacy_locker_delegate` (trusted only via `app.legacy_admin_sync` or service role) |
| mismatch fails closed | present: `submit-recovery-request` requires active `legacy_admins` row **and** `delegate_user_id = caller` |

## Defect found in the seeding path (the one real fix)

Triggers fire in name order: `trg_seed_…` runs before `trg_validate_…`.
The seed trigger sets `NEW.delegate_user_id` from the active Legacy Admin, then the validate trigger sees
`TG_OP = 'INSERT'` with a non-NULL `delegate_user_id` and no trust flag and raises
`Secure Vault recovery participant is system-maintained`.

Consequence: for exactly this account's situation — active Legacy Admin, no locker row yet — the owner's first
client-side Secure Vault creation **fails hard**, and the mirror can never be seeded. This is the reason the gap is
not self-healing.

Smallest fix: make the validate trigger treat a value that equals the account's current active Legacy Admin as
system-maintained (allowed) on INSERT, and on UPDATE keep rejecting any client-driven change. No relaxation of the
general rule: arbitrary client values, self-assignment, and client-driven UPDATEs still fail closed.

## Work in this pass

1. **Migration** (schema/function only):
   - Rewrite `validate_legacy_locker_delegate` so an untrusted INSERT is allowed only when
     `NEW.delegate_user_id` equals the active `legacy_admins.legacy_admin_user_id` for the owner's account
     (and still `<> user_id`); any other untrusted value or any untrusted UPDATE change still raises `42501`.
   - Harden `assign_legacy_admin`: after the mirror UPDATE, if no locker row exists, record that in the activity
     log details (`mirror_pending: true`) so the deferred-seed case is visible instead of silent.
2. **Repair pass** (data): reconcile every account with exactly one active `legacy_admins` row whose existing
   locker row has NULL or divergent `delegate_user_id`, using `legacy_admins` as sole source of truth, and NULL any
   `delegate_user_id` on lockers whose account has no active Legacy Admin. Given current data this repairs **0
   rows** — the only affected account has no locker row, which the fixed seed path now covers on creation. The
   repair statement is still run so the invariant is asserted, and the result reported.
3. **Verification queries**: for every account, active Legacy Admin vs `delegate_user_id` equality; no stale
   pointer without an active designation; no `delegate_user_id = user_id`.
4. **Reassignment test** (A → B) executed at the database layer against a scratch owner/AU pair, not the live
   account: confirm A's open `recovery_requests` become `revoked`, A's `vault_delegate_grants` become `revoked`,
   mirror flips to B, `legacy_locker.recovery_status` resets, and A's stale grant stays unusable.
5. **Recovery-path and negative tests**: exercise the authorization predicates that `submit-recovery-request` and
   the delegate-vault RLS use, for each case — Read Only AU, Full Access AU who is not Legacy Admin, revoked
   former Legacy Admin, mismatched mirror, stale grant from a previous Legacy Admin, expired request, direct client
   `delegate_user_id` write, owner self-designation, Legacy Admin of a different account. Each must fail closed.
6. **Report**: root cause, rows repaired, enforcement added, assign/clear/reassign/downgrade behavior,
   recovery-path results, negative-test results, and remaining gaps.

## Testing limitation to state up front

This project uses an external, unmanaged Supabase instance, so no browser session can be minted for an AU — a
click-through end-to-end recovery run in the preview is not available. The recovery flow will therefore be validated
at the authorization layer (the exact predicates the edge function and RLS evaluate, plus the wrap/grant row
transitions) with each state transition documented, and any step that can only be confirmed by a human clicking as
the Legacy Admin will be listed explicitly as owner-verified rather than claimed as passed.

## Out of scope

Authorized User permissions, Secure Vault encryption and passphrase behavior, continuity export, memorialization,
closure, and the dormant contributors infrastructure. No change to the active Legacy Admin row or AU roles.
