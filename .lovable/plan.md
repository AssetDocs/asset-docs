# Contributors System Audit — Findings and Retirement Plan

Read-only audit. Verified against the live database (policies, triggers, functions, row counts) and the full repo.

## 1. What `contributors` was originally intended to represent

The original sharing model, before `account_memberships` existed. It is an invite-and-accept table (`account_owner_id`, `contributor_email`, `contributor_user_id`, `invite_token`, `status`, `role`) with a three-level `contributor_role` enum: `administrator`, `contributor`, `viewer`. Administrator was intended as "co-owner-ish" (vault access, may request account deletion), contributor as add/edit, viewer as read-only.

The current model is `account_memberships` with `membership_role` = `owner` / `full_access` / `read_only`, plus one Legacy Admin. `contributors` is the superseded predecessor.

Live data: **`contributors` has 0 rows** (0 accepted). `account_memberships` has 17 rows, 1 active Full Access AU. So every contributor-based branch below is currently dead at runtime, but still reachable code.

## 2. Every live place that reads it

Frontend reads:
- `SecureVault.tsx` — `fetchContributorsList()` and an admin-contributor lookup that loads **another owner's vault row** (`legacy_locker` incl. `allow_admin_access`, wrapped key).
- `LegacyLocker.tsx` — `checkContributorStatus()` and `fetchContributors()`.
- `ManageTab.tsx` — `checkIfContributor()`, drives the administrator-initiated account-deletion panel.
- `AccountHeader.tsx`, `PeopleActivityCard.tsx`, `ProtectionScore.tsx` (realtime channel on `contributors`), `AdminContributorPlanInfo.tsx`, `AccountSettings.tsx` (restricted tabs), `ExportService.ts` (export section), `SampleDashboard.tsx` / `DemoLegacyLocker.tsx` (demo only).
- Admin tooling: `AdminUsers.tsx` (treats `administrator` as `full_access`), `AdminDatabase.tsx`, `SystemInfrastructure.tsx`, `SystemArchitectureFlowcharts.tsx`.
- Signup/auth glue: `AuthLegacy.tsx`, `SignupLegacy.tsx`, `AuthCallback.tsx`, `AuthContext.tsx`, `CreatePassword.tsx`.

Database reads:
- `compute_user_verification()` computes `has_contributors` from `contributors` — this feeds the Security Progress "Add an Authorized User" row via `useVerification` / `SecurityProgress.tsx` / `useDashboardResumePrompt.ts`. **This is the one genuinely load-bearing read: it is why that row can never complete today**, because AUs are created in `account_memberships`.
- `get_profiles_safe()`, `get_feature_adoption()`.
- `has_contributor_access(uuid, contributor_role)` and `has_contributor_access(uuid, uuid, contributor_role)`.

Edge functions: `invite-contributor`, `accept-contributor-invitation`, `complete-contributor-signup`, `submit-deletion-request`, `delete-account`, `check-verification`, `check-subscription`, `request-account-closure`, `reverse-account-closure`.

## 3. Permission decisions based on `role === 'administrator'`

| Location | Decision |
| --- | --- |
| `SecureVault.tsx` ~115-135 | Grants vault visibility and loads the owner's `legacy_locker` row + wrapped key |
| `LegacyLocker.tsx` ~749 | Blocks non-administrator contributors from the Locker |
| `ManageTab.tsx` ~160, ~818 | Exposes administrator-initiated account deletion |
| `submit-deletion-request` ~74 | Server-side gate: only administrator contributors may request deletion |
| `delete-account` ~588 | Server-side gate: only administrator contributors may delete |
| `AdminUsers.tsx` ~423 | Admin display mapping only |
| RLS on `legacy_locker`, `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`, `voice_note_attachments`, `trust_information`, `user_activity_logs`, `receipts`, `storage_usage`, `calendar_events`, `account_deletion_requests`, `storage.objects` | "Administrator contributors can view…" policies grant cross-owner SELECT |

## 4. Where each check should map now

