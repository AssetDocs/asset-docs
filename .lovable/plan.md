# Global "+ Add" Dashboard CTA

## Audit of what exists today

- **Dashboard**: `src/components/DashboardGrid.tsx`, rendered from `src/pages/Account.tsx` (tab state is driven by the `?tab=` URL param; `setActiveTab` writes the URL).
- **Asset Documentation upload chooser**: `src/components/AssetTypeSelector.tsx` (the "What are you uploading?" modal, 12 types). It is opened today from `src/components/AssetDocumentationGrid.tsx`, whose `handleTypeSelect` routes to existing flows (`/account/media/upload?tab=photos|videos`, `/account/documents/upload?type=…`, `/account/insurance/new`, scan-to-PDF). This modal is directly reusable from the dashboard.
- **Family Archive modules**: `LifeHubGrid.tsx` lists VIP Contacts (`/account/contacts`), Voice Notes, Trusted Professionals, Notes & Traditions, Family Recipes, Medication List, Important Locations, Memory Safe. Their create forms live **inside** each section component (`NotesAndTraditions`, `FamilyRecipes`, `FamilyMedications`, `ImportantLocations`, `ServiceProsSection`, `VoiceNotesSection`, `MemorySafe`) as internal state (`isOpen` / `showAddForm` / record button). They are not exported as standalone reusable dialogs.
- **Insights & Tools**: `InsightsToolsGrid.tsx` — real create actions exist for Upgrades & Repairs (`setIsAdding`), Paint Codes, Smart Calendar, Quick Notes, Manual Entry Items (`/inventory`). Source Websites is a reference/reporting list and will be excluded.
- **Account context / permissions**: `src/contexts/AccountContext.tsx` exposes `accountId`, `isOwner`, `role`, `isReadOnly`, `canEdit`. Destination modules already enforce this; the chooser will additionally hide itself when `canEdit` is false.
- **Analytics**: `src/lib/track.ts` `track(event, props)` already exists and will be reused.

## Honest constraint to flag up front

Family Archive and Insights & Tools create forms are **internal to their section components**. There is no reusable exported form to call from a modal. To avoid duplicating those forms, the shortcut will **navigate to the module and ask it to open its own existing add form**, via a tiny opt-in signal — an `autoOpenAdd` boolean prop passed down from `Account.tsx` when the URL carries `&add=1`. Each affected section gets a ~3-line `useEffect` that flips its existing state (no new form code, no new mutations). If you would rather not touch those section files at all, the fallback is to navigate to the module without auto-opening the form (user taps the module's own Add button) — say the word and I'll switch to that.

## What gets built

1. **`DashboardQuickAdd.tsx`** (new) — full-width CTA button + the chooser dialog.
   - CTA: full-width, solid Asset Safe accent, white text, `Plus` icon, large touch target, rounded per design system, `aria-label="Add documentation, family information, or property details"`.
   - Helper text: "Quickly add documentation, family information, or property details."
   - Hidden when `!canEdit` (read-only roles).
2. **Chooser dialog** (single `Dialog`, internal step state — no stacked overlays):
   - Step 1 "What would you like to add?" / "Choose where your new information belongs." → Asset Documentation, Family Archive, Insights & Tools (existing card/icon styling).
   - Step 2 for Family Archive and Insights & Tools: vertical list of the real create actions above, with a **Back** action returning to step 1.
   - Asset Documentation: closes the chooser and opens the existing `AssetTypeSelector`, wired to the same routing logic as `AssetDocumentationGrid.handleTypeSelect` (extracted into a shared helper so there is one source of truth, not a copy).
3. **`DashboardGrid.tsx`** — render `DashboardQuickAdd` at the top of the grid, directly above the Asset Documentation / Family Archive cards, spanning both columns, with divider spacing above and below.
4. **`Account.tsx`** — pass `autoOpenAdd` into the affected tab sections when `?add=1` is present.

## Placement

```text
Welcome / Account Banner
Security Progress
Authorized Users / Legacy Admin / Storage
------------------------------
+ Add
------------------------------
Asset Documentation | Family Archive
Documentation Checklist
Secure Vault
...
```

## Not changed

No schema, RLS, storage buckets, entitlement/subscription logic, routing architecture, active-account behavior, upload validation, property linking, or unrelated refactors. Existing direct navigation into each section keeps working unchanged. Analytics reuses `track()` with `dashboard_add_opened`, `dashboard_add_category_selected`, and per-destination events; no content values are logged.

## Verification

Build + TypeScript no-emit check, then a Playwright pass on the dashboard: CTA visible in the right slot, chooser opens, Asset Documentation opens the existing type modal and routes to the real photo/document upload pages, Family Archive and Insights choosers open their modules with the add form up, Back and Escape behave, and a mobile-width layout check.
