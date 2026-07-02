# Asset Safe Billing & Revenue Launch Runbook

Status: launch operations runbook
Owner: Asset Safe operator / Billing owner
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Billing_Revenue_Operations.md`
- `docs/AssetSafe_Billing_Revenue_Operations_Review.md`
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`
- `docs/AssetSafe_Support_Ops_Runbook.md`

## Purpose

This runbook closes the launch policy gaps around Stripe webhook recovery, disputes, refunds, dunning, receipt behavior, trial reminders, gift payment failures, and billing manual review.

Stripe remains the source of truth for money movement. Asset Safe's database is a local operational projection used for entitlements, account status, support, audit, and admin review.

## Current Launch Posture

| Area | Current behavior | Launch posture |
|---|---|---|
| Webhook claim/idempotency | `stripe_events` row is inserted with `outcome = 'pending'`; duplicates are skipped | Accept, but monitor failed outcomes |
| Handler failure | Handler-level errors set `stripe_events.outcome = 'error'`; an admin can mark the event ready for replay, then Stripe redelivery reprocesses it | Deploy and verify replay tooling before launch |
| Signature/config failure | Invalid signature or missing config returns non-2xx | Accept |
| Disputes/chargebacks | Not handled by webhook; visible in Stripe only | Manual Stripe Dashboard review for MVP unless code is added |
| Refunds | No admin refund edge function; visible in Stripe only | Manual Stripe Dashboard refund for MVP unless code is added |
| Dunning | Stripe smart retries plus one app-side reminder | Acceptable MVP if owner accepts single app reminder |
| Trial reminders | Columns exist; scheduled path is stale | Disable/defer trial reminder UX or rebuild before offering trials |
| Receipts | App receipt may send from checkout/payment-intent paths; Stripe receipts may also be enabled | Owner must choose one or approve duplication |
| Gift payment failures | Gift payment failures should not drive ordinary dunning | Verify latest webhook/gift behavior before launch |
| Manual fulfillment review | Admin queue includes `manual_review` and `fulfilled_email_failed` | Accept |

## P0 Launch Decisions

These decisions should be recorded before launch.

| Decision | Recommended MVP answer | If not accepted |
|---|---|---|
| Webhook replay/repair | Use Admin Billing > Stripe Reconciliation to prepare errored events for signed Stripe redelivery | Manual repair remains the fallback if replay evidence fails |
| Disputes | Manual Stripe Dashboard handling; create support/billing issue for every dispute | Build `charge.dispute.*` webhook handling before launch |
| Refunds | Manual Stripe Dashboard handling; record support/billing issue with Stripe refund ID | Build admin refund function and refund audit table |
| Dunning | Keep one app-side payment reminder plus Stripe smart retries | Add `dunning_attempts` table and day-3/day-5/day-7 copy |
| Trial reminders | Do not market free trials until reminder path is restored or removed | Recreate `check-trial-reminders` flow |
| Receipts | Use either Stripe receipts or Asset Safe branded receipts as the primary user receipt | Add idempotent receipt log and opt-out rules |
| Gift payment failures | Treat gift payment failures as non-dunning unless tied to an active redeemed recipient subscription | Add explicit gift filter in webhook/checker |

## Webhook Failure Recovery

### What can fail

There are two broad failure classes:

| Failure class | Stripe retry? | Local signal |
|---|---|---|
| Signature/config/outer exception before event claim | Usually yes, because response is non-2xx | Edge function logs |
| Handler-level processing error after event claim | No, current function returns 200 with `outcome = 'error'` | `stripe_events.outcome = 'error'` |

Because handler-level failures are claimed and return 200, operators must monitor and repair them.

### Daily check

```sql
select
  stripe_event_id,
  event_type,
  outcome,
  created_at,
  processed_at,
  payload
from public.stripe_events
where outcome = 'error'
order by created_at desc;
```

Also review recent skipped events so noisy ignored events do not hide important new event types:

```sql
select
  event_type,
  outcome,
  count(*) as event_count,
  max(created_at) as latest_seen
from public.stripe_events
where created_at > now() - interval '7 days'
group by event_type, outcome
order by latest_seen desc;
```

### Manual repair process

1. Open the Stripe event by `stripe_event_id`.
2. Confirm event type, livemode, customer, subscription, invoice, amount, and timestamp.
3. Compare Stripe state to local `entitlements`, `profiles`, `subscribers`, `payment_events`, and `checkout_fulfillments`.
4. If the event should have changed access, run the safest existing recovery path:
   - `sync-subscription` for subscription projection drift.
   - `finalize-checkout` or billing manual review for checkout fulfillment.
   - Stripe Dashboard plus support/billing issue for refunds or disputes.
5. Record the repair in the support/billing issue.
6. Update or annotate the failed event only after repair evidence is saved.

Do not delete failed Stripe event rows. They are operational evidence.

### Webhook Replay Verification

Before launch:

- Apply `20260702100000_add_stripe_event_replay_requests.sql`.
- Deploy `admin-request-stripe-event-replay` and the updated `stripe-webhook`.
- Mark one `stripe_events.outcome = 'error'` event ready for replay from the admin surface.
- Redeliver the event from Stripe and confirm `stripe_event_replay_requests.status` becomes `succeeded` or `failed` with details.
- Confirm duplicate redelivery without a replay request still returns skipped.

## Stripe Event Severity Tiers

| Tier | Events | Required action |
|---|---|---|
| Safe to skip | Customer metadata updates, payment-method attachment/detachment with no entitlement effect | Log as skipped |
| Monitor | `invoice.upcoming`, `invoice.finalized`, low-risk invoice lifecycle events | Review volume weekly |
| Admin review | `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, suspicious customer/subscription mismatch | Create billing support issue |
| Immediate access review | Confirmed chargeback, unrecoverable payment reversal, fraud signal affecting account ownership/access | Billing owner plus security/support review |

If Stripe introduces new event types in production, classify them before adding them to the ignored/skipped posture.

## Disputes And Chargebacks

Current posture: disputes are handled manually in Stripe Dashboard.

When a dispute is received:

1. Create a billing support issue with priority `critical`.
2. Record Stripe dispute ID, charge ID, customer ID, subscription ID, amount, reason, due date, and evidence deadline.
3. Check account ownership and recent account activity.
4. Decide whether to keep the account active, move it to read-only, or freeze selected actions.
5. Preserve relevant audit, payment, subscription, checkout, and support records.
6. Submit dispute evidence in Stripe.
7. Record final outcome when Stripe closes the dispute.

Recommended MVP access policy:

| Dispute state | Account action |
|---|---|
| New dispute, no fraud signal | Keep active while under review |
| Suspected fraud/account takeover | Escalate to security; consider maintenance/freeze/read-only |
| Lost dispute or unrecoverable reversal | Move to `expired_read_only` if no valid paid subscription remains |
| Won dispute | Keep or restore normal billing status |

## Refunds

Current posture: refunds are issued manually in Stripe Dashboard.

Refund workflow:

1. Create a billing support issue with priority `high` or `critical`.
2. Verify requester authority: account owner or billing owner.
3. Check cancellation status, subscription period, usage, gift status, and any legal/security hold.
4. Decide full vs partial refund and whether access changes immediately.
5. Issue refund in Stripe Dashboard.
6. Record Stripe refund ID, amount, reason, approver, and access decision in the support issue.
7. Confirm local entitlement status still matches intended access.

Do not promise refunds before owner/billing approval.

## Dunning And Grace Period

Current posture:

- Stripe smart retries remain enabled in Stripe Dashboard.
- App-side `check-payment-failures` runs daily and sends at most one reminder per failure cycle.
- The 7-day app grace period begins on `invoice.payment_failed`.
- `invoice.payment_succeeded` must clear `payment_failed_at` and `grace_period_ends_at`.
- Hourly `expire_grace_periods()` flips accounts to `expired_read_only` after grace expires.

Launch acceptance criteria:

- Owner accepts one app-side reminder for MVP.
- Stripe retry/email settings are reviewed in Stripe Dashboard.
- `check-payment-failures` cron health is visible.
- `expire-subscription-grace-periods-hourly` is installed and verified.

Future escalation path:

- Add `dunning_attempts`.
- Add day-3/day-5/day-7 templates.
- Add owner/admin escalation report for accounts about to become read-only.

## Receipts

Current code can send Asset Safe receipts from checkout/payment-intent paths. Stripe may also send Stripe-hosted receipts depending on Dashboard settings.

Before launch, choose one:

| Option | Recommendation | Notes |
|---|---|---|
| Stripe receipts only | Simplest | Disable or limit app receipt sends |
| Asset Safe receipts only | Branded experience | Disable Stripe automatic receipts where possible |
| Both receipts | Accept only if intentional | User may receive duplicates |

If app receipts remain enabled, add or verify idempotency through `subscription_email_events` or another durable email log before broad launch.

## Trial Reminders

Do not market or enable a trial reminder promise until one of these is true:

- A current `check-trial-reminders` function and cron exist and are monitored.
- Trial reminders are explicitly removed from product/legal/support copy.

If trials are offered without app reminders, Stripe's own trial lifecycle emails should be reviewed in Stripe Dashboard and support should know the app does not send separate trial-ending notices.

## Gift Payment Failures

Gift purchases are intended as non-renewing prepaid gifts. A gift `invoice.payment_failed` should not put the purchaser or recipient into the ordinary dunning flow unless there is an active redeemed subscription that truly failed payment.

Launch verification:

1. Confirm gift checkout metadata reliably identifies gift sessions/subscriptions.
2. Confirm redeemed gift accounts are labeled as gift in admin views.
3. Confirm `invoice.payment_failed` for gift-related Stripe records does not set `payment_failure_reminder_sent` for an unrelated active subscriber.
4. Confirm gift expiry is driven by `gift_subscriptions.expires_at` and gift reminder jobs, not card-on-file dunning.

If this is not verified, add an explicit gift-subscription filter to `stripe-webhook` and `check-payment-failures` before launch.

## Billing Manual Review

The admin billing manual review queue should include:

- `checkout_fulfillments.status = 'manual_review'`
- `checkout_fulfillments.status = 'fulfilled_email_failed'`

For `fulfilled_email_failed`, support should recover through the existing fulfillment/resend path rather than manually granting access without evidence.

Daily check:

```sql
select
  id,
  stripe_session_id,
  email,
  status,
  manual_review_reason,
  created_at
from public.checkout_fulfillments
where status in ('manual_review', 'fulfilled_email_failed')
order by created_at asc;
```

## Launch Gate

Before launch, confirm:

- Stripe Dashboard retry, receipt, refund, and dispute settings have been reviewed.
- `stripe_events.outcome = 'error'` has an owner and daily check.
- Billing support issues have an escalation owner.
- Manual refund and dispute handling are accepted for MVP or replacement code is built.
- Receipt strategy is chosen.
- Trial reminder posture is chosen.
- Gift payment-failure behavior is verified.
- Billing manual review queue includes email-failure cases.
- `check-payment-failures` and `expire-subscription-grace-periods-hourly` are scheduled and healthy.
