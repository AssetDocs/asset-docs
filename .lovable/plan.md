

## Fix: Checkout "Plan type is required" Error

### Root Cause

The edge function logs show the error: **"Plan type is required"**

The code in the repository (`supabase/functions/create-checkout/index.ts`) correctly accepts `planLookupKey` and falls back to `planType`. However, the **deployed** version of the function is outdated and still requires `planType` to be present.

The pricing page sends `{ planLookupKey: "standard_monthly" }` (without `planType`), which the old deployed code rejects.

### Fix

**Redeploy the `create-checkout` edge function.** No code changes are needed -- the repository already has the correct version. A redeployment will sync the deployed function with the codebase.

### Post-deploy flow verification

After redeployment, the flow will work as follows:

1. User clicks "Get Started" on a plan
2. Frontend sends `{ planLookupKey: "standard_monthly" }` (or `premium_yearly`, etc.)
3. Edge function resolves the lookup key, finds the matching Stripe Price, and creates a Checkout Session
4. User is redirected to Stripe Checkout to enter payment details
5. After payment, Stripe redirects to `/subscription-success`
6. User logs in and accesses the dashboard

### What this plan does

- Redeploy the existing `create-checkout` edge function (no file edits required)
- Verify the function responds correctly after deployment

