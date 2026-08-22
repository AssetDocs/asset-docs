# Continuity / Secure Vault Terminology Audit — Findings

Read-only audit complete. No code, SQL, copy, or docs were changed. Verified against the live database (columns, functions, row counts) and the full repo (`src`, `supabase/functions`, `docs`).

## A. Clean — already consistent with the current model

- **No user-facing "Recovery Delegate" copy anywhere.** The only textual hits are a retirement section in `docs/AssetSafe_Continuity_Legacy_Operations.md` and one internal comment.
- **Protected Vault Segments: fully gone.** Zero hits for `vault_segments`, `never_transfer`, `preserve_read_only`, `requires_secondary_verification`, `transfer_allowed`, `export_only` in any active code.
- **Heartbeat / Annual Review / Readiness scoring: fully gone.** No `heartbeat`, `annual_reminder`, `compute_continuity_readiness`, or `reviewed_within_12_months` in UI, admin UI, edge functions, cron, or the database. Remaining "readiness" hits are unrelated marketing copy (insurance/disaster readiness).
- **Emails are clean.** Continuity emails only mention ownership transfer as reassurance ("No ownership transfer has occurred"), which matches the current model. No email mentions Recovery Delegate, Temporary Stewardship, or Archive Custodian.
- **Ownership transfer execution is genuinely retired.** `execute_ownership_transfer` no longer exists in the database; `TransferScopeSelector` explicitly excludes transfer; `OwnershipTransfersTab` is a labeled historical view.
- **Secure Vault copy is correct.** It states the Legacy Admin *may request* recovery access and that the owner approves or denies — no claim of automatic access, and Digital Access + Legacy Locker both inherit the vault gate.
- **Authorized User roles exposed in the AU flow are only Full Access and Read Only.** No AU picker offers delegate/steward/custodian/successor.

## B. Stale references to remove

### B1. Broken queries against dropped columns (highest priority — live errors)
`legacy_admins` no longer has `designation_role` or `designation_priority` (confirmed against the live schema), but four files still select/order by them, so those queries fail and the panels render blank or fall back to placeholders:

| File | Stale term |
| --- | --- |
| `src/components/AccountContinuityInstructions.tsx` (~48-63) | selects both columns; appends `(secondary)` to names |
| `src/components/admin/legacy-continuity/CaseSummarySidebar.tsx` (~45, 76) | orders by priority; renders "Designation Role" |
| `src/components/admin/legacy-continuity/execution/CurrentOwnershipSummary.tsx` (~26-39) | selects both; renders a multi-admin list |
| `src/components/admin/legacy-continuity/execution/ProposedSuccessorSummary.tsx` (~28-50) | orders by priority; "Legacy Admin role" row |

Correction: select only `legacy_admin_user_id, status`, filter `status = 'active'`, drop the primary/secondary wording, and render a single Legacy Admin.

### B2. Legacy Locker still writes the system-maintained mirror
`src/components/LegacyLocker.tsx` (~707) includes `delegate_user_id: selectedDelegateId` and `recovery_grace_period_days` in its save payload. `delegate_user_id` is now trigger-protected, so any save from this path risks being rejected outright. Correction: drop both fields from the payload and remove the now-unused delegate state (`selectedDelegateId`, `gracePeriodDays` setters at ~463-513).

### B3. Dead delegate-selection state in Secure Vault
`src/components/SecureVault.tsx` retains `selectedDelegateId`, `originalDelegateId`, `hasDelegateChanges`, `isSavingDelegate`, and a "Recovery delegate state" comment after the picker was removed. Correction: keep only what the read-only recovery summary and the Legacy Admin unlock view need.

