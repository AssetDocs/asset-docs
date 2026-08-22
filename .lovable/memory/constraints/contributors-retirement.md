---
name: Contributors System Retirement
description: Staged retirement of the legacy contributors table; mapping rules for old administrator/contributor/viewer checks
type: constraint
---

The legacy `contributors` table (roles `administrator` / `contributor` / `viewer`) is the retired predecessor of `account_memberships` (`owner` / `full_access` / `read_only`). It holds 0 rows and is being retired in stages. Never re-add contributor-based logic.

Mapping rules when removing an old contributor check — never assume `administrator` = `full_access`:
- Secure Vault / Legacy Locker / trust information access → **Legacy Admin only** (via the recovery-request flow). Full Access AU must not gain vault access.
- Account deletion request / execution → **account owner only**. The old administrator-initiated deletion is retired.
- Ordinary account areas, counts, display badges → `account_memberships` (`full_access` / `read_only`).
- Verification milestone `has_contributors` → exists an active non-owner `account_memberships` row.

Stage status:
- Stage 1 DONE: `compute_user_verification.has_contributors` repointed to `account_memberships`; the six "Administrator contributors can view…" SELECT policies dropped (`legacy_locker`, `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`, `voice_note_attachments`, `trust_information`); contributor branches removed from `SecureVault.tsx` and `LegacyLocker.tsx`.
- Stage 2A pending: admin CRM (`AdminUsers.tsx`) repoint with side-by-side validation, including revoked/historical memberships.
- Stage 2B pending: remaining frontend reads + removal of contributor-based deletion (`ManageTab`, `submit-deletion-request`, `delete-account`).
- Stage 3/4 pending approval: invite pipeline (`invite-contributor`, `accept-contributor-invitation`, `complete-contributor-signup`), then drop `has_contributor_access`, the table, and the `contributor_role` enum.

Separate open issue (do not fix inside contributor work): account `35f0a6a4-…` has an active `legacy_admins` row while `legacy_locker.delegate_user_id` is NULL — mirror consistency needs its own pass.
