
## Gift Subscription Overhaul + Pre-Checkout Consent Gate

This is a large, multi-layer implementation. Here is the full breakdown of every change, new file, and database migration required.

---

### Overview of What's Changing

The current gift flow uses the existing `gift_subscriptions` table, `create-gift-checkout` edge function, and `GiftCheckout.tsx` form. Per the brief, we are:

1. **Replacing** the `gift_subscriptions` table with a new canonical `gifts` table (with token-based redemption)
2. **Replacing** the `create-gift-checkout` edge function with a new webhook-driven flow
3. **Adding** a `user_consents` table for legal consent logging
4. **Adding** consent gates (checkbox + DB record) to both the gift checkout and the core subscription checkout
5. **Rewriting** `GiftCheckout.tsx` to use the new single-plan gift model with consent
6. **Creating** a new `/redeem` page (`src/pages/GiftRedeem.tsx`)
7. **Updating** the Stripe webhook to handle the new gift flow (create `gifts` record, cancel auto-renew, send emails)
8. **Adding** `Pricing.tsx` consent gate before regular subscription checkout
9. **Adding** `/redeem` route in `App.tsx`

---

### Part 1: Database Migrations (2 migrations)

**Migration A: `gifts` table + `user_consents` table**

```sql
-- New gifts table (replaces gift_subscriptions for the new flow)
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  gift_message TEXT,
  term TEXT NOT NULL CHECK (term IN ('monthly', 'yearly')),
  expires_at TIMESTAMPTZ,
  redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_by_user_id UUID,
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'redeemed', 'expired')),
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Users can read their own redeemed gift
CREATE POLICY "Users can read their own redeemed gift"
  ON public.gifts FOR SELECT
  USING (redeemed_by_user_id = auth.uid() OR recipient_email = auth.email());

-- Service role manages all (webhook writes via service role)

-- user_consents table for audit trail
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Public insert allowed (pre-auth checkout flow)
CREATE POLICY "Anyone can log consent"
  ON public.user_consents FOR INSERT
  WITH CHECK (true);
```

---

### Part 2: New / Updated Edge Functions

**A. `supabase/functions/create-gift-checkout/index.ts` — Full Rewrite**

The current function creates a `gift_subscriptions` row before payment. The new pattern:

- Accepts: `{ recipientEmail, fromName, giftMessage, term }` (no plan type selector — always core)
- Validates: checks `user_consents` table for a recent consent record for this email
- Creates Stripe Checkout Session with:
  - Price: `standard_yearly` (gifts are always yearly at $189)
  - Mode: `subscription` (needed for Stripe to create subscription, then we cancel auto-renew in webhook)
  - Metadata: `{ gift: "true", gift_term: "yearly", recipient_email, from_name, gift_message }`
  - `cancel_url` and `success_url`
- Does NOT insert into `gifts` yet — that happens in the webhook after payment
- Returns: `{ url }`

**B. `supabase/functions/stripe-webhook/index.ts` — Add gift handling block**

After `checkout.session.completed`, check `metadata.gift === "true"`:
1. Generate a `token` (UUID)
2. Calculate `expires_at` = now + 1 year (for yearly gifts)
3. Insert into `public.gifts` table
4. Immediately cancel the Stripe subscription auto-renew: `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`
5. Send two emails via Resend:
   - Recipient email: "You've been gifted full access to Asset Safe" with CTA link `https://www.getassetsafe.com/redeem?token=<token>`
   - Gifter email: "Your Asset Safe gift was delivered" with recipient name + message

**C. `supabase/functions/log-consent/index.ts` — New lightweight function**

- Accepts: `{ userEmail, consentType, termsVersion, ipAddress }`
- Inserts into `user_consents`
- Returns: `{ success: true, id }`
- Used by both the gift form and the regular subscription button

---

### Part 3: Frontend Changes

**A. `src/pages/GiftCheckout.tsx` — Major Rewrite**

Remove the old dual-plan logic (`planConfigs` with `standard`/`premium`). Replace with:

- Single plan: "Gift – Asset Safe Plan | $189 / 1 year"
- Form fields:
  - Your name (from_name)
  - Your email (for consent logging + Stripe customer)
  - Recipient email
  - Gift message (optional)
  - Delivery: immediately or scheduled date
- Consent checkbox (required before submit):
  > "I agree to the [Terms of Service](/terms) and [Subscription Agreement](/legal)."
- Submit button disabled until consent checked
- On submit:
  1. Call `log-consent` edge function to record consent
  2. If consent logged successfully, call `create-gift-checkout`
  3. Redirect to Stripe
- Plan summary card on the right: shows "Gift – Asset Safe Plan", $189/yr, full feature list, "No auto-renew. Recipient opts in after gift expires."

**B. `src/pages/Pricing.tsx` — Add consent gate for regular subscription**

