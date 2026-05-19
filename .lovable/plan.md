# Legacy Continuity Safeguards Expansion

This is a very large expansion (17 parts). Proposing a phased build with clear scope per phase so you can approve the whole roadmap, or trim phases before we start.

## Phase 1 — Database foundation (one migration)

**Extend existing tables**
- `legacy_locker` (owner preferences live here, keyed by user_id):
  add `continuity_preferences JSONB` (incapacity, permanent_incapacity, death, vault_segments, annual_reminder bool, last_reviewed_at, preferences_version int).
- `legacy_admins`:
  add `consent_acknowledged_at`, `consent_terms_version`, `consent_ip`, `consent_user_agent`, `consent_mfa_completed`, `continuity_preferences_version_at_consent`.
- `account_continuity_requests`:
  add `owner_dispute_status`, `owner_disputed_at`, `owner_dispute_reason`, `freeze_status`, `freeze_type`, `freeze_reason`, `freeze_applied_at`, `freeze_applied_by`, `waiting_period_starts_at`, `scheduled_execution_at`, `waiting_period_bypass_reason`, `risk_flags JSONB`, `owner_last_active_at`.
- `accounts`:
  add `account_freeze_status`, `account_freeze_type`, `memorialized` bool, `memorialized_at`, `memorialized_by`.

**New tables (all RLS — admin read, owner read where applicable)**
- `legacy_admin_consent_history` — full snapshot per consent event.
- `continuity_owner_notifications` — every owner email (type, recipient, delivery_status, opened_at, clicked_at, dispute_clicked_at, token_expires_at, related_case_id).
- `continuity_owner_dispute_tokens` — one-time tokens for dispute links (token hash, request_id, owner_user_id, expires_at, used_at).
- `continuity_account_freezes` — freeze history (type, reason, applied_by, applied_at, removed_at, removed_by).
- `continuity_billing_succession` — per-transfer billing state (status, payment_method_confirmed_at, terms_accepted_at, new_owner_id).
- `continuity_export_forensics` — per-export record (export_type, sections, file_hash, requested_by, approved_by, downloaded_by, downloaded_at, ip, user_agent).
- `continuity_document_retention` — adds retention_category, retention_expires_at, encryption_status, access_restriction, last_accessed_by/at to `continuity_documents` (extend existing table).
- `continuity_secondary_legacy_admins` — future-compatible model (schema only, no UI).
- `continuity_email_audit_log` — every continuity email send (admin/owner/legacy admin).

**New RPCs (SECURITY DEFINER, role/owner-gated)**
- `submit_continuity_dispute(token, reason)` — owner action.
- `apply_account_freeze(account_id, type, reason)` / `remove_account_freeze(...)` — admin.
- `record_owner_notification(...)`, `record_email_open(...)`, `record_email_click(...)`.
- `compute_continuity_readiness(user_id)` — returns score + checklist.
- `set_memorialized_mode(account_id, reason)` — admin.
- `bypass_waiting_period(request_id, reason)` — senior admin.

## Phase 2 — Owner-facing UI

New page/section: `src/components/continuity/ContinuityPreferences/` rendered inside the owner dashboard near Legacy Continuity.

Components:
- `ContinuityPreferencesPage.tsx` — container with the 7 sections.
- `LegacyAdminSummaryCard.tsx` — current designate + change/remove.
- `IncapacityPreferencesCard.tsx` — temp incapacity checkboxes.
- `PermanentIncapacityCard.tsx` — checkboxes + require docs.
- `DeathPreferencesCard.tsx` — checkboxes + executor/legal docs required.
- `VaultSegmentPreferencesCard.tsx` — per-segment policy selector.
- `ContinuityReadinessCard.tsx` — calm progress widget using `compute_continuity_readiness`.
- `AnnualReviewToggle.tsx` — opt-in reminder.
- `LegacyAdminConsentDialog.tsx` — required checkboxes + optional re-auth before save, writes `legacy_admin_consent_history`.

