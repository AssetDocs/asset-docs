
## Asset Safe — Cleanup & Alignment Plan

### What This Request Is Doing

This is a targeted cleanup pass to align the entire codebase with the final single-plan model. No new features are being built. The work falls into four categories:

1. **Backend lookup key cleanup** — replace all `standard_*` / `premium_*` references with `asset_safe_*`
2. **Storage add-on guard** — prevent storage checkout without an active base entitlement
3. **UI display cleanup** — derive billing frequency from `plan_lookup_key` instead of static strings; fix copy
4. **Gift payment mode** — update webhook to accept `mode: "payment"` for the gift one-time flow

---

### Part 1: Stripe Webhook — Add New Lookup Keys + Gift Payment Mode

**File:** `supabase/functions/stripe-webhook/index.ts`

**Change A:** `parseSubscriptionItems()` currently only recognizes `standard_*` and `premium_*`. Add the new keys:

```typescript
// Before (line 26)
if (lookupKey.startsWith('standard_') || lookupKey.startsWith('premium_')) {

// After — keeps legacy support + adds new keys
if (
  lookupKey.startsWith('standard_') ||
  lookupKey.startsWith('premium_') ||
  lookupKey === 'asset_safe_monthly' ||
  lookupKey === 'asset_safe_annual'
) {
  plan = 'standard';
  baseStorageGb = 25;
  planLookupKey = lookupKey;
  planPriceId = item.price.id;
}
```

**Change B:** The gift handler checks `session.mode === 'subscription'`. Since the new gift product is a one-time payment (`mode: "payment"`), update the condition:

```typescript
// Before
if (session.metadata?.gift === "true" && session.mode === 'subscription' && session.subscription) {

// After
if (session.metadata?.gift === "true" && 
    (session.mode === 'payment' || session.mode === 'subscription')) {
  // For payment mode: skip cancel_at_period_end step (no subscription to cancel)
  // For subscription mode: keep existing cancel_at_period_end logic
}
```

---

### Part 2: `create-checkout` — Update Fallback Lookup Keys + Storage Guard

**File:** `supabase/functions/create-checkout/index.ts`

**Change A:** Update `toLookupKey()` to produce new keys instead of legacy ones:

```typescript
// Before
function toLookupKey(planType: string, billingInterval: string): string {
  const interval = billingInterval === 'year' ? 'yearly' : 'monthly';
  if (plan === 'premium' || plan === 'professional') return `premium_${interval}`;
  return `standard_${interval}`;
}

// After
function toLookupKey(planType: string, billingInterval: string): string {
  const interval = billingInterval === 'year' ? 'annual' : 'monthly';
  return `asset_safe_${interval}`;
}
```

**Change B:** Add a guard that blocks storage add-on checkout (`storage_25gb_monthly`) when there is no active base entitlement. Before creating the Stripe session, if the lookupKey is `storage_25gb_monthly`, verify the user has an active entitlement:

```typescript
if (lookupKey === 'storage_25gb_monthly') {
  if (!user) throw new Error("Authentication required for storage add-ons");
  const supabaseService = createClient(url, serviceKey);
  const { data: entitlement } = await supabaseService
    .from('entitlements')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!entitlement || !['active', 'trialing'].includes(entitlement.status)) {
    throw new Error("An active Asset Safe Plan is required before adding storage.");
  }
}
```

---

### Part 3: `check-subscription` — Expose `billing_status`

**File:** `supabase/functions/check-subscription/index.ts`

Add `billing_status` to the response object (already exists as a column after prior migration):

```typescript
billing_status: entitlement?.billing_status || 'active',
```

This allows the frontend to detect gifted users and gate the storage add-on UI.

---

### Part 4: `SubscriptionContext` — Expose `billing_status` + `billingStatus`

**File:** `src/contexts/SubscriptionContext.tsx`

Add `billing_status` to the `SubscriptionStatus` interface and expose `billingStatus` in the context value. This allows `SubscriptionTab` and `StorageTab` to read it:

```typescript
interface SubscriptionStatus {
  // ... existing fields
  billing_status?: string; // 'active' | 'gifted' | 'expired'
}

interface SubscriptionContextType {
  // ... existing fields
  billingStatus: string;
}

// In the provider:
const billingStatus = subscriptionStatus.billing_status || 'active';
```

---

### Part 5: `SubscriptionTab` — Fix Lookup Key + Derive Billing Frequency Display + Storage Copy

**File:** `src/components/SubscriptionTab.tsx`

**Change A (line 288):** Replace legacy lookup key in `handleStartSubscription`:

