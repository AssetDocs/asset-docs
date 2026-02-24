

## Fix: "Failed to open billing management" Error

### Root Cause

The `customer-portal` edge function creates a **new Stripe Billing Portal configuration on every single invocation**. This fails because:

1. It fetches 5 prices by lookup key (`standard_monthly`, `standard_yearly`, `premium_monthly`, `premium_yearly`, `storage_25gb_monthly`)
2. Groups them by product ID
3. Passes them to `stripe.billingPortal.configurations.create()`
4. Stripe rejects this because multiple prices on the same product have duplicate billing intervals (e.g., two prices both set to "monthly" on the same product)

Additionally, creating a new configuration per request is wasteful and hits Stripe API limits.

### Fix

Simplify the `customer-portal` edge function to **not create a custom portal configuration**. Instead, let Stripe use the **default portal configuration**, which should be set up once in the Stripe Dashboard.

**File:** `supabase/functions/customer-portal/index.ts`

Changes:
- Remove all the price-fetching logic (lines ~56-86 that fetch prices, group by product, and create a portal config)
- Remove the `configuration` parameter from `billingPortal.sessions.create()`
- Just create a simple portal session with the customer ID and return URL

The resulting function becomes much simpler:
1. Authenticate user
2. Find or create Stripe customer
3. Create a portal session (no custom configuration -- uses the default set in Stripe Dashboard)
4. Return the URL

### Stripe Dashboard Setup Required

After deploying, the portal behavior (which plans users can switch between, cancellation options, etc.) should be configured once in the Stripe Dashboard under **Settings > Billing > Customer Portal**. This is the standard Stripe-recommended approach.

### What Stays the Same
- Authentication flow
- Customer lookup/creation
- Return URL logic
- All other edge functions unaffected

