

## Fix All Decorative Legacy Locker Fields — Make Every Field Saveable

### Problem
19 textarea fields across 6 sections look functional but have no `value` or `onChange` bindings and no corresponding database columns. Users can type into them, but the data is silently lost when they save.

### Decorative Fields by Section

| Section | Field IDs (19 total) |
|---------|---------------------|
| Personal (4) | `life_overview`, `digital_identity`, `personal_philosophies`, `medical_preferences` |
| Executor (4) | `executor_instructions`, `subscriptions`, `household_operations`, `financial_crypto` |
| Guardians (4) | `parenting_preferences`, `emotional_behavioral`, `developmental_goals`, `letters_to_children` |
| Assets (4) | `photo_video_documentation`, `physical_documents`, `sentimental_items`, `crypto_passwords` |
| Property (4) | `property_walkthrough`, `home_maintenance`, `neighborhood_contacts`, `rental_property` |
| Wishes (3) | `sentimental_distribution`, `legacy_messages`, `charitable_giving` |

### Solution

**Step 1 — Database migration**: Add all 19 text columns to the `legacy_locker` table. All nullable, no constraints.

**Step 2 — Wire up the component** (`src/components/LegacyLocker.tsx`):
- Add all 19 fields to the `LegacyLockerData` interface
- Add them to `formData` initial state (default `''`)
- Add `value={formData.xxx}` and `onChange` to each textarea
- Add them to the `textFields` array in `handleSave` (for encryption)
- Add them to the `textFields` array in `handleMasterPasswordSubmit` (for decryption)
- Map them in `fetchLegacyLocker` (for loading from DB)

### What does NOT change
- No layout or navigation changes
- No new sections or restructuring
- Existing wired fields remain untouched
- Encryption, admin access, save button, voice notes, uploads, trust — all unchanged

### Files Changed
| File | Change |
|------|--------|
| New migration SQL | Add 19 text columns |
| `src/components/LegacyLocker.tsx` | Wire all 19 fields to state, save, load, encrypt/decrypt |

