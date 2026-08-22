# Stage 2B — Remove contributor-based deletion, repoint remaining live reads

Scope: the frontend/edge reads of the legacy `contributors` table that affect live behavior, plus removal of the contributor-initiated account-deletion path. Out of scope: Stage 3 (invite pipeline: `invite-contributor`, `accept-contributor-invitation`, `complete-contributor-signup`, `SignupLegacy`, `CreatePassword` prefill), Stage 4 (drop `has_contributor_access`, the table, the enum). The `legacy_locker.delegate_user_id` mirror gap stays untouched. No database migration in this stage.

## Pre-check result — Full Access AU has no Secure Vault access (verified, read-only)

Ran before proposing implementation, as required.

- **Every vault query in `SecureVault.tsx` is self-scoped.** `fetchVaultStatus` reads `legacy_locker` with `.eq('user_id', user.id)` and, separately, `.eq('delegate_user_id', user.id)`. Nothing queries by the *owner's* id or the active `account_id`, so a Full Access AU can only ever load their own vault row or a row where they are the designated Legacy Admin.
- **RLS confirms it at the database layer.** `legacy_locker`, `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`, `voice_note_attachments`, and `trust_information` now have exactly one SELECT policy each: `auth.uid() = user_id`. The only extras are the admin-role policy on `legacy_locker` (`has_app_role(admin) AND allow_admin_access = true`) and `vault_delegate_grants`, scoped to `owner_user_id` / `delegate_user_id`. No membership- or role-based path exists.
- **`canAccessEncryptedVault = isOwner || isFullAccess` is a UI gate on the user's *own* vault, not an authorization grant.** It only decides whether the "cannot access encrypted vaults" block screen renders; the data it would reveal is already restricted to `user_id = auth.uid()`. A Read Only AU gets the block screen; a Full Access AU does not — but with no owner-scoped query and no permissive RLS, there is nothing to retrieve or decrypt.
- **Decryption is key-bound, not role-bound.** Unlock uses the owner's passphrase-derived key / `encryption_key_encrypted_for_user` wrapped for a specific user. AU role grants no key material.
- **Recovery initiation stays Legacy Admin-only.** The recovery panel requires `isDelegate`, set solely by a `legacy_locker` row whose `delegate_user_id` is the current user; `submit-recovery-request` additionally cross-checks the `legacy_admins` mirror.
- **No contradicting path found.** Two cosmetic defects noted, both no-ops today: line 44 destructures `isViewer`, `isContributorRole`, `contributorRole`, `isAdministrator` from `useAccount()`, none of which the context provides — so `isAdminBlockedFromVault` (line 446) is permanently `false` and the "viewer/limited" copy at line 494 reads from `undefined`. Stage 2B will clean these up as presentation-only fixes; `canAccessEncryptedVault` itself is left byte-identical so no gate widens or narrows.


## Explicit mapping decision per check (no blanket administrator → full_access)

| # | Location | Current contributor check | Replacement mapping |
|---|---|---|---|
| 1 | `ManageTab.tsx` `checkIfContributor` | accepted `contributors` row → `isContributor`; `role === 'administrator'` unlocks "Delete Managed Account" + deletion-request card | AU identity comes from `useAccount()` (`isFullAccess`/`isReadOnly`, already `account_memberships`-derived). Deletion of another person's account maps to **nobody** — card, `handleAdminDeleteAccount`, `submit-deletion-request` call, and `pendingDeletionRequest` state removed. Owner-only delete stays exactly as is. |
| 2 | `delete-account` edge, `isAdminDeletion` branch | administrator contributor may delete the owner's account | **Nobody.** Branch removed; the function keeps self-deletion and the `isScheduledClosureDeletion` service path unchanged. Contributor-row cleanup at the end (lines ~843-848) is **kept** so residual rows still get wiped. |
| 3 | `submit-deletion-request` edge | administrator contributor creates a deletion request | **Nobody.** Function's authorization branch becomes a hard 403 (function left deployed but inert) — no caller remains after (1). |
| 4 | `check-subscription` edge | accepted contributor inherits the owner's entitlement | **Full Access AU and Read Only AU**, via active `account_memberships` → `accounts.owner_user_id` → owner `entitlements`. Same inheritance outcome, current source of truth. This is the one place where read-only AUs must keep inheriting the plan. |
| 5 | `request-account-closure` / `reverse-account-closure` edges | email accepted contributors about scheduled/reversed closure | **All active non-owner AUs** on the account, addressed via the AU's `profiles`/membership email. Notification-only; recipient set is the same people. |
| 6 | `ExportService.ts` owner export | lists accepted contributors in the export PDF | **Active `account_memberships` non-owner rows** (name from `profiles`, role label Full Access / Read Only). Section heading becomes "Authorized Users". |
| 7 | `ProtectionScore.tsx` realtime channel on `contributors` | refresh metrics on contributor change | **`account_memberships`** filtered by the owner's `account_id`. Purely a refresh trigger. |
| 8 | `AdminContributorPlanInfo.tsx` (rendered for Full Access AU in Settings → Profile) | lists accepted contributors of the owner's account | **Active `account_memberships`** for the same account, Full Access / Read Only labels. Subscription block unchanged. |
| 9 | `AccountHeader.tsx` | reads contributors to set owner name/badge | Component renders an empty `<div>` and is imported nowhere. **Delete the file.** |
| 10 | `AdminDatabase.tsx` table-stats list | read-only `contributors` row count | **Unchanged**, per your instruction. |
| 11 | `SecureVault.tsx` copy line ("Viewers and limited-access contributors never have access…") | wording only | Reworded to Read Only / Authorized User vocabulary. No logic. |
| 12 | `AccountSettings.tsx`, `ActivityLog.tsx`, `subscriptionFeatures.ts`, admin flowcharts | the word "contributor" in labels/copy | Left alone in this stage except where it appears in a section I already touch; copy sweep belongs with Stage 3/4. |

## Non-regression requirements

- Owner: every tab, action, delete-own-account flow, and entitlement identical.
- Full Access AU: same tabs/actions, still inherits the owner's plan, still **no** Secure Vault access, still not able to delete the owner's account (it never could via `account_memberships`; the contributor path that could is being removed).
- Read Only AU: same restricted view, still inherits the owner's plan.
- Legacy Admin: row, eligibility, recovery-request flow untouched.
- `account_memberships` rows, roles, statuses, invite acceptance untouched. No renaming of `full_access` / `read_only`.
- Admin CRM (Stage 2A result) untouched.

## Verification

1. SQL: for the active AU `4df74d1f…` and read-only AU `119929b9…`, confirm the new membership→owner→entitlement join returns the same owner plan the contributor path would have (contributors has 0 rows, so today it returns nothing — the new path is strictly a fix, and this is the one intended behavior delta: AUs now correctly inherit).
2. SQL: closure-notification recipient set (active non-owner memberships per account) matches the AU list shown in Admin → Authorized Users.
3. Confirm zero `from('contributors')` reads remain outside the invite pipeline (Stage 3), `delete-account` cleanup, and `AdminDatabase` stats.
4. Confirm no remaining caller of `submit-deletion-request`, and no UI surface offering deletion of someone else's account.
5. Typecheck clean; owner/AU click-through on your side (external Supabase blocks authenticated browser checks here).

## Stop point

Report the per-check mapping outcome and the one intended delta (AU plan inheritance now actually resolves). No Stage 3 or Stage 4 work without a new approval.
