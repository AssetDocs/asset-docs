# Knowledge Hub Consolidation — Audit + Plan

## Part 1: Audit of current state (verified in code)

### Dashboard cards (`src/components/DashboardGrid.tsx`)
- Asset Documentation → tab `asset-documentation` (renders `AssetDocumentationGrid`)
- Family Archive → tab `life-hub` (renders `LifeHubGrid`)
- Insights & Tools → tab `insights-tools` (renders `InsightsToolsGrid`)
- Legacy Locker, Digital Access, Property Profiles, Asset Values — unrelated, untouched

### Family Archive sub-grid (`LifeHubGrid.tsx`) — 9 cards
VIP Contacts (`navigate('/account/contacts')`), Voice Notes (`voice-notes`), Trusted Professionals (`service-pros`), Notes (`notes`), Family Traditions (`family-traditions`), Family Recipes (`family-recipes`), Medication List (`medication-list`), Important Locations (`important-locations`), Memory Safe (`memory-safe`)

### Insights & Tools sub-grid (`InsightsToolsGrid.tsx`) — 6 cards
Smart Calendar (`smart-calendar`), Manual Entry Items (`navigate('/inventory')`), Upgrades & Repairs (`upgrades-repairs`), Source Websites (`source-websites`), Paint Codes (`paint-codes`), Quick Notes (`quick-notes`)

### Tab hosts (`src/pages/Account.tsx`)
Every module above is a `TabsContent` block with its own component; several already accept `autoOpenAdd`: `ServiceProsSection`, `UpgradesRepairsSection`, `SmartCalendar`, `NotesSection`, `FamilyTraditions`, `FamilyRecipes`, `FamilyMedications`, `ImportantLocations`. Section titles/subtitles come from a `getSectionConfig()` map (lines ~292-312). Two "back" strips exist: one for Family Archive tabs → `life-hub`, one for Insights tabs → `insights-tools`.

### Quick Add (`DashboardQuickAdd.tsx`)
Three-way root chooser (`asset_documentation` / `family_archive` / `insights_tools`), then flat option lists with `?add=1` links. Asset Documentation branch delegates to `AssetTypeSelector` + `resolveAssetUploadDestination` (`src/lib/assetUploadRouting.ts`). Insights list includes Manual Entry Item → `/inventory`.

### Quick Notes storage (audit item — has its own silo)
`QuickNotesSection.tsx` reads/writes table **`public.user_notes`** (title, content, file_name, file_path, bucket_name), scoped by `user_id` (not `account_id`), with per-user RLS. Files live in the existing `documents` bucket. It is also wired into `ExportService` (line ~1572), `delete-account` cleanup, and the storage-orphan reconciliation SQL. **Notes** is a different table: `public.notes_traditions` (with `record_type` + `folder_id`), scoped by account.
Conclusion: retiring Quick Notes as a destination is safe UI-wise, but the records are NOT interchangeable — no migration, no deletion in this pass.

### Manual Entry Items
Nav-only entry to route `/inventory` (`src/pages/Inventory.tsx`, uses `AddInventoryItemForm`). `ManualEntrySection.tsx` exists but is not mounted by Inventory. Relocating it under Asset Documentation is a pure navigation change.

### Purely navigation vs. schema
- Purely navigation: everything in this plan.
- Schema/storage/RLS changes required: **none**. No migration will be proposed.

## Part 2: Proposed implementation (after your approval)

### New files
- `src/components/KnowledgeHubGrid.tsx` — section headings + cards only, `onTabChange`/`navigate` props, no data access.
- `src/components/hubs/ContactsHub.tsx` — VIP Contacts | Trusted Professionals selector (navigation only).
- `src/components/hubs/NotesHub.tsx` — Written Notes | Voice Notes.
- `src/components/hubs/TraditionsRecipesHub.tsx` — Family Traditions | Family Recipes.

### Knowledge Hub layout
```text
PEOPLE & CARE
Contacts | Medication List

NOTES & FAMILY
Notes | Family Traditions & Recipes | Memory Safe

PROPERTY & HOUSEHOLD
Important Locations | Paint Codes | Upgrades & Repairs | Source Websites

PLANNING
Smart Calendar
```
Existing `DashboardGridCard` compact style retained; headings are small uppercase muted text, no extra containers. Card copy as you supplied.

### Changed files
- `src/pages/Account.tsx`: add tabs `knowledge-hub`, `contacts-hub`, `notes-hub`, `traditions-recipes-hub`; add their `getSectionConfig()` entries; repoint both existing "back" strips to the correct hub level; keep `life-hub` and `insights-tools` as working aliases that render the Knowledge Hub (no dead links from bookmarks/emails). `quick-notes` tab content stays mounted but is no longer linked from any grid.
- `src/components/DashboardGrid.tsx`: replace the Family Archive and Insights & Tools cards with one Knowledge Hub card — "Contacts · Notes · Property Details · Records · Memories" — carrying over the calendar badge; add `Manual Entry` to the Asset Documentation card's tag list.
- `src/components/AssetDocumentationGrid.tsx`: add a Manual Entry card that navigates to `/inventory` (nav only).
- `src/components/DashboardQuickAdd.tsx`: root becomes Asset Documentation | Knowledge Hub; Knowledge Hub lists Note, Voice Note, VIP Contact, Trusted Professional, Medication, Family Tradition, Family Recipe, Important Location, Upgrade/Repair, Paint Code, Calendar Entry, Manual Entry Item moves to the Asset Documentation branch. Existing `?add=1` targets reused verbatim.
- `src/components/InsightsToolsGrid.tsx` / `src/components/LifeHubGrid.tsx`: retained but unlinked (removal deferred; no dead-code cleanup in this pass).
- Terminology-only text updates where "Family Archive"/"Insights & Tools" appear in dashboard-facing copy.

### Explicitly out of scope
Auth, MFA, AU invites, gift flows, Stripe/billing, subscriptions, RLS, storage buckets, retention/deletion, and every module's own create/edit/delete behavior. No component renames or refactors.

### Open decision
Quick Add currently has no "Source Website" create action — recommend leaving it out of Quick Add. Quick Notes: recommend retiring the destination only (tab kept reachable by direct URL so existing `user_notes` records stay viewable/exportable) and adding no new "Quick Note" shortcut, since Notes covers it.