Before calling `create-checkout` in `handleSubscribe`:
- Show a modal or inline consent section with the same checkbox
- The "Get Started" button only becomes active after consent is checked
- On click, log consent then create checkout session
- Implementation: a small `ConsentModal` component or inline consent below the plan card

**C. `src/pages/GiftRedeem.tsx` — New page**

Route: `/redeem?token=<uuid>`

Logic:
1. Read `token` from URL query param
2. Query `public.gifts` where `token = ?` and `status = 'paid'` and `redeemed = false`
3. Check `expires_at > now()`
4. If invalid/expired: show error state with CTA to `/pricing`
5. If user not logged in: show "Create your account or log in to redeem your gift" → link to `/signup` with `?redirect=/redeem?token=<token>`
6. If logged in + valid: show gift details (from_name, message, expires_at)
7. "Redeem Gift" button:
   - Update `gifts` record: `redeemed = true`, `redeemed_by_user_id = auth.uid()`, `status = 'redeemed'`
   - Upsert into `entitlements`: `plan = 'core'` (or `standard`), `status = 'active'`, `expires_at = gift.expires_at`, `billing_status = 'gifted'`
   - Redirect to `/dashboard`

**D. `src/App.tsx` — Add `/redeem` route**

Add `import GiftRedeem from "./pages/GiftRedeem"` and `<Route path="/redeem" element={<GiftRedeem />} />`.

**E. `src/pages/Gift.tsx` — Minor update**

Update `handleGiftPurchase` to navigate to `/gift-checkout` directly (already does this, just ensure no plan type selection required since there's only one plan). Remove the old `planType` param.

---

### Part 4: Email Templates

The webhook will call the existing `send-gift-email` edge function (already deployed) for the gifter confirmation. For the recipient email ("You've been gifted"), we'll add logic to call the existing `send-welcome-email` or create a new direct Resend call inside the webhook. Both use `RESEND_API_KEY` (already set as a secret).

Recipient email content:
- Subject: "You've been gifted full access to Asset Safe"
- Body: From name, gift message, CTA button → `https://www.getassetsafe.com/redeem?token=<token>`

Gifter confirmation email:
- Subject: "Your Asset Safe gift was delivered"
- Body: Recipient email, copy of message, Stripe receipt link

---

### Part 5: Entitlements for Gifted Users

The `entitlements` table already has a `plan`, `status`, and `expires_at` column. Redemption upserts:
```sql
plan = 'standard'  (for backend compat)
status = 'active'
expires_at = gift.expires_at
billing_status = 'gifted'  (new field needed)
```

We need to check if `billing_status` column exists — if not, add it in the migration. This allows the UI to display "Gifted access expires on [date]" and block storage add-ons during gift period.

**Migration B addendum: add `billing_status` to entitlements if not present:**
```sql
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active';
```

---

### Files To Create / Edit (Summary)

| File | Action |
|------|--------|
| `supabase/migrations/XXXX_gifts_and_consents.sql` | New — creates `gifts`, `user_consents`, adds `billing_status` to `entitlements` |
| `supabase/functions/create-gift-checkout/index.ts` | Rewrite — single plan, metadata-only, no pre-insert |
| `supabase/functions/stripe-webhook/index.ts` | Update — handle gift metadata, create `gifts` record, cancel auto-renew, send emails |
| `supabase/functions/log-consent/index.ts` | New — logs consent record |
| `src/pages/GiftCheckout.tsx` | Rewrite — single plan, consent checkbox, calls `log-consent` then `create-gift-checkout` |
| `src/pages/GiftRedeem.tsx` | New — token validation, login gate, redemption logic |
| `src/pages/Pricing.tsx` | Update — add consent gate (inline checkbox + `log-consent` call) before `create-checkout` |
| `src/App.tsx` | Update — add `/redeem` route |
| `src/pages/Gift.tsx` | Minor — remove plan type param from navigate |

---

### What Is NOT Changed

- The `gift_subscriptions` table remains intact (legacy data)
- `GiftSuccess.tsx` and `GiftClaim.tsx` remain (legacy redemption still works for old codes)
- `SubscriptionTab.tsx`, `PricingPlans.tsx`, `PricingHero.tsx` — no changes needed
- `create-checkout` edge function — no changes (already correct for subscriptions)
- The `standard_yearly` Stripe price ID is reused for gift checkout (same product, one plan)

---

### Stripe Behavior Note

Gifts use `mode: "subscription"` in Stripe Checkout so that Stripe creates a proper subscription object (which we immediately mark `cancel_at_period_end = true` in the webhook). This means the gift period is tracked by Stripe but will never auto-renew. The recipient is not charged — the subscription cancels at period end and `billing_status = 'gifted'` gates the UI.

The alternative — `mode: "payment"` — is simpler but loses Stripe's subscription period tracking. Using subscription mode is the correct pattern per the brief ("Cancel Stripe subscription auto-renew immediately after purchase").
