## Fix Payment Events table in Admin > User Management

**File:** `src/components/admin/AdminUsers.tsx` (Payment Events tab, ~lines 713-782)

### Changes

1. **Show full Stripe customer ID** — remove `customerInfo.slice(0, 12) + '...'`. Render the full `cus_...` string in a monospace cell with `break-all` so it wraps cleanly instead of truncating.

2. **Add Name and Email columns** — new table headers: `Event Type | Customer Name | Email | Customer ID | Amount | Status | Date`.

3. **Resolve name + email per event** by building a lookup map in `loadUsers()`:
   - Map `stripe_customer_id → user_id` from the already-fetched `entitlements` rows (line 136 already selects `stripe_customer_id`).
   - Map `user_id → profile` from the already-fetched `users`/`profiles` state.
   - Store both as a memoized `customerLookup: Record<string, { name, email }>` on state (or `useMemo`).
   - Fallback chain when rendering a row: lookup by `customerInfo` → else read `event.event_data.object.customer_details.{name,email}` / `customer_email` → else show `—`.

4. **Empty/short customer IDs** still render `—`.

### Out of scope
No schema or edge function changes; data already available in current queries.