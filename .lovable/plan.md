

## Remove Shipping Address from Stripe Checkout

### Problem
All three checkout edge functions currently include `shipping_address_collection: { allowed_countries: ['US'] }`, which shows an "Enter shipping address" section on the Stripe Checkout page. Asset Safe is a SaaS product -- nothing is shipped.

### Solution
Remove `shipping_address_collection` from all three functions. The billing address (already required via `billing_address_collection: 'required'`) is sufficient for Stripe Tax to calculate correctly. Also remove the now-unnecessary `shipping: 'auto'` from `customer_update` in `create-checkout`.

### Changes

**1. `supabase/functions/create-checkout/index.ts`**
- Remove line: `shipping_address_collection: { allowed_countries: ['US'] },`
- Change `customer_update` from `{ name: 'auto', address: 'auto', shipping: 'auto' }` to `{ name: 'auto', address: 'auto' }`

**2. `supabase/functions/add-storage/index.ts`**
- Remove lines 71-73: `shipping_address_collection: { allowed_countries: ['US'] },`

**3. `supabase/functions/add-storage-25gb/index.ts`**
- Remove lines 71-73: `shipping_address_collection: { allowed_countries: ['US'] },`

### What stays the same
- `billing_address_collection: 'required'` -- kept in all three functions
- `automatic_tax: { enabled: true }` -- kept in `create-checkout` (Stripe Tax uses billing address)
- `tax_id_collection: { enabled: true }` -- kept in `create-checkout`
- All success/cancel URLs, line items, mode, and metadata unchanged
- Webhook and entitlement logic completely unaffected

### After code changes
All three edge functions will be redeployed. The Stripe Checkout page will show "Billing address" only, with no shipping section.
