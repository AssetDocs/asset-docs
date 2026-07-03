# Asset Safe Launch Code Workqueue

Status: conditional launch implementation queue
Date: 2026-06-23
Owner: Asset Safe operator / development lead
Companion docs:
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Operational_Readiness_Sweep.md`
- `docs/AssetSafe_Billing_Revenue_Launch_Runbook.md`
- `docs/AssetSafe_Support_Ops_Runbook.md`
- `docs/AssetSafe_Key_Rotation_Runbook.md`

## Purpose

This workqueue translates the operator sign-off checklist into developer-ready implementation prompts.

Only build items marked `Code required` by the operator. Items marked `Accepted MVP`, `Operator action required`, or `Deferred` should not become engineering work unless the launch decision changes.

## Launch Decision Flow

1. Complete `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.
2. For each P0 row marked `Code required`, copy the matching work item below into Lovable/dev planning.
3. Implement only the selected items.
4. Update the sign-off checklist with commit, migration, deployment, and verification evidence.

## P0 Conditional Code Items

| ID | Area | Build only if | Default launch posture |
|---|---|---|---|
| BILL-01 | Stripe webhook replay/repair | Implemented in code; final operator replay drill/evidence may still be attached | Operator daily repair accepted only if replay tooling is not deployed |
| BILL-02 | Stripe dispute webhooks | Implemented, deployed, and test-evidenced | Manual dispute evidence submission remains in Stripe Dashboard |
| BILL-03 | Admin refund flow | Deferred by owner for MVP | Manual Stripe Dashboard refunds accepted with webhook-confirmed local evidence |
| BILL-04 | Escalated dunning | Single app reminder plus Stripe smart retries is not accepted | Single reminder accepted for MVP |
| BILL-05 | Receipt idempotency / source-of-truth | Receipt idempotency evidence fails, or both receipt sources are not accepted | Choose one receipt source operationally |
| BILL-06 | Gift payment-failure filter | Verified evidence is no longer accepted or behavior regresses | Add explicit gift filter |
| BILL-07 | Trial reminder flow | Free trials are reintroduced or marketed before a monitored reminder path exists | Restore reminders before offering trials |
| SEC-01 | Dual-secret webhook verification | Maintenance-window secret rotation is not accepted | Single active secret accepted for MVP |
| MON-01 | External alert delivery | Dashboard/manual monitoring is not accepted | Dashboard/admin monitoring accepted for MVP |

## BILL-01: Stripe Webhook Replay / Repair

### Problem

Handler-level Stripe webhook failures can set `stripe_events.outcome = 'error'` while still returning HTTP 200 to Stripe. Stripe will not necessarily retry those claimed events unless an operator explicitly requests redelivery.

### Build

- Apply `20260702100000_add_stripe_event_replay_requests.sql`.
- Deploy `admin-request-stripe-event-replay` and the updated `stripe-webhook`.
- Use Admin Billing > Stripe Reconciliation to mark an errored event ready for replay.
- Redeliver the event from Stripe so the fresh signed payload re-enters `stripe-webhook`.
- Confirm the replay request ledger records actor, timestamp, result outcome, and error details.

### Acceptance

- A failed event can be replayed without duplicating entitlements, payment events, checkout fulfillment, or emails.
- Duplicate replay attempts are idempotent.
- A replayed success updates evidence without deleting the original failed event.
- Admin access is restricted and audited.

### Lovable Prompt

Verify the implemented admin-only Stripe webhook replay/repair path for `stripe_events.outcome = 'error'`. Apply the migration, deploy the two affected functions, mark one failed event ready for replay from the admin surface, redeliver it from Stripe, and capture the resulting `stripe_event_replay_requests` and `stripe_events` evidence.

## BILL-02: Stripe Dispute Webhooks

### Problem

`charge.dispute.created`, `charge.dispute.updated`, and `charge.dispute.closed` are handled by the Stripe webhook after deployment. Evidence submission still happens in Stripe Dashboard.

### Build

- Apply `20260702110000_add_stripe_dispute_reviews.sql`.
- Deploy the updated `stripe-webhook`.
- Verify `charge.dispute.created`, `charge.dispute.updated`, and `charge.dispute.closed`.
- Confirm `stripe_dispute_reviews` stores dispute ID, charge ID, customer ID, amount, reason, status, evidence due date, and outcome.
- Confirm a billing review support issue is created or updated.
- Do not automatically lock access unless the product decision says to.

