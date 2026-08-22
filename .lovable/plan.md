# Final Continuity/AU Cleanup Pass

Frontend copy and naming only. No migration, no authorization change.

## Requested verification first: exact RLS scope of `allow_admin_access`

Queried live policies. An `app_role = 'admin'` identity with `allow_admin_access = true` can SELECT **only the `legacy_locker` row itself**. Nothing else in the vault surface has an admin SELECT path:

| Object | Admin SELECT path when `allow_admin_access = true` |
| --- | --- |
| `legacy_locker` | **Yes** — `Admins can view legacy lockers when permitted`: `has_app_role(auth.uid(),'admin') AND allow_admin_access = true` |
| `legacy_locker_files` | No — only `auth.uid() = user_id` |
| `legacy_locker_folders` | No — only `auth.uid() = user_id` |
| `legacy_locker_voice_notes` | No — only `auth.uid() = user_id` |
| `voice_note_attachments` | No — only `auth.uid() = user_id` |
| `trust_information` | No — only `auth.uid() = user_id` (the old admin-contributor policy was dropped in Stage 1) |
| `password_catalog` | No — only `auth.uid() = user_id` |
| Vault storage objects (`documents/legacy-locker/...`) | No — `Vault: read locker objects` routes through `can_access_vault_path`, which allows only the owner or a delegate with an `acknowledged` recovery request. It does not consult `allow_admin_access`. |

So the toggle governs support-staff visibility of the single locker record (settings/state row), not vault contents, files, passwords, trust info, or storage. The proposed copy is accurate. Vault payloads remain end-to-end encrypted regardless.

Side note, no change this pass: one legacy storage policy on `documents` still references the `contributors` table — Stage 4 cleanup item.

## 1. Secure Vault — Support Staff Access (`src/components/SecureVault.tsx`)

- Retitle the card "Admin Access Control" to **Support Staff Access**.
- Body copy: "Allow authorized Asset Safe support staff to access the Secure Vault record when needed for account support. Vault contents remain encrypted and cannot be decrypted without the required vault recovery credentials."
- Status label stays Allowed / Restricted; toggle, `allow_admin_access` write, and owner-only visibility unchanged.
- Toast titles become "Support Staff Access Enabled/Disabled" with matching support-staff wording; no mention of Authorized User, Legacy Admin, or Recovery Delegate.
- Remove the dead `isManualAdminRestriction` constant (line 458) and its unreachable branch (479-487), keeping the "Authorized Users cannot access the account owner's encrypted vault" message.

## 2. Legacy deletion banner (`src/components/ManageTab.tsx`)

- Line 685: replace "An administrator has requested to delete your account." with wording for a legacy request from an authorized user, noting third-party deletion is retired and only the account owner can complete a deletion.
- Lines 691-692: drop "before the administrator can proceed" / "The administrator can now proceed"; state that the request is on record and that only the owner can complete deletion.
- Line 327 toast: same correction.
- Approve/Reject controls and owner self-deletion behavior untouched.

## 3. Admin CRM naming (`src/components/admin/AdminUsers.tsx`)

- `ContributorRecord` → `MembershipRecord` (lines 33, 52).
- Bucket field `contributors` → `authorizedUsers` (lines 52, 271, 287, 355, 993).
- Tab value `contributors` → `authorized-users` (lines 618, 988).
- Queries, membership derivation, role/status mapping, counts, and revoked historical display unchanged.

## 4. Export naming (`src/services/ExportService.ts`)

- Interface field `contributors` → `authorizedUsers` (line 268), initializer (1148), summary count (468), section render (928-950), assignment from memberships (1959).
- The `account_memberships` query and export output content stay the same.

## Out of scope

AU permissions, `account_memberships`, roles, invitations, Legacy Admin eligibility/recovery, `delegate_user_id`, `vault_delegate_grants`, vault recovery RLS, encryption/passphrase behavior, Continuity Export, memorialization, closure logic, Stage 3 invite pipeline, Stage 4 table/enum/`has_contributor_access`, and `AccountContext` legacy aliases.

## Verification

Typecheck and production build clean apart from the known Browserslist / mixed-import / bundle-size warnings; owner sees Support Staff Access and the toggle persists both directions; Authorized User still blocked from the owner's encrypted vault; Legacy Admin recovery unchanged; deletion banner no longer says an administrator can delete the account; Admin CRM rows, counts, and the revoked historical AU unchanged; export authorized-user count and section unchanged; repo-wide search confirms the renamed identifiers are gone from the touched files. Changes are committed to the canonical branch for an independent audit.
