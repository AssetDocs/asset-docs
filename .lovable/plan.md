## Legacy Continuity Admin Workspace

Build a dedicated case management area inside the Admin Owner Workspace for reviewing Legacy Continuity requests. This is a large feature — proposing a phased plan so you can approve scope before implementation.

### Placement

Add a new top-level tab **"Legacy Continuity"** to `AdminOwnerWorkspace.tsx` (between Security and Legal). The tab renders a new `LegacyContinuityWorkspace` component containing 7 sub-tabs:

1. Request Queue
2. Active Reviews
3. Temporary Access
4. Ownership Transfers
5. Denied Requests
6. Archived Cases
7. Audit Log

### Database (one migration)

Extend the existing `account_continuity_requests` table with admin review columns:
- `risk_level`, `assigned_reviewer_id`, `priority`, `completed_at`, `preservation_hold` (bool)

Add new tables (all RLS-restricted to admins via `has_owner_workspace_access` / `has_any_app_role`):
- `continuity_documents` (mirror metadata from storage; per-file verification_status, reviewer_notes, category)
- `continuity_checklist_items` (identity, legal authority, account safety checklist with status)
- `continuity_notes` (internal admin notes with category)
- `continuity_messages` (outbound communications)
- `continuity_timeline_events` (chronological events)
- `continuity_temporary_access` (grants with permissions JSONB, expires_at)
- `continuity_ownership_transfers` (multi-step transfer workflow tracking)
- `continuity_audit_logs` (immutable admin action log)

Add a helper RPC `log_continuity_event` for writing timeline + audit log rows in one call.

### Components (under `src/components/admin/legacy-continuity/`)

- `LegacyContinuityWorkspace.tsx` — tab container + metric cards header
- `RequestQueueTab.tsx` — filterable/sortable table with status & risk badges
- `ActiveReviewsTab.tsx` — focused list of in-progress cases
- `TemporaryAccessTab.tsx` — active grants table with extend/revoke/modify actions
- `OwnershipTransfersTab.tsx` — multi-step transfer pipeline view
- `DeniedRequestsTab.tsx` — read-only denied list
- `ArchivedCasesTab.tsx` — read-only completed/archived cases
- `AuditLogTab.tsx` — filterable immutable log view
- `CaseReviewDialog.tsx` — large dialog with 3-zone layout:
  - **Left:** `CaseSummarySidebar.tsx` (case info, account holder, legacy admin)
  - **Center:** tabbed sections — Request Summary, Requested Actions, Documents, Identity & Authority Checklist, Timeline, Internal Notes, Communication Center
  - **Right:** `DecisionPanel.tsx` (assign reviewer, change status, request info, preservation hold, grant temp access, start ownership transfer, deny, complete)
- `OwnershipTransferWizard.tsx` — 5-step deliberate flow (recommendation → senior approval → invitation → acceptance tracking → final execution with TRANSFER text confirmation)
- `TemporaryAccessDialog.tsx` — permissions toggles + expiration + reason
- Shared `constants.ts` for status/risk labels, badge classes, denial reasons, message templates

### Permissions

Use existing `useAdminRole` hook. Map app_role → continuity capability:
- `qa` / support → view + notes + messages only
- `developer` → + checklist + recommend
- `dev_lead` → + approve temp access + preservation hold
- `admin` → + execute ownership transfer
- `owner` → full

Disabled actions show tooltip: "Requires Senior Reviewer permission."

### Important constraints honored

- No "claim account" language anywhere
- No one-click ownership transfer — requires recommendation, senior approval, invitation, acceptance, TRANSFER text confirmation
- Reason required for: deny, grant temp access, preservation hold, recommend transfer, execute transfer
- Temp access always has expiration
- Archived cases read-only
- Every meaningful action writes to timeline + audit log
- Calm institutional styling using existing semantic tokens (muted/border/amber/emerald/rose), no celebratory colors

### Out of scope (this round)

- Actually sending emails for messages (logs them; wires to existing `notify-continuity-request` only)
- Real preservation hold enforcement at the data layer (flag set + UI gating only; deeper enforcement is a follow-up)
- Real-time inter-admin notifications
- Encrypted document viewing tools beyond signed-URL download/view
- Senior approval as separate auth gate beyond role check (no second-device confirmation)

### Files

**Created (~15):**
- 1 migration
- ~12 components under `src/components/admin/legacy-continuity/`
- 1 `constants.ts`, 1 `types.ts`

**Edited:**
- `src/components/admin/AdminOwnerWorkspace.tsx` (add tab)

### Estimated scope

This is a substantial build (~2500–3500 lines across components + migration). Approving the plan kicks off the migration first, then the UI in a single follow-up pass.

Approve to proceed, or tell me which screens/tabs to trim or defer.
