## Goal
Eliminate every stale "100GB" mention in the codebase. Standardize on **"50GB storage (+25GB add-on available)"** to match the Pricing page and the real product (single Asset Safe plan + optional 25GB add-on).

## Files to update (10 files, 14 occurrences)

### 1. `src/components/StorageTab.tsx` — Upgrade card rework
Currently shows an "Upgrade to Premium / 100GB" recommendation. Since there is only one paid plan, replace the upsell with an **"Add 25GB" add-on CTA** that calls the existing `add-storage-25gb` edge flow (same path the Billing/Manage tab uses).

- Remove `getUpgradeRecommendation()` (premium-tier logic is obsolete).
- Replace the "Upgrade your storage" panel with a single "Add 25GB to your plan" panel:
  - Headline: "Need more space?"
  - Body: "Add a 25GB storage block to your current plan."
  - Primary button: "Add 25GB" → invokes existing add-storage flow (mirror the call site used in `BillingTab`/Manage tab).
  - Secondary link: "View Pricing" → `/pricing`.
- Drop the "Recommended" badge and the "View Pricing Plans" upsell button.
- Keep the existing plan summary header and the `StorageDashboard` block unchanged.

### 2. Marketing / FAQ / Chatbot copy → "50GB storage (+25GB add-on available)"
- `src/components/AskAssetSafe.tsx` (line 29) — rewrite the canned pricing answer to reflect the single Asset Safe plan, 50GB base + 25GB add-on. Remove the obsolete "Standard vs Premium" two-tier framing.
- `src/components/ChatbotInterface.tsx` (line 68) — same rewrite as above, single-plan language.
- `src/components/HomeFAQ.tsx` (line 33) — rewrite the storage FAQ answer to single plan, "50GB storage with an optional 25GB add-on".

### 3. Public pages
- `src/pages/CompletePricing.tsx` (line 76) — feature bullet: `"50GB secure cloud storage (+25GB add-on available)"`.
- `src/pages/SubscriptionCheckout.tsx` (line 83) — same bullet text.
- `src/pages/Pricing.tsx` (line 179) — helper line currently "100GB ≈ ~6,000 photos…". Change to "50GB ≈ ~3,000 photos or substantial video".
- `src/pages/CompassPartnership.tsx` (line 89) — change "Subscription tiers with scalable storage (25GB–100GB+)" to "50GB base storage with optional 25GB add-ons".

### 4. Admin reference doc
- `src/components/admin/SystemInfrastructure.tsx`
  - Line 420 — list item "100GB storage" → "50GB storage (+25GB add-on)".
  - Line 476 — table cell "Standard: 25GB, Premium: 100GB — enforced at upload" → "Asset Safe plan: 50GB base, +25GB add-on — enforced at upload".

## Stripe manual checklist (for you to verify in dashboard — cannot read from here)
Please confirm in the live Stripe dashboard that none of these still say "100GB":

1. **Product → "Asset Safe" (or equivalent)** description and statement descriptor.
2. **Price object metadata** for the main subscription price (look for `storage_quota_gb` / `total_storage_gb` keys — should read `50`, not `100`).
3. **Add-on price** (`add-storage-25gb` lookup_key) — confirm description and metadata reference 25GB.
4. **Stripe Tax / product tax code descriptions** — usually unaffected, but skim.
5. **Customer Portal configuration → Products** — the plan card shown to customers (description text often duplicates "100GB").
6. **Any active coupon / promo descriptions** mentioning storage.
7. **Stripe-hosted invoice & receipt line-item descriptions** — verify on the next real invoice.

## Out of scope
- No schema, RLS, edge function, or entitlement changes — `STORAGE_LIMITS` and `getStorageLimit()` already enforce 50GB; we are only fixing display copy and the upgrade card's CTA target.
- No changes to the `add-storage-25gb` edge function itself — we just wire the existing flow into the new StorageTab CTA.

## Verification after build
- Visit `/account?tab=storage`: card shows "Add 25GB" CTA, no "100GB" anywhere.
- Visit `/pricing`, `/checkout`, homepage FAQ, chatbot panel: all say 50GB (+25GB add-on).
- `grep -rni "100gb" src/` returns zero matches.
