# Add Account # to Payment Events

## Goal
In Admin → Overview → User Management → Payment Events, display the Asset Safe **Account #** (assigned internally) alongside the Stripe **Customer ID** so each transaction can be tied back to a specific account.

## Where
`src/components/admin/AdminUsers.tsx` — the Payment Events table and the existing `customerLookup` builder created in the previous change.

## Changes

1. **Extend `customerLookup` shape**
   Currently: `Record<string, { name, email }>` keyed by `stripe_customer_id`.
   New: `Record<string, { name, email, accountNumber, userId }>`.

2. **Populate `accountNumber` during `loadData`**
   - Already-fetched data: `entitlements` rows give `stripe_customer_id → user_id`; `ownerProfileMap` / `subscriberMap` give the user's profile.
   - Add a lookup `userId → account_number` built from the `accounts` rows the page already loads (owner workspace accounts). If `accounts` isn't currently fetched on this view, add a single `from('accounts').select('id, owner_user_id, account_number')` call scoped to the owner user IDs already in scope.
   - Fallback chain for account #: owner's account_number → "—".

3. **Update Payment Events table header**
   New column order: `Event Type | Customer Name | Email | Account # | Customer ID | Amount | Status | Date`.

4. **Render Account # cell**
   - Monospace, same styling as Customer ID cell.
   - Show `customerLookup[customerInfo]?.accountNumber ?? "—"`.

## Out of scope
- No schema changes.
- No edge function changes.
- No changes to non-admin views.

## Verification
- Open Admin → User Management → Payment Events.
- Confirm each row shows both the full `cus_...` ID and the matching Asset Safe Account #.
- Rows where the Stripe customer can't be matched to an internal user still render "—" for Account #, Name, and Email (no crash).
