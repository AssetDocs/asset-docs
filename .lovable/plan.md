## Problem

The Owner Workspace admin dashboard (`src/components/admin/AdminOwnerWorkspace.tsx`) is missing the "Database" tab that exists in the legacy `/admin` page (`src/pages/Admin.tsx`). That's where the Bucket Lifecycle Policies card (storage lifecycle status evidence) lives, so it's currently unreachable from the workspace view shown in your screenshot.

## Fix

In `src/components/admin/AdminOwnerWorkspace.tsx`:

1. Import `AdminDatabase` from `@/components/admin/AdminDatabase` and a `Database` icon from `lucide-react`.
2. Add a new `TabsTrigger value="database"` to the `TabsList` (placed next to Security/Settings — logical grouping with infra tooling). Update the `md:grid-cols-12` to `md:grid-cols-13` so the new trigger fits the row.
3. Add a matching `<TabsContent value="database"><AdminDatabase /></TabsContent>` block.
4. Optionally add a quick-access card in the Overview grid that jumps to the Database tab (consistent with existing User Management / Dev Team / CRM cards).

No backend or business-logic changes — purely surfacing an existing component in the Owner Workspace navigation.

## Verification

- Reload `/admin` (Owner Workspace), confirm a "Database" tab is visible.
- Click it and confirm the Bucket Lifecycle Policies card renders rows from `get_storage_bucket_lifecycle_status`.
