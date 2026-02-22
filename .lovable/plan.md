

## Stripe Billing Migration: Lookup Keys, Portal-Managed, Hardened Entitlements

This plan migrates all billing flows to use Stripe's pre-created Price lookup keys, routes all management through the Stripe Customer Portal, and hardens the entitlements table to prevent drift and race conditions.

---

### 1. Database Migration

Add new columns to the `entitlements` table:

```text
stripe_customer_id        TEXT
stripe_subscription_id    TEXT
stripe_plan_price_id      TEXT
plan_lookup_key           TEXT
subscription_status       TEXT        (mirrors Stripe: active, trialing, past_due, canceled, etc.)
cancel_at_period_end      BOOLEAN     DEFAULT false
base_storage_gb           INTEGER     DEFAULT 0   (not 5 -- storage only granted with active sub)
storage_addon_blocks_qty  INTEGER     DEFAULT 0
total_storage_gb          INTEGER     GENERATED ALWAYS AS (base_storage_gb + (storage_addon_blocks_qty * 25)) STORED
```

The `total_storage_gb` column is the single authoritative quota. The existing `plan`, `status`, `current_period_end` columns remain for backward compatibility.

---

### 2. Edge Function: `create-checkout` (rewrite)

- Accept `planLookupKey` (e.g. `standard_monthly`, `premium_yearly`) instead of `planType` + `billingInterval`
- Use `stripe.prices.list({ lookup_keys: [planLookupKey], active: true })` to find the Price
- Fail explicitly if no active price found (no silent fallback)
- Create checkout session with `price: foundPrice.id` (no inline `price_data`)
- Keep `billing_address_collection: 'required'` and US-only shipping restriction
- Store `plan_lookup_key` and `user_id` in session metadata
- Backward compat: still accept `planType` + `billingInterval` and map to lookup key if `planLookupKey` not provided

---

### 3. Edge Function: `customer-portal` (update)

- Update return URL to `/account/settings?tab=subscription`
- Add Stripe Portal Configuration to restrict allowed actions:
  - Switching between the 4 base plan prices (by lookup key)
  - Adjusting quantity of `storage_25gb_monthly` add-on
  - Cancel subscription
  - Update payment method
  - No adding arbitrary products or duplicate base plans
- Create a portal configuration via `stripe.billingPortal.configurations.create()` with explicit `products` and `features` restrictions

---

### 4. Edge Function: `stripe-webhook` (major rewrite of handlers)

**`handleSubscriptionChange` rewrite:**
- Use `subscription.items.data` directly (already expanded with price)
- Read `item.price.lookup_key` directly -- no separate price fetch
- Classify items:
  - If lookup_key matches `standard_*` or `premium_*`: base plan item
    - Parse tier (standard/premium) and interval (monthly/yearly)
    - Set `base_storage_gb`: standard = 25, premium = 100
  - If lookup_key === `storage_25gb_monthly`: storage add-on
    - Read `item.quantity` as `storage_addon_blocks_qty`
- Store `stripe_subscription_id` in entitlement -- only update when webhook subscription ID matches or no existing subscription ID
- Prevent deleted/stale subscriptions from overwriting active entitlements
- Set `cancel_at_period_end` from `subscription.cancel_at_period_end`
- Set `subscription_status` directly from Stripe status string
- Upsert entitlements with all new fields

**`handleSubscriptionDeleted` update:**
- Only reset entitlements if `stripe_subscription_id` matches the deleted subscription
- Reset `base_storage_gb` to 0, `storage_addon_blocks_qty` to 0

**`handleCheckoutCompleted` update:**
- On first checkout, retrieve the subscription and process items using the same lookup-key logic
- Store `stripe_customer_id` in entitlements

**Remove:**
- `handleStorageAddon` function (metadata-based storage -- replaced by lookup key qty)
- `getPlanLimits` and `getPlanLimitsFromType` (replaced by lookup-key parsing)
- Storage add-on handling from checkout metadata

---

### 5. Edge Function: `check-subscription` (update)

- Read new entitlement fields: `plan_lookup_key`, `base_storage_gb`, `storage_addon_blocks_qty`, `total_storage_gb`, `cancel_at_period_end`, `stripe_subscription_id`
- Return these to the UI so the frontend can display accurate info
- Use `total_storage_gb` as the authoritative storage quota (not `profiles.storage_quota_gb`)

