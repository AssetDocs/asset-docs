# Cleanup Pass: Admin Access Copy, Deletion Banner, Stale Identifiers

Codex's three remaining findings are accepted with one important correction, then all three get fixed in a single cosmetic/copy pass. No authorization behavior changes.

## Correction on the P2 finding

`legacy_locker.allow_admin_access` is **not** dead. It is still enforced by a live policy on `legacy_locker`:

```text
"Admins can view legacy lockers when permitted"
  has_app_role(auth.uid(), 'admin') AND allow_admin_access = true
```

So the toggle really does control something: whether a **platform/support admin** (an `app_role = 'admin'` staff account) can read the owner's locker row. What is wrong is the wording. The card and its toasts say "Administrators (authorized user)", which is leftover contributor-era language and describes the wrong actor entirely. The column is also unrelated to the new Legacy Admin recovery policy, which is correct — recovery is gated by mirror match + active `legacy_admins` row + active grant, and deliberately ignores this flag.

Codex is right that `isManualAdminRestriction = false` at line 458 makes the branch at 479-487 unreachable dead code.

Worth stating in the UI: even when the flag is on, vault contents stay end-to-end encrypted, so a support admin sees the row, not the decrypted secrets.

## Changes

**1. `src/components/SecureVault.tsx`**
- Reword the "Admin Access Control" card to describe the real actor: Asset Safe support/platform staff, not authorized users. Retitle to "Support Staff Access" (or similar), and replace the body text with a statement that turning it off blocks support-staff record access, and that vault contents remain end-to-end encrypted either way.
- Fix the two toast messages in `handleAdminAccessToggle` to match.
- Keep the toggle, the column write, and the owner-only visibility condition unchanged.
- Delete the dead `isManualAdminRestriction` constant and its unreachable branch, keeping only the "Authorized Users cannot access the account owner's encrypted vault" message.

**2. `src/components/ManageTab.tsx`** — replace "administrator" in the owner-facing deletion-request banner and toast (lines 327, 685, 691, 692) with wording that matches the current model: an authorized user can no longer delete the account, so the banner should describe a legacy pending request and state that only the owner can complete a deletion. The banner stays, since old `account_deletion_requests` rows may exist.

**3. `src/components/admin/AdminUsers.tsx`** — rename `ContributorRecord` to `MembershipRecord`, the bucket field `contributors` to `authorizedUsers`, and the tab value `contributors` to `authorized-users`. Display strings already read "Authorized Users".

**4. `src/services/ExportService.ts`** — rename the `assets.contributors` field to `assets.authorizedUsers` and update the interface plus the three read sites (PDF summary count, section render, initializer).

## Out of scope

- No RLS, function, trigger, or grant changes.
- No touching the Legacy Admin recovery path, `vault_delegate_grants`, or the mirror.
- Stage 3 (contributor invite edge functions) and Stage 4 (drop the `contributors` table, `has_contributor_access`, `contributor_role` enum) remain unstarted; `delete-account`'s contributor cleanup deletes stay until Stage 4.
- `AccountContext`'s legacy aliases (`useContributor`, `ContributorProvider`, `isContributor`) are load-bearing across many files; renaming them is a separate, larger refactor.

## Verification

- Typecheck and build.
- Owner view: the reworded support-access card renders, the toggle still persists `allow_admin_access` both ways.
- Authorized User view on an encrypted owner vault: still sees the single "Access Restricted" message.
- Admin CRM: Authorized Users tab still lists the same rows and counts, including the revoked historical membership.
- Export: authorized-user count and section still populate from active `account_memberships`.