### Acceptance

- New dispute creates an auditable review item.
- Closed dispute records won/lost/other outcome.
- Access action is explicit, not accidental.
- Manual Stripe Dashboard evidence submission remains supported.
- Launch evidence: `stripe trigger charge.dispute.created` produced recent `stripe_dispute_reviews` and `dev_support_issues` rows.

### Lovable Prompt

Verify the implemented Stripe dispute webhook handling for `charge.dispute.created`, `charge.dispute.updated`, and `charge.dispute.closed`. Confirm auditable billing review records and support issue linkage are created, and confirm no account access changes occur without an explicit reviewed access decision.

## BILL-03: Admin Refund Flow

### Problem

Refunds are currently issued in Stripe Dashboard with no app-side refund workflow.

### MVP Decision

Owner decision: keep refunds manual in Stripe Dashboard for MVP.

Required evidence for each refund:

- Support/billing issue exists before refund is issued.
- Issue records requester, Stripe customer/payment reference, reason, requested amount, approved amount, approver, and access decision.
- Stripe Dashboard refund ID is copied into the issue after completion.
- `charge.refunded` webhook creates or updates a `stripe_refund_reviews` audit row.
- Entitlement/account access changes are handled separately from refund issuance.

### Build Later If Manual Handling Is Rejected

- Add admin refund request/record table.
- Add an admin-only edge function to issue full or partial refunds through Stripe.
- Require reason, approver, amount, charge/payment intent/invoice reference, and account/user context.
- Store Stripe refund ID and status.
- Link to support issue when applicable.
- Prevent duplicate refunds beyond Stripe state.

### Acceptance

- Manual Stripe Dashboard refund remains the MVP issuance path.
- Refund record is auditable through `stripe_refund_reviews`.
- Billing review support issue is created or updated.
- Entitlement/account access is not changed unless explicitly reviewed.
- Launch evidence: `stripe trigger charge.refunded` produced recent `stripe_refund_reviews` and `dev_support_issues` rows.

### Lovable Prompt

No refund-issuance UI required for MVP. Manual Stripe Dashboard refunds are accepted with support-ticket evidence and webhook-confirmed local audit rows. Revisit an admin-only refund workflow only if manual handling becomes too slow, too risky, or not auditable enough.

## BILL-04: Escalated Dunning

### Problem

The app sends one payment reminder per failure cycle. There is no day-3/day-5/day-7 escalation.

### Build

- Add `dunning_attempts` or equivalent table.
- Track failure cycle, attempt number, template, sent_at, and outcome.
- Send day-1/day-3/day-5/day-7 reminders or the owner-approved cadence.
- Stop reminders when payment succeeds or account is canceled/deleted.
- Do not send dunning for gift-only prepaid subscriptions.

### Acceptance

- Reminder cadence is deterministic and idempotent.
- Payment success resets the failure cycle.
- Gift subscriptions are excluded unless a real renewed paid subscription fails.
- Admin can see current dunning state.

### Lovable Prompt

Replace the single `payment_failure_reminder_sent` behavior with a durable dunning-attempt lifecycle. Add cadence tracking, idempotent sends, payment-success reset, gift exclusion, and an admin view of the current failure cycle.

## BILL-05: Receipt Idempotency / Source Of Truth

### Problem

Asset Safe can send app receipts while Stripe may also send receipts. Receipt triggers may include checkout and payment-intent paths.

### Build

- Decide whether Asset Safe receipts remain enabled.
- If enabled, keep durable receipt idempotency keyed by Stripe transaction/recipient.
- Check `subscription_email_events.idempotency_key` before sending.
- Document whether Stripe automatic receipts should be disabled.

### Acceptance

- A user does not receive duplicate Asset Safe receipts for the same payment.
- Stripe/app double-send is either disabled or intentionally documented.
- Receipt sends are visible in email/audit evidence.
- Launch implementation: `subscription_email_events.idempotency_key` prevents duplicate Asset Safe receipt sends for the same Stripe transaction/recipient.

### Lovable Prompt

