

## Update Storage Add-on UI and Remove 50GB Option

### Summary
Update all "Need more space?" boxes across the app to use the new wording, remove the 50GB storage add-on entirely, and clean up any remaining 50GB references.

### Changes

**1. `src/components/SubscriptionTab.tsx`** (Dashboard subscription management)
- Remove the 50GB entry from the `storageAddOns` array (line 80), keeping only the 25GB option
- Replace both "Need more space?" storage add-on boxes (lines 655-676 and 908-929) with the new UI wording:
  - Heading: "Your life evolves -- your storage can too"
  - Subheading: "Flexible storage you can adjust anytime."
  - Pricing: "+25GB for $4.99 / month"
  - Bullets: "Add multiple increments as needed" and "Upgrade or remove storage anytime"
  - Single "Add 25GB" button
- Update the active add-on price display (line 853) to remove the 50GB pricing logic, simplifying to `$${(addOnStorageGb / 25 * 4.99).toFixed(2)}/mo` for any add-on amount

**2. `src/pages/Pricing.tsx`** (Pricing navigation page)
- Replace the storage add-on box (lines 355-370) with the same new wording and layout (no purchase button here, just informational)

**3. `src/components/StorageTab.tsx`** (Account Settings storage tab)
- The "Need more storage?" box here (lines 70-113) talks about upgrading the plan tier, not storage add-ons, so this is a different context. No change needed here unless you want it updated too.

**4. No FAQ/Q&A changes needed**
- The FAQAccordion does not mention 50GB storage add-ons. The "50GB" in `PricingPlans.tsx` refers to the Business Plus plan's base storage, not add-ons, so it stays.

### Technical Details

- **`storageAddOns` array** (SubscriptionTab.tsx line 78-81): Change from 2 entries to 1 entry (25GB only)
- **Active add-on pricing formula** (line 853): Simplify from `addOnStorageGb === 25 ? '$4.99/mo' : addOnStorageGb === 50 ? '$9.99/mo' : ...` to a formula based on 25GB increments
- The `add-storage` edge function (50GB) remains deployed but will no longer be called from the UI. It can be cleaned up later if desired.
- 3 files modified total

