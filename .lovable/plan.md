# Retire Ownership Transfer from Legacy Continuity

Asset Safe stops offering account ownership transfer. Continuity keeps review, temporary access, archive custodian, memorialization, preservation, closure approval, and authorized export. The four remaining execution functions are not modified in this pass.

## Audit findings (verified before planning)

**`execute_ownership_transfer(_request_id, _reason, _senior_approver_id, _snapshot_reference)`** exists in the database, `SECURITY DEFINER`, and:

- Reads: `continuity_account_snapshots`, `account_continuity_requests`, `accounts.owner_user_id`; gate via `has_any_app_role` and `enforce_continuity_execution_guard`.
- Writes: `accounts` (`owner_user_id`, `owner_state='archived_owner'`, `continuity_setup_required`), `account_memberships` (demotes prior owner, inserts/upserts new owner), `ownership_transfer_history`, `account_ownership_metadata`, `continuity_execution_events`, `account_continuity_requests` (status `completed`, `transfer_scope='transfer'`), plus `log_continuity_event`.
- Does change account ownership and workspace membership roles. Does not touch auth identity, Stripe/billing identifiers, Legacy Admin rows, or Secure Vault keys directly (vault access follows account role, which is why this path must go).
- No other database function references it (checked `prosrc` across `public`).
- Code references: only `src/integrations/supabase/types.ts` (generated) and one open question line in `docs/AssetSafe_Continuity_Legacy_Operations.md`. No frontend or edge function calls the RPC.

**Unexpected active dependency found — reporting before deletion, per your instruction:**

`src/components/admin/legacy-continuity/OwnershipTransferWizard.tsx` is **live**, not orphaned. `DecisionPanel.tsx` renders it behind a "Start Ownership Transfer Review" button (line 152-153). The wizard does not call the RPC — it performs the transfer itself with direct table writes: it inserts into `continuity_ownership_transfers`, sets `account_continuity_requests.status='ownership_transfer_pending'`, and on execute writes `accounts.owner_user_id = proposed_owner_id` straight from the client. `OwnershipTransfersTab.tsx` (a live admin tab, "Continuity Actions") lists rows from `continuity_ownership_transfers`.

So retiring the capability requires removing this client-side path too, otherwise dropping the RPC changes nothing operationally.

## What this plan changes

### 1. Database
Migration that drops `public.execute_ownership_transfer`. No table drops: `continuity_ownership_transfers`, `ownership_transfer_history`, and `account_ownership_metadata` are retained read-only as historical record (they may hold review rows). No changes to `execute_archive_custodian`, `execute_temporary_stewardship`, `execute_memorialization`, `authorize_continuity_export`.

### 2. Admin frontend
- Delete `OwnershipTransferWizard.tsx` and the deprecated `execution/OwnershipTransferForm.tsx`.
- `DecisionPanel.tsx`: remove the wizard import, `transferOpen` state, and the "Start Ownership Transfer Review" action button. All other decision actions untouched.
- `OwnershipTransfersTab.tsx`: convert to a read-only historical record tab labeled "Historical Transfer Reviews", with a note that ownership transfer is retired and no new reviews can be started. Keep it so existing rows stay auditable; drop the "Open Case" wizard entry point wording only if it points at the retired flow (it opens the case detail, so it stays).
- `constants.ts`: remove the `recommend_transfer` capability (wizard-only) and the `notify_ownership_transfer` email template. Keep `senior_approve_transfer` and `execute_transfer` capability keys — they gate memorialization and closure in `ContinuityExecutionPanel` — but reword their help text away from "Ownership Administrator"/transfer language.
- Relabel remaining user-facing transfer wording: `ownership_transfer_pending` label, `TransferScopeSelector`/`TransferPreviewDialog` copy, workspace intro text ("manual review before ownership transfer, export…"), and `execution/executionConstants.ts` comments. `TransferScopeSelector`/`TransferPreviewDialog` component filenames stay (renaming files is churn); only their copy changes.
- `src/components/legacy-continuity/types.ts` keeps the legacy `ownership_transfer` request-type value with its "(legacy)" label so historical rows still render.

### 3. Documentation
- `docs/AssetSafe_Continuity_Legacy_Operations.md`: remove ownership transfer as a current outcome, replace the open question with a "Retired 2026-08-22" entry, and add the product-direction statement: Asset Safe does not transfer ownership of a user's account through Legacy Continuity; approved continuity workflows may provide access to or export of available account information; ongoing use by another family member requires a separate Asset Safe account.
- Same correction in the other live docs that present it as a capability: `AssetSafe_Continuity_Launch_Decision_Memo.md`, `AssetSafe_Continuity_Incident_Tabletop_Runbook.md`, `AssetSafe_Support_Ops_Runbook.md`, `AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`, `AssetSafe_Launch_Operator_Signoff_Checklist.md`, `AssetSafe_Operational_Readiness_Sweep.md`, `AssetSafe_Lovable_P0_Launch_Readiness_Classification.md`, `AssetSafe_Launch_Evidence_Collection_Runbook.md`. Historical migrations are left alone.

### 4. Explicitly not touched
Secure Vault gating, Legacy Locker encryption, Digital Access, passphrase behavior, Recovery Delegate, Admin Access Control, Authorized Users, Legacy Admin assignment and invitations, `authorize_continuity_export`, and the three other execution functions. No successor-account, copy-forward, or subscription-transfer functionality is built.

## Closure mechanisms — informational report (no changes)

Discovered surfaces to be reported in detail, not modified: `request-account-closure`, `process-account-closures`, `reverse-account-closure`, and `delete-account` edge functions; `approve_closure_request` / `complete_closure` / `cancel_closure` / `bypass_waiting_period` database functions; `account_closure_requests`, `closure_requests`, `deleted_accounts`, `storage_deletion_jobs`; and the admin `ApproveClosureForm` (30-day waiting period). The report will state, per surface, whether it cancels Stripe, whether it starts retention/deletion windows, and whether continuity cases currently connect to it. No wiring is added.

## Verification
- Confirm the function is gone from `pg_proc` and that no database function, edge function, or frontend file references it.
- Repo-wide search shows no live ownership-transfer capability, only historical migrations and retired-behavior notes.
- Confirm the remaining admin continuity forms (Archive Custodian, Temporary Continuity Access, Memorialization, Preservation, Approve Closure, Authorize Export) still render and their capability gates resolve.
- Typecheck/build clean.

## Follow-up (separate, read-only)
Immediately after this pass, audit `execute_archive_custodian`, `execute_temporary_stewardship`, `execute_memorialization`, and `authorize_continuity_export` — intent, who can invoke, assumed manual review, tables touched, Secure Vault exposure, effect on access/ownership, ongoing operational burden, launch necessity, and a keep/simplify/replace/retire recommendation each. No modifications during that audit.
