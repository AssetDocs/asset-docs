# Retire Protected Vault Segments (Option C)

Remove the unenforced vault-segment policy system before launch. No data migration or legacy compatibility, since there are no live users.

## Frontend — `src/components/continuity/ContinuityPreferencesPage.tsx`
- Delete the entire "Protected Vault Segments" card (heading, description, and all segment dropdowns).
- Delete the now-dead constants `VAULT_SEGMENTS` and `SEGMENT_POLICY`, and the unused `Select`/`Label`/`Lock` imports if nothing else uses them.
- Remove the `vault_segments` block from `DEFAULT_PREFS`, so saved preferences contain only `incapacity`, `permanent_incapacity`, and `death`.
- On load, strip any `vault_segments` key from the fetched `continuity_preferences` so a stale value can never be re-saved.
- Remove the `vault_prefs` entry from `READINESS_LABELS` ("Secure Vault preferences configured").
- No renamed replacement section. Annual Review Reminder and Continuity Heartbeat are untouched, including the heartbeat upsert fields and `record_continuity_owner_heartbeat` call.

## Database — `compute_continuity_readiness`
Migration replacing the function:
- Drop the `v_vault_prefs` variable, its `continuity_preferences ? 'vault_segments'` check, its increment, and the `vault_prefs` checklist key.
- Change `max` from 8 to 7 and the percentage divisor from 8 to 7, so score, denominator, and percentage stay consistent.
- Remaining 7 items: legacy_admin_assigned, mfa_enabled, backup_email_verified, continuity_prefs, export_prefs, emergency_contact, reviewed_within_12_months.
- No default or replacement point is added.
- One-time data cleanup in the same migration: `UPDATE public.legacy_locker SET continuity_preferences = continuity_preferences - 'vault_segments' WHERE continuity_preferences ? 'vault_segments';` — other keys in the JSON are preserved.

Nothing else in the database reads `continuity_preferences`, so no other function changes.

## Admin — `src/components/admin/legacy-continuity/OwnerRiskPanel.tsx`
The panel prints the whole `continuity_preferences` JSON rather than a segments-specific block, so once the key is removed and cleaned up it no longer displays retired data. No structural change needed there; verify by reading the rendered JSON after the migration. Heartbeat badges and review/version line stay.

## Explicitly out of scope
- No changes to `execute_ownership_transfer`, `execute_archive_custodian`, `execute_temporary_stewardship`, `execute_memorialization`, or `authorize_continuity_export`.
- No new Secure Vault transfer/access logic. Legacy Locker and Digital Access remain gated by the Secure Vault unlock.
- No changes to Authorized User permissions or Legacy Admin behavior.

## Verification after implementation
1. Grep the repo for `vault_segments`, "Protected Vault Segments", and the six policy slugs (`transfer_allowed`, `export_only`, `requires_additional_docs`, `requires_secondary_verification`, `never_transfer`, `preserve_read_only`) — only historical migration files should still contain them.
2. Load Continuity Preferences: no segments card; save succeeds; reload shows the same checkbox state.
3. Query a saved row and confirm `continuity_preferences` has no `vault_segments` key.
4. Call `compute_continuity_readiness` and confirm `max` is 7, the checklist has 7 keys, and `percentage` equals `round(score/7*100)`.
5. Toggle Annual Review Reminder and Heartbeat on/off and confirm cadence, `last`, `next`, and status persist as before.
6. Open the admin Owner Preferences tab and confirm no retired data appears.
