
## Single-Plan Migration: Asset Safe Plan

This is a significant structural change across multiple files. The goal is to replace all two-tier (Standard/Premium) logic with a single "Asset Safe Plan" that includes everything, with storage governed only by add-on blocks.

---

### Architecture Decisions

**Backend / Entitlements (No DB migration needed)**
The `entitlements` table already stores `plan` as free text and `status`. The existing `standard`/`premium` values in the DB can remain — they just won't be user-facing. The `check-subscription` edge function returns `subscription_tier`; we'll display "Asset Safe Plan" regardless of its value.

**Feature Gating (Simplify)**
`subscriptionFeatures.ts` currently gates Legacy Locker, Authorized Users, and Emergency Access behind `premium`. Per the brief, all subscribers get everything. We'll collapse the tier system: all `SUBSCRIPTION_FEATURES` map to `'standard'` (i.e., any active subscriber), and the `SubscriptionTier` type will remain for backward compatibility but effectively becomes a single tier.

**`SubscriptionContext`**
`isPremium` will always return `true` for any active subscriber, since all features are now included. `mapTierToEnum` will map both `standard` and `premium` → `'premium'` so existing Premium feature guards still pass.

---

### Files to Change

#### 1. `src/config/subscriptionFeatures.ts`
- Move all `premium`-only features to `requiredTier: 'standard'` (Legacy Locker, Authorized Users, Emergency Access, Executor Tools, etc.)
- Update fallback messages to remove upgrade references
- `STORAGE_LIMITS` — remove the two-tier structure; storage is now governed exclusively by `total_storage_gb` from entitlements (add-ons). Keep `standard` as 25GB default (entitlements handles this server-side).

#### 2. `src/contexts/SubscriptionContext.tsx`
- Update `mapTierToEnum`: map both `standard` and `premium` → `'premium'` so `isPremium` is always `true` for active subscribers
- This ensures all existing `PremiumFeatureGate` checks pass without needing to touch every gating component

#### 3. `src/pages/Pricing.tsx`
- **Remove** the two `plans` array and the billing cycle toggle (or keep cycle toggle for the single plan)
- **Replace** with a single plan card titled "Asset Safe Plan"
- Single plan pricing: $12.99/mo or $129/yr (starting price; storage add-ons on top)
- Remove `Standard` vs `Premium` comparison logic
- Remove `premiumOnlyIndicators` section
- Rename "Included in Both Plans" → "What's Included"
- **Add** "Why one plan?" section (the approved copy from the brief)
- Update `SEOHead` metadata to single-plan messaging
- Update `structuredData` to single product

#### 4. `src/components/PricingHero.tsx`
- Update headline: "One Simple Plan. Everything Included."
- Update subtext to match approved brand messaging

#### 5. `src/components/PricingPlans.tsx`
- Replace two-plan grid with a single plan card
- Remove "Business" tab (or keep it — the brief doesn't mention business plans, but this is a separate concern; we'll leave the business tab as-is since it's enterprise/B2B, not the consumer tier)
- Remove `premiumOnlyFeatures` section
- Rename "Included in Both Plans" → "What's Included"

#### 6. `src/components/SubscriptionTab.tsx`
- **Not-subscribed view**: Remove plan selector (`planConfigs` with Standard/Premium). Replace with a single plan card showing "Asset Safe Plan" at $12.99/mo
- **Subscribed view**: Replace `planConfigs[activeTier].title` display with "Asset Safe Plan"
- Remove "Compare Plans" collapsible section (it compares Standard vs Premium — no longer relevant)
- Remove the `planConfigs` object and replace with a single `planConfig` object
- Keep billing interval toggle (Monthly/Yearly still applies)
- Keep storage add-on section as-is (it's positioning storage as growth)
- Price display: "$12.99/mo or $129/yr"

#### 7. `src/pages/Gift.tsx`
- Replace two gift plans with a single "Gift – Asset Safe Plan"
- Price: $129/yr (gift is yearly only)
- Features: unified feature list
- Remove the two-plan grid; single centered card layout
- Update `SEOHead` structured data

#### 8. Pricing page `giftPlans` in `src/pages/Pricing.tsx` (As a Gift tab)
- Same single-plan approach in the Gift tab

#### 9. `src/components/WelcomeBanner.tsx` / other UI components referencing Standard/Premium
- Quick search/replace of any "Standard" or "Premium" plan name references in UI copy

---

### Single Plan Configuration (Canonical)

```
Title: Asset Safe Plan
Tagline: "One simple plan. Everything included."
Monthly: $12.99/mo
Yearly: $129/yr
Checkout lookup key: standard_monthly / standard_yearly (unchanged in Stripe — just displayed differently)
Features (unified):
  - Unlimited properties
  - 25GB secure cloud storage (+ add-ons available)
  - Photo, video & document uploads
  - Room-by-room inventory organization
  - Secure Vault & Password Catalog
  - Legacy Locker (family continuity & instructions)
  - Authorized Users
  - Emergency Access Sharing
  - Voice notes, damage reports, exports
  - Memory Safe & Quick Notes
  - MFA, full web platform access
  - Service Pros Directory
```

**Storage add-on:** +25GB for $4.99/mo (unchanged)

---

### Checkout Flow Changes

`handleSubscribe` / `handleStartSubscription` in `Pricing.tsx` and `SubscriptionTab.tsx`:
- Remove plan type selector
- Always use `standard_monthly` or `standard_yearly` lookup key depending on billing interval
- The Stripe product itself doesn't change — just the presentation

---

### "Why One Plan?" Section

Add to `Pricing.tsx` below the plan card and add-on section:

> **Why one plan?**
> Most services make you choose between "good" and "better." We don't think that makes sense when it comes to protecting what matters most.
> Asset Safe is built as a complete system, not a set of gated features. That's why there's only one plan — everything included — with flexible storage you can adjust anytime as your needs evolve.
> Simple. Transparent. Built for the long term.

---

### SEO Updates

- `Pricing.tsx` SEOHead title: `"Asset Safe Plan — Everything Included | Asset Safe"`
- Description: `"One simple plan starting at $12.99/mo. Secure asset documentation, cloud storage, legacy tools, and trusted access — with flexible storage that grows with you."`
- `structuredData`: single `productSchema` for "Asset Safe Plan"

---

### What We Are NOT Changing

- Stripe product/price IDs and lookup keys (backend stays `standard_monthly`, `standard_yearly`)
- The `entitlements` DB table structure
- Edge functions (`check-subscription`, `create-checkout`, `stripe-webhook`)
- All non-pricing UI (dashboard features, uploads, vault, etc.)
- Business enterprise plans in `PricingPlans.tsx` (separate B2B track)
- The `PremiumFeatureGate` component (becomes a no-op for active subscribers via context fix)

---

### Files to Edit (Summary)

1. `src/config/subscriptionFeatures.ts` — collapse all features to standard tier
2. `src/contexts/SubscriptionContext.tsx` — map all tiers → premium for active subscribers
3. `src/pages/Pricing.tsx` — single plan card + "Why one plan?" section + SEO update
4. `src/components/PricingHero.tsx` — updated headline
5. `src/components/PricingPlans.tsx` — single plan display, remove tier comparison
6. `src/components/SubscriptionTab.tsx` — remove plan selector, single plan display, remove Compare Plans
7. `src/pages/Gift.tsx` — single gift plan
