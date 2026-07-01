# Asset Safe Gift Payment-Failure Verification

Status: launch evidence plan
Owner: Billing / Ops
Environment: staging for active tests; production read-only queries only

## Overview

Gift purchases are intended to behave like prepaid access: the purchaser pays up front, and the recipient can redeem only after payment succeeds. There is no post-redemption dunning lifecycle for the recipient.

Important implementation note: the current `create-gift-checkout` code in this worktree creates the Stripe Checkout Session with `mode="subscription"` and `cancel_at_period_end=true`, even though the product posture is prepaid one-time gift access. The webhook hardening below supports both the current subscription-backed gift session and a future `mode="payment"` one-time gift session. If Asset Safe wants pure one-time gift charges, the checkout mode should be reviewed separately from this payment-failure hardening.

## Function Map

| Function | Responsibility |
|---|---|
| `create-gift-checkout` | Creates the Stripe Checkout Session and pre-inserts a `gift_subscriptions` row with `status='pending'`, `payment_status='pending'`, `delivery_status='not_sent'`, and `redemption_status='unredeemed'`. |
| `stripe-webhook` / `handleCheckoutCompleted` | Marks a gift paid, records Stripe IDs, and dispatches or schedules the gift email. |
| `stripe-webhook` / `handleGiftCheckoutFailed` | Handles `checkout.session.async_payment_failed` for gift sessions and marks the gift failed without sending recipient access. |
| `stripe-webhook` / `handleGiftCheckoutExpired` | Handles abandoned/unpaid `checkout.session.expired` events and marks the gift expired without sending recipient access. |
| `stripe-webhook` / `handleGiftPaymentIntentFailed` | Defensive handler for `payment_intent.payment_failed` when a one-time gift payment intent or its checkout session can be identified. |
| `send-gift-email`, `resend-gift-email`, `check-gift-reminders` | Delivery/reminder paths. These should operate only after the gift is paid or already eligible for resend. |
| `redeem-gift`, `get-gift-status` | Recipient and purchaser status paths. Recipients should have no redeem path for failed/expired gifts. |

`check-payment-failures` is intentionally subscription-focused and scans `subscribers`, not gifts.

## Table And Columns

Primary table: `public.gift_subscriptions`

Relevant columns:

| Column | Purpose |
|---|---|
| `status` | Business state: `pending`, `paid`, `failed`, `expired`, etc. |
| `payment_status` | Payment state: `pending`, `paid`, `failed`, `expired`, etc. |
| `delivery_status` | Email delivery state. Failed/expired payment keeps this as `not_sent`. |
| `redemption_status` | Recipient redeem state. Failed/expired payment remains `unredeemed`. |
| `stripe_session_id` / `stripe_checkout_session_id` | Checkout lookup identifiers. |
| `stripe_payment_intent_id` | Payment intent identifier when available. |
| `paid_at` | Successful payment timestamp. |
| `failed_at` | Failed or expired checkout timestamp. Added for launch evidence. |
| `failure_reason` | Provider/event reason, such as `checkout.session.async_payment_failed`. Added for launch evidence. |

## Expected Behavior Matrix

| Event | `gift.status` | `payment_status` | Delivery | Purchaser access | Recipient access |
|---|---|---|---|---|---|
| `checkout.session.completed` paid gift | `paid` | `paid` | queued, sent, or scheduled | unchanged | email sent/scheduled; can redeem after delivery |
| `checkout.session.async_payment_failed` | `failed` | `failed` | `not_sent` | unchanged | none |
| `checkout.session.expired` unpaid gift | `expired` | `expired` | `not_sent` | unchanged | none |
| `payment_intent.payment_failed` gift PI | `failed` | `failed` | `not_sent` | unchanged | none |

Safety guard: webhook failure handlers must never downgrade a gift whose `status` or `payment_status` is already `paid`.

## SQL Evidence Queries

Pending gift rows older than 24 hours:

```sql
select id, stripe_session_id, purchaser_email, recipient_email, status, payment_status, delivery_status, created_at
from public.gift_subscriptions
where payment_status = 'pending'
  and created_at < now() - interval '24 hours'
order by created_at asc;
```

Failed or expired gifts in the last 30 days:

```sql
select id, stripe_session_id, stripe_payment_intent_id, status, payment_status, delivery_status, failed_at, failure_reason, created_at
from public.gift_subscriptions
where (status in ('failed', 'expired') or payment_status in ('failed', 'expired'))
  and coalesce(failed_at, created_at) > now() - interval '30 days'
order by coalesce(failed_at, created_at) desc;
```

Delivery state by payment state:

```sql
select payment_status, delivery_status, count(*) as gift_count
from public.gift_subscriptions
group by payment_status, delivery_status
order by payment_status, delivery_status;
```

Potential invalid gift access rows:

```sql
select id, status, payment_status, delivery_status, redemption_status, delivered_at, redeemed_at
from public.gift_subscriptions
where payment_status in ('failed', 'expired')
  and (
    delivery_status <> 'not_sent'
    or delivered_at is not null
    or redeemed_at is not null
    or redemption_status <> 'unredeemed'
  )
order by created_at desc;
```

Recent gift Stripe webhook events:

```sql
select stripe_event_id, event_type, outcome, processed_at, error_message
from public.stripe_events
where event_type in (
  'checkout.session.completed',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'payment_intent.payment_failed'
)
order by processed_at desc
limit 50;
```

## Staging Test Steps

Use staging only for active failure tests.

1. Create a gift checkout using a purchaser and recipient test email.
2. Submit a card that fails the gift payment flow.
   - For async failure testing, use Stripe test card `4000 0000 0000 0341` where supported by the selected payment method flow.
   - For immediate decline testing, use Stripe test card `4000 0000 0000 9995`.
3. Confirm Stripe sends either `checkout.session.async_payment_failed` or `payment_intent.payment_failed`.
4. Confirm the matching `gift_subscriptions` row transitions to `status='failed'`, `payment_status='failed'`, `delivery_status='not_sent'`, with `failed_at` and `failure_reason` populated.
5. Confirm no recipient gift email was sent.
6. Confirm purchaser entitlements/account access are unchanged.
7. Test `checkout.session.expired` by abandoning checkout until expiration or using Stripe CLI/test tooling to trigger the event against a staging checkout session.
8. Confirm the abandoned gift row transitions to `status='expired'`, `payment_status='expired'`, `delivery_status='not_sent'`.

## Launch Pass Criteria

- Each row in the expected behavior matrix is reproducible in staging or has a documented Stripe limitation.
- Failed/expired gifts never send recipient redeem access.
- Failed/expired gifts do not change purchaser subscriptions or entitlements.
- A paid gift cannot be downgraded by a late failure/expired event.
- Failed/expired gifts are visible via SQL evidence queries.
- Any purchaser-facing failed-payment email is either intentionally deferred or separately implemented and verified.

## Deferred Follow-Ups

- Purchaser-facing "your gift payment failed" email.
- Admin UI filter/card for failed and expired gifts.
- Review whether `create-gift-checkout` should move from `mode="subscription"` to true one-time `mode="payment"` for gifts.
