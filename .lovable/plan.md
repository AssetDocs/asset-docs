## Goal
In Admin → Overview → User Management → All Users, make the **Plan** column clearly distinguish between:
- **Asset Safe Plan (Monthly)** — paid Stripe monthly subscription
- **Asset Safe Plan (Annual)** — paid Stripe annual subscription
- **Asset Safe Plan (Gift)** — entitlement granted via a redeemed gift, with purchaser name + email shown beneath the plan label

Lifetime/Admin/AU rows stay as they are.

## Scope
Frontend-only change to `src/components/admin/AdminUsers.tsx`. No schema or edge function changes — all data needed is already loaded.

## Data sources (already loaded in the component)
- `entitlements.plan_lookup_key` — `asset_safe_monthly` | `asset_safe_annual` (and similar)
- `entitlements.entitlement_source` — `stripe` | `admin` | (future) `gift`
- `giftSubscriptions` state — already fetched via `from('gift_subscriptions').select('*')`

A gift-redeemed user is identified by:
- `gift_subscriptions.recipient_user_id === user.user_id`
- `redeemed === true` (or `redemption_status === 'redeemed'`)

## Changes

### 1. Build a gift lookup map (after gifts are fetched)
```ts
const giftByRecipient = useMemo(() => {
  const m = new Map<string, GiftSubscription>();
  for (const g of giftSubscriptions) {
    if (g.recipient_user_id && (g.redeemed || g.redemption_status === 'redeemed')) {
      m.set(g.recipient_user_id, g);
    }
  }
  return m;
}, [giftSubscriptions]);
```

### 2. Extend `getPlanInfo` to accept gift + lookup_key
Update the signature and the Asset Safe branch:
```ts
const getPlanInfo = (planId, subscriptionTier, entitlementSource, stripeSubId, planLookupKey, gift) => {
  // existing lifetime / admin branches unchanged
  // ...
  if (tier === 'standard' || tier === 'premium') {
    if (gift) {
      return { name: 'Asset Safe Plan (Gift)', price: 'Gift', variant: 'gift' };
    }
    const isAnnual = planLookupKey?.includes('annual') || planLookupKey?.includes('yearly');
    return {
      name: isAnnual ? 'Asset Safe Plan (Annual)' : 'Asset Safe Plan (Monthly)',
      price: isAnnual ? '$189/yr' : '$18.99/mo',
    };
  }
};
```

Also surface `plan_lookup_key` on the user row (already pulled from entitlements at line ~131 — add it to the mapping at ~204 so it's available here).

### 3. Render purchaser info under the plan name for gift rows
In the Plan cell (around line 547), when `planInfo.variant === 'gift'`:
```tsx
<div>
  <p className="font-medium">Asset Safe Plan (Gift)</p>
  <p className="text-xs text-muted-foreground">Gift · no recurring charge</p>
  <div className="mt-1 pt-1 border-t text-xs">
    <p className="text-muted-foreground">Gifted by:</p>
    <p className="font-medium">{gift.purchaser_name || '—'}</p>
    <p className="text-muted-foreground">{gift.purchaser_email}</p>
    {gift.redeemed_at && (
      <p className="text-muted-foreground mt-0.5">
        Redeemed {formatDate(gift.redeemed_at)}
      </p>
    )}
  </div>
</div>
```

### 4. Source badge
When a row is gift-redeemed, render a `Gift` badge (purple/pink) in the Source column instead of/in addition to whatever `entitlement_source` says, so admins can scan-spot gifts.

## Out of scope
- Gift Subscriptions tab (already shows purchaser + recipient correctly).
- Any change to checkout/redeem flows — the purchaser is already captured at `create-gift-checkout` time (`purchaser_name`, `purchaser_email`).
- No DB migration.

## Acceptance
- Monthly Stripe subscriber → "Asset Safe Plan (Monthly)" / "$18.99/mo"
- Annual Stripe subscriber → "Asset Safe Plan (Annual)" / "$189/yr"
- Redeemed gift recipient → "Asset Safe Plan (Gift)" with purchaser name + email + redeemed date underneath, plus a `Gift` source badge
- Lifetime / Admin / Authorized User rows unchanged
