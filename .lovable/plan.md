
## Gift Flow Fix Plan

### What's Actually Broken

After deep inspection, there are **three** problems, not two:

**Problem 1 — Most Critical: Webhook insert references columns that don't exist**
The `stripe-webhook` tries to insert these columns into `gift_subscriptions`:
- `stripe_checkout_session_id` → does NOT exist (table has `stripe_session_id`)
- `term` → does NOT exist
- `expires_at` → does NOT exist

This means **every real gift purchase fails** — the insert throws a Postgres error, the webhook returns an error to Stripe, and Stripe retries repeatedly. The gift record is never created, no email is sent to the recipient. The one existing record in the database (`GIFT-3FHPP4827...`) has `status: 'pending'` and uses the old column name — it's from a legacy flow predating the webhook rewrite.

**Problem 2: `GiftSuccess.tsx` queries the wrong column**
Line 30 queries `.eq('stripe_session_id', sessionId)` — this column *does* exist in the table, so this query won't error, but it will never find the record because the webhook never successfully inserts one (Problem 1). Once Problem 1 is fixed, this page works correctly since the webhook populates `stripe_session_id` as the correct column name.

Actually — re-reading the webhook insert: the webhook uses `stripe_checkout_session_id` as the key but the table column is `stripe_session_id`. So GiftSuccess.tsx's `.eq('stripe_session_id', sessionId)` would actually be the **correct** column after the schema fix. The page's query logic is fine once the schema is aligned.

**Problem 3: `claim_gift_subscription` RPC never activates an entitlement**
The RPC only marks `redeemed = true` in `gift_subscriptions`. It never writes to `entitlements`. The recipient claims the gift, gets redirected to `/account`, but their entitlement row stays `plan: 'free', status: 'inactive'`. They get no actual platform access.

---

### The Fix Plan

**Fix 1 — Database migration: align `gift_subscriptions` schema with webhook**

Add the missing columns the webhook expects:
```sql
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS term text DEFAULT 'yearly',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
```

This is the root fix — all three inserts in the webhook (`stripe_checkout_session_id`, `term`, `expires_at`) will now land correctly.

**Fix 2 — Webhook: also populate the legacy `stripe_session_id` column**

To keep `GiftSuccess.tsx` working without any changes (it queries `stripe_session_id`), add `stripe_session_id: session.id` to the webhook insert alongside `stripe_checkout_session_id`. Both columns get the same value. This is a one-line addition to the webhook insert object in `supabase/functions/stripe-webhook/index.ts` around line 491.

**Fix 3 — Update `claim_gift_subscription` DB function to activate entitlement**

After marking the gift redeemed, the function must upsert an entitlement for the recipient. The gift record contains `expires_at` (available after Fix 1) and the recipient user ID. The entitlement should use `entitlement_source: 'gift'` with `status: 'active'`, `plan: 'standard'`, `base_storage_gb: 50` (system-wide standard per architecture memory), and `current_period_end` = the gift's `expires_at`.

```sql
-- After the UPDATE statement in claim_gift_subscription:
INSERT INTO public.entitlements (
  user_id, plan, status, entitlement_source,
  base_storage_gb, cancel_at_period_end,
  storage_addon_blocks_qty, current_period_end,
  expires_at, updated_at
)
VALUES (
  v_user_id, 'standard', 'active', 'gift',
  50, false, 0,
  (SELECT expires_at FROM public.gift_subscriptions WHERE id = v_gift_id),
  (SELECT expires_at FROM public.gift_subscriptions WHERE id = v_gift_id),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'standard',
  status = 'active',
  entitlement_source = 'gift',
  base_storage_gb = 50,
  cancel_at_period_end = false,
  current_period_end = EXCLUDED.current_period_end,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();
```

Also update the backwards-compat tables (`profiles`, `subscribers`) the same way the regular checkout flow does.

---

### Files to Edit

| # | File | Change |
|---|------|--------|
| 1 | DB migration | Add `stripe_checkout_session_id`, `term`, `expires_at` columns to `gift_subscriptions` |
| 2 | `supabase/functions/stripe-webhook/index.ts` | Add `stripe_session_id: session.id` to the gift insert (line ~502) so both column names are populated |
| 3 | DB migration | Update `claim_gift_subscription` function to upsert `entitlements`, `profiles`, and `subscribers` after marking gift redeemed |

No frontend changes needed — `GiftClaim.tsx` already redirects to `/account` and shows the right success state. `GiftSuccess.tsx` queries `stripe_session_id` which will be correctly populated after Fix 2.

```text
Purchase flow after fix:
  Stripe → webhook → gift_subscriptions insert (all columns land) ✓
                   → recipient email sent ✓

Claim flow after fix:
  claim_gift_subscription RPC
    → gift_subscriptions.redeemed = true ✓
    → entitlements upserted (status: active, plan: standard) ✓
    → profiles updated ✓
    → redirect to /account → full access ✓
```
