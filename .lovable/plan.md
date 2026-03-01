
# Harden Gift Subscription Safety: Two Targeted Fixes

## Issue 1: Fallback Price Key Creates Renewal Risk

### Current behavior
`create-gift-checkout` tries `asset_safe_gift_annual`, then falls back to `asset_safe_annual` if not found. The webhook sets `cancel_at_period_end: true` inside a try/catch that swallows errors — so if that Stripe API call fails, the gift subscription silently becomes auto-renewing with no alert.

### The two-part fix

**Part A — Remove the unsafe fallback in `create-gift-checkout`**

The fallback to `asset_safe_annual` should be removed entirely. If the gift price key doesn't exist in Stripe, the checkout should fail loudly with a clear error rather than silently create a potentially-renewing subscription. The error message should be actionable.

```
// Before
const fallbackPrices = prices.data.length
  ? prices
  : await stripe.prices.list({ lookup_keys: ["asset_safe_annual"], active: true, limit: 1 });

// After — fail hard, no fallback
if (!prices.data.length) {
  throw new Error("Gift price 'asset_safe_gift_annual' not found in Stripe. Please configure this price key.");
}
```

**Part B — Make `cancel_at_period_end` failure non-silent in the webhook**

Currently the webhook catches the Stripe subscription update error and logs a warning, then continues. This means a gift subscription could become auto-renewing with no observable signal. The fix: log the error with a structured `ERROR`-level tag AND still proceed with writing the gift record (so the recipient gets their gift), but mark the `gift_subscriptions` row with a `needs_cancel_review: true` flag or equivalent so it can be audited. Since there's no such column, the simplest approach is to include the warning in the structured log at a higher severity so it surfaces in edge function logs.

Additionally, add `asset_safe_gift_annual` to `parseSubscriptionItems` so that if the subscription syncs later via `customer.subscription.updated`, it's recognized as a standard plan (not falling through to `plan = 'free'`).

---

## Issue 2: Legacy Fallback Swallows Real Insert Errors

### Current behavior
Lines 509–524: any insert failure into `gift_subscriptions` triggers a fallback to `gifts`, with the secondary insert itself wrapped in `.catch(() => {})`. Real errors (schema mismatch, missing required fields, RLS policy) are silently routed into legacy instead of surfacing.

### The fix: classify errors before falling back

Replace the blanket fallback with structured error classification:

- **Duplicate key (23505)** — a true idempotency case. Log it as a warning, do not insert into legacy, treat as success (the record already exists).
- **All other errors** — do NOT fall back to legacy. Log them at `ERROR` level with full details and re-throw so the webhook returns a non-200 status to Stripe. Stripe will then retry delivery, giving the system a chance to recover.

Remove the legacy fallback insert entirely. The `gifts` table should only be read (for the redirect wrapper on `/redeem`), never written to by new purchases.

---

## Files to Change

| File | Change |
|---|---|
| `supabase/functions/create-gift-checkout/index.ts` | Remove `asset_safe_annual` fallback; fail fast with clear error if `asset_safe_gift_annual` not found |
| `supabase/functions/stripe-webhook/index.ts` | (1) Classify insert errors — remove legacy fallback, only log duplicate as idempotent; (2) Elevate `cancel_at_period_end` failure log to ERROR level; (3) Add `asset_safe_gift_annual` to `parseSubscriptionItems` recognized keys |

## No database changes required

The `gift_subscriptions` table schema is unchanged. The `gifts` table remains intact for legacy token reads on `/redeem`.

## Acceptance checks

- If `asset_safe_gift_annual` is missing from Stripe → checkout returns a clear error, no Stripe session is created
- If `gift_subscriptions` insert fails due to duplicate → logged as idempotent, webhook returns 200
- If `gift_subscriptions` insert fails for any other reason → webhook returns non-200, Stripe retries, error is visible in edge function logs
- If `cancel_at_period_end` Stripe update fails → logged at ERROR level with subscription ID, still visible in dashboard logs
- `asset_safe_gift_annual` subscriptions sync correctly if a `customer.subscription.updated` event fires later
