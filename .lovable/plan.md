# Contributors Retirement — Stages 1, 2A, 2B (approved scope)

Stages 3 (invite pipeline) and 4 (drop table/enum) are explicitly out of scope for this pass.

## Before-state snapshot (captured, read-only)

Live `account_memberships`: 17 rows — 15 `owner` (all active), 1 `full_access` active, 1 `full_access` revoked, 1 `read_only` active. `contributors`: **0 rows**.

Your test account (`35f0a6a4-9e5e-4c10-a4fc-5f05ee7b10ab`):

| Relationship | User | Role / status |
| --- | --- | --- |
| Owner | `2e62a796…f52fc` | `owner` / active |
| Full Access AU | `4df74d1f…70f66` | `full_access` / active |
| Read Only AU | `119929b9…45d76` | `read_only` / active |
| Legacy Admin | `4df74d1f…70f66` (same user as the Full Access AU) | `legacy_admins` active (two older rows `removed`) |

Note recorded for verification: `legacy_locker.delegate_user_id` for this owner is currently **NULL** while `legacy_admins` has an active row. That mirror gap is observed, not touched in this pass — reported at the end.

Also captured: account `35082a28…` has a **revoked** `full_access` membership (`253a807a…`) — used to confirm the CRM still represents inactive/historical relationships after the repoint.

## Non-regression requirements (binding for every change below)

- Do not alter any `account_memberships` row, role, status, invite acceptance, or AU permission.
- Do not rename or remap `full_access` / `read_only`.
- Full Access AU access to normal account areas stays byte-for-byte equivalent; Read Only behavior unchanged.
- Full Access AU must **not** gain Secure Vault access as a side effect.
- Legacy Admin relationship and owner functionality unchanged.
- Every contributor-based check gets an explicit documented mapping before it changes. `administrator` is **not** globally `full_access`.

### Mapping decisions (explicit, per check)

| Current check | Maps to |
| --- | --- |
| `SecureVault.tsx` admin-contributor vault load | **Legacy Admin only** (existing recovery flow) — not Full Access |
| `LegacyLocker.tsx` non-administrator block | **Legacy Admin only** |
| Locker / trust / voice-note "Administrator contributors can view" RLS | **Legacy Admin only** |
| `ManageTab.tsx` + `submit-deletion-request` + `delete-account` administrator deletion | **Nobody** — owner-only deletion |
| `compute_user_verification.has_contributors` | Active non-owner `account_memberships` row (either role) |
| `AccountHeader`, `PeopleActivityCard`, `AdminContributorPlanInfo`, `ExportService` display reads | `account_memberships` (`full_access` / `read_only` labels) |
| `AccountSettings` restricted tabs, `ProtectionScore` realtime | `account_memberships` — same effective visibility as today |
| Admin CRM (`AdminUsers`) | `account_memberships` incl. non-active rows for history |

## Stage 1 — close the vault path and fix verification

1. Migration:
   - Rewrite `compute_user_verification` so `has_contributors` = exists an active non-owner `account_memberships` row for the account. Nothing else in the function changes.
   - Drop the contributor-based SELECT policies on `legacy_locker`, `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`, `voice_note_attachments`, `trust_information`. No replacement policy is added — Legacy Admin access already flows through the recovery-request path.
2. Frontend: remove the admin-contributor branch and `contributorsList` from `SecureVault.tsx`; remove the contributor gate and `contributorRole` from `LegacyLocker.tsx`. The Legacy Admin unlock path is untouched.
3. Verify: owner can still unlock and read both vault modules; Full Access AU sees no vault; Read Only sees no vault; Security Progress "Add an Authorized User" now completes for the snapshot account.

## Stage 2A — admin CRM repoint with side-by-side validation

1. Document how `AdminUsers.tsx` currently derives owners, attached AUs, roles, active state, and counts (it already reads `account_memberships` for active AUs and merges the legacy `contributors` map).
2. Rebuild the AU derivation entirely from `account_memberships` + `accounts` + `profiles`, including non-active rows so revoked/historical AUs stay represented with their status. Drop the legacy contributor merge only after the checks below pass.
3. Side-by-side checks before/after: owner accounts all present; the Full Access AU still attached to owner `2e62a796…`; Read Only AU still listed; the revoked `full_access` row on `35082a28…` still represented as inactive; total account/user/AU counts unchanged; Legacy Admin still shown where intended; no duplicated AU rows from merging two sources.
4. `AdminDatabase.tsx` keeps `contributors` in its table-stats list this pass (read-only count, no decision).

## Stage 2B — remaining frontend reads and contributor-based deletion

1. Remove the administrator-initiated deletion panel from `ManageTab.tsx`; make `submit-deletion-request` reject all callers as retired and remove the contributor branch in `delete-account` so only owner-initiated deletion remains.
2. Repoint to `account_memberships`, preserving current rendering: `AccountHeader.tsx`, `PeopleActivityCard.tsx` (counts + role chips), `ProtectionScore.tsx` (realtime channel), `AccountSettings.tsx` (restricted tabs), `ExportService.ts` (export section), `AdminContributorPlanInfo.tsx` (role badge colors → Full Access / Read Only).
3. Update copy that still advertises three levels: `HomeFAQ.tsx` (~37) and `SystemInfrastructure.tsx` (~584) → Full Access / Read Only.
4. Re-verify the snapshot table: AU-visible tabs and actions identical, owner-visible tabs and actions identical.

## Safety gate after Stage 2B

Repo-wide search for `role === 'administrator'` and any `contributors`-derived permission decision, and confirm **zero** remain. Then report the surviving contributor dependencies (invite pipeline, auth glue, `has_contributor_access`, remaining RLS on `receipts` / `storage_usage` / `calendar_events` / `account_deletion_requests` / `storage.objects`, demo surfaces) as the input to Stages 3-4. No further change without approval.

Approve to begin Stage 1.
