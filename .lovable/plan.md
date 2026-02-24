

## Fix: Post-Payment Redirect Lands on Pricing Page

### Root Cause

The issue is a **race condition** between subscription activation and the dashboard's access check:

1. Stripe redirects to `/subscription-success?session_id=...`
2. `SubscriptionSuccess` page syncs the subscription, then redirects to `/account` after 1.5 seconds
3. `/account` is wrapped in `ProtectedRoute`, which calls `check-subscription` up to 3 times (with 1.5s delays)
4. If entitlements still haven't propagated from the Stripe webhook, `ProtectedRoute` concludes the user has no subscription and **redirects to `/pricing`** (line 238 of `App.tsx`)

### Fix (2 changes)

**1. `src/components/PricingPlans.tsx` -- Remove the flag emoji**

Change the U.S. billing notice text to remove the flag emoji as requested.

**2. `src/pages/SubscriptionSuccess.tsx` -- Stay on the success page longer and redirect with a flag**

Instead of redirecting to `/account` after 1.5 seconds (where the subscription guard may reject them), redirect to `/account?from=subscription-success`. Then in `ProtectedRoute`, when this query param is present, skip the subscription check -- treating it the same as `skipSubscriptionCheck`.

**Alternative (simpler) approach**: Rather than modifying `ProtectedRoute`, change the `SubscriptionSuccess` page to:
- Wait longer before redirecting (give the webhook more time)
- Add retry logic: if the first `check-subscription` call doesn't show active, retry with increasing delays before redirecting
- Only redirect to `/account` once `check-subscription` confirms the subscription is active
- Add a manual "Go to Dashboard" button as a fallback after ~10 seconds

This approach keeps all the logic contained in `SubscriptionSuccess.tsx` without modifying the global `ProtectedRoute`.

### Detailed Changes

**File 1: `src/components/PricingPlans.tsx`**
- Line 121: Change `🇺🇸 Paid subscriptions are currently available to U.S. billing addresses only.` to `Paid subscriptions are currently available to U.S. billing addresses only.`

**File 2: `src/pages/SubscriptionSuccess.tsx`**
- Modify the sync logic to **poll `check-subscription` until it confirms active** (up to ~15 seconds with retries) before redirecting
- Only call `navigate('/account')` after getting a confirmed `subscribed: true` response
- After ~15 seconds of polling without success, show a manual "Go to Dashboard" button instead of auto-redirecting to a page that will reject them
- Remove the fixed 1.5-second `setTimeout` redirect

### What Stays the Same
- All edge functions unchanged
- `ProtectedRoute` logic unchanged
- Stripe checkout URLs unchanged
- The subscription-success route still has `skipSubscriptionCheck={true}`

