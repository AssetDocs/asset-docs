

## Fix: Stripe Checkout "automatic_tax + shipping" Validation Error

### Root Cause

The `create-checkout` edge function fails when an **existing Stripe customer** clicks "Get Started" because the `customer_update` object is missing `shipping: 'auto'`.

Stripe requires that when both `automatic_tax: { enabled: true }` and `shipping_address_collection` are used together with an existing customer, the `customer_update` must include `shipping: 'auto'` so the collected shipping address is saved back to the Customer object.

New customers (no existing Stripe record) are unaffected because `customer_update` is not sent for them.

### Fix

**File:** `supabase/functions/create-checkout/index.ts`

Update the `customer_update` field in the `stripe.checkout.sessions.create()` call (around line 82) to include `shipping: 'auto'`:

```
// Before
customer_update: customerId ? { name: 'auto', address: 'auto' } : undefined,

// After
customer_update: customerId ? { name: 'auto', address: 'auto', shipping: 'auto' } : undefined,
```

Then redeploy the `create-checkout` edge function.

### What This Fixes

- Users who already have a Stripe customer record (from a previous checkout attempt or account) will no longer hit this error
- The shipping address collected during checkout will be saved back to the Stripe Customer, which Stripe needs for automatic tax calculation

### No Other Changes Needed

The rest of the checkout flow (price lookup, session creation, redirect) is working correctly based on the logs. The function successfully:
1. Resolves the lookup key (`standard_monthly`)
2. Finds the Stripe price (`price_1T3js8EyVj2Ir7a8DejyRXFz`)
3. Finds the existing customer (`cus_TaqjlWRzVvMRBz`)
4. Only fails at session creation due to the missing `shipping` field