### B4. Retired continuity outcomes still offered and executable
- `src/components/legacy-continuity/types.ts`: `REQUEST_TYPE_OPTIONS` and `REQUESTED_OUTCOMES` present **Temporary Continuity Access** as a selectable choice to families.
- `src/components/admin/legacy-continuity/execution/TemporaryContinuityAccessForm.tsx` calls `execute_temporary_stewardship`, and `ArchiveCustodianForm.tsx` calls `execute_archive_custodian` — both RPCs still exist in the database, so these admin buttons are live paths into retired capabilities.
- `TemporaryAccessTab.tsx`, `DecisionPanel.tsx` (writes `continuity_temporary_access`, sets `temporary_access_granted`), `ExecutionCompletionScreen.tsx` ("Archive Custodian Access Granted"), `executionConstants.ts` (`archive`, `approved_temporary`), and `TransferPreviewDialog.tsx` (a `scope === 'transfer'` branch) all still present them as current.

Correction: remove Temporary Continuity Access and Archive Custodian from selectable request types, outcomes, and admin execution forms; keep their **status labels** for historical rows only.

### B5. Stale naming and docs
- `src/components/OnboardingProgress.tsx`: `hasRecoveryDelegate` state name (label already reads "Assign a Legacy Admin").
- `docs/AssetSafe_Continuity_Legacy_Operations.md` (lines 35-36, 296) still states an account may have one primary plus additional secondary Legacy Admins.
- `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md` (line 30) sets up a tabletop with primary and secondary Legacy Admins.

## C. Intentional legacy / internal references to keep

- **`vault_delegate_grants`, `vault_delegate_keypairs`, `src/lib/delegateKeypair.ts`, `src/lib/delegateGrants.ts`, `recoveryEncryption.ts`.** These are accurate low-level names for delegate-key wrapping and expose no role choice to users. A crypto rename is not worth the risk.
- **`legacy_locker.delegate_user_id` and the edge functions reading it** (`submit-recovery-request`, `respond-recovery-request`, `send-delegate-access-email`, `acknowledge-delegate-access`, `check-grace-period-expiry`) — this is the enforced mirror of the active Legacy Admin; `submit-recovery-request` already cross-checks `legacy_admins`.
- **Legacy request-type and status labels** (`ownership_transfer: 'Legacy Admin Access (legacy)'`, `temporary_access_granted`, `approved_temporary`) — required to render historical rows.
- **`OwnershipTransfersTab`** as an explicitly labeled retired-history view, plus all historical migrations and generated Supabase types.

## D. Architectural leftovers worth reviewing separately (not touched)

- **`contributors` system.** The table currently holds **0 rows**, yet ~30 live consumers remain, several of which still make access decisions: `SecureVault.tsx` grants vault visibility on `role === 'administrator'`, `LegacyLocker.tsx` blocks non-administrators, and `ManageTab.tsx` exposes an administrator-initiated account-deletion flow. This duplicates `account_memberships` and is a strong candidate for staged retirement.
- **User-facing copy that still advertises three AU permission levels:** `src/components/HomeFAQ.tsx` (~37) and `src/components/admin/SystemInfrastructure.tsx` (~584) describe administrator / contributor / viewer.
- **Orphan-ish continuity tables:** `continuity_temporary_access`, `continuity_archive_custodian_access`, `continuity_ownership_transfers` — all 0 rows; keep only if history rendering is wanted.
- **Live retired RPCs:** `execute_temporary_stewardship`, `execute_archive_custodian` still exist and are reachable from admin UI.
- **Demo/sample surfaces:** `DemoLegacyLocker.tsx`, `SampleDashboard.tsx` reference the contributor model.

## Proposed follow-up (needs approval before any change)

1. Fix B1 (broken `designation_role` / `designation_priority` queries) and B2 (Legacy Locker mirror write) — these are functional defects, not cosmetics.
2. Clean B3 dead state, B5 naming, and the two docs.
3. Remove Temporary Continuity Access and Archive Custodian from selectable user requests and admin execution forms (B4), keeping historical labels; then drop the two retired RPCs in a separate migration.
4. Handle D (contributors retirement, AU copy, orphan tables) as its own scoped project.

Approve to proceed with steps 1-2 only, or tell me to include step 3.
