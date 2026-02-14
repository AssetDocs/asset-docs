

# Add High-Value Items as Permanent Folder in Room Organization

## Overview

Move the "High-Value Items" from a standalone card above the page into a permanent, non-deletable folder entry inside the "Room Organization" sidebar. When users click it, the main content area filters to show only files marked as high-value.

---

## Changes

### 1. PhotoGalleryFolders.tsx — Add permanent High-Value Items folder

- Add a new `Star` icon import from lucide-react
- Add new props: `highValueCount` (number) and `onHighValueSelect` callback
- Add a new `selectedFolder` value convention: use a special string like `"high-value"` to represent this virtual folder
- Insert a new button **above** the "All Photos and Videos" button, styled with an amber gradient icon and a star, labeled "High-Value Items" with a badge showing the count
- This folder cannot be deleted, edited, or dragged — it is always present

### 2. CombinedMedia.tsx — Wire up the high-value folder

- Pass `highValueCount` and `onHighValueSelect` props to `PhotoGalleryFolders`
- When `selectedFolder === 'high-value'`, filter `getFilteredItems()` to only show files where `is_high_value === true`
- Update `currentFolderName` to show "High-Value Items" when this virtual folder is selected
- Remove the standalone high-value items `Card` section (lines ~417-460) since it is now integrated into the folder sidebar

---

## Technical Details

**New props on PhotoGalleryFolders:**
```
highValueCount: number
```

**Folder selection logic in CombinedMedia:**
- `selectedFolder === null` → all files (existing)
- `selectedFolder === 'high-value'` → files where `is_high_value === true` (new)
- `selectedFolder === '<uuid>'` → files in that room folder (existing)

**High-Value folder button styling:**
- Amber gradient background (`from-amber-400 to-amber-600`)
- `Star` icon (filled white)
- No delete/edit/drag controls — permanently pinned at top

