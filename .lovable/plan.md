

## In-App Plan Upgrade/Downgrade

### Problem
When a subscribed user clicks "Switch to Premium" or "Switch to Standard", they are sent to the Stripe Customer Portal, which does not have plan switching configured. Users have no way to change their plan.

### Solution
Handle plan changes directly within Asset Safe by creating a new edge function that uses the Stripe API to swap the subscription item's price. The UI button will call this function instead of opening the Stripe portal.

### How It Will Work
1. User clicks "Switch to Premium" or "Switch to Standard" on the Subscription tab
2. A confirmation dialog appears explaining what will change (price, features, proration)
3. On confirm, the app calls a new `change-plan` edge function
4. The edge function finds the user's active Stripe subscription and updates it to the new plan using Stripe's subscription update API (with proration)
5. The webhook processes the resulting `customer.subscription.updated` event to update entitlements
6. The UI refreshes to show the new plan

### Changes

**1. New edge function: `supabase/functions/change-plan/index.ts`**
- Authenticates the user
- Finds their active Stripe subscription
- Creates new price data for the target plan (preserving billing interval -- monthly or yearly)
- Calls `stripe.subscriptions.update()` to swap the subscription item to the new price
- Uses `proration_behavior: 'create_prorations'` so users get credit for unused time
- Updates the entitlements table immediately (plan, storage_quota_gb)
- Returns success with the new plan details

**2. Update `src/components/SubscriptionTab.tsx`**
- Replace the `handleManageSubscription` call on the "Switch to..." button with a new `handleChangePlan` function
- Add a confirmation dialog that shows: current plan, new plan, and a note about proration
- On confirm, call the `change-plan` edge function
- On success, refresh subscription status and show a success toast
- Remove the "Click to modify your subscription through Stripe" text

**3. Update `supabase/config.toml`**
- Add `[functions.change-plan]` with `verify_jwt = false` (auth handled in code)

### Technical Details

The `change-plan` edge function will:

```text
1. Verify user auth token
2. Look up Stripe customer by email
3. Retrieve active subscription (stripe.subscriptions.list)
4. Determine current billing interval from the existing subscription item
5. Build new price_data for the target plan (standard or premium) with same interval
6. Call stripe.subscriptions.update() with:
   - items: [{ id: existing_item_id, price_data: new_price_data }]
   - proration_behavior: 'create_prorations'
7. Update entitlements table (plan, storage_quota_gb)
8. Return { success: true, plan: targetPlan }
```

The confirmation dialog will clearly state:
- "You are switching from [Current Plan] to [New Plan]"
- "Your billing will be prorated -- you'll receive credit for unused time on your current plan"
- Two buttons: "Cancel" and "Confirm Change"

### Files to Create/Modify
- **Create**: `supabase/functions/change-plan/index.ts`
- **Modify**: `src/components/SubscriptionTab.tsx` (replace portal redirect with in-app plan change)
- **Modify**: `supabase/config.toml` (add function config)
