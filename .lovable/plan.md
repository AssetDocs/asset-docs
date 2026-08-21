# Audit: Protected Vault Segments (Legacy Continuity)

## Where it lives
The "Protected Vault Segments" card is in the Continuity Preferences page (`src/components/continuity/ContinuityPreferencesPage.tsx`), not in the Legacy Locker editor itself. Each row is a dropdown (not an on/off toggle) with six policy choices: Transfer allowed, Export allowed only, Requires additional documentation, Requires secondary verification, Never transfer, Preserve read-only.

Current rows: Secure Vault, Password Catalog, Family Archive, Legacy Locker, Property Records, Financial Documents, Personal Notes.

## Do the selections turn anything on or off? No.
Verified across the frontend, edge functions, migrations, and the live database:

- Selections are saved as free-text keys inside `legacy_locker.continuity_preferences.vault_segments` (JSON keyed by the display label string).
- Only one database function in the whole project reads `continuity_preferences`: `compute_continuity_readiness`. It merely checks that the `vault_segments` key *exists* to award one readiness checklist point. It never reads which policy was picked.
- No continuity execution path consults them. `execute_ownership_transfer`, `execute_archive_custodian`, `execute_temporary_stewardship`, `execute_memorialization`, and `authorize_continuity_export` contain no reference to `continuity_preferences`.
- No RLS policy, trigger, or edge function gates data on these values.
- The only other consumer is the admin `OwnerRiskPanel`, which dumps the raw JSON as read-only text for a human reviewer.

Conclusion: they are declarative owner intent for manual Asset Safe review. Functionally inert beyond one readiness point and an admin display. The same is true of the checkbox lists above them (incapacity / permanent incapacity / death), including "Allow Secure Vault access".

## Risk worth flagging
The UI copy implies protection ("Choose how each sensitive area should be handled"). Nothing enforces it, and there is no visible statement that these are guidance for manual review only — an owner could reasonably believe "Never transfer" is technically enforced.

## Proposed next step (pick a direction before any code changes)
Option A — Reframe as declared wishes (UI only, low risk):
- Rename the card to "Continuity Wishes by Area" or keep the name but add an explicit note: "These preferences guide Asset Safe's manual review of any continuity request. They are recorded instructions, not automatic system locks."
- Trim the list to areas that are genuinely vault/continuity-scoped and remove ones that don't belong (e.g. Family Archive, Financial Documents, Property Records, Personal Notes), leaving Secure Vault, Password Catalog, Legacy Locker, plus whatever you confirm.
- Migrate existing saved keys so no owner silently loses a recorded choice: keep removed keys in the stored JSON as legacy entries, hidden from the UI but still visible to admin review.

Option B — Make it enforced (backend work):
- Define a stable segment key vocabulary (slugs, not display labels) and map each to concrete tables/buckets.
- Have `authorize_continuity_export` and the execute_* functions read the policy and block or require extra documentation accordingly, with audit entries.
- This is a real continuity-engine change and should be planned separately.

## Technical notes
- Storage: `public.legacy_locker.continuity_preferences` JSONB, upserted wholesale by the preferences page.
- Keys are display strings, so any label rename orphans previously saved values. Any change should include a key normalization step.
- `DEFAULT_PREFS` pre-seeds "Password Catalog" and "Secure Vault" as `requires_secondary_verification`, which means the readiness point is effectively awarded as soon as the page is saved.
