

## Fix Admin Workspace: Stripe Billing Error + Lifetime Plan Display

### Issue 1: Stripe Billing Tab Crashes

**Root cause**: The `admin-stripe-subscriptions` edge function calls `stripe.subscriptions.list()` with `expand: ["data.customer", "data.items.data.price.product"]`. Stripe limits expansion to 4 levels, and `data.items.data.price.product` is 5 levels deep. This causes a 500 error every time.

**Fix**: Remove the deep expand and fetch product details separately. Change the Stripe call to only expand `["data.customer"]`, then for each subscription, make a separate `stripe.products.retrieve()` call using the product ID from the price object (which is already a string, not expanded).

| File | Change |
|------|--------|
| `supabase/functions/admin-stripe-subscriptions/index.ts` | Replace deep expand with shallow expand + separate product lookups |

### Issue 2: AS010118 Shows "Asset Safe Plan" Instead of Lifetime

**Root cause**: AS010118 (user `e71b4d2e`) has `entitlement_source: admin` and `plan: premium` but no `plan_lookup_key`. The `getPlanInfo` function checks for `planId === 'premium_lifetime'` but this user's plan is just `premium`. The function doesn't consider `entitlement_source` at all.

**Fix**: Pass `entitlement_source` into `getPlanInfo` and check for `admin` or `lifetime` sources with no `stripe_subscription_id` to display as "Free Lifetime (ASL2025)".

| File | Change |
|------|--------|
| `src/components/admin/AdminUsers.tsx` | Update `getPlanInfo` to accept and check `entitlement_source`; pass it from user record |

### Deployment

Redeploy `admin-stripe-subscriptions` after the fix.

