
# Fix & Simplify Gift Subscription Flow

## Current State Summary

**Two competing systems exist:**
1. **Legacy (`/redeem?token=`)** — Uses the `gifts` table. The `stripe-webhook` populates this on checkout completion, sends emails with `/redeem?token=` links, and redemption directly upserts entitlements. This is actually what runs today because `create-gift-checkout` uses `mode: "subscription"` which hits the legacy path in the webhook.
2. **New (`/gift-claim?code=`)** — Uses the `gift_subscriptions` table with `claim_gift_subscription` RPC. Relies on email matching. Currently orphaned — the webhook never writes to `gift_subscriptions` for new gift checkouts (only for an old `gift_code` metadata path that no longer exists).

**Stripe key bug:** `create-gift-checkout` calls `stripe.prices.list({ lookup_keys: ["standard_yearly"] })` — wrong key. The correct key per project memory is `asset_safe_gift_annual` (or `asset_safe_annual`).

**Mode bug:** `create-gift-checkout` uses `mode: "subscription"`. For a non-renewing gift, this should be `mode: "payment"` with a one-time price, OR `mode: "subscription"` with `cancel_at_period_end: true` set immediately after session creation. The webhook already handles `cancel_at_period_end` for subscription mode.

---

## Plan

### A — Fix Stripe price lookup key in `create-gift-checkout`

- Change lookup key from `standard_yearly` to `asset_safe_gift_annual`
- Keep `mode: "subscription"` (webhook already handles `cancel_at_period_end: true` for gift subscriptions)
- Add `recipient_name` field to checkout form (optional) and pass it in metadata

### B — Unify webhook to write ONLY to `gift_subscriptions`

Replace the current `handleCheckoutCompleted` gift flow in `stripe-webhook/index.ts` to:
- On `checkout.session.completed` with `metadata.gift === "true"`:
  - Generate a `gift_code` (format: `GIFT-XXXXXXXXXX`)
  - Write to `gift_subscriptions` table (not `gifts`)
  - Set `cancel_at_period_end: true` on the subscription
  - Send recipient email with BOTH the gift code AND a claim link (`/gift-claim?code=<gift_code>`)
  - Send purchaser confirmation email
- Stop writing to the `gifts` table for new purchases

### C — Legacy redirect: `/redeem?token=` → `/gift-claim`

Update `GiftRedeem.tsx` to:
- Look up the token in the `gifts` table
- Find the corresponding `gift_subscriptions` record (or create a bridge lookup by `stripe_checkout_session_id`)
- Redirect to `/gift-claim?code=<gift_code>` if found
- If no corresponding `gift_subscriptions` record exists (pure legacy), process redemption inline as it does today

This preserves existing unredeemed legacy links without breaking them.

### D — Click-to-claim on `/gift-claim`

Update `GiftClaim.tsx` to:
- Read `?code=` from URL params (already reads `?gift_code=` — update to also accept `?code=`)
- If user is logged in and code is in URL: auto-trigger claim on mount (no button click needed)
- If user is NOT logged in and code is in URL: show login/signup prompt with a message "Sign in to claim your gift", and set redirect back to `/gift-claim?code=<gift_code>` after auth
- Keep manual code entry as fallback

### E — Gift checkout form: add optional recipient name

Add an optional "Recipient's First Name" field to `GiftCheckout.tsx`:
- Added to form schema as optional
- Passed to `create-gift-checkout` function as `recipientName`
- Edge function passes it as `recipient_name` in Stripe metadata
- Webhook stores it in `gift_subscriptions.recipient_name`
- Email personalizes greeting: "Hi [Name]," or "Congratulations [Name]!"

---

## Files to Change

| File | Change |
|---|---|
| `src/pages/GiftCheckout.tsx` | Add optional `recipientName` field |
| `src/pages/GiftClaim.tsx` | Accept `?code=` param, auto-claim if logged in, auth redirect if not |
| `src/pages/GiftRedeem.tsx` | Convert to redirect wrapper → `/gift-claim?code=` |
| `supabase/functions/create-gift-checkout/index.ts` | Fix lookup key to `asset_safe_gift_annual`, add `recipient_name` to metadata |
| `supabase/functions/stripe-webhook/index.ts` | Rewrite gift path in `handleCheckoutCompleted`: write to `gift_subscriptions`, send new email with claim link |

## Database

The `gift_subscriptions` table already exists with all needed columns (`gift_code`, `recipient_email`, `purchaser_name`, `recipient_name`, `gift_message`, `status`, `redeemed`, etc.) based on the `get_claimable_gift` and `claim_gift_subscription` RPC functions already present.

The `gifts` table is kept as-is (read-only for legacy tokens) — no migration needed. New purchases will only write to `gift_subscriptions`.

## Constraints Preserved

- Consent logging behavior unchanged
- No new competing redemption routes (legacy `/redeem` becomes a redirect wrapper)
- All new gifts use `gift_subscriptions` exclusively
- `claim_gift_subscription` RPC email-matching logic is preserved
