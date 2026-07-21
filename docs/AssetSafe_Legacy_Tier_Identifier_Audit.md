# Asset Safe – Legacy Tier Identifier Audit

_Last updated: 2026-07-21_

Governing rule: **Change what people see, not how the system works.**

All customer- and operator-facing surfaces now read "The Asset Safe Plan" (long form)
or "Asset Safe Plan" (compact UI labels). The identifiers below are intentionally
retained inside the runtime because renaming them would require coordinated Stripe,
webhook, and data migrations. Do not rename these without an accompanying migration plan.

## Retained internal identifiers

| Identifier | Location | Purpose | Rename risk |
|---|---|---|---|
| `subscription_tier` column values (`standard`, `premium`) | `public.profiles`, `public.subscribers` | Historical tier tag written by legacy checkouts and Stripe webhooks. Used by admin views and PaymentHistory to distinguish the paid product from `basic`/gift/lifetime rows. | Renaming would rewrite production rows and every webhook branch. Keep. |
| `plan_id` values (`standard_monthly`, `standard_annual`, `premium_monthly`) | `public.profiles.plan_id`, `public.entitlements.plan` | Written by `create-checkout`, `stripe-webhook`, `sync-subscription`. Read by entitlement gates. | Requires atomic Stripe lookup_key + webhook + entitlement rewrite. Keep. |
| Stripe `lookup_key` prefixes (`asset_safe_monthly`, `asset_safe_annual`, `asset_safe_gift_annual`, `standard_monthly`, `premium_monthly`) | Stripe product config, `create-checkout`, `create-gift-checkout` | Bind our client to a specific Stripe price. Legacy `standard_*` / `premium_*` keys still resolve historical customers. | Requires Stripe price re-issuance + customer migration. Keep. |
| `SubscriptionTier` TS union (`'standard' \| 'premium'`) | `src/types`, entitlement helpers | Internal gating type mirroring DB values. | Downstream typed code across ~30 files. Keep. |
| Enum `plan_type` in gift flow (`planType: "standard"`) | `src/pages/Gift.tsx`, `src/pages/Pricing.tsx` | Passed to `create-gift-checkout`; the function resolves the Stripe price by this key. | Requires simultaneous edge-function update. Keep. |
| Webhook fallback labels in `stripe-webhook` (branches on `standard` / `premium`) | `supabase/functions/stripe-webhook/index.ts` | Ensures historical events without new metadata still land on the correct entitlement. | Removing breaks replay of pre-2026 events. Keep. |
| Admin label mapping in `AdminUsers.tsx` (reads `standard`/`premium`, displays "Asset Safe Plan (Monthly/Annual)") | `src/components/admin/AdminUsers.tsx` | Reads legacy values from DB but only ever displays normalized copy. | Presentation layer already normalized. Keep as-is. |
| Legacy `Basic` variant in `getSubscriptionBadgeVariant` (removed) | `src/components/PaymentHistory.tsx` | Previously mapped `basic` badge tone. Superseded by unified badge. | N/A – already normalized. |

## What we changed (customer- and operator-facing copy)

- `src/pages/CompletePricing.tsx` – collapsed the two-tier ("Standard" vs "Premium") layout into a single "The Asset Safe Plan" card that still posts `planLookupKey: 'asset_safe_monthly'` to `create-checkout`.
- `src/components/PricingPlans.tsx` – business tab copy "basic asset documentation needs" → "essential asset documentation needs" so the word "Basic" no longer collides with tier semantics.
- `src/components/PaymentHistory.tsx` – badge no longer prints `payment.subscriptionType` verbatim; always shows "Asset Safe Plan".
- `supabase/functions/send-payment-receipt-internal/index.ts` – receipt planName is always "The Asset Safe Plan" (or the gift variant), regardless of the `planType` we get from Stripe.
- `supabase/functions/send-subscription-welcome-email/index.ts` – dropped `Basic/Standard/Premium/Enterprise` lookup; welcome copy always reads "The Asset Safe Plan".
- `supabase/functions/send-reminder-email/index.ts` – dropped `planDisplayName` branching; body reads "Your Asset Safe Plan subscription…".

## Rules for future work

1. Never rename a retained identifier in this audit without a same-migration plan for Stripe, webhooks, and downstream reads.
2. Any new customer- or operator-facing surface must say "The Asset Safe Plan" / "Asset Safe Plan" – never "Basic", "Standard", or "Premium".
3. Do not introduce new tier vocabulary (Pro, Plus, Family, Business) unless the product framing changes; if it does, replace this document.
