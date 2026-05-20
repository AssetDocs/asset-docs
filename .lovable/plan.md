
# Continuity & Preservation Refactor

This is a large, multi-area change. To keep risk low and preserve audit history, I'll do it in **four sequenced passes** rather than one giant migration. Each pass is shippable on its own.

## Guiding rules (apply everywhere)

- **Non-destructive migration.** Existing ownership-transfer tables, RPCs, and audit rows stay in the DB for history. We **hide** them from UI, **disable** their execution paths, and stop referencing them in new flows.
- **No ownership/inheritance language** anywhere user-visible (UI, emails, status labels, admin badges, audit-event display strings). Backend column names may keep legacy identifiers where renaming would break references; display layer translates.
- **Owner silence ≠ approval.** Already enforced by the dispute/waiting-period guard — reinforced in new closure & memorialization flows.
- **Every action writes an audit row** via the existing `log_continuity_event` RPC.

---

## Pass 1 — Terminology + UI hiding (no schema changes)

Goal: ship the rebrand and remove ownership-transfer surfaces immediately.

**Shared rename map** in a new `src/lib/continuityTerms.ts` (single source of truth, imported by every component below):

| Old | New |
|---|---|
| Legacy Admin | Continuity Steward |
| Legacy Continuity | Continuity & Preservation |
| Ownership Transfer / Transfer Ownership | Grant Continuity Access / Stewardship Access |
| Successor Owner / New Owner | Designated Steward |
| Transfer Execution Panel | Continuity Action Panel |
| Ownership Review | Continuity Review |
| Permanent Transfer | Preservation Stewardship |

**Files touched (rename-only, no behavior change):**
- `src/components/LegacyAdminAssignment.tsx` → user-facing strings updated, file kept at same path.
- `src/components/legacy-continuity/*` → all labels, status text, request-type options, wizard copy.
- `src/components/admin/legacy-continuity/constants.ts` → STATUS_LABEL, REQUEST_TYPE_LABEL, risk labels.
- `src/components/admin/legacy-continuity/LegacyContinuityWorkspace.tsx` → header → "Continuity & Preservation"; tab list updated (see below).
- `src/components/admin/legacy-continuity/CaseReviewDialog.tsx` → tab + sidebar labels.
- `src/components/admin/legacy-continuity/OwnerRiskPanel.tsx` → "Continuity Steward Info".
- `src/pages/ContinuityDispute.tsx`, `src/components/continuity/ContinuityRequestBanner.tsx`, `src/components/continuity/ContinuityPreferencesPage.tsx` → all owner-facing copy.

**Admin tab restructure** in `LegacyContinuityWorkspace.tsx`:
- New tabs: Request Queue · Active Reviews · Temporary Stewardship · Export Requests · Memorialized Accounts · Closure Requests · Disputed Requests · Audit Logs.
- **Remove from nav:** "Ownership Transfers" tab.
- The `OwnershipTransfersTab.tsx` file stays on disk for now (history) but is no longer routed.

**Hide ownership-transfer execution surfaces:**
- `ContinuityExecutionPanel.tsx` → remove "Full Ownership Transfer" from `TransferScopeSelector`; show only Temporary Stewardship, Export, Memorialization, Preservation, Closure.
- `OwnershipTransferForm.tsx` → render a disabled "Ownership transfer is deprecated. Use Grant Continuity Access." stub. Keep the file so any deep links don't 500.
- Add a server guard: a new SQL trigger on `account_continuity_requests` rejects writes that set `status` to `ownership_transfer_pending` going forward (existing rows untouched).

**Email subjects/bodies** in `dispatch-continuity-event/index.ts` rewritten to use the new vocabulary. No structural change to the dispatcher — just template strings.

---

## Pass 2 — Expanded owner preferences

Goal: deliver the full "Continuity Preferences" screen spec.

**Schema (migration):**
- Extend `legacy_locker.continuity_preferences` JSONB to support the 5 sections (temporary incapacity, permanent incapacity, death, protected areas per-segment, readiness). Backwards-compatible — old shape continues to read.
- Add `legacy_locker.continuity_preferences_last_reviewed_at` (already exists as `continuity_preferences_reviewed_at` — reuse).

**UI:** rewrite `src/components/continuity/ContinuityPreferencesPage.tsx` into 5 collapsible sections matching the spec exactly, with the defaults you listed (manual review on temp incapacity; Secure Vault + Password Catalog default to "requires additional verification"; Family Archive defaults to "preserve read-only"). Readiness widget pulls from MFA status, backup email, last-reviewed-at, etc.

---

## Pass 3 — New action types + schema

Goal: support Memorialization, Preservation Mode, and Closure as first-class continuity actions.

**Migration adds 4 tables** (matching your spec, with RLS):
- `memorialized_accounts` (account_id, request_id, memorialized_at, steward_access_level, export_allowed, billing_handling_status, reason)
- `preservation_states` (account_id, request_id, state_type, restrictions JSONB, applied_at, status)
- `closure_requests` (request_id, account_id, status, waiting_period_starts_at, waiting_period_ends_at default `+30 days`, snapshot_reference, completed_at, cancellation_reason)
- `dispute_flags` (already partially covered by existing `owner_dispute_*` cols on requests — add this table only for non-owner-initiated disputes; otherwise reuse).

