
# Root Cause: finalize-checkout Blocked by JWT Verification

## What's Happening

The `SubscriptionSuccess` page calls `finalize-checkout` immediately after Stripe redirects the user back. At that moment, **the user has no Supabase session** — they just came from Stripe's hosted checkout page as an anonymous visitor.

`supabase.functions.invoke()` without an active session sends **no Authorization header**. Supabase's edge function gateway enforces JWT verification by default, so it **rejects the request before the function code ever runs** — returning a non-2xx response. The function logs are empty because the function never executed.

This is confirmed by:
- Zero `finalize-checkout` logs (function never ran)
- The `config.toml` only has `project_id` — no `verify_jwt = false` for this function
- The function is designed to be called publicly (it validates via Stripe session retrieval, not JWT)

---

## The Fix — Two Files

### 1. `supabase/config.toml`
Add a `[functions.finalize-checkout]` section disabling JWT verification:

```toml
[functions.finalize-checkout]
verify_jwt = false
```

This is safe because the function validates legitimacy by calling Stripe directly with the `session_id`. A random caller cannot forge a valid Stripe `session_id` to get a fake entitlement — Stripe will simply return a non-paid session and the function returns 402.

### 2. `supabase/functions/finalize-checkout/index.ts` — Add Idempotency Guard

Since the function will now be publicly callable without a token, add a guard to prevent replay abuse: if the `session_id` has already been processed (i.e., an entitlement with that `stripe_subscription_id` already exists and is active), return success immediately without re-processing.

```typescript
// Check idempotency — already processed?
const { data: existingEntitlement } = await supabaseAdmin
  .from('entitlements')
  .select('user_id')
  .eq('stripe_subscription_id', subscriptionId)
  .eq('status', 'active')
  .maybeSingle();

if (existingEntitlement) {
  logStep("Already processed — returning cached success");
  return new Response(
    JSON.stringify({ success: true, email: customerEmail, already_processed: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
```

This idempotency check happens **after** Stripe confirms `payment_status === 'paid'`, so it can't be used to probe real subscription IDs.

---

## Files to Change

| File | Change |
|---|---|
| `supabase/config.toml` | Add `[functions.finalize-checkout]` with `verify_jwt = false` |
| `supabase/functions/finalize-checkout/index.ts` | Add idempotency guard after subscription is extracted |

---

## No Frontend Changes Needed

`SubscriptionSuccess.tsx` already calls `supabase.functions.invoke('finalize-checkout', ...)` correctly. Once the JWT gate is removed, the call will reach the function and the full post-payment flow (user creation → entitlement upsert → magic link email) will execute as designed.

---

## Security Posture

| Risk | Mitigation |
|---|---|
| Anyone calls finalize-checkout with a fake session_id | Stripe API call fails — no `paid` status returned |
| Replay of a valid session_id | Idempotency guard returns early — no duplicate user/entitlement created |
| Someone guesses a subscription_id | Still requires a valid Stripe checkout `session_id` to pass the payment_status check |
