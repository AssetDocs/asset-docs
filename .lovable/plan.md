# Change Log for External Review (Legacy Admin / Contributors Retirement)

Scope covered: Stage 1, Stage 2A, Stage 2B, and the Legacy Admin mirror repair + recovery hardening pass. Stage 3 (invite pipeline retirement) and Stage 4 (dropping the `contributors` table) were explicitly NOT started.

---

## 1. Backend — Database Functions

| Function | Change |
| --- | --- |
| `compute_user_verification` | Rewritten. `has_contributors` no longer reads `contributors`; it now counts active non-owner rows in `account_memberships` (`full_access` or `read_only`). Fixes the Security Progress row that never lit up. |
| `validate_legacy_locker_delegate` | Rewritten. Previously rejected any non-NULL `delegate_user_id` on INSERT, which silently blocked the seed trigger. Now permits an INSERT value that matches the account's active Legacy Admin. |
| `assign_legacy_admin` | Hardened. Writes the `legacy_locker.delegate_user_id` mirror when a locker exists; logs `mirror_pending: true` when no locker exists yet. Reassignment revokes the prior admin's artifacts atomically in the same call. |
| `revoke_legacy_admin_recovery_artifacts` | Now also sets `wrapped_vault_key = NULL` in addition to `status='revoked'` and `revoked_at=now()`. This is the single choke point shared by reassignment, `clear_legacy_admin`, and the membership-eligibility trigger. |
| `clear_legacy_admin` | Verified to route through the shared revoke helper (nulls mirror + destroys key material). |
| `enforce_legacy_admin_eligibility` (trigger on `account_memberships`) | Verified: AU downgrade, revocation, or removal clears the Legacy Admin designation and triggers artifact revocation. |

## 2. Backend — Schema

- `vault_delegate_grants.wrapped_vault_key`: `NOT NULL` constraint dropped so revoked rows can have key material destroyed while the audit row survives.
- No tables created, renamed, or dropped. `contributors` still exists (Stage 4 out of scope).
- `account_memberships` rows, roles, statuses, and invite-acceptance data untouched throughout.

## 3. Backend — RLS Policy Changes

Removed (Stage 1) — six SELECT policies named `Administrator contributors can view ...` on `legacy_locker` and related vault tables. Zero remain.

Added — `legacy_locker`, `Legacy admin reads owner locker during active recovery`, role `authenticated`, requiring ALL of:
1. `delegate_user_id = auth.uid()` (mirror match)
2. `user_id <> auth.uid()` (not self)
3. an `active` `legacy_admins` row for `auth.uid()` on the account owning that locker
4. an `active` `vault_delegate_grants` row matching locker id + owner + delegate with non-NULL `wrapped_vault_key`

Tightened — `vault_delegate_grants`, `Delegate reads own active grants`: now `auth.uid() = delegate_user_id AND status = 'active'`.

Unchanged by design — owner self-access policies (`auth.uid() = user_id`), the pre-existing app-admin `allow_admin_access` policy, `vault_delegate_keypairs` self-only policies, `recovery_requests` approval policies. `vault_delegate_grants` still has no client INSERT policy (service-role only).

Current live policy set on the vault/continuity tables was re-read and confirmed after all changes.

## 4. Backend — Edge Functions

- Account deletion edges: contributor-initiated deletion retired; third-party deletion attempts now return **403**. Deletion is owner-only.
- `check-subscription`: entitlement inheritance repointed from `contributors` to active `account_memberships`.
- Account closure notification path repointed to `account_memberships`.

## 5. Frontend Changes

| File | Change |
| --- | --- |
| `src/pages/SecureVault.tsx` | Removed `fetchContributorsList` and all admin-contributor branches; removed dead contributor state. Vault access is owner-only or Legacy Admin recovery. Vault queries confirmed self-scoped (`.eq('user_id', user.id)`). |
| `src/pages/LegacyLocker.tsx` | Same contributor branch removal. |
| `src/components/admin/AdminUsers.tsx` | Contributors fetch + legacy merge removed. Owner/AU relationships now built from `accounts` + `account_memberships` + `profiles`, including inactive/revoked rows for historical visibility. Role labels standardized to "Full Access" / "Read Only" (no more administrator/contributor/viewer). |
| `ManageTab.tsx` | Contributor-based deletion entry point removed. |
| `ExportService`, `ProtectionScore` | Repointed to `account_memberships`. |
| `src/components/AccountHeader.tsx` | Deleted (dead file). |

## 6. Role Mapping Decisions Applied

| Old contributor check | New mapping |
| --- | --- |
| `role === 'administrator'` → initiate account deletion | **Nobody** (owner-only) |
| `role === 'administrator'` → view owner's Secure Vault | **Legacy Admin only**, and only during an approved active recovery |
| contributor exists → subscription inheritance | Active `account_memberships` (either role) |
| contributor count → verification / Security Progress | Active non-owner `account_memberships` |
| contributor role labels in Admin CRM | Full Access / Read Only |

Explicitly rejected: any blanket `administrator → full_access` conversion. Full Access AU gained no Secure Vault access as a side effect.

## 7. Verification Already Performed

- `account_memberships`: 17 rows / 16 active preserved; 1 active `legacy_admins` row preserved; 0 grants, 0 recovery requests, 1 locker row (clean post-rollback state).
- Positive recovery: active Legacy Admin + mirror match + active grant reads exactly 1 locker row (the owner's).
- Cross-locker isolation: grant for Locker 1 gives 0 rows on Locker 2 for the same Legacy Admin.
- Reassignment A→B: A's request and grant revoked, key nulled, mirror repointed to B, B has 0 active grants until a fresh cycle.
- Negatives all returned 0 rows: Full Access AU, Read Only AU, LA without grant, mirror mismatch, revoked grant, former LA, new LA pre-grant, arbitrary non-admin user.
- Mirror invariants: `mismatch_active = 0`, `stale_pointer_no_admin = 0`.
- One expected non-zero: an app-admin identity can read a locker via the pre-existing `allow_admin_access` policy — unchanged, not introduced here.

## 8. Known Open Items for Codex to Confirm

1. **Stage 3 not started** — the parallel contributor invite pipeline and its edge functions still exist and are still deployed.
2. **Stage 4 not started** — the `contributors` table, its four RLS policies, and the `contributor_role` enum (`administrator`, `contributor`, `viewer`) still exist. Table has 0 rows.
3. **Grant expiry** — the recovery SELECT policy has no time bound because `vault_delegate_grants` has no expiry column; grace-period timing lives on `recovery_requests.grace_period_ends_at` and gates approval only. Worth deciding whether grants should expire independently.
4. **Manual browser E2E not executed** — external/unmanaged Supabase means sessions can't be minted in the sandbox. The owner → confirm LA → create vault → LA requests → owner approves → owner unlocks (issues grant) → LA opens `/delegate-vault` → owner revokes sequence still needs a human run.
5. Pre-existing project-wide linter warnings (GraphQL exposure, SECURITY DEFINER functions) are unrelated to this work.
