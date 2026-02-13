

## Dashboard UI Unification

### Goal
Comb through every dashboard sub-page and standardize the button styles, navigation patterns, labels, and filter controls so they all follow a single consistent pattern.

### Audit of Issues Found

**Inventory / Manual Entry (`src/pages/Inventory.tsx`)**
1. Two "Back to Dashboard" buttons (one from `DashboardBreadcrumb`, one manual)
2. Breadcrumb shows "> Page" text next to back button
3. "Add New Item" button is small, top-right -- should be full-width
4. Missing secondary "Back to Insights & Tools" button

**Source Websites (`src/components/SourceWebsitesSection.tsx`)**
5. "Add Website" button is small, top-right corner -- should be full-width

**Upgrades & Repairs (`src/components/UpgradesRepairsSection.tsx`)**
6. "Add New" button is small, top-right -- should be full-width

**Memory Safe (`src/components/MemorySafe.tsx`)**
7. `DocumentFolders` sidebar shows "Document Organization" -- change to "Folder Organization"
8. "All Documents" label and "View all documents" text -- change to "All Memories" / "View all memories"
9. "No documents found" placeholder text -- change to "No files found"
10. Missing media type filter (All Files / Photos Only / Videos Only) like CombinedMedia has

**DocumentFolders (`src/components/DocumentFolders.tsx`)**
11. Title is hardcoded as "Document Organization" -- needs a `titleOverride` prop
12. "All Documents" / "View all documents" labels are hardcoded -- need override props

### Pages Left As-Is (form-based input sections)
- Paint Codes -- has inline form entry, leave as-is
- Asset Values -- read-only summary view, leave as-is
- Family Recipes -- already uses full-width button pattern
- Notes & Traditions -- already uses full-width button pattern
- Voice Notes -- different input pattern (recording), leave as-is

### Changes

**1. `src/pages/Inventory.tsx`**
- Remove the manual "Back to Dashboard" `Button` block (lines 176-187)
- Update `DashboardBreadcrumb` to include `parentRoute="/account?tab=insights-tools"` and `parentLabel="Back to Insights & Tools"` and `hidePageName`
- Change the "Add New Item" button from small top-right to full-width `bg-brand-blue`, placed below the title/subtitle block (matching Notes & Traditions pattern)

**2. `src/components/SourceWebsitesSection.tsx`**
- Move the "Add Website" button from the small top-right position to a full-width button below the card header (matching the Family Recipes and Notes & Traditions pattern)

**3. `src/components/UpgradesRepairsSection.tsx`**
- Change the "Add New" button from small top-right to full-width below the header

**4. `src/components/DocumentFolders.tsx`**
- Add optional props: `titleOverride`, `allItemsLabel`, `allItemsDescription`
- Default values: "Document Organization", "All Documents", "View all documents"
- Memory Safe will pass: "Folder Organization", "All Memories", "View all memories"

**5. `src/components/MemorySafe.tsx`**
- Pass the new label override props to `DocumentFolders`
- Add a media type filter dropdown (All Files / Photos Only / Videos Only) matching the CombinedMedia pattern, filtering by file extension (image vs video vs all)
- Change the empty state text from "No documents found" to "No files found"

### Technical Details

**Files to modify:**
- `src/pages/Inventory.tsx` -- remove duplicate back button, add parent route, make add button full-width, hide breadcrumb page name
- `src/components/SourceWebsitesSection.tsx` -- restructure button to full-width
- `src/components/UpgradesRepairsSection.tsx` -- restructure button to full-width
- `src/components/DocumentFolders.tsx` -- add title/label override props
- `src/components/MemorySafe.tsx` -- pass label overrides, add media filter, fix empty state text
- `src/components/MediaGalleryGrid.tsx` -- no changes needed (already has `emptyMessage` support via its internal logic, empty state text is controlled by the parent)

**UI pattern to follow (full-width button):**
```text
+--------------------------------------------------+
| Section Title                                      |
| Subtitle text here                                 |
|                                                    |
| [===========  + Add New Item  ==================] |
|                                                    |
| (content below)                                    |
+--------------------------------------------------+
```
