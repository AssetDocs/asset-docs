

## Audit and Enhance PDF Export

After reviewing the `ExportService.ts` thoroughly, here is what the PDF currently covers and what is missing.

### Currently Exported (PDF + ZIP)

| Section | Data Source | Status |
|---------|-----------|--------|
| Properties | `properties` table | Covered |
| Photos | `property_files` (photos bucket) | Covered |
| Videos | `property_files` (videos bucket) | Covered |
| Documents | `property_files` (documents bucket) + `legacy_locker_files` + `receipts` | Covered |
| Floor Plans | `property_files` (floor-plans bucket) | Covered |
| Inventory Items | `items` table | Covered |
| Voice Notes | `legacy_locker_voice_notes` | Covered |
| Paint Codes | `paint_codes` table | Covered |
| Source Websites | `source_websites` table | Covered |
| VIP Contacts | `vip_contacts` + `vip_contact_attachments` | Covered |
| Damage Reports | `damage_reports` table | Covered |

### What is Missing

| Gap | Description |
|-----|-------------|
| Account Verification Status | The PDF header shows name and account number but does NOT show whether the user is "User", "Verified", or "Verified+" |
| Emergency Contact Flag | VIP Contacts were recently updated with `is_emergency_contact` -- the export does not reflect this designation |
| Insurance Policies | The `insurance_policies` table has full policy data (company, policy number, coverage, agent info) but is not included in the export |
| Family Recipes | The `family_recipes` table exists but recipes are not exported |
| Contributors List | The `contributors` table tracks who the user has invited -- not included in the export |

### Planned Changes

All changes are in a single file: **`src/services/ExportService.ts`**

**1. Add Account Verification Status to PDF Header**
- In `exportCompleteAssetSummary`, fetch from `account_verification` table alongside the profile.
- Pass verification data to `generateAssetSummaryPDF`.
- Display "Account Status: Verified+" / "Verified" / "User" right after the name/account number in the header section.

**2. Add Emergency Contact Badge to VIP Contacts**
- Update the `vipContacts` mapping in `getUserAssets` to include the `is_emergency_contact` field.
- Update the `AssetSummary` interface to add `isEmergencyContact` to VIP contact type.
- In the PDF rendering, show "[EMERGENCY CONTACT]" label next to contacts that have this flag set.

**3. Add Insurance Policies Section**
- Add `insurancePolicies` to the `AssetSummary` interface.
- Fetch from `insurance_policies` table in `getUserAssets`.
- Render a new "Insurance Policies" section in the PDF showing company, policy number, type, coverage amount, deductible, premium, agent info, and status.
- Add to summary statistics count.

**4. Add Family Recipes Section**
- Add `familyRecipes` to the `AssetSummary` interface.
- Fetch from `family_recipes` table in `getUserAssets`.
- Render a "Family Recipes" section in the PDF showing recipe name, creator, and details.
- Include recipe file attachments in the ZIP download.
- Add to summary statistics count.

**5. Add Contributors Section**
- Add `contributors` to the `AssetSummary` interface.
- Fetch from `contributors` table in `getUserAssets` (only accepted contributors).
- Render a "Contributors" section listing name, email, role, and accepted date.
- Add to summary statistics count.

