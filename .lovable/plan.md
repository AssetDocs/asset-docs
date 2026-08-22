# Merge Recovery Delegate Into Legacy Admin

## Audit findings (verified before planning)

**How Recovery Delegate exists today**

- Frontend: `src/components/RecoveryDelegateSelector.tsx` (card + selector + grace period), rendered from `src/components/SecureVault.tsx` (line ~826) and `src/components/LegacyLocker.tsx` (line ~927). The selector lists people from the **contributors** table with `role = 'administrator'` — a different system from Authorized Users (`account_memberships`, roles `owner / full_access / read_only`), so today's delegate can be someone who is not a Full Access AU.
- Supporting UI: `src/pages/DelegateVault.tsx`, `src/pages/AcknowledgeAccess.tsx`, `src/components/RecoveryRequestAlert.tsx`, delegate milestone rows in `src/components/SecurityProgress.tsx` / `src/hooks/useVerification.ts`, plus copy in `FAQAccordion.tsx`, `OnboardingProgress.tsx`, `SampleDashboard.tsx`, admin flowcharts.
- Database: `legacy_locker.delegate_user_id`, `legacy_locker.encryption_key_encrypted_for_delegate`, `recovery_requests.delegate_user_id`, `vault_delegate_grants` (`wrapped_vault_key`, `delegate_key_version`), `vault_delegate_keypairs` (per-user public keys), `account_verification.has_recovery_delegate`.
- Functions/triggers: `validate_legacy_locker_delegate` (self-delegate guard), `can_access_vault_path`, `get_vault_delegate_public_key`, `recovery_requests_update_guard`, `compute_user_verification` (milestone #10), `create_continuity_snapshot`, `consume_continuity_export_authorization`, `execute_temporary_stewardship`.
- Edge functions: `submit-recovery-request`, `respond-recovery-request`, `acknowledge-delegate-access`, `check-grace-period-expiry`, `issue-delegate-vault-grant`, `send-recovery-request-email`, `send-recovery-approved-email`, `send-recovery-rejected-email`, `send-delegate-access-email`, plus cleanup paths in `delete-account`.
- Client crypto: `src/lib/delegateKeypair.ts`, `src/lib/delegateGrants.ts`, `src/utils/recoveryEncryption.ts`.

**Security-critical dependency (important)**

Recovery Delegate **does** carry cryptographic material: the vault key is wrapped to the delegate's public key (`vault_delegate_keypairs`) and stored in `vault_delegate_grants.wrapped_vault_key`, plus a legacy `encryption_key_encrypted_for_delegate` field. All of it is keyed by a plain **user id**, and grants are only issued after an owner-approved + acknowledged `recovery_requests` row. So the identity can be swapped to the Legacy Admin's user id without touching any crypto. Nothing will be deleted that holds wrapped keys — the wrapping/unwrapping mechanism, grace period, approval guard, MFA and passphrase controls all stay exactly as they are.

**Legacy Admin today**

`legacy_admins` (account-scoped) supports primary/secondary designations and any non-owner member; `continuity_secondary_legacy_admins` also exists. Assignment happens client-side from `LegacyAdminAssignment.tsx` (inside Authorized Users tab) with no backend eligibility check.

## What will change

**One designation, one source of truth.** `legacy_admins` becomes the single record of the continuity contact. `legacy_locker.delegate_user_id` stops being an owner-editable field and becomes a system-maintained mirror of the active Legacy Admin, so every existing Secure Vault recovery path (requests, grants, wrapped keys, acknowledgment) keeps working unchanged — it simply now points at the Legacy Admin.

**Backend enforcement (migration)**

1. Assignment RPC `assign_legacy_admin(_account_id, _user_id)` — security definer, owner-only. Rejects unless the target has an `account_memberships` row for that account with `role = 'full_access'`, `status = 'active'`, `accepted_at` set, `revoked_at` null. Rejects self-assignment. Deactivates any existing active row, inserts the new one, mirrors `legacy_locker.delegate_user_id`, writes an activity/audit event.
2. `clear_legacy_admin(_account_id)` — owner-only; deactivates the row, nulls the mirror, revokes any active `vault_delegate_grants` and open `recovery_requests` for the former designee.
3. Partial unique index enforcing at most one `status = 'active'` row per `account_id`; drop `designation_role` / `designation_priority` usage and retire `continuity_secondary_legacy_admins`.
4. Trigger on `account_memberships` (update + delete): if the affected user is the active Legacy Admin and the change makes them ineligible (role → `read_only`, status not active, revoked, removed), clear the designation atomically, null the mirror, revoke grants/open requests, and log `legacy_admin_removed_due_to_au_ineligibility`.
5. Replace `validate_legacy_locker_delegate` with a guard that blocks direct client writes to `delegate_user_id` (only definer functions may set it); keep the self-delegate check.
6. `compute_user_verification` milestone #10 reads "has an active Legacy Admin" from `legacy_admins` instead of `delegate_user_id`; rename the flag surfaced to the app to `has_legacy_admin` and keep the same milestone count.
7. Drop the now-unused `legacy_locker.encryption_key_encrypted_for_delegate` only after confirming it holds no rows; otherwise leave it untouched and report it.

**Frontend**

- Delete `RecoveryDelegateSelector.tsx` and its usage in `SecureVault.tsx` and `LegacyLocker.tsx`. Remove the delegate save handlers, grace-period selector, and related state from those two components (delegate-side recovery panels in Secure Vault stay — that's the recovery participant experience, not a configuration surface).
- Secure Vault shows a compact read-only line: `Legacy Admin: [Name] — may participate in Secure Vault recovery but cannot access the vault without the recovery process.` with a link to the single management surface.
- Rewrite `LegacyAdminAssignment.tsx`: single designation, selector limited to active Full Access AUs (name + email), no primary/secondary, calls the new RPCs, new copy:
  "Choose one Full Access Authorized User to serve as your trusted continuity contact. Your Legacy Admin can participate in Secure Vault recovery when needed, but does not receive automatic access to your Secure Vault."
  Empty state: "Add a Full Access Authorized User before selecting a Legacy Admin."
- Authorized Users tab: when downgrading or revoking the current Legacy Admin, warn that the designation will be cleared.
- `AccountContinuityInstructions.tsx` (Legacy Instructions) keeps showing the selected Legacy Admin and links to the one management surface; drop "(secondary)" labels.
- Update `SecurityProgress.tsx` / `useVerification.ts` milestone to "Assign a Legacy Admin"; scrub delegate wording from `FAQAccordion.tsx`, `OnboardingProgress.tsx`, `SampleDashboard.tsx`, `RecoveryRequestAlert.tsx`, `DelegateVault.tsx`, `AcknowledgeAccess.tsx`, admin flowcharts, and admin continuity panels.

**Edge functions**

- `submit-recovery-request`: authorize the caller as the account's active Legacy Admin (still cross-checked against `legacy_locker.delegate_user_id`), not an arbitrary delegate.
- Email/notification copy in the recovery + legacy-admin functions switches to "Legacy Admin"; `send-legacy-admin-notification` stays as a post-assignment notification only (no membership invite).
- Everything else (approval, acknowledgment, grant issuance, grace-period cron) keeps its current logic and guards.

**Docs**

Update `AssetSafe_Continuity_Legacy_Operations.md`, `AssetSafe_Support_Ops_Runbook.md`, `AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`, `AssetSafe_Mobile_Capacitor_Ops_Runbook.md`, `AssetSafe_Support_Launch_Decision_Memo.md` to the three-role model, with a retired note: "Recovery Delegate — retired 2026-08-22; capability consolidated into Legacy Admin."

## Sequence (backend first)

1. **Migration first**: `assign_legacy_admin` / `clear_legacy_admin` RPCs, one-active-per-account unique index, AU ineligibility trigger, mirror enforcement on `legacy_locker.delegate_user_id`, verification-function update, and RLS lockdown — revoke direct client insert/update/delete on `legacy_admins` and block client writes to `delegate_user_id` so both are reachable only through the definer RPCs and trigger logic.
2. Update the frontend to use only the new RPC-based Legacy Admin flow.
3. Remove the Recovery Delegate configuration UI (`RecoveryDelegateSelector.tsx` and its two call sites) and the delegate save handlers.
4. Update recovery edge functions to require an active Legacy Admin.
5. Regenerate types, repo-wide `recovery.delegate` terminology scrub, typecheck/build, end-to-end verification.

## Verification additions

- **Desynchronization test**: manually create a mismatch between `legacy_admins` and `legacy_locker.delegate_user_id` in the test environment and confirm the recovery request path **rejects loudly** instead of trusting either side. `submit-recovery-request` will require both the active `legacy_admins` row and the mirror to agree, and raise/fail closed on mismatch rather than falling back.
- Confirm no client role can write `legacy_admins` or `delegate_user_id` directly (attempt a direct insert/update as an authenticated owner and expect a permission error).
- Plus the standard checks: Read Only ineligible, ineligible assignment rejected backend-side, downgrade/revocation clears the designation and revokes grants, one Legacy Admin maximum, vault still locked for the Legacy Admin, export/closure/memorialization unchanged.


## Not changing

Full Access / Read Only AU permissions, `authorize_continuity_export`, memorialization, account closure, MFA/passphrase/recovery cryptography, and the retired Ownership Transfer / Temporary Stewardship / Archive Custodian roles.
