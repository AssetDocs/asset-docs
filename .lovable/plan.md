# Close the Legacy Admin recovery read path and harden revoked grants

Two narrow gaps remain from the mirror-integrity pass. Both are backend-only. Nothing about Authorized User permissions, eligibility rules, the approval workflow, or the vault cryptography changes.

## Confirmed current state (verified this turn)

- `legacy_locker` has exactly four SELECT/write policies: owner (`auth.uid() = user_id`) and an app-admin read gated on `allow_admin_access`. There is **no** path for an approved Legacy Admin to read the owner's row, so `DelegateVault.tsx` fails at its final read.
- `vault_delegate_grants` delegate read policy is `Delegate reads own grants` → `auth.uid() = delegate_user_id`, with no status condition.
- `vault_delegate_grants.wrapped_vault_key` is `text NOT NULL`, so today it is impossible to null out key material on revoke.
- There is **no expiry column** on `vault_delegate_grants` (columns: id, legacy_locker_id, owner_user_id, delegate_user_id, wrapped_vault_key, delegate_key_version, recovery_request_id, status, issued_at, revoked_at, timestamps). Grace-period timing lives on `recovery_requests.grace_period_ends_at`, which governs the approval flow, not grant validity. So no expiry term goes in the policies.
- Grants are inserted only by the `issue-delegate-vault-grant` edge function (service role); there is no client INSERT policy. That stays as-is.
- The single grant-revocation path in the database is `revoke_legacy_admin_recovery_artifacts(owner, admin)`, called by `assign_legacy_admin` (reassignment), `clear_legacy_admin`, and the `enforce_legacy_admin_eligibility` trigger on `account_memberships` (covers downgrade, revocation, removal). No edge function touches the grants table. Centralizing key destruction in that one helper covers every path.
- Existing data: `vault_delegate_grants` has 0 rows, so the one-time cleanup of revoked-rows-with-keys is expected to touch 0 rows. It will still be run and reported.

## Join keys for the new policy

```text
vault_delegate_grants.legacy_locker_id -> legacy_locker.id
vault_delegate_grants.owner_user_id    -> legacy_locker.user_id
legacy_locker.user_id                  -> accounts.owner_user_id
accounts.id                            -> legacy_admins.account_id
legacy_admins.legacy_admin_user_id     -> auth.uid()  (status = 'active')
legacy_locker.delegate_user_id         -> auth.uid()  (system-maintained mirror)
```

## Migration

1. New SELECT policy `Legacy admin reads owner locker during active recovery` on `legacy_locker`, for role `authenticated`, requiring **all** of: mirror match (`delegate_user_id = auth.uid()`), an active `legacy_admins` row for `auth.uid()` on the account owning that locker, and an active `vault_delegate_grants` row whose `legacy_locker_id` is that locker, `owner_user_id` is the locker owner, and `delegate_user_id = auth.uid()`. Owner and app-admin policies are untouched. Because the predicate is re-evaluated per query, clearing/reassigning Legacy Admin, downgrading or revoking the AU, or revoking the grant each cut the read off immediately.
2. `ALTER TABLE public.vault_delegate_grants ALTER COLUMN wrapped_vault_key DROP NOT NULL` so key material can be destroyed while the audit row survives.
3. Replace `Delegate reads own grants` with a status-scoped version: `auth.uid() = delegate_user_id AND status = 'active'`. Owner read, owner update, and audit paths are unchanged; no rows are deleted.
4. Update `revoke_legacy_admin_recovery_artifacts` to also set `wrapped_vault_key = NULL` alongside `status = 'revoked'`, `revoked_at = now()`. Keeps id, owner/delegate ids, status, `delegate_key_version`, `recovery_request_id`, and all timestamps intact. This is the shared helper the three callers already use, so no logic is duplicated.
5. One-time cleanup: null `wrapped_vault_key` on any row already `status = 'revoked'` with a non-null key. Active grants untouched.

## Verification (database/authorization level, in a self-rolling-back harness)

Negative set — each must return zero rows for the owner's locker: Full Access AU who is not Legacy Admin; Read Only AU; active Legacy Admin with no grant; former Legacy Admin; Legacy Admin with a revoked grant; mirror mismatch; Legacy Admin of a different account; arbitrary authenticated user.

Positive set: before a grant is issued the Legacy Admin sees nothing; after an active grant exists the Legacy Admin can read exactly that one locker row and their own grant row; after revocation the locker read and the grant read both return nothing and `wrapped_vault_key` is NULL while the row remains.

Reassignment A→B: A's designation removed, A's requests revoked, A's grant revoked with key nulled, A loses both reads, mirror points to B, and B has no locker access until a fresh request/approval/grant completes.

All harness writes are rolled back, exactly as in the previous pass.

## Manual browser test to hand back

Lovable cannot mint owner and Legacy Admin sessions for this project (external/unmanaged Supabase), so the end-to-end UI run stays manual. The plan's report will hand back the ordered step list: owner signs in and confirms the designation, creates/unlocks the vault, Legacy Admin signs in and confirms ordinary vault access is denied, initiates recovery, owner approves, acknowledgment/grace steps complete, owner unlocks once more so the grant is issued, Legacy Admin opens the delegated vault, then the owner revokes/clears and the Legacy Admin confirms access is gone. No browser E2E success will be claimed unless actually executed.

## Out of scope

AU permissions and roles, `account_memberships`, invitations, dormant contributors infrastructure, Continuity Export, memorialization, closure, vault encryption format, passphrase derivation, recovery keypair crypto, and Legacy Admin eligibility rules.
