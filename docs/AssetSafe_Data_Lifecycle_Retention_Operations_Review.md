# Asset Safe Data Lifecycle & Retention Operations Review

Date: 2026-07-01
Status: Current launch gap addendum

This addendum refreshes the earlier developer review of `AssetSafe_Data_Lifecycle_Retention_Operations.md` after the recent retention, export, storage, cron, and evidence fixes. It should be used as the current checklist of remaining data-lifecycle launch risks.

## Closed Since Initial Review

- `deleted_accounts` tombstone references and anonymization behavior have been implemented and smoke-tested.
- Storage deletion jobs, orphan review, storage usage drift reconciliation, expired export cleanup, and retention-expiration sweepers now have backing tables/functions and cron health rows.
- The private `exports` bucket exists and is private.
- Server-managed account export bundle support is in place, including audit columns and download/expiration controls.
- `process-expired-exports`, `process-storage-deletion-jobs`, `process-storage-orphans`, `process-storage-usage-drift`, `process-retention-expirations`, `process-account-closures`, `scrub-old-support-pii`, and `quarterly-restore-drill-reminder` have been scheduled and smoke-checked.
- Internal lifecycle cron authentication now uses `ASSETSAFE_SECRET_KEYS` / `assetsafe_secret_keys` through the shared helper.
- `reverse-account-closure` now restores account status from entitlement state instead of always forcing `cancelled_billing_active`.

## P0 Remaining Launch Items

### 1. Owner-operated restore drill evidence

Current state: restore drill tables, admin surfaces, and reminder function exist.

Remaining gap: a real owner-operated PITR/restore drill must still be performed and signed off before launch.

Recommended next step:

- Run the restore drill using `docs/AssetSafe_Backup_Restore_Runbook.md`.
- Record the run in `restore_drill_runs`.
- Verify database, storage, auth, edge, and signed-url smoke checks.
- Complete signoff in the admin restore surface.

### 2. Account deletion outbox and retry semantics

Current state: account deletion performs pre-delete storage cleanup and aborts if cleanup fails.

Remaining risk: if cleanup fails, the user-facing deletion flow still depends on retrying the edge function rather than a durable outbox/lease model.

Recommended next step:

- Move hard-delete work into an account-deletion job/outbox table.
- Keep storage refs and row metadata available until each deletion job succeeds.
- Add admin visibility for blocked deletion jobs.

### 3. Legal hold operational signoff

Current state: legal hold fields and review workflow exist.

Remaining risk: operator/counsel policy for when to place, remove, or override legal hold still needs formal signoff.

Recommended next step:

- Add the legal hold policy owner and response SLA to the operator checklist.
- Confirm which sweepers must skip legal-hold accounts.
- Record review outcome in the legal hold admin workflow.

## P1 Remaining Launch Items

### 4. Storage object lifecycle external controls

Current state: app-level sweepers and bucket policy inventory exist.

Remaining gap: provider-level lifecycle/replication posture still needs owner confirmation.

Recommended next step:

- Confirm whether production requires cross-region object replication or secondary storage backup.
- Record the decision in `AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`.
- If deferred, add it to post-launch risk register.

### 5. Export end-to-end evidence cadence

Current state: managed export bundle generation, download, and expiration have been repaired and smoke-tested.

Remaining gap: periodic evidence should be captured so export regressions are visible.

Recommended next step:

- Add a monthly export round-trip check to launch/ops evidence.
- Verify `account_export_audit` status progression, bucket object creation, signed URL download, and expiration cleanup.

### 6. Retention schedule legal language

Current state: technical retention behavior is largely implemented.

Remaining gap: final user-facing retention language still needs legal review.

Recommended next step:

- Align Privacy Policy/TOS language to the implemented tombstone/anonymization model.
- Confirm tax, billing, consent, audit, support, and legal evidence retention windows.
- Document DSAR handling and user notification timelines.

## Documentation Corrections Needed

Update `AssetSafe_Data_Lifecycle_Retention_Operations.md` before treating it as the source of truth:

- Replace stale `closure_pending` / `deletion_pending` state names with implemented states: `active`, `expired_read_only`, `cancelled_billing_active`, `deletion_requested`, `scheduled_for_deletion`, and `deleted`.
- Reflect the current managed export bundle model and private `exports` bucket.
- Update cron inventory with the now-scheduled lifecycle sweepers and their observed health behavior.
- Update closure reversal behavior to describe entitlement-based restoration.
- Separate implemented retention behavior from owner/legal policy decisions that still require signoff.