Audit the payment receipt flow and add durable idempotency for Asset Safe receipts. Make the chosen receipt source explicit: Stripe-only, Asset Safe-only, or both intentionally. Ensure checkout and payment-intent paths cannot send duplicate Asset Safe receipts.

## BILL-06: Gift Payment-Failure Filter

### Problem

Gift purchases are prepaid/non-renewing. Gift-related payment failures should not drive ordinary subscriber dunning or set unrelated `payment_failure_reminder_sent` state.

### Build

- Identify gift sessions/subscriptions reliably from Stripe metadata and local `gift_subscriptions`.
- In `stripe-webhook`, ignore or separately log gift-only `invoice.payment_failed`.
- In `check-payment-failures`, exclude gift-only records from normal dunning.
- Keep redeemed recipient subscriptions governed by actual entitlement status.

### Acceptance

- Gift-only payment failure does not send normal dunning.
- Gift expiry remains driven by `gift_subscriptions.expires_at`.
- Redeemed users with a real paid renewal failure still enter ordinary dunning.

### Lovable Prompt

Add an explicit gift payment-failure filter to `stripe-webhook` and `check-payment-failures`. Gift-only prepaid failures should be logged but should not trigger normal subscriber dunning or mutate unrelated payment failure flags.

## BILL-07: Trial Reminder Flow

### Problem

Trial reminder columns exist, but the current scheduled function path is stale.

### MVP Decision

Owner decision: Asset Safe does not offer free trials for launch. Current paid options are monthly subscription and yearly gift.

### Build Later If Trials Are Reintroduced

- Recreate `check-trial-reminders`.
- If rebuilding, send trial-ending reminders based on `subscribers.trial_end`.
- Track `trial_reminder_sent`.
- Add cron health.

### Acceptance

- Product/legal/support copy does not promise free trials for launch.
- Reminder sends are idempotent.
- Cron health is visible.

### Lovable Prompt

No trial-reminder code is required for MVP because Asset Safe does not offer free trials for launch. If trials are reintroduced later, restore a monitored `check-trial-reminders` flow that sends idempotent trial-ending notices and updates `subscribers.trial_reminder_sent`.

## SEC-01: Dual-Secret Webhook Verification

### Problem

Stripe and Resend webhook secret rotation currently assume one active secret at a time.

### Build

- Support current and next webhook secrets during rotation.
- Validate against both, preferring the active/current secret.
- Log which secret slot matched without exposing the secret.
- Add runbook update for cutover/removal.

### Acceptance

- Rotation can happen without downtime.
- Old secret can be removed after verification.
- Signature failure behavior remains strict.

### Lovable Prompt

Add dual-secret verification support for Stripe and Resend webhooks, using current and next secret environment variables. Log the matched slot without exposing secrets, keep strict signature failure behavior, and update the rotation runbook.

## MON-01: External Alert Delivery

### Problem

Admin panels expose monitoring state, but external routing may still require email/Slack/pager integration.

### Build

- Add an alert dispatcher for critical `monitoring_alert_policies`.
- Route to the owner-approved destination.
- De-dupe repeated alerts.
- Record alert delivery attempts and status.

### Acceptance

- Critical cron/webhook/email failures generate external notifications.
- Repeated failures do not spam indefinitely.
- Admin can see last delivery status.

### Lovable Prompt

Implement external alert delivery for critical monitoring policies. Use owner-approved route configuration, de-dupe repeated alerts, record delivery attempts/status, and surface last delivery state in Admin Monitoring.

## Recommended Build Order If Code Is Required

1. `BILL-01` Stripe webhook replay/repair.
2. `BILL-06` gift payment-failure filter.
3. `BILL-05` receipt idempotency/source-of-truth.
4. `BILL-02` dispute webhooks.
5. `BILL-03` admin refund flow.
6. `BILL-04` escalated dunning.
7. `BILL-07` trial reminder flow.
8. `SEC-01` dual-secret webhook verification.
9. `MON-01` external alert delivery.

## Operator Note

For MVP launch, the recommended posture is to accept manual processes for disputes, refunds, dunning escalation, and external alerting, while requiring evidence for monitoring, cron health, receipt choice, gift payment-failure verification, support ownership, legal/privacy sign-off, restore drill, and security scan.
