
## Status

- Database migration **already applied** (additive only — new columns, indexes, two SECURITY DEFINER RPCs locked to `service_role`). No legacy columns dropped.
- All remaining changes are code: 6 edge functions + 2 frontend pages. They require build mode.

## Database (done)

`gift_subscriptions` now has:

- `payment_status` (`pending|paid|refunded|canceled`), `delivery_status` (`not_sent|sending|sent|failed`), `redemption_status` (`unredeemed|redeemed|expired`).
- `paid_at`, `delivered_at`, `recipient_email_sent_at`, `purchaser_email_sent_at`, `delivery_attempted_at`, `last_delivery_error`.
- `stripe_payment_intent_id`, `claim_token_hash`, `resend_recipient_email_id`, `resend_purchaser_email_id`.
- `success_token_hash`, `success_token_expires_at` (24h).
- Backfilled from legacy `status`/`redeemed`.
- Unique partial index on `stripe_session_id`; lookup index on `(stripe_session_id, success_token_hash)`.

RPCs (service_role only, `SECURITY DEFINER SET search_path = public, pg_temp`):

- `get_gift_status_by_session_and_token(session_id, token_hash)` → `{found, payment_status, delivery_status, created_at, delivered_at, recipient_email_masked}`. No row id, no Stripe IDs.
- `redeem_gift(code, token_hash, user_email, user_id)` → returns `{success, reason?, gift_id?}` with reasons `invalid_token|not_paid|already_redeemed|expired|legacy_link_needs_resend|wrong_email`. Row-locked; verifies token hash + recipient email match.

## Edge functions (to write in build mode)

1. **`create-gift-checkout`** — rewrite.
   - Validate inputs, verify consent.
   - Generate `giftId`, `giftCode`, `successToken` (32 bytes base64url), `successTokenHash`, 24h expiry — all server-side.
   - **Insert `gift_subscriptions` row BEFORE Stripe** with `payment_status=pending`, `delivery_status=not_sent`, `redemption_status=unredeemed`, `success_token_hash`, `success_token_expires_at`.
   - Build `success_url` server-side: `${origin}/gift-success?session_id={CHECKOUT_SESSION_ID}&t=${successToken}`.
   - Stripe metadata: only `gift="true"`, `gift_subscription_id`, `gift_term`. No PII, no token, no message.
   - After session creation, store `stripe_session_id`. Return `{ url }`.

2. **`stripe-webhook` (gift branch only)** — patch lines 527–669.
   - Look up the existing gift row by `stripe_session_id` (created by `create-gift-checkout`); if missing, log and skip.
   - Set `cancel_at_period_end` on the Stripe subscription.
   - Update payment fields: `payment_status='paid'`, `paid_at`, `stripe_payment_intent_id`, `stripe_subscription_id`, `expires_at`.
   - Atomic sending lock with stuck-recovery guard (allow if `delivery_status in (not_sent, failed)` OR (`sending` AND `delivery_attempted_at < now() - 10 min`)). Set `delivery_status='sending'`, `delivery_attempted_at=now()`.
   - Generate raw `claimToken`, store `claim_token_hash`.
   - Invoke `send-gift-email` via internal secret with `{ giftId, claimToken }`. Webhook NEVER writes `sent/failed/delivered_at/*_email_sent_at/last_delivery_error`.

3. **`send-gift-email`** — single writer. Auth via `x-internal-secret` (SUPABASE_SERVICE_ROLE_KEY) or admin JWT (`has_app_role`). Idempotent: skip if `recipient_email_sent_at` and `resend !== true`. Build tokenized claim URL `…/gift-claim?code=…&token=…`. All Resend from `@assetsafe.net`. Writes `sent/failed/delivered_at/recipient_email_sent_at/purchaser_email_sent_at/resend_*_id/last_delivery_error`. Purchaser email sent only on first delivery.

4. **`get-gift-status`** — public. `action: 'status'` calls the RPC (verbatim safe response). `action: 'resend'` re-queries `gift_subscriptions` with the verified `(session_id, success_token_hash, success_token_expires_at > now())` tuple to obtain `gift_id`, applies 3/15-min rate limit per `(session_id, IP)`, requires `payment_status='paid'`, acquires sending lock with stuck-recovery guard, rotates `claim_token_hash`, invokes `send-gift-email` with `{ resend:true }`. Never returns gift id or row.

5. **`resend-gift-email`** — JWT-authenticated (purchaser by `purchaser_user_id` or matching email, or admin). 5/15-min rate limit per user. Same lock + rotate + invoke pattern. Logs `gift_email_resent`.

6. **`redeem-gift`** — JWT-authenticated. Validates `code` + `token` from body. Hashes token server-side; calls `redeem_gift` RPC with user email and id derived from JWT. 10/15-min rate limit per user+IP. Returns RPC payload.

7. **`backfill-gift-session`** — admin-only (`has_app_role admin`). Verifies Stripe Checkout Session is `paid`. Updates payment fields FIRST (required by `send-gift-email`), then lock, then rotate, then invoke. Audit-logged.

## Frontend (to write in build mode)

- **`src/pages/GiftCheckout.tsx`** — no change. Already redirects to the returned Stripe URL.
- **`src/pages/GiftSuccess.tsx`** — rewrite. Read `session_id` and `t` from URL. Call `get-gift-status` with `{ action:'status', sessionId, successToken: t }`. Poll every 5s up to ~30s. Render masked recipient + delivery status. If `delivery_status === 'failed'`, surface a "Resend gift email" button that calls `get-gift-status` with `{ action:'resend' }`. Never invokes `send-gift-email`, never reads the table directly, never shows raw tokens / Stripe IDs / errors.
- **`src/pages/GiftClaim.tsx`** — rewrite. Read `code` + `token` from URL. Require sign-in (preserve via `?redirect=`). On submit, POST `{ code, token }` to `redeem-gift`. Map RPC reasons to friendly messages (`wrong_email`, `legacy_link_needs_resend`, `already_redeemed`, `expired`, `not_paid`, `invalid_token`). On success, navigate to `/account`.

## Sender domain

All gift Resend calls use `noreply@assetsafe.net` (already correct in `send-gift-email`; updated wherever needed).

## Verification after build

- Deploy edge functions, then trigger a test gift checkout end-to-end on staging Stripe.
- Confirm: no raw token in Stripe metadata; GiftSuccess never calls `send-gift-email`; webhook retries don't duplicate emails; recipient email comes from `@assetsafe.net`; claim requires matching recipient email; code-only links rejected for new sends.

Reply "build mode" (or approve) to let me write the 6 edge function files and 2 page updates.
