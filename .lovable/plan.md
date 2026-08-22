# Codex Audit Response + Cleanup Plan

## Headline: the audit ran against a stale checkout

Current repo HEAD here is `ce8628e2` with a clean worktree (no uncommitted changes). Codex reports `1911dc1c`. Every commit carrying this work landed after that point:

```text
ce8628e2  Update plan
6bb40778  Changes
d8cf730c  Added legacy recovery policy
b1787eac  Changes
73244cc1  Update plan
```

Codex also cites line numbers that no longer exist: `ManageTab.tsx:818` (file is 779 lines), `SecureVault.tsx:95` / `:128` (no contributors fetch there), `AdminUsers.tsx:133`, `ExportService.ts:1930`. Codex should `git fetch && git pull` and re-run. Note also that Secure Vault lives at `src/components/SecureVault.tsx` and the locker at `src/components/LegacyLocker.tsx` — there is no `src/pages/SecureVault.tsx`.

## Finding-by-finding verification against current HEAD

| Codex finding | Actual state now |
| --- | --- |
| P1 — SecureVault fetches contributors, branches on `role === 'administrator'` | **Resolved.** No contributors query and no role branch remain. `fetchVaultStatus` reads only the user's own locker (`.eq('user_id', user.id)`) plus a delegate lookup (`.eq('delegate_user_id', user.id)`). The one surviving word "administrators" is UI copy at line 482. |
| P1 — contributor-initiated deletion UI + "Only administrator contributors can delete accounts." | **Resolved.** `delete-account/index.ts` now documents the retirement inline and returns `403 "Only the account owner can delete this account"` for any third-party attempt; only owner self-deletion or the scheduled-closure sweeper proceeds. The contributor deletion UI is gone from `ManageTab.tsx`. |
| P2 — `check-subscription` uses contributors | **Resolved.** Reads `account_memberships` with `status='active'` and `role <> 'owner'`, joined to `accounts.owner_user_id`. |
| P2 — `ExportService` uses contributors | **Resolved.** Sources active `account_memberships`; only the in-memory field name is still `contributors`. |
| P2 — `AdminUsers` uses contributors | **Resolved.** Fetches `account_memberships` (all statuses, so revoked rows stay visible as historical) joined to `accounts`. Only local variable/tab identifiers still read `contributors`. |
| P2 — no `assign_legacy_admin`, `revoke_legacy_admin_recovery_artifacts`, or the two policy names locally | **Present.** They live in `supabase/migrations/20260822180729_…`, `20260822181528_…`, `20260822211611_…`, `20260822213930_…` — all after Codex's HEAD. |
| P3 — types model `wrapped_vault_key` as non-null | **Already regenerated.** `types.ts` shows `wrapped_vault_key: string \| null` (line 7921) and optional-nullable in Insert/Update. |

## Genuinely remaining items (all cosmetic or Stage 4 scope)

1. `ManageTab.tsx` lines 327, 685, 691, 692 — owner-facing copy still says "administrator has requested to delete your account". That banner is now only reachable through the legacy `account_deletion_requests` path; the wording should say "an authorized user" or the request surface should be removed with Stage 4.
2. `AdminUsers.tsx` — bucket field `contributors`, tab value `contributors`, and the `ContributorRecord` type name are stale identifiers behind correct data. Rename to `authorizedUsers` / `MembershipRecord`.
3. `ExportService.ts` — `assets.contributors` field name, same cosmetic rename.
4. `delete-account/index.ts` lines 756–761 — still deletes `contributors` rows during cleanup. Correct to keep until Stage 4 drops the table; remove in the same pass.
5. Stage 3 / Stage 4 remain deliberately unstarted: the contributor invite edge functions (`invite-contributor`, `accept-contributor-invitation`, `complete-contributor-signup`), `has_contributor_access`, the `contributors` table with its four policies, and the `contributor_role` enum all still exist. Table holds 0 rows.

## Proposed next step (optional, pick one)

- **Cosmetic-only pass:** rename the stale `contributors` identifiers in `AdminUsers.tsx` and `ExportService.ts`, and fix the "administrator" deletion copy in `ManageTab.tsx`. No behavior change, makes the next audit read clean.
- **Or hold** until you decide on Stage 3/4, and do the renames inside that pass so the audit surface changes once instead of twice.

## Technical note for the reviewer

Nothing in this work is "deployed remotely but absent from the repo." The four migrations are committed files in `supabase/migrations/`, the edge function sources are committed under `supabase/functions/`, and the frontend edits are committed under `src/`. The divergence is purely that the reviewing checkout is behind `origin/main`.
