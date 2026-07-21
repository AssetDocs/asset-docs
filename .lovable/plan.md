# Gift purchase flow repair and verification

## Confirmed production diagnosis

The latest purchase reached Stripe and the database correctly became paid, but fulfillment stopped before the recipient email:

- At **2026-07-21 18:21:57 UTC**, `stripe-webhook` processed the paid gift session and then failed while acquiring the email-sending lock with: `column gift_subscriptions.delivery_status does not exist`.
- The column does exist in the live database now, so the webhook encountered a PostgREST schema-cache/deployment mismatch. No `send-gift-email` invocation followed; the gift remains `payment_status = paid`, `delivery_status = not_sent`.
- The purchaser receipt function did run and Resend accepted it, returning message ID `54e18e6f-dfa0-4d27-84d6-fded9e52ea92`. “Accepted by Resend” does not prove inbox delivery.
- Delivery telemetry is currently broken: `resend-webhook` returns HTTP 500 because its upsert conflict target does not match a usable unique constraint. This prevents reliable delivered/bounced evidence.
- The scheduled gift worker is also misconfigured: its cron request uses the secret value as a JSON header name instead of sending the required `x-internal-secret` header. It therefore cannot reliably recover paid-but-unsent gifts.
- `/gift-success` polls only seven times and redirects only after `delivery_status = sent`; a gift left `not_sent` or `sending` therefore remains on the processing page.

No additional information is required from you to fix the confirmed failures. For final inbox verification, access to the purchaser and recipient inboxes—or your confirmation of received/spam/bounced status—will be useful after deployment.

## Implementation plan

1. **Repair the database/API contract**
   - Add a migration that explicitly refreshes PostgREST’s schema cache after the gift columns are present.
   - Correct the Resend delivery-event uniqueness/upsert contract so webhook events can be recorded idempotently instead of returning 500.
   - Correct the `check-gift-deliveries` cron request to send `x-internal-secret` with the expected internal secret, without storing new plaintext credentials in source migrations.

2. **Make Stripe fulfillment recoverable**
   - Update `stripe-webhook` so a lock/query failure cannot be swallowed while still returning a misleading successful fulfillment outcome.
   - Persist a useful failure state and error message when gift email dispatch cannot start.
   - Normalize late/out-of-order Stripe events so a paid gift cannot remain in contradictory states such as `status = failed` with `payment_status = paid`.
   - Keep receipt and recipient-email operations idempotent, but make failed receipt dispatch observable and retryable.

3. **Strengthen gift email delivery and recovery**
   - Align `send-gift-email`, `check-gift-deliveries`, and `get-gift-status` around the same lock, status, retry, and stale-lock rules.
   - Ensure the scheduled worker picks up paid direct-recipient gifts in `not_sent`, `failed`, or stale `sending` states.
   - Preserve valid claim links unless a resend genuinely requires token rotation.

4. **Fix the success-page dead end**
   - Continue low-frequency polling after the initial fast polling window instead of freezing permanently.
   - Surface a recoverable failed/delayed state with a retry action when fulfillment does not complete promptly.
   - Redirect to `/gift` after delivery is confirmed, while preserving the purchaser-code display path.

5. **Add payment-critical regression coverage**
   - Cover direct-recipient and purchaser-code purchases, paid webhook fulfillment, duplicate/out-of-order events, email failure/retry, scheduled delivery, status polling, and redemption.
   - Verify the receipt uses “Asset Safe Gift Plan - 1 Year.”
   - Verify the recipient email is invoked exactly once under normal fulfillment and can recover after a transient failure.

6. **Deploy and validate against the existing failed purchase first**
   - Apply the migration and deploy `stripe-webhook`, `send-gift-email`, `send-payment-receipt-internal`, `get-gift-status`, `check-gift-deliveries`, `resend-webhook`, and any touched shared fulfillment code.
   - Recover the existing paid-but-unsent gift without charging again, then confirm its delivery status and redirect behavior.
   - Run a fresh low-value/live gift regression only after the existing record succeeds, and report each checkpoint: Stripe paid, receipt accepted/delivered, gift email accepted/delivered, success-page redirect, claim, and redemption/account creation.