# Continuity Execution Panel

A protected execution layer inside an open Legacy Continuity case that lets approved cases be carried out — Temporary Stewardship, Archive Custodian Mode, or Full Ownership Transfer — with snapshot, preview, typed confirmation, audit logging, and automated role/permission changes. No ownership change ever happens through normal user management.

## Visibility rules

Show panel only when case status is one of: `approved`, `approved_temporary`, `approved_transfer`, `ready_to_execute`, `transfer_pending`.

Hide entirely for: `submitted`, `under_review`, `additional_info_requested`, `escalated`, `denied`, `completed`, `archived`.

To support new statuses, extend the case `status` column choices and the `STATUS_LABEL`/`STATUS_BADGE_CLASS` constants.

## Database (one migration)

New tables (all RLS, `has_dev_workspace_access` for SELECT, role-gated INSERT via RPC):

1. `ownership_transfer_history` — permanent record of every executed transfer (account_id, previous_owner_id, new_owner_id, executed_by_admin_id, senior_approver_id, request_id, transfer_reason, transfer_type, execution_timestamp, snapshot_reference, rollback_eligible default false, previous_owner_final_state, new_owner_role, audit_log_reference, notes).
2. `continuity_account_snapshots` — immutable JSON snapshot per execution (snapshot_reference unique, snapshot_type, included_assets/documents/permissions/user_relationships/audit_history JSONB, checksum, storage_location).
3. `continuity_execution_events` — start→complete lifecycle (execution_type, status, started_at, completed_at, failure_reason).
4. `continuity_archive_custodian_access` — view/export-only grants (can_view/export/download/modify/delete booleans, starts_at, expires_at, status, reason).
5. `account_ownership_metadata` — per-account stamp written on transfer: `ownership_origin = 'transferred_via_legacy_continuity'`, continuity_case_id, transfer_date, previous_owner_id, executed_by, senior_approver, snapshot_reference, `continuity_setup_required` boolean.

Extend existing tables:
- `account_continuity_requests`: add `transfer_scope` (temporary/transfer/archive), `execution_status`, `executed_at`, `executed_by`, `senior_approver_id`, `snapshot_reference`, `transfer_preview_reviewed_at`.
- `accounts`: add `owner_state` enum (`active`, `archived_owner`, `disabled`), `continuity_setup_required` boolean.

New RPCs (SECURITY DEFINER, role-gated):
- `create_continuity_snapshot(request_id)` — gathers account data, inserts snapshot row, returns snapshot_reference.
- `execute_temporary_stewardship(request_id, permissions, expires_at, reason)` — inserts `continuity_temporary_access`, logs event + audit, updates case execution_status.
- `execute_archive_custodian(request_id, perms, expires_at, reason)` — same for archive custodian.
- `execute_ownership_transfer(request_id, reason, senior_approver_id, snapshot_reference)` — verifies snapshot exists, archives original owner (`accounts.owner_state='archived_owner'`, demote `account_memberships.role` to `archived_owner`), promotes Legacy Admin to `owner` membership, writes `ownership_transfer_history`, stamps `account_ownership_metadata`, sets `continuity_setup_required=true`, logs all events.
- `revoke_continuity_access(grant_id, grant_type, reason)` — revokes temp/custodian grants.

## Components (under `src/components/admin/legacy-continuity/execution/`)

- `ContinuityExecutionPanel.tsx` — gated container; renders only for approved statuses. Mounts into `CaseReviewDialog` as a new center tab "Execution" (or a sticky bottom panel within Decision panel).
- `CurrentOwnershipSummary.tsx` — read-only current-owner + account metadata block.
- `ProposedSuccessorSummary.tsx` — read-only Legacy Admin block with verification status badges.
- `PreTransferChecklist.tsx` — required checklist with Complete/Incomplete/Failed/Not Applicable states; computes `canExecute`.
- `TransferScopeSelector.tsx` — three radio cards: Temporary Stewardship, Full Ownership Transfer, Archive Custodian Mode, each with description + permission template.
- `TemporaryStewardshipForm.tsx` — permissions toggles, expiration date (required), reason, reviewer confirmation.
- `ArchiveCustodianForm.tsx` — view/export/download/permanent toggles, optional expiration, reason.
- `OwnershipTransferForm.tsx` — reason, senior approver dropdown (filtered to `admin`/`owner` roles), confirmation gates.
- `TransferPreviewDialog.tsx` — Before / After / Changed Permissions / Restricted Permissions / Audit Records to be created. Marks `transfer_preview_reviewed_at`.
- `OwnershipTransferConfirmModal.tsx` — checkbox + typed "TRANSFER" gate, calls `execute_ownership_transfer`.
- `ExecutionCompletionScreen.tsx` — post-execution summary with case/account/owners/snapshot/audit references.
- `ExecutionGate.tsx` — small helper mapping role → allowed actions with disabled tooltips ("Requires Ownership Administrator permission.").

## Permissions

Extend `capabilitiesForRole` in `constants.ts`:
- `qa` / support → view only
- `developer` → checklist + recommend
- `dev_lead` (Senior Reviewer) → approve temp / archive / recommend transfer
- `admin` (Ownership Administrator) → execute ownership transfer
- `owner` → all

Disabled buttons render with tooltip when role insufficient.

## Notifications

After execution, invoke existing `notify-continuity-request` edge function with new `event_type` values (`temporary_stewardship_granted`, `archive_custodian_granted`, `ownership_transfer_completed`) so:
- New owner gets ownership confirmation email
- Internal admins get summary email
- (Estate/legal contact email left as future hook)

No new edge function unless current one cannot be parameterized — will be a small additive change.

## Out of scope (deferred)

- Rollback execution (only flag `rollback_eligible=false` stored; no UI).
- Real-time inter-admin notifications.
- Estate/legal external contact emails.
- Cryptographic snapshot signing beyond a computed SHA-256 `checksum` over the JSON payload.
- Enforcement of "Disabled User" alternative state (we ship `archived_owner` only).

## Files

**Created (~14):**
- 1 migration
- ~11 components under `execution/`
- 1 helper `executionConstants.ts`
- 1 hook `useContinuityExecution.ts`

**Edited:**
- `CaseReviewDialog.tsx` — add Execution tab
- `legacy-continuity/constants.ts` — new statuses, transfer scope labels, capabilities
- `notify-continuity-request` edge function — add new event types

Approve to proceed; migration runs first, then UI in one pass.