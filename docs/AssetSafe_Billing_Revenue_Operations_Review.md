# Asset Safe Billing & Revenue Operations Review

Date: 2026-07-01
Status: Current launch gap addendum

This addendum refreshes the earlier developer review of `AssetSafe_Billing_Revenue_Operations.md` after the recent gift, monitoring, cron, and evidence fixes. It should be used as a current checklist of remaining billing/revenue launch risks, not as a replacement for the full architecture document.

## Closed Since Initial Review

- Gift payment-failure behavior is now documented and production evidence is recorded in `docs/AssetSafe_Gift_Payment_Failure_Verification.md`.
- Gift failure/expired schema support is live: `gift_subscriptions.failed_at`, `failure_reason`, and `payment_status in ('failed','expired')`.
- `stripe-webhook` now handles gift `checkout.session.async_payment_failed`, `checkout.session.expired`, and defensive `payment_intent.payment_failed`.
- Scheduled gift delivery is deployed through `check-gift-deliveries`, with cron returning HTTP 200 no-op success.
- Internal cron/function authentication now uses the shared `ASSETSAFE_SECRET_KEYS` / `assetsafe_secret_keys` helper instead of relying on the legacy service-role key as the public header value.
- Monitoring alert policy rows and the Admin Monitoring surface are in place.

## P0 Remaining Launch Items

### 1. Stripe webhook failure recovery and replay

Current risk: `stripe-webhook` records errored events with `outcome = 'error'`, but the operational replay/repair path is still not a first-class admin workflow.

Impact: an event can be claimed and logged but require manual repair if local processing fails after idempotency capture.

Recommended next step:

- Add an admin-only replay/reprocess function for `stripe_events.outcome = 'error'`.
- Add an Admin Billing/Monitoring card for recent errored Stripe events.
- Document when operators should repair data manually versus replaying an event.

Relevant implementation:

- `supabase/functions/stripe-webhook/index.ts`
- `public.stripe_events`
- `public.payment_events`

### 2. Refunds, disputes, and chargebacks

Current risk: dispute/refund events remain policy-defined but not fully implemented.

Recommended next step:

- Add severity tiers for `charge.dispute.created`, `charge.dispute.closed`, `charge.refunded`, and related payment reversal events.
- Decide which events require immediate read-only lock, admin review only, or no entitlement change.
- Add a support/admin queue entry for dispute/chargeback review.

### 3. Plan-change preview and proration disclosure

Current risk: Stripe proration defaults are used, but the app does not show a clear pre-confirmation charge/credit preview.

Recommended next step:

- Add a Stripe upcoming-invoice preview before plan changes or storage add-on changes.
- Display today's estimated charge/credit and next renewal amount.
- Record the accepted preview in an audit table or billing event metadata.

## P1 Remaining Launch Items

### 4. Escalated dunning sequence

Current state: `check-payment-failures` sends a once-per-failure-cycle app reminder and Stripe handles retry policy.

Remaining gap:

- No second/third reminder sequence.
- No explicit day-5 grace escalation copy.
- No admin visibility into accounts approaching grace expiry beyond existing status queries.

Recommended next step:

- Add dunning checkpoints around day 1, day 3, and day 5 after first failure.
- Keep the current daily job, but record reminder stage and timestamps.

### 5. Billing manual review scope

Current risk: manual review definitions should be reconciled with the admin UI and fulfillment statuses.

Recommended next step:

- Confirm whether `fulfilled_email_failed` should appear in the billing manual review queue or in a separate email recovery queue.
- Update either the architecture doc or the admin query so the source of truth and UI agree.

### 6. Receipt trigger and duplicate-send policy

Current risk: receipt sends can be triggered by multiple Stripe paths depending on event ordering.

Recommended next step:

- Confirm whether Asset Safe relies on Stripe-hosted receipts, app receipts, or both.
- Add or verify idempotency for app receipt sends.
- Update the event map with actual receipt trigger behavior.

## Documentation Corrections Needed

Update `AssetSafe_Billing_Revenue_Operations.md` before treating it as the source of truth:

- Replace stale `stripe_events.status = received -> processed/failed` language with the current `outcome = pending/success/skipped/error` behavior where applicable.
- Clarify current gift payment-failure behavior and link to `AssetSafe_Gift_Payment_Failure_Verification.md`.
- Keep billing grace enforcement distinct from legacy/recovery grace jobs.
- Update cron inventory to include `check-gift-deliveries-every-15-min`.
- Add explicit refund/dispute handling policy once decided.
