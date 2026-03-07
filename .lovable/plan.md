
## What Needs Updating in `SystemArchitectureFlowcharts.tsx`

Based on a full read of the current architecture page vs. the actual codebase + memory notes, here are all the inaccuracies to fix:

---

### 1. Account Creation Flow (lines 206–286) — Major rework needed

The current diagram shows the OLD free signup flow:
- Signup Form → email/password/name → Email Verification → AuthCallback → choose plan → Stripe

The **actual current flow** is payment-first:
```
Pricing → Stripe Checkout → /subscription-success → finalize-checkout (edge fn)
→ Magic Link email → /auth/callback (waits for SIGNED_IN event)
→ /welcome/create-password → /onboarding (3 steps) → /account
```

Specific wrong items to fix:
- `FlowNode` "Signup Form" shows "Email, Password, Name + Optional Gift Code" — wrong, new users don't pick a password at signup. Password is set at `/welcome/create-password`
- The two-branch "Gift Code?" decision after AuthCallback is wrong. Gift flow is separate from the main subscription flow
- Plan nodes show `Standard ($12.99/mo) or Premium ($18.99/mo)` — wrong. Per memory: single "Asset Safe Plan" at **$18.99/mo or $189/yr**
- Key Functions list at bottom still includes `supabase.auth.signUp` and old functions

New Account Creation Flow to document:
1. User visits Pricing page → selects Monthly ($18.99) or Annual ($189/yr)
2. `create-checkout` edge function → Stripe Checkout
3. `stripe-webhook` → `finalize-checkout` edge function creates the user via Supabase Admin API + sends magic link email
4. User clicks magic link → `/auth/callback` (waits for `SIGNED_IN` event before clearing hash)
5. → `/welcome/create-password` (sets password via `supabase.auth.updateUser`, marks `profiles.password_set = true`, then `navigate('/onboarding')`)
6. → `/onboarding` (3-step wizard: name, phone, first property with Google Places autocomplete)
7. → `/account` dashboard

### 2. Subscription & Billing Flow (lines 656–754) — Pricing nodes wrong

Lines 667–693 show three plan tiers:
- **Standard Plan** at `$129/year`
- **Premium Plan** at `$189/year`  
- **Lifetime (ASL2025)**

Per memory: Asset Safe now has a **single "Asset Safe Plan"** at `$18.99/mo` or `$189/yr`. No Standard vs Premium split. Remove the Standard/Premium comparison grid and replace with single plan + two billing options.

Also: Key functions summary should note deprecated functions (`add-storage`, `add-storage-25gb`, `change-plan`, `cancel-subscription`) are deprecated — Stripe Customer Portal handles changes now.

### 3. Photo Upload Flow (lines 363–453) — Minor: deprecated function reference

Line 385 still shows `add-storage / add-storage-25gb` as the storage upgrade path. Per memory these are deprecated. Should say "Stripe Customer Portal" instead.

### 4. System Architecture Overview (lines 122–204) — Minor updates

The Auth Pages box (line 142) currently lists "Login, Signup, Verify Email, Password Reset". Should reflect actual auth pages: "Login, Magic Link, Create Password, Onboarding".

Storage buckets grid (lines 194–200) lists only 4 buckets but there are 6 in Supabase: `photos`, `videos`, `documents`, `floor-plans`, `memory-safe`, `contact-attachments`. Add the missing two.

### 5. Contributor Flow (lines 455–566) — Minor update

Line 467 says `Contributors Tab` at `/account/settings`. The actual route per memory is `/account/access-activity`. Update the sublabel.

---

## Files to Change

| File | Changes |
|---|---|
| `src/components/admin/SystemArchitectureFlowcharts.tsx` | 5 targeted updates across the existing flowcharts |

---

## Summary of All Changes

```text
FlowChart 1 - System Overview:
  Auth Pages box: update text to reflect actual pages
  Storage buckets: add floor-plans + memory-safe

FlowChart 2 - Account Creation:
  Full rewrite of the flow to show payment-first architecture:
  Pricing → Stripe → finalize-checkout → Magic Link
  → /auth/callback → /welcome/create-password → /onboarding → /account
  Fix pricing: single plan, $18.99/mo or $189/yr
  Update Key Functions list

FlowChart 4 - Photo Upload:
  Storage upgrade path: remove deprecated edge fns, replace with Stripe Customer Portal

FlowChart 5 - Contributors:
  Route sublabel: /account/settings → /account/access-activity

FlowChart 6 - Subscription & Billing:
  Replace Standard/Premium/Lifetime grid with single-plan + billing options
  Note deprecated billing edge functions
  Update pricing figures
```

Single file: `src/components/admin/SystemArchitectureFlowcharts.tsx`
