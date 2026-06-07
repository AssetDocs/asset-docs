# Admin → User Management → Cancellations: enrich + add Deleted tab

Frontend-only change in `src/components/admin/AdminCancellations.tsx`. All data is already available via existing tables.

## 1. Enrich the existing "Subscription Cancellations" tab

Currently shows: Cancelled | Owner (truncated UUID) | Plan | Period End | Reason | Comments.

Change to: **Name | Account # | Plan | Reason | Comments | Cancelled On**

- Load `profiles` (first_name, last_name, account_number, user_id) for every `owner_user_id` in the result set in one batched query, build a `Map<user_id, profile>`.
- Render full name (fall back to email-style placeholder or "—"); render `account_number` in a monospace badge.
- Keep search/sort behavior as-is (none currently). Keep top stats (Total + Top Reasons).

## 2. Rework "Account Closure Requests" tab → rename to "Cancelled (Pending Deletion)"

This tab currently mixes scheduled/reversed/completed closures. Keep it for in-flight closures only:

- Filter rows where `status IN ('scheduled','pending','reversed')` (exclude `completed` — those move to the new Deleted tab).
- Columns: **Name | Account # | Status | Reason | Comments | Requested | Scheduled Deletion**
- Same profile-batch lookup as above.

## 3. NEW "Deleted" tab

Source: `deleted_accounts` (email, original_user_id, deleted_at, deleted_by) joined with the latest matching `account_closure_requests` row (by `owner_user_id = original_user_id`) to obtain `reason` and `comments`. `account_deletion_requests` is used as a secondary source if no closure request exists (match by `account_owner_id`).

Note: `profiles` rows are wiped on deletion, so name/account_number are typically unavailable. Display:

Columns: **Name | Account # | Email | Reason | Deleted On | Deleted By**

- Name/Account #: show "—" if no surviving profile (expected); attempt a `profiles` lookup by `original_user_id` first in case it exists.
- Reason: prefer `account_closure_requests.reason` (latest), else `account_deletion_requests.reason`, else "—".
- Add a Total card at the top.

## Tabs

Update `TabsList` to three tabs:
1. `cancellations` — "Subscription Cancellations"
2. `closures` — "Cancelled (Pending Deletion)"
3. `deleted` — "Deleted Accounts"

## Out of scope

- Backend/RLS changes, edge functions, schema changes.
- Capturing additional deletion metadata (e.g., storing reason in `deleted_accounts`) — current data is what we display.
- Other admin tabs.

## Acceptance

- Cancellations tab shows owner name + account number instead of truncated UUID, plus reason and date.
- Closures tab only lists in-flight (non-completed) requests with name + account #.
- New Deleted tab lists each `deleted_accounts` row with email, deletion date, deleted_by, and a best-effort reason pulled from closure/deletion request history.