```typescript
// Before
const lookupKey = `standard_${billingInterval === 'year' ? 'yearly' : 'monthly'}`;

// After
const lookupKey = billingInterval === 'year' ? 'asset_safe_annual' : 'asset_safe_monthly';
```

**Change B (line 498–550):** Remove tier-based logic and static price string. Derive billing frequency from `plan_lookup_key`:

```typescript
// Before
const activeTier = rawTier.includes('premium') ? 'premium' : 'standard';
// ...
{(activeTier === 'standard' || activeTier === 'premium') && '$18.99/mo or $189/yr'}

// After
const planLookupKey = subscriptionStatus.plan_lookup_key || '';
const billingFrequency = planLookupKey.includes('annual') || planLookupKey.includes('yearly')
  ? 'Billed yearly · $189/yr + tax'
  : planLookupKey.includes('monthly')
  ? 'Billed monthly · $18.99/mo + tax'
  : '$18.99/mo or $189/yr + tax'; // fallback for legacy keys
```

Display this under the "Asset Safe Plan" heading in the subscribed view (fulfills checklist §8: "Dashboard shows: Asset Safe Plan / Billed monthly / yearly").

**Change C (line 406 and 618):** Update storage add-on copy from "Your life evolves — your storage can too" to "Need more room to grow? Add storage anytime." (per checklist §7).

**Change D:** Remove the `activeTier` / `rawTier` tier-based conditionals entirely. Since there is only one plan, the subscribed view does not need to branch on tier.

---

### Part 6: `Pricing.tsx` — Fix `handleSubscribe` Lookup Key

**File:** `src/pages/Pricing.tsx`

**Change (line 100):** The `handleSubscribe` function currently builds:

```typescript
// Before
const lookupKey = `${planType}_${yearly ? 'yearly' : 'monthly'}`;
// This produces 'standard_yearly' / 'standard_monthly'

// After
const lookupKey = yearly ? 'asset_safe_annual' : 'asset_safe_monthly';
```

Also remove the `planType` parameter from the `handleSubscribe` call on line 243:

```tsx
// Before
onClick={() => handleSubscribe('standard', billingCycle === 'yearly')}

// After
onClick={() => handleSubscribe(billingCycle === 'yearly')}
```

And simplify the function signature: `handleSubscribe(yearly: boolean = false)`.

---

### Part 7: `StorageTab` — Gift Period Guard

**File:** `src/components/StorageTab.tsx`

Read `billingStatus` from `useSubscription()`. If `billingStatus === 'gifted'`, show an info message instead of the "Add storage" CTA:

```tsx
// If in gifted period
{billingStatus === 'gifted' ? (
  <p className="text-sm text-muted-foreground text-center py-2">
    Additional storage becomes available after your gifted period ends.
  </p>
) : (
  <Button onClick={handleAddStorage}>Add Storage</Button>
)}
```

---

### Summary of Files Changed

| File | What Changes |
|------|-------------|
| `supabase/functions/stripe-webhook/index.ts` | Add `asset_safe_monthly`/`asset_safe_annual` to parser; support `mode: 'payment'` in gift handler |
| `supabase/functions/create-checkout/index.ts` | Update `toLookupKey()` to new keys; add storage add-on entitlement guard |
| `supabase/functions/check-subscription/index.ts` | Add `billing_status` to response |
| `src/contexts/SubscriptionContext.tsx` | Add `billing_status` to interface; expose `billingStatus` in context |
| `src/components/SubscriptionTab.tsx` | Fix `handleStartSubscription` lookup key; derive billing frequency label from `plan_lookup_key`; remove tier conditionals; update storage copy |
| `src/pages/Pricing.tsx` | Fix `handleSubscribe` lookup key construction; simplify function signature |
| `src/components/StorageTab.tsx` | Add gifted-period guard on storage add-on CTA |

### No Database Migration Required

The `billing_status` column was added in the prior migration. The `plan_lookup_key` column already stores whatever key the webhook writes. Existing subscribers with `standard_*` keys continue to work — the webhook still recognizes those keys for backward compatibility.

### Stripe Dashboard Prerequisite (Code Cannot Do This)

Before any subscription flows work with the new keys, these prices must exist in Stripe with exact lookup keys:
- `asset_safe_monthly` — $18.99/mo recurring
- `asset_safe_annual` — $189.00/yr recurring
- `storage_25gb_monthly` — $4.99/mo recurring (quantity-enabled)
- `asset_safe_gift_annual` — $189.00 one-time
