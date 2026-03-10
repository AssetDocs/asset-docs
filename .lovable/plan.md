
## Three Issues — One Coherent Plan

### Issue 1: Stripe Customer Portal not showing cancel/storage options
The `customer-portal` edge function creates a session using Stripe's **default** portal configuration (`stripe.billingPortal.sessions.create` with no `configuration` parameter). This means whatever is toggled on/off in the Stripe Dashboard's portal settings controls what users see. The fix is to pass an explicit `configuration` object directly in the API call so cancel subscription and subscription update (quantity adjustments for storage) are always enabled — independent of dashboard defaults.

**Fix:** Update `supabase/functions/customer-portal/index.ts` to create a portal session with an inline `configuration` that explicitly enables:
- `cancel_subscription: { mode: 'at_period_end' }`  
- `subscription_update: { default_allowed_updates: ['quantity'] }`  
- `subscription_pause: { enabled: false }`  
- `invoice_history: { enabled: true }`

### Issue 2: Merge Billing + Plan tabs into a single "Manage" tab
**Files changed:**
- `src/pages/AccountSettings.tsx` — rename tab value `billing`→`manage`, remove `subscription` tab trigger/content, update tab grid to `grid-cols-5`, update `restrictedTabs`, update `getDefaultTab` valid tabs list
- `src/components/BillingTab.tsx` — repurpose/rename into `ManageTab.tsx` (new file) — a single combined component with these sections in order:
  1. **Manage Your Subscription** — Current plan card (pulled from SubscriptionTab's subscribed view: green plan box with status, billing, storage, next date, + "Manage Your Subscription" CTA → Stripe portal)
  2. **Payment Methods** — Single "Manage Payment Methods" button → Stripe portal
  3. **Payment History** — `<PaymentHistory />` component (already exists)
  4. **Add or Adjust Storage** — Storage add-on card (pulled from SubscriptionTab: +25GB/$4.99/mo, "Add or Adjust Storage" → Stripe portal)
  5. **Account Deletion** — Danger zone card (pulled from SubscriptionTab: delete account button + contributor admin deletion logic)
- Remove the "What's included with your plan" section from SubscriptionTab's subscribed view entirely
- The **not-subscribed view** of SubscriptionTab becomes the content of the `manage` tab when user has no active plan (the checkout flow stays intact)

### Issue 3: Tab state resets to Profile when switching browser tabs
**Root cause:** `AccountSettings` uses `<Tabs defaultValue={getDefaultTab()}>`. `defaultValue` is only read once on mount. When the user switches away and returns, React re-renders but does NOT remount — the tab state is in memory and should persist. However, the actual bug is that the URL `?tab=X` param is not being updated when the user clicks a tab, so if the page happens to remount (e.g. visibility change causing Supabase session refresh + auth redirect), it re-evaluates `getDefaultTab()` from the URL which still says nothing = defaults to `profile`.

**Fix:** Make the tab state URL-driven (controlled):
- In `AccountSettings.tsx`, track the active tab with `useState` initialized from the URL
- Add `onValueChange` to `<Tabs>` that calls `navigate` (with `replace: true`) to update `?tab=X` whenever user clicks a tab
- This way if the page remounts, `getDefaultTab()` reads the correct `?tab=manage` from the URL and restores the right tab

### Files to change

| File | Action |
|---|---|
| `supabase/functions/customer-portal/index.ts` | Add inline portal configuration enabling cancel + storage quantity updates |
| `src/components/ManageTab.tsx` | New file — merged billing+subscription tab with 5 sections |
| `src/pages/AccountSettings.tsx` | Replace billing+subscription with single `manage` tab; add URL-sync via `onValueChange` + `navigate` |
| `src/components/BillingTab.tsx` | Can be removed or left unused (ManageTab replaces it) |
