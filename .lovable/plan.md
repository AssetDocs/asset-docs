# Consolidate Activity Log into Access & Activity

## Findings (already verified)

- `/account/activity` exists only as one route in `src/App.tsx` (line 438) rendering `src/pages/ActivityLog.tsx`, wrapped in `ProtectedRoute`.
- Nothing links to it anymore. It was reachable solely from the banner CTA that is now the "Users" tile. No navbar, footer, sitemap, or email references it.
- Both views read the same data through `useActivityLog()`. No duplicated data layer, no separate table.
- The standalone page is richer: full history, category tabs with counts, day grouping, absolute timestamps, manual refresh, explainer card. The dashboard's Recent Activity card shows only the 10 newest entries with relative times and no filters.

## Proposed change

Make `?tab=access-activity` the single destination, without losing anything the standalone page offered.

1. **Upgrade the Recent Activity card** in `src/components/AccessActivitySection.tsx`:
   - Keep it collapsible and closed by default so the tab does not get taller on load.
   - When expanded, render the full log using the existing `ActivityLogList` component (day grouping, category badges, absolute date + time) instead of the current flat 10-item list.
   - Add the same category filter row (All / Uploads / Contributors / Vault / Security / Properties with counts) and the Refresh button, sourced from the existing page code.
   - Rename the card header to "Account Activity".
   - Move the "About Activity Logs" explainer text in as a small footnote under the list.

2. **Retire the standalone page**:
   - Remove the `/account/activity` route and the `ActivityLog` import from `src/App.tsx`.
   - Delete `src/pages/ActivityLog.tsx`.
   - Keep `src/components/ActivityLogList.tsx` and `src/hooks/useActivityLog.ts` — both are now used by the dashboard section.

## Out of scope

- No schema, RLS, or logging changes; activity is still written the same way.
- No changes to authorized-user management, permissions, or account scoping.
- No changes to the banner CTAs (already pointing at `?tab=access-activity`).

## Technical notes

- Files touched: `src/components/AccessActivitySection.tsx`, `src/App.tsx`, delete `src/pages/ActivityLog.tsx`.
- `useActivityLog()` already returns `logs`, `isLoading`, and `refetch`, so the filter counts and refresh button port over with no data-layer work.
- Verify with a typecheck plus a browser pass on `?tab=access-activity` confirming filters, grouping, and refresh behave as they did on the old page.

## Alternative if you would rather not merge

Leave `ActivityLog.tsx` in place and simply add a "View full activity log" link inside the Access & Activity section so the page is discoverable again. Smaller change, but keeps two destinations.