**Existing tables we keep and reuse** (no rename to avoid breaking types.ts):
- `account_continuity_requests` → adds new allowed values for `request_type`: `memorialization`, `account_preservation`, `account_closure`. New status values: `approved_memorialization`, `approved_preservation`, `closure_waiting_period`, `closure_completed`, etc.
- `continuity_temporary_access` → unchanged (already models temp stewardship).
- `continuity_ownership_transfers` → marked deprecated in a SQL COMMENT; no new rows written.
- `continuity_audit_logs` → unchanged, used for all new actions.

**RPCs:**
- `execute_memorialization(_request_id, _steward_access_level, _export_allowed, _billing_handling_status, _reason)` — writes memorialized_accounts row, sets account.status='memorialized', writes audit + timeline event. Calls existing `enforce_continuity_execution_guard` first.
- `execute_preservation_mode(_request_id, _state_type, _restrictions, _reason)` — analogous.
- `approve_closure_request(_request_id, _waiting_days default 30, _reason)` — creates closure_requests row with waiting period, sets status, notifies owner + steward via dispatch-continuity-event.
- `complete_closure(_closure_id, _override boolean default false)` — guarded; refuses if waiting period not elapsed AND `_override=false`. Creates archive snapshot via existing `create_continuity_snapshot`.
- `cancel_closure(_closure_id, _reason)` — restores account.

**Note on owner role:** the existing `execute_ownership_transfer` RPC is **not deleted** (audit history), but a new `REVOKE EXECUTE … FROM authenticated, anon, service_role` revokes call rights. Internal callers are gone (Pass 1 removed UI). If any other code path still references it, the revoke makes it inert.

---

## Pass 4 — New admin Continuity Action Panel + closure UX

Goal: replace the execution panel UX with the 7-action panel.

**New components under `src/components/admin/legacy-continuity/action-panel/`:**
- `ContinuityActionPanel.tsx` — replaces the rendered `ContinuityExecutionPanel`. Same gating (only on approved/ready statuses). Renders the 7 action forms as Cards.
- `GrantTemporaryStewardshipForm.tsx` (wraps existing TemporaryStewardshipForm with relabeled copy + permission toggles per spec).
- `AuthorizeExportForm.tsx` (export scope checkboxes, expiration, download limit, sensitive-area confirmation).
- `ActivateMemorializationForm.tsx` (steward access level, export, billing handling).
- `ActivatePreservationForm.tsx` (restrictions checkboxes).
- `ApproveClosureForm.tsx` (waiting-period selector default 30d, owner-notice toggle, snapshot toggle, confirmation modal with required wording).
- `FreezeAccountForm.tsx` (4 freeze types — reuses existing `apply_account_freeze` RPC).
- `DenyRequestForm.tsx` (denial reason enum + internal note + optional steward message).

**Pre-action checklist** (`PreActionChecklist.tsx`) — single shared component used by every action form; renders the 13 checklist items from your spec; disables Execute button until required items pass; auto-derives several items (dispute window, freeze status, etc.) from server state.

**Continuity Action Preview** (`ContinuityActionPreview.tsx`) — generic preview dialog, replaces `TransferPreviewDialog`. Includes the required confirmation paragraph: *"This action does not determine legal ownership or inheritance rights…"*

**Closure waiting-period banner** in `CaseReviewDialog` header when status = `closure_waiting_period`, showing countdown and "Cancel Closure" / "Complete Closure (after waiting period)" buttons.

---

## Email notification updates

`supabase/functions/dispatch-continuity-event/index.ts` gets:
- Rewritten subject + body templates for every existing event in the new vocabulary.
- New events: `memorialization_approved`, `memorialization_activated`, `preservation_activated`, `closure_requested`, `closure_waiting_period_started`, `closure_export_reminder`, `closure_completed`, `closure_cancelled`.
- All owner action links continue to use signed expiring tokens (existing mechanism).
- `eventForStatus()` in `src/lib/continuityNotifications.ts` extended for new statuses.

---

## What I am NOT doing in this pass

- Not deleting any existing table, RPC, or audit row.
- Not changing the storage bucket structure (`continuity-documents` stays).
- Not building memorialized-account read-only enforcement across the rest of the app (Family Archive, Vault, etc. respect `accounts.status='memorialized'` via existing RLS in a follow-up; this pass adds the flag and admin tooling).
- Not migrating in-flight ownership-transfer cases (none exist in DB — verified earlier).

---

## Confirm before I start

This is ~3 migrations, ~15 new files, ~25 modified files, and 1 edge-function rewrite. **Shall I proceed with all four passes in this single response**, or would you prefer I ship Pass 1 (rebrand + hide) first so you can review tone/copy before I commit to the schema and new admin panel?
