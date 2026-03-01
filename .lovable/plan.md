
## Payment-First Onboarding Flow — Full Implementation Plan

### Current Problem

Two competing entry points create loops and confusion:

1. `/signup` → collects name/email → sends verification email → redirects to `/pricing` → selects plan → needs account → loop
2. `/pricing` → unauthenticated user selects plan → redirected to `/signup?billing=...` → same loop

Additionally, `/subscription-success` is behind `ProtectedRoute`, so unauthenticated users who just paid cannot reach it.

---

### New Flow (Single Path)

```text
Any CTA (Get Started, etc.)
    ↓
/pricing  — select plan, check consent box
    ↓
create-checkout (auth optional — Stripe collects email)
    ↓
Stripe Checkout hosted page
    ↓
/subscription-success?session_id=xxx  (PUBLIC — no auth required)
    ↓
finalize-checkout edge function:
  • verify session paid
  • lookup/create user by email (admin API)
  • upsert entitlement in DB
  • send magic link to Stripe customer email
    ↓
[If logged in]  → redirect to /account
[If not logged in] → show "Payment confirmed — check email" screen
    ↓ (user clicks magic link in email)
/auth/callback?type=magiclink
    ↓
Check entitlement → active? → /account
               → inactive? → /pricing
```

---

### Files to Create / Edit

#### 1. NEW: `supabase/functions/finalize-checkout/index.ts`
This is the core new backend function. It will:
- Accept `{ session_id }` in the request body (no auth required — `verify_jwt = false`)
- Use Stripe SDK to retrieve the checkout session
- Confirm `payment_status === 'paid'`
- Extract `customer_email` and `subscription` ID from the session
- Use Supabase admin client to look up user by email via `auth.admin.getUserByEmail()`
- If user not found: create via `auth.admin.createUser({ email, email_confirm: true })`
- Upsert the `entitlements` table row with `status='active'`, `stripe_subscription_id`, `stripe_customer_id`, `stripe_plan_price_id`, and `plan_lookup_key`
- Send a magic link via `auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: '/account' } })`
- Return `{ success: true, email, user_created: boolean }`

Note: The `validate_entitlement_source` DB trigger requires `stripe_subscription_id`, `stripe_customer_id`, `stripe_plan_price_id`, and `plan_lookup_key` to all be non-null for active Stripe entitlements. The function will retrieve all of these from the Stripe session before upserting.

#### 2. EDIT: `supabase/functions/create-checkout/index.ts`
- Update `success_url` from `/subscription-success?session_id=...` to keep as-is (already correct path, just needs to remain `/subscription-success`)
- Update `cancel_url` to `/pricing?canceled=1`
- Remove the requirement for auth — the function already supports optional auth. No change needed here beyond confirming the anon flow works.

#### 3. EDIT: `src/pages/Pricing.tsx`
- In `handleSubscribe`, replace the unauthenticated fallback:
  ```ts
  // REMOVE:
  window.location.href = `/signup?billing=${yearly ? 'yearly' : 'monthly'}`;
  
  // REPLACE WITH:
  // Same create-checkout call, but without forcing auth
  // For unauthenticated users, skip the log-consent call (no email yet)
  // Stripe will collect email at checkout
  ```
- For unauthenticated users: call `create-checkout` directly (Supabase client will have no auth header — this is fine since `create-checkout` already handles optional auth)
- Change button text from "Get Started" / "Subscribe" to **"Start Asset Safe"**
- Handle the `?canceled=1` query param to show a subtle notice ("Your checkout was canceled — choose a plan to try again")

#### 4. EDIT: `src/pages/SubscriptionSuccess.tsx` → Rename/repurpose as post-checkout page
- Remove `ProtectedRoute` wrapper in `App.tsx` (make it public)
- On load: call `finalize-checkout` with `session_id` from URL
- Show loading state while calling
- If user is already logged in after `finalize-checkout` returns → redirect to `/account`
- If not logged in → show: **"Payment confirmed — finish setup via your email link."** with a note that the magic link email was sent to their Stripe email address

#### 5. EDIT: `src/App.tsx`
- Change line 294:
  ```tsx
  // FROM:
  <Route path="/subscription-success" element={<ProtectedRoute skipSubscriptionCheck={true}><SubscriptionSuccess /></ProtectedRoute>} />
  
  // TO:
  <Route path="/subscription-success" element={<SubscriptionSuccess />} />
  ```

#### 6. EDIT: `src/pages/AuthCallback.tsx`
- For `type=magiclink` (currently routes to `/account`): add entitlement check
  - If active entitlement → `/account` (no change)
  - If no active entitlement → `/pricing`
- For `type=signup`: **remove** the redirect to `/pricing`. This path is now deprecated for the primary flow. Route to `/account` directly (if the user signed up via magic link post-payment, they'll already have an entitlement)
- Remove any automatic redirect that would push a freshly-verified user into a pricing loop

#### 7. EDIT: `supabase/config.toml`
- Add entry for new function:
  ```toml
  [functions.finalize-checkout]
  verify_jwt = false
  ```

---

### Consent Gate for Unauthenticated Users

Currently `log-consent` requires `userEmail`. For unauthenticated checkout:
- Skip the `log-consent` API call before checkout
- Instead, `finalize-checkout` will log consent **after** payment is confirmed (we then have the Stripe customer email)
- This is legally equivalent — the user agreed to terms before proceeding, and we record it with their confirmed email post-payment

---

### Cancel URL Handling

When a user cancels out of Stripe and lands on `/pricing?canceled=1`, a subtle banner will appear: "Your checkout was canceled — you can try again below."

---

### Summary Table

| File | Action | Key Change |
|---|---|---|
| `supabase/functions/finalize-checkout/index.ts` | CREATE | Verify payment, link entitlement, send magic link |
| `supabase/functions/create-checkout/index.ts` | EDIT | Update cancel_url to `/pricing?canceled=1` |
| `supabase/config.toml` | EDIT | Add `verify_jwt = false` for finalize-checkout |
| `src/pages/Pricing.tsx` | EDIT | Remove signup redirect, allow unauthed checkout, "Start Asset Safe" button, canceled banner |
| `src/pages/SubscriptionSuccess.tsx` | EDIT | Make public, call finalize-checkout, show magic link confirmation screen |
| `src/App.tsx` | EDIT | Remove ProtectedRoute from /subscription-success |
| `src/pages/AuthCallback.tsx` | EDIT | Magic link → check entitlement → route correctly, remove signup→pricing loop |
