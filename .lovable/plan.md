# Simplify Legacy Continuity and Secure Vault

Remove the continuity policy/automation layer from the Legacy Locker tab, keep a single simplified "Legacy Instructions" card, and leave Secure Vault, Digital Access, Recovery Delegate, Admin Access Control, and Legacy Admin assignment untouched.

## Pre-work audit findings (verified now)

Account preference dropdown (item 5)
- Current options: `maintain` (keep account active), `export` (release data to Legacy Admin / family), `close` (wind down and close).
- Stored in `public.legacy_locker.continuity_preference` (text), written by the instructions card.
- No database function contains any reference to `continuity_preference` (checked every function body in `public`), and no edge function or other frontend file reads it. It is a stored, human-read value only — no execution, no ownership-transfer or custodian semantics.
- Conclusion: the dropdown carries no automation liability. Recommendation is to keep the three options as-is and only soften the label wording ("Export — make my data available to my Legacy Admin / family" instead of "release"). No option is removed in this pass unless you say so.

Continuity Heartbeat (item 3)
- The heartbeat columns (`continuity_heartbeat_enabled`, `_interval_days`, `_last_heartbeat_at`, `_next_heartbeat_due_at`, `_status`) **do not exist** on `legacy_locker`, and `record_continuity_owner_heartbeat` does not exist in the database. The UI was reading and writing fields that were never created, so the whole card is dead code today.
- No cron job references heartbeat (all 16 scheduled jobs reviewed: gift, billing, storage, retention, closure, restore-drill). No edge function, email, or notification exists for it.

Readiness (items 1 and 12)
- `compute_continuity_readiness` still exists and is called from exactly one place, the Continuity Preferences page. Nothing else in the frontend, edge functions, or other database functions calls it. It becomes orphaned once the page is removed; it will be reported, not dropped, in this pass.

Continuity execution functions (item 11)
- `execute_ownership_transfer`: no caller anywhere in the frontend or edge functions — orphaned.
- `execute_archive_custodian`, `execute_temporary_stewardship`, `execute_memorialization`, `authorize_continuity_export`: each still called from the admin Legacy Continuity execution forms (`ArchiveCustodianForm`, `TemporaryContinuityAccessForm`, `MemorializationForm`, `AuthorizeExportForm`). These are admin-review flows, not user-preference driven, so they stay untouched.
- Admin Access Control has no dependency on the removed preference structures.

## Changes

Frontend
- Delete `src/components/continuity/ContinuityPreferencesPage.tsx` and its import/render in `src/pages/Account.tsx`. This removes the readiness bar and checklist, the temporary-incapacity, permanent-incapacity, and death cards, the Annual Review Reminder toggle, and the Continuity Heartbeat card in one step.
- Rename `AccountContinuityInstructions` heading to **Legacy Instructions** with the supporting copy "Leave guidance for the people you trust if you are ever unable to manage your account yourself." Keep Selected Legacy Admin, Account preference, Notes for family or support, and Save Instructions exactly as they work today. Add a short line making clear these are stored instructions Asset Safe does not execute automatically.
- Resulting Legacy Locker tab order: Continuity request banner (unchanged) → Legacy Instructions → Secure Vault (Recovery Delegate, Admin Access Control, Digital Access, Legacy Locker).
- Admin `OwnerRiskPanel`: drop the heartbeat badges and the heartbeat/annual columns from its `select`, and drop the `continuity_preferences` JSON dump plus the "Last reviewed / Version" line, since those preferences no longer exist. Leave the rest of the panel intact.

Database
- One migration: drop the now-unused `legacy_locker` columns `continuity_preferences`, `continuity_preferences_version`, `continuity_preferences_reviewed_at`, `continuity_annual_reminder` (verified: no function, trigger, view, or policy references them), and drop `compute_continuity_readiness`.
- Keep `continuity_preference`, `continuity_notes`, `continuity_notes_encrypted` (Legacy Instructions), and all continuity request/execution tables and functions.

Not touched
Secure Vault gating and passphrase flow, encryption/decryption, vault relock, Digital Access, Legacy Locker fields, Recovery Delegate, Admin Access Control, Authorized User permissions, Legacy Admin assignment, `account_continuity_requests` and the admin review workflow.

## Verification
- Repo-wide search for `readiness`, `heartbeat`, `annual_reminder`, `continuity_preferences`, `vault_segments`, `incapacit` returns no live references outside migration history and docs.
- Typecheck clean; Legacy Instructions saves and reloads (including encrypted notes when the vault is unlocked); Legacy Admin badge still renders; Secure Vault still locks and unlocks; admin Owner & Risk panel renders without the removed fields.
- Report at the end: `execute_ownership_transfer` and `compute_continuity_readiness` orphan status, plus a note that `docs/AssetSafe_Continuity_Legacy_Operations.md` still documents heartbeat/readiness and needs a follow-up doc pass.
