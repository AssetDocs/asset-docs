## Goal
In Admin → Overview → User Management → **Authorized Users** tab, ensure every authorized user (AU) row displays:
- AU's full name
- AU's own account number
- AU's email
- Role badge + status
- **The owner account they are authorized on**: owner name + owner account number

## Current state
The tab groups AUs under owner cards. The owner header shows owner name + account #, but each AU row only shows name/email/role/status/invited/accepted — the AU's own account number is missing, and the owner-account context is only visible via the surrounding card header (easy to lose when scrolling/searching).

## Scope
Frontend-only change in `src/components/admin/AdminUsers.tsx`. All data is already loaded — AU profile (with `account_number`) is in `ownerProfileMap`, owner profile is on the bucket.

## Changes

### 1. Capture AU's own account number on the contributor record
When building `bucket.contributors` from `membershipsData` (≈ line 266) and from `contributorsData` (≈ line 246), attach the AU's profile fields we need:
```ts
const auProfile = ownerProfileMap.get(m.user_id); // already done for memberships
// also do for legacy contributors when contributor_user_id is present
bucket.contributors.push({
  ...,
  contributor_account_number: auProfile?.account_number || null,
});
```
Extend `ContributorRecord` interface with `contributor_account_number?: string | null`.

### 2. Convert the grouped view to a flat "All Authorized Users" table
Replace the per-owner cards with a single table so every AU is visible at a glance with full context. Columns:

| Authorized User | AU Account # | Email | Role | Status | Authorized On (Owner) | Owner Account # | Invited | Accepted |

Each row pulls AU fields from the contributor record and owner fields from the parent bucket. Sort by owner name, then AU name.

Keep the existing search input — extend match to also include `contributor_account_number` and owner `accountNumber`.

Keep the summary count badge at the top: "X Authorized Users across Y Accounts".

### 3. Empty state
"No authorized users found" if list is empty after filter.

## Out of scope
- Owner side (already correct in All Users tab).
- Backend / RLS / data fetching changes.
- Gift Subscriptions tab.

## Acceptance
- Every AU appears once in the table.
- Each row shows AU name, AU account #, AU email, role badge, status, owner name, owner account #.
- Searching by AU name, AU account #, owner name, owner account #, or AU email all return matching rows.