---

### 6. Edge Function: `sync-subscription` (update)

- Parse subscription items by `price.lookup_key` (same logic as webhook)
- Store all new entitlement fields
- This function is now a fallback reconciliation tool, not the primary update path

---

### 7. UI: `SubscriptionTab.tsx` (major update)

**Initial purchase flow:**
- Map `selectedPlan` + `billingInterval` to a lookup key string (e.g. `standard_monthly`)
- Pass `planLookupKey` to `create-checkout` instead of `planType` + `billingInterval`

**Subscription management (subscribed users):**
- Replace `handleChangePlan` (which calls `change-plan` edge function) with opening Stripe Customer Portal
- Replace `handleAddStorage` (which calls `add-storage-25gb`) with opening Stripe Customer Portal
- Replace `handleCancelSubscription` (which calls `cancel-subscription`) with opening Stripe Customer Portal
- Add a prominent "Manage Billing" button that opens the portal for all changes
- Remove the custom cancel toggle/confirmation UI, the change-plan dialog, and the storage add-on purchase button
- Keep the current plan display, but source storage from `total_storage_gb` in entitlements

**Post-redirect refresh:**
- After returning from Stripe (URL params like `payment_success=true` or `storage_added=true`):
  - First call `check-subscription` to refresh UI
  - Only call `sync-subscription` if entitlements appear stale or missing

---

### 8. UI: `Pricing.tsx` and `CompletePricing.tsx`

- Update `handleSubscribe` to pass `planLookupKey` instead of `planType` + `billingInterval`

---

### 9. UI: `SubscriptionSuccess.tsx`

- After Stripe redirect: call `check-subscription` first
- Only call `sync-subscription` if entitlements are missing or stale
- Pass `planLookupKey` instead of `planType` when retrying checkout

---

### 10. `SubscriptionContext.tsx`

- Add new fields to `SubscriptionStatus` interface: `plan_lookup_key`, `base_storage_gb`, `storage_addon_blocks_qty`, `total_storage_gb`, `cancel_at_period_end`
- Use `total_storage_gb` from entitlements as the authoritative storage quota

---

### 11. Deprecated Functions (stop calling from UI)

These edge functions remain deployed but are no longer invoked:
- `change-plan`
- `add-storage`
- `add-storage-25gb`
- `cancel-subscription`

---

### Technical Details

**Lookup key mapping:**
```text
standard_monthly  -> plan=standard, interval=month, base_storage_gb=25
standard_yearly   -> plan=standard, interval=year,  base_storage_gb=25
premium_monthly   -> plan=premium,  interval=month, base_storage_gb=100
premium_yearly    -> plan=premium,  interval=year,  base_storage_gb=100
storage_25gb_monthly -> storage add-on, qty-based
```

**Subscription ID guard (webhook):**
```text
Before updating entitlements:
  1. Read existing entitlement.stripe_subscription_id
  2. If existing ID is set AND differs from webhook subscription ID:
     - Check if existing subscription is still active in Stripe
     - If yes, skip update (stale webhook)
     - If no, proceed with update
  3. If no existing ID, proceed with update
```

**Portal configuration restrictions:**
- `subscription_update.products`: only the 4 base plan prices + storage add-on
- `subscription_cancel.enabled`: true
- `payment_method_update.enabled`: true
- `customer_update.allowed_updates`: ['email', 'address']

**Files modified/created:**
| File | Action |
|------|--------|
| Database migration | Add columns to entitlements |
| `supabase/functions/create-checkout/index.ts` | Rewrite for lookup keys |
| `supabase/functions/customer-portal/index.ts` | Add portal config restrictions |
| `supabase/functions/stripe-webhook/index.ts` | Major rewrite for lookup-key parsing |
| `supabase/functions/check-subscription/index.ts` | Return new entitlement fields |
| `supabase/functions/sync-subscription/index.ts` | Lookup-key parsing |
| `src/components/SubscriptionTab.tsx` | Portal-based management |
| `src/pages/Pricing.tsx` | Pass lookup key |
| `src/pages/CompletePricing.tsx` | Pass lookup key |
| `src/pages/SubscriptionSuccess.tsx` | Smart sync logic |
| `src/contexts/SubscriptionContext.tsx` | New fields |