- Vault access (`SecureVault`, `LegacyLocker`, the four locker RLS policies): **Legacy Admin only**, via the existing `legacy_admins` / `legacy_locker.delegate_user_id` mirror and the recovery-request flow. Full Access AUs do **not** get the vault by role.
- `trust_information`, `voice_note_attachments`: **Legacy Admin** (they are vault-adjacent).
- Content/activity/receipts/storage/calendar policies: **Full Access AU** via `has_account_access` / `is_account_member`.
- Account deletion request + `delete-account` administrator path: **account owner only** — nobody else. An AU-initiated deletion of someone else's account is not part of the current model.
- `has_contributors` verification criterion: **Full Access or Read Only AU** in `account_memberships` (status active). This is a bug fix, not just cleanup.
- Marketing/FAQ copy describing three levels (`HomeFAQ.tsx` ~37, `SystemInfrastructure.tsx` ~584): **Full Access / Read Only** only.

## 5. RLS, triggers, edge functions, invitations, admin tooling

- **RLS on `contributors`:** 4 policies — owner ALL, app-admin SELECT, invitee SELECT, invitee UPDATE-own-acceptance.
- **Triggers:** `audit_contributors_trigger`, `content_audit_contributors`, `guard_contributor_self_acceptance_update`, `update_contributors_updated_at`.
- **Functions:** two `has_contributor_access` overloads, `guard_contributor_self_acceptance_update`, plus reads inside `compute_user_verification`, `get_profiles_safe`, `get_feature_adoption`.
- **Invitations:** a complete parallel invite pipeline (`invite-contributor` → email → `complete-contributor-signup` / `accept-contributor-invitation`), duplicating the current `invites` + `accept_invite_atomic` flow. `AuthContext` still fires `accept-contributor-invitation` on login.
- **Admin tooling:** listed in `AdminUsers`, `AdminDatabase`, `SystemInfrastructure`, and the architecture flowcharts.
- **Cross-table FKs:** `account_deletion_requests` policy depends on it; the locker/trust policies reference it.

## 6. Can it be removed without weakening Secure Vault security?

Yes — removing it **strengthens** the vault. The contributor path is the only remaining way a non-owner gets `legacy_locker` SELECT and the wrapped key purely from a role value, with no Legacy Admin designation, no recovery request, and no owner approval. It is inert today only because the table is empty; a single inserted row would re-open it. Dropping the policies and the client branches leaves the Legacy Admin recovery flow as the sole non-owner path, which is the intended model.

Two things must be repointed, not just deleted:
1. `compute_user_verification.has_contributors` must read `account_memberships` or the Security Progress AU row breaks permanently.
2. The administrator-initiated deletion flow must be removed (owner-only), including both server gates.

## Proposed retirement plan (staged, needs approval)

**Stage 1 — fix the live defect and close the vault path**
- Migration: rewrite `compute_user_verification` so `has_contributors` = exists an active non-owner row in `account_memberships`.
- Migration: drop the "Administrator contributors can view…" policies on `legacy_locker`, `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`, `voice_note_attachments`, `trust_information`.
- Frontend: remove the admin-contributor branch from `SecureVault.tsx` and the contributor gate from `LegacyLocker.tsx`; keep the Legacy Admin unlock path untouched.

**Stage 2 — remove contributor-based deletion and remaining reads**
- Remove the administrator-initiated deletion panel from `ManageTab.tsx`; make `submit-deletion-request` and the `delete-account` contributor branch owner-only.
- Repoint `AccountHeader`, `PeopleActivityCard`, `ProtectionScore` (realtime channel), `AccountSettings`, `ExportService`, and `AdminContributorPlanInfo` to `account_memberships`.
- Update `HomeFAQ.tsx` and `SystemInfrastructure.tsx` copy to Full Access / Read Only.

**Stage 3 — retire the parallel invite pipeline**
- Stop calling `accept-contributor-invitation` from `AuthContext`, `AuthCallback`, `SignupLegacy`, `AuthLegacy`; delete `invite-contributor`, `accept-contributor-invitation`, `complete-contributor-signup` once no path reaches them.
- Drop the remaining contributor RLS policies elsewhere (`receipts`, `storage_usage`, `calendar_events`, `account_deletion_requests`, `storage.objects`) after confirming each has an `account_memberships` equivalent.

**Stage 4 — drop the table**
- Drop `has_contributor_access` overloads, the guard trigger, then `public.contributors` and the `contributor_role` enum. Kept last so Stages 1-3 can be verified in production first. Admin flowchart/demo surfaces updated in the same pass.

Approve to start with Stage 1, or tell me to run Stages 1-2 together.