Owner dashboard alerts:
- `ContinuityRequestBanner.tsx` — persistent banner if active request, with "View Details / I Recognize / Dispute" actions.
- New page `/continuity/dispute` — handles token from email, shows confirmation, posts to `submit_continuity_dispute`, then displays freeze copy.

## Phase 3 — Owner notifications & email audit

Add 6 transactional Resend templates (using existing `@assetsafe.net` sender) wired through a small new edge function `send-continuity-notification`:
1. Request Submitted, 2. Under Review, 3. Additional Docs Requested, 4. Approved for Next Step, 5. Transfer Pending Execution, 6. Transfer Completed.

Each send writes a row to `continuity_owner_notifications` and `continuity_email_audit_log`. All "deny" CTAs use signed tokens stored in `continuity_owner_dispute_tokens`.

Hook into existing case state transitions in the admin Decision panel and the new execution RPCs so each transition triggers the right email automatically.

## Phase 4 — Admin workspace additions

Inside `CaseReviewDialog`, add 6 new tabs/sections (or a grouped "Owner & Risk" panel):
- `OwnerPreferencesPanel.tsx` — render legacy_locker.continuity_preferences for this account, with vault segment rules.
- `ConsentHistoryPanel.tsx` — table of `legacy_admin_consent_history`.
- `OwnerNotificationHistoryPanel.tsx` — table from `continuity_owner_notifications`.
- `OwnerActivityPanel.tsx` — last login, last email open, recent settings/password/billing/vault changes (joined views).
- `DisputeFreezeControls.tsx` — dispute banner, apply/remove freeze, escalate.
- `WaitingPeriodPanel.tsx` — start/scheduled/remaining, override controls.

## Phase 5 — Execution-layer integration

Update the existing execution panel/RPCs (from prior turn) so:
- `execute_ownership_transfer` refuses to run if `owner_dispute_status='disputed'`, `freeze_status` is active, or waiting period unfulfilled (with senior-only bypass via `bypass_waiting_period`).
- Approval transitions to "Transfer Approved – Waiting Period" instead of immediate execute, with default 7-day window.
- Billing succession block — pre-execution gate that requires `continuity_billing_succession.status='accepted'` (or admin override with audit note).
- Memorialized mode added as a 4th scope alongside Temporary/Archive/Transfer.

## Phase 6 — Forensics, retention, risk

- Add risk-flag computation when a request is submitted (recent owner activity, recent password/email change, MFA disabled, multiple requests, etc.) — written into `risk_flags`.
- Export actions write into `continuity_export_forensics` + audit log; sensitive segment exports show confirm dialog before download.
- Document upload UI captures retention_category + retention_expires_at.

## Permissions

Reuse existing `capabilitiesForRole`. Add new caps:
- `apply_freeze`, `remove_freeze`, `bypass_waiting_period`, `set_memorialized_mode` — Senior Reviewer + above.
- `resolve_dispute` — Senior Reviewer + above.

## Out of scope (this round)

- Real second-device MFA confirmation on dispute (we accept existing logged-in session as auth).
- Open/click pixel tracking — we record `delivery_status` from Resend webhooks only.
- Secondary Legacy Admin full UI (schema only).
- Automatic retention deletion job (UI-only retention metadata).
- IP/device geo lookup — store IP + UA only.
- New ActivityCampaign / external CRM events.

## Scope

This is a multi-day build (~30–40 new files, 1 large migration, 1 new edge function, 6 email templates, integration into existing Execution Panel and CaseReviewDialog). Lines of code in the high thousands.

## Recommended question before we start

Because each phase is large and partially independent, please answer one of:

A. **Build all 6 phases now** in a single sweep (long agent run, many files).
B. **Build Phases 1 + 2 first** (database + owner-facing preferences/dispute UI), then iterate — recommended.
C. **Build Phases 1 + 4 + 5 first** (database + admin workspace + execution integration), then add owner UI/emails.
D. **Trim** — list any parts (e.g. memorialized mode, secondary legacy admin, export forensics) to defer or drop.

Reply with the letter (or specify a custom subset) and I will start with the migration immediately.