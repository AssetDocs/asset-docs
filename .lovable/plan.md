

## Property Profiles UI Cleanup

### Goal
Restructure the Property Profiles page (`/account/properties`) to match the layout patterns used by Asset Documentation and Family Archive -- a clean header with title/subtitle and a top-right action button, with property cards displayed in a responsive side-by-side grid.

### Current State
- The Properties page uses a 1/3 + 2/3 column split (sidebar list + detail panel)
- The "+ Add Property" button is buried inside the `PropertyManagement` component's header
- The page header ("My Properties") is styled differently from other dashboard sections
- Property cards are stacked vertically in a single column

### What Changes

**1. Page Header -- match Asset Documentation pattern**
- Replace the current `<h1>` header block with the same layout used by `AssetDocumentationGrid`: title + subtitle on the left, `+ Add Property` button on the top right
- Title: "Property Profiles" (bold, `text-2xl`)
- Subtitle: "View and manage all your property documentation"
- Button: `+ Add Property` (primary style, top-right, matching `+ Upload`)

**2. Property Cards -- side-by-side grid using `DashboardGridCard`**
- Remove the current 1/3 + 2/3 split layout
- Display properties in a `grid grid-cols-1 sm:grid-cols-2 gap-5` grid (same as Asset Documentation's 2-column layout)
- Each property rendered as a `DashboardGridCard` with:
  - Icon: `Home`
  - Title: property name
  - Description: property address
  - Tags: property type, estimated value (if present), year built (if present)
  - Action button: "View Property" (navigates to the property's assets page)
  - Color: `blue` (matching the Property Profiles color from the dashboard grid)

**3. Empty State**
- Keep the existing empty state (Home icon + "No Properties Added" + "Add Your First Property" button) but center it full-width

**4. Remove the right-side detail panel**
- The `PropertyHeader` detail panel (the 2/3 column) will be removed from this page since each card now links directly to `/account/properties/:id/assets`

**5. Move Add/Edit/Delete dialog logic into Properties.tsx**
- The Add Property dialog will be triggered from the new top-right button
- Edit and Delete actions will remain accessible via small icon buttons on each property card (similar to current behavior)

### Technical Details

**Files to modify:**
- `src/pages/Properties.tsx` -- Complete restructure of the page layout to use the grid pattern with `DashboardGridCard` components, move the `+ Add Property` button to the header, and remove the sidebar/detail split
- `src/components/PropertyManagement.tsx` -- Refactor to accept a simplified role: either extract its Add/Edit/Delete dialog logic into a shared hook or keep it as-is and just change how `Properties.tsx` composes it

**Key pattern to follow (from `AssetDocumentationGrid.tsx`):**
```text
+--------------------------------------------------+
| Property Profiles              [+ Add Property]   |
| View and manage all your ...                       |
+--------------------------------------------------+
| +---------------------+  +---------------------+  |
| | [Home] Main Home    |  | [Home] Vacation     |  |
| | 123 Oak St...       |  | 456 Beach Rd...     |  |
| | Single Family · $X  |  | Vacation Home · $Y  |  |
| | [View Property]     |  | [View Property]     |  |
| +---------------------+  +---------------------+  |
+--------------------------------------------------+
```

**Max width:** Changed from `max-w-7xl` to `max-w-6xl` to match the dashboard container width.

