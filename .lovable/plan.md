## Goal

1. Eliminate the `/account?tab=protection-progress` page.
2. Revert the blue welcome banner to its pre-Readiness state (no right-side column).
3. Re-home the "Readiness" metrics inside the existing "Security Progress" card, styled like the existing "Next step to reach Verified status" strip — same font size and orientation — to minimize added height.
4. Show only three rows (omit Protection Status): Authorized Users, Legacy Admin, Storage Used.

## Changes

### 1. `src/pages/Account.tsx`

- Remove the `protection-progress` entry from `getSectionConfig()` (line 141).
- Remove the entire `<TabsContent value="protection-progress">` block (lines 273–282), including the `<ProtectionScore defaultOpen />` and inline `<DocumentationChecklist />` it renders.
- Remove the now-unused `ProtectionScore` import (line 38).
- In the overview render (lines 180–195):
  - Remove the `readinessContent={<DashboardAtAGlanceCard … />}` prop so the banner returns to its original single-column layout.
  - Remove the `DashboardAtAGlanceCard` import.

### 2. `src/components/WelcomeBanner.tsx`

- Drop the `readinessContent` prop and its render block (lines 11–16, 152–156).
- Restore the outer grid to a single column: change `<div className="grid gap-5 lg:grid-cols-[2.5fr_1fr] lg:items-stretch">` (line 88) back to a plain `<div>` (or remove the grid wrapper entirely so the inner flex row is the only child).

### 3. `src/components/SecurityProgress.tsx`

- Below the existing "Next step…" strip (the block at lines 117–134) add a sibling strip with the same container styling (`px-4 py-2.5 border-t border-border bg-muted/20`) and the same row layout used for the Next Step row:
  - `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-3`
  - Left label uses `text-[11px] text-muted-foreground`; right value uses `text-[11px] font-medium text-foreground`; action uses the existing `Go → ` style (`text-[11px] font-semibold text-primary` with `ArrowRight h-3 w-3`).
- Render three rows stacked, each matching that pattern (no Protection Status row):
  - **Authorized Users** — value = count (e.g. `0`); action: `Add →` → `setActiveTab('access-activity')` via `navigate('/account?tab=access-activity')`.
  - **Legacy Admin** — value = `Assigned` or `Not Assigned`; action when not assigned: `Add →` → `/account?tab=access-activity`.
  - **Storage Used** — value = `X.X GB / Y GB`; no action button unless > 85 % used (keep current threshold; action `Manage →` to `/account/settings?tab=manage`).
- Source the data inside `SecurityProgress` (owner-only, gated by `useAccount().isOwner`) by porting the Supabase queries currently in `DashboardAtAGlanceCard`:
  - `account_memberships` count (non-owner, active) → Authorized Users.
  - `legacy_admins` lookup by `account_id` + active → Legacy Admin.
  - `StorageService.getStorageQuotaWithLimit(ownerUserId, storageQuotaGb)` (with `useSubscription().storageQuotaGb`) → Storage Used.
- Skip the new strip for non-owners or while data is loading (render nothing rather than `-` placeholders to avoid flicker / added height).

### 4. `src/components/DashboardAtAGlanceCard.tsx`

- File no longer referenced. Delete it.

### 5. (No DB / route changes)

The `protection-progress` value was only addressable via the in-page `<Tabs>` — there is no router entry, sidebar link, or sitemap entry to update. Existing deep links to `?tab=protection-progress` will simply fall through to the default overview tab.

## Acceptance

- Visiting `/account?tab=protection-progress` shows the overview, not a dedicated page.
- The blue welcome banner looks identical to its pre-Readiness layout (no right-side column, no extra height beyond original).
- The "Security Progress" bar shows the existing Next Step row plus three new compact rows (Authorized Users / Legacy Admin / Storage Used) using the same 11 px type and inline `Add →` / `Manage →` actions.
- No "Protection Status" row appears anywhere in the new strip.
- No console warnings about unused imports; no references to `DashboardAtAGlanceCard` or `ProtectionScore` (in Account.tsx) remain.
