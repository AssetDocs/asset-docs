
## Complete Flow Audit: Payment → Onboarding → Dashboard

I reviewed every file in the chain: `finalize-checkout`, `SubscriptionSuccess`, `AuthCallback`, `AuthContext`, `CreatePassword`, `App.tsx` (ProtectedRoute), and `client.ts`. Here are the issues found and the fixes needed.

---

### Issues Found

#### Issue 1 — CRITICAL: `finalize-checkout` writes `plan: "standard"` but `check-subscription` grants access only if `subscribed: true`

`finalize-checkout` upserts the entitlement with `plan: "standard"`, `status: "active"`. When the user later hits `ProtectedRoute`, it calls `check-subscription` which returns `subscribed: true` for `status === 'active'`. This part is fine.

**BUT**: The `entitlements` table has a `validate_entitlement_source` DB trigger that requires `stripe_subscription_id`, `stripe_customer_id`, `stripe_plan_price_id`, AND `plan_lookup_key` to all be non-null for Stripe-sourced active entitlements. If `planLookupKey` is null (e.g. the Stripe price has no lookup_key configured), the trigger throws an exception — causing the entire `finalize-checkout` to fail silently at the entitlement step, leaving the user without an active entitlement and bouncing them to `/pricing` after they complete onboarding.

**Fix**: Add a fallback in `finalize-checkout` — if `planLookupKey` is null, default it to `'asset_safe_monthly'` so the trigger never rejects it.

---

#### Issue 2 — CRITICAL: `ProtectedRoute` has a 4.5-second built-in delay before granting new users access

The subscription check retries 3 times with 1.5s delays (`setTimeout(..., 1500)` up to `retryCount < 3`). For a brand-new user coming from `handleFinish`, the initial `check-subscription` call will succeed on the first try (entitlement is already active). But the invitation check at `retryCount === 0` adds latency. More critically: **the retry loop keeps counting even when `checkingSubscription` should have resolved**, so after `handleFinish` navigates to `/account`, the user sees the full 32×32 spinner for 1-4.5 seconds before accessing the dashboard.

This isn't a blocker but it is a poor experience. The fix: immediately resolve when `check-subscription` returns `subscribed: true` without invoking retries.

**Already fixed** (the condition `if (data?.subscribed || data?.subscription_tier === 'free')` breaks early). This is fine.

---

#### Issue 3 — SIGNIFICANT: `AuthCallback` sends new users through `magiclink` branch which checks `password_set` — but `password_set` is `null` not `false` for brand-new users

In `AuthCallback`, the `magiclink` case (line 168–196) checks:
```ts
if (!profileData?.password_set) {
  navigate('/welcome/create-password', { replace: true });
}
```
For a brand-new user, `password_set` is `null` (the DB default). `!null === true` so this correctly redirects to the wizard. ✅ This is fine.

But there's a separate path in `handleHashSessionFlow` (line 29-76) which handles the `access_token=` hash fragment path. On line 60-61:
```ts
} else if (!profileData?.onboarding_complete) {
  navigate('/onboarding', { replace: true });
}
```
If `password_set` is null/false AND `onboarding_complete` is false, it correctly hits the first branch and goes to `/welcome/create-password`. ✅

---

#### Issue 4 — SIGNIFICANT: `ProtectedRoute` checks `profile.password_set === false` but for new users, `password_set` is `null` 

Line 239:
```ts
if (profile && profile.password_set === false) {
  return <Navigate to="/welcome/create-password" replace />;
}
```

`null === false` is `false` in JS/TS. So a brand-new user with `password_set = null` will **NOT** be caught by this guard. They'll fall through to the `onboarding_complete === false` guard on line 244, which redirects to `/onboarding` (the stub that goes back to `/welcome/create-password`). This works but causes an extra redirect hop.

**Fix**: Change `profile.password_set === false` to `!profile.password_set` to catch both `false` and `null`.

---

#### Issue 5 — MINOR: `CreatePassword.tsx` does not save the phone number anywhere

Step 2 collects a phone number (`phone` state), but `handleFinish` never writes it to the profiles table. The phone field is just silently dropped.

**Fix**: Include `phone` in the profile `.update()` call inside `handleFinish` if it's been filled in.

---

#### Issue 6 — MINOR: `client.ts` custom lock uses `{ steal: false }` but this is not a valid Web Locks API option

The Web Locks API `request()` options object does not accept a `steal: false` property — `steal` can only be `true` to request stealing. Passing `steal: false` is a no-op at best, ignored silently. The correct approach is to simply omit the `steal` option entirely to get normal exclusive lock behavior.

**Fix**: Change `navigator.locks.request(name, { steal: false }, fn)` to `navigator.locks.request(name, fn)`.

---

### Summary of changes

| File | Change | Severity |
|---|---|---|
| `supabase/functions/finalize-checkout/index.ts` | Default `planLookupKey` to `'asset_safe_monthly'` if null, preventing trigger rejection | Critical |
| `src/App.tsx` | Change `profile.password_set === false` to `!profile.password_set` to catch null | Significant |
| `src/integrations/supabase/client.ts` | Remove invalid `{ steal: false }` option from `navigator.locks.request` | Minor |
| `src/pages/CreatePassword.tsx` | Save phone number in the profiles update inside `handleFinish` | Minor |

The `AuthCallback` and `AuthContext` logic are correct — no changes needed there. The `SubscriptionSuccess` page is correct. The `ProtectedRoute` `profileLoading` gate is correctly in place from the prior fix.
