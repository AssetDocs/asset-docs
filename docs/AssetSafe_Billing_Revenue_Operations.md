# Asset Safe — Billing & Revenue Operations Architecture

**Audience:** Developer review
**Date:** 2026-06-21
**Status:** Documentation of current implementation + open items for launch

---

## 1. High-Level Flow

```
Stripe (source of truth for $)
        │
        ▼
stripe-webhook  ─────►  entitlements (canonical)
        │               profiles.account_status   (drives UI gating)
        │               profiles.plan_status      (legacy/back-compat)
        │               subscribers               (legacy/back-compat)
        │               payment_events            (audit)
        │               stripe_events             (idempotency log)
        ▼
   side-effects: welcome email, cancellation email, gift fulfillment,
                 grace-period start, status flip to read-only
```

Stripe is always the source of truth for money state. The local DB is a projection rebuilt from webhook events. Three independent jobs reconcile drift:

- `check-payment-failures` (daily)
- `expire_grace_periods()` SQL function (hourly via pg_cron)
- `check-gift-reminders` (daily)

---

## 2. Stripe Event Map

| Event | Handler | DB Writes | Side Effects |
|---|---|---|---|
| `customer.subscription.created` | `handleSubscriptionChange` | `entitlements` upsert (status=`active`/`trialing`), `profiles` (plan_status, current_period_end, storage_quota_gb), `subscribers` upsert | `send-subscription-welcome-email` if first subscription, `applyAccountStatusFromStripe` |
| `customer.subscription.updated` | `handleSubscriptionChange` | Same as above. Subscription-ID guard prevents stale webhook from overwriting newer subscription. Downgrade guard keeps `active` from being downgraded to `incomplete`. | `applyAccountStatusFromStripe` |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | `entitlements.status=canceled`, `cancel_at_period_end=false`, storage zeroed, `profiles.plan_status=canceled`, `subscribers.subscribed=false` | `applyAccountStatusFromStripe('canceled')` → flips to `expired_read_only` |
| `invoice.payment_succeeded`, `invoice.paid` | `handlePaymentSucceeded` | `entitlements.status=active`, `profiles.plan_status=active`, `subscribers.payment_failure_reminder_sent=false` (resets dunning flag) | `applyAccountStatusFromStripe('active')` clears `payment_failed_at` and `grace_period_ends_at` |
| `invoice.payment_failed` | `handlePaymentFailed` | `entitlements.status=past_due`, `profiles.plan_status=past_due`, stamps `payment_failed_at` + `grace_period_ends_at = now + 7d` | Account stays `active` for the full grace window |
| `checkout.session.completed` (mode=subscription/payment, non-gift) | `handleCheckoutCompleted` → `fulfillCheckout` (shared) | `checkout_fulfillments` row written through state machine: `pending → in_progress → fulfilled / fulfilled_email_failed / manual_review / rejected` | Magic-link delivery (`send-invite` style), back-compat `profiles`/`subscribers` upsert |
| `checkout.session.completed` (metadata.gift=true) | gift branch of `handleCheckoutCompleted` | `gift_subscriptions`: mark `paid`, set `expires_at = now + 12 months`, generate claim token (SHA-256 hash persisted) | Force `cancel_at_period_end=true` on the Stripe subscription, send recipient + purchaser emails via `send-gift-email` (single-writer guard on `delivery_status`) |
| `payment_intent.succeeded` | logged only | none | none — handled via invoice events |
| **Not currently handled** | `charge.dispute.created`, `charge.dispute.closed`, `charge.refunded`, `invoice.upcoming`, `invoice.finalized`, `customer.subscription.trial_will_end`, `payment_method.attached/detached`, `customer.updated` | — | **OPEN ITEM #1** |

### Idempotency
Every event is recorded in `stripe_events` (`stripe_event_id` unique key) with `status` (`received` → `processed`/`failed`). The webhook short-circuits if `stripe_events.status='processed'`. Failures keep the row and surface an `errorId` to Stripe for retry. Within handlers, an additional `source_event_id` is written on `entitlements` so we can debug which event last touched each user.

---

### 2.1 Launch Closure Update - 2026-07-03

The original event-map notes above predate the July billing launch hardening work. For launch readiness, use this closure status:

- `stripe_events` now tracks webhook processing through `outcome` values such as `pending`, `success`, `skipped`, and `error`; failed handler-level events can be prepared for signed Stripe redelivery from the admin replay workflow.
- Gift payment failures and expired gift checkout sessions are handled separately from ordinary subscriber dunning. Evidence is recorded in `docs/AssetSafe_Gift_Payment_Failure_Verification.md`.
- `charge.dispute.created`, `charge.dispute.updated`, and `charge.dispute.closed` create/update `stripe_dispute_reviews` rows and linked billing review support issues. Stripe evidence submission and account access changes remain manual/operator-owned for MVP.
- `charge.refunded` creates/updates `stripe_refund_reviews` rows and linked billing review support issues. Refunds are initiated manually in Stripe Dashboard for MVP.
- `invoice.upcoming`, `invoice.finalized`, `customer.subscription.trial_will_end`, payment-method-only events, and customer metadata updates remain logged/skipped/monitor-only unless a future product decision adds side effects.

## 3. Lifecycle Rules (Current)

### 3.1 Retry cadence (dunning)
- **Stripe-side:** uses the project's default Stripe smart retry schedule (Stripe Dashboard → Billing → Settings → Subscriptions and emails). The application does **not** override `payment_settings.retry`.
- **App-side reminder cadence:** `check-payment-failures` runs **daily at 09:00 UTC** (cron job `check-payment-failures-daily`). Sends `send-payment-reminder` **at most once per customer** per failure cycle, gated by `subscribers.payment_failure_reminder_sent`. Flag is reset on the next `invoice.payment_succeeded`.
- **Detection signals:** (a) `subscription.default_payment_method` card expired, (b) any open invoice with `attempt_count > 0` and `next_payment_attempt` set.
- **OPEN ITEM #2** — no second / third reminder, no escalation copy when day 5 of grace hits.

### 3.2 Grace period
- **Length:** `GRACE_PERIOD_DAYS = 7` (hardcoded in `stripe-webhook/index.ts`).
- **Start:** stamped on `invoice.payment_failed` when `profiles.payment_failed_at` is null. `grace_period_ends_at = failed_at + 7d`.
- **During grace:** `account_status='active'` — full read/write access continues. UI shows `GracePeriodBanner.tsx`.
- **Expiry:** hourly pg_cron job `expire-subscription-grace-periods-hourly` (`'17 * * * *'`) calls `public.expire_grace_periods()` which flips qualifying profiles to `account_status='expired_read_only'`. This is the *enforcement* path; the webhook itself only sets the timer.
- **Recovery:** any subsequent `invoice.payment_succeeded` clears `payment_failed_at`, `grace_period_ends_at`, returns `account_status='active'`.

### 3.3 Lock / downgrade behavior (read-only state)
Triggered when Stripe reports `unpaid`, `incomplete_expired`, `canceled`, **or** grace has elapsed.
- `profiles.account_status = 'expired_read_only'`.
- Frontend gates writes via `useAccountStatus` + `enforce_read_only_core_writes` RLS policies (migration `20260614183905`). Inserts/updates to core tables (properties, files, items, documents, etc.) are blocked at the database. Reads + export remain available.
- Storage quota is preserved on `incomplete`/`unpaid` but **zeroed** on hard `customer.subscription.deleted`.
- Property limit remains hardcoded at `999999` (the workspace memory rule) — we do not downgrade caps; we lock writes instead.
- Admin bypass via `useAdminRole` ignores `expired_read_only`.

### 3.4 Gift-specific exceptions
- Subscriptions tagged `metadata.gift=true` are forced to `cancel_at_period_end=true` immediately on `checkout.session.completed`. They are never auto-renewed.
- `gift_subscriptions.expires_at` is the authoritative end-of-life (12 months from `paid_at`); the Stripe subscription's `current_period_end` should match.
- `invoice.payment_failed` for a gift sub is effectively a no-op operationally — there is no card on file post-purchase. **OPEN ITEM #3.**
- At `expires_at - 30d`: `check-gift-reminders` → `send-reminder-email` ("expires in 30 days, choose a plan").
- At `expires_at`: Stripe fires `customer.subscription.deleted` → standard cancellation path. Gift recipient enters the same 7-day grace + read-only flow as any cancelled paying customer.

### 3.5 Storage overage behavior
- Base storage is the plan default (50 GB for the current Asset Safe plan), tracked in `entitlements.base_storage_gb`.
- Add-ons sold as 25 GB blocks (`add-storage-25gb`) tracked in `entitlements.storage_addon_blocks_qty`. Total = base + qty × 25.
- `profiles.storage_quota_gb` mirrors the total for back-compat reads.
- `storage_usage` table holds per-account computed usage (`count_account_scoped_storage_usage` migration).
- **Enforcement:** uploads check `storage_usage.used_bytes` against `storage_quota_gb` client-side and via storage RLS policies. `send-storage-warning` fires at the warning threshold.
- **At or over quota:** new uploads are rejected; existing data is read/write/deletable. No auto-charge for overage. **OPEN ITEM #4** — no auto-purchase flow, no soft-overage tolerance.

### 3.6 Cancellation timing
- Self-serve cancel: `cancel-subscription` (action=`cancel`) → Stripe `cancel_at_period_end=true`. MFA step-up required.
- Local writes:
  - `entitlements.cancel_at_period_end=true`.
  - `profiles.account_status='cancelled_billing_active'` (UI shows "Cancelling, access until X").
  - `subscription_cancellations` insert (`reason`, `comments`, `plan`, `period_end`, `stripe_subscription_id`, `account_id`).
- Email: `send-cancellation-emails` (owner + admin), idempotent.
- Reactivation: `cancel-subscription` (action=`reactivate`) before `period_end` flips `cancel_at_period_end=false` and clears `cancellation_notice_sent_at`.
- Hard cancellation lands when Stripe fires `customer.subscription.deleted` at `period_end`. At that point `account_status` → `expired_read_only` immediately (no second 7-day grace stacked on top of an intentional cancel).

### 3.7 Proration assumptions
- Plan changes go through `change-plan` (and Stripe Customer Portal via `customer-portal`).
- Proration mode is Stripe's default (`proration_behavior='create_prorations'`). Upgrades charge a prorated amount on the next invoice; downgrades credit.
- Storage add-ons (`add-storage-25gb`, `add-storage`) use the same proration default — the add-on item is added to the existing subscription.
- **OPEN ITEM #5** — no preview UI ("you'll be charged $X.XX today") before confirming a plan change.

---

## 4. Database Tables

| Table | Role | Key columns |
|---|---|---|
| `entitlements` | **Canonical** view of what the user is entitled to | `user_id`, `plan`, `status`, `entitlement_source`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_plan_price_id`, `plan_lookup_key`, `subscription_status`, `cancel_at_period_end`, `base_storage_gb`, `storage_addon_blocks_qty`, `current_period_end`, `source_event_id` |
| `subscribers` | **Legacy** mirror used by dunning + ActiveCampaign sync. | `user_id`, `email`, `stripe_customer_id`, `subscribed`, `subscription_tier`, `subscription_end`, `payment_failure_reminder_sent`, `payment_failure_reminder_sent_at`, `last_payment_failure_check`, `trial_end`, `trial_reminder_sent` |
| `profiles` | UI-facing summary + `account_status` state machine | `account_status` (`active` / `expired_read_only` / `cancelled_billing_active` / `deletion_requested` / `scheduled_for_deletion` / `deleted`), `payment_failed_at`, `grace_period_ends_at`, `plan_status`, `plan_id`, `current_period_end`, `storage_quota_gb`, `property_limit` (always 999999) |
| `stripe_events` | Idempotency log for incoming webhooks | `stripe_event_id` (unique), `event_type`, `status`, `processed_at`, `error_id` |
| `payment_events` | App-side audit of every billing-relevant event | mirrors event type, customer, amount, invoice, subscription |
| `subscription_cancellations` | Cancellation record with reason | `owner_user_id`, `account_id`, `stripe_subscription_id`, `period_end`, `reason`, `comments`, `plan` |
| `subscription_email_events` | Email send log specifically for billing emails | template, recipient, idempotency key |
| `gift_subscriptions` | Gift lifecycle (covered in the separate gift-plan doc) | `expires_at`, `status`, `payment_status`, `delivery_status`, `claim_token_hash`, `redeemed`, `redeemed_at`, `first_login_at`, `reminder_email_sent_at` |
| `storage_usage` | Per-account live usage rollup | `account_id`, `used_bytes`, last_calculated_at |
| `checkout_fulfillments` | State machine for post-checkout magic-link delivery + manual review | `stripe_session_id`, `status`, `magic_link_delivery_status`, `manual_review_reason`, `delivery_attempted_at` |
| `checkout_session_audit` | Append-only audit for every checkout session created | session id, mode, customer, metadata |
| `admin_fulfillment_overrides` | Admin actions taken on the manual-review queue | reviewer, action, reason |
| `audit_logs` / `user_activity_logs` | Cross-cutting audit (security alerts, plan changes) | actor, target_user, action, metadata |

### Tables explicitly **not** present (open items)
- No `dunning_attempts` table — we rely on Stripe's retry state + the single `subscribers.payment_failure_reminder_sent` flag.
- No `dispute` / `chargeback` table.
- No `refund` table (refunds today are observable only in Stripe).
- No `proration_previews` cache.

---

## 5. Edge Functions

| Function | Trigger | Purpose | Auth |
|---|---|---|---|
| `stripe-webhook` | Stripe → HTTPS | Single entry for all Stripe events. Idempotent via `stripe_events`. Orchestrates `entitlements`, `profiles`, `subscribers`, gift fulfillment. | Stripe signature (`STRIPE_WEBHOOK_SECRET`) |
| `check-payment-failures` | pg_cron daily 09:00 UTC | Scans `subscribers` where `subscribed=true` and `payment_failure_reminder_sent=false`. Detects expired cards + open invoices with retries. Fires `send-payment-reminder` once. | `x-internal-secret` (service-role) |
| `send-payment-reminder` | `check-payment-failures` | Sends dunning email to customer. | Service-role internal |
| `check-grace-period-expiry` | pg_cron (legacy-locker grace only) | Sweeps `legacy_locker.recovery_status='grace_period_active'` past their `recovery_requested_at + grace_period_days`. **Not the billing grace sweeper** — that one is the SQL function `expire_grace_periods()` invoked hourly. | `x-internal-secret` |
| `expire_grace_periods()` (SQL) | pg_cron hourly at `:17` (`expire-subscription-grace-periods-hourly`) | Flips `profiles.account_status` from `active`→`expired_read_only` where `grace_period_ends_at < now()` and a payment is still failing. | Runs in DB context |
| `cancel-subscription` | User UI (Manage Billing) | Cancel at period end or reactivate. Writes `subscription_cancellations`, fires emails. Step-up MFA required. | JWT + MFA step-up |
| `customer-portal` | User UI | Generates Stripe Billing Portal session. | JWT |
| `payment-history` | User UI | Lists invoices from Stripe for the signed-in customer. | JWT |
| `sync-subscription` | Manual / UI fallback | Pulls latest subscription state from Stripe and overwrites `entitlements`/`profiles`. Used after race conditions. | JWT |
| `finalize-checkout` | `/subscription-success` page on return from Stripe | Polls `checkout_fulfillments` up to 10s; if no terminal state, re-fetches the session from Stripe and runs `fulfillCheckout` recovery. | Public (session_id required) |
| `create-checkout` | UI | Builds Stripe Checkout Session for plans/storage. | JWT + consent gate |
| `change-plan` | UI | Switch plan on existing subscription (proration default). | JWT + MFA step-up |
| `add-storage`, `add-storage-25gb` | UI | Add storage add-on item to subscription. | JWT + MFA step-up |
| `send-cancellation-emails`, `send-cancellation-notice` | webhook / cancel-subscription | Cancellation comms. | Service-role internal |
| `send-subscription-welcome-email` | webhook on new subscription | First-subscription welcome. | Service-role internal |
| `send-payment-receipt`, `send-payment-receipt-internal` | webhook on `invoice.paid` | Branded receipt (in addition to Stripe's). | Service-role internal |
| `create-gift-checkout`, `redeem-gift`, `send-gift-email`, `resend-gift-email`, `backfill-gift-session`, `get-gift-status`, `track-gift-login`, `check-gift-reminders` | Gift lifecycle | See separate gift-plan doc. | Mixed (JWT + service-role) |
| `admin-stripe-subscriptions`, `admin-link-stripe-customer` | Admin UI | Admin lookup + manual customer↔account linking. | Admin role + password gate |
| `sync-activecampaign` | webhook hook | Mirror subscription state to CRM. | Service-role internal |

---

## 5.1 Growth / Product Ops

Activation funnel review, churn reason analysis, lifecycle/win-back messaging, referral readiness, and changelog operations are covered in `docs/AssetSafe_Growth_Product_Ops_Runbook.md`.

Authorized User over-limit handling after plan changes and ownership/billing transfer boundaries are covered in `docs/AssetSafe_Multi_Account_Workspace_Ops_Runbook.md`.

---

## 6. Admin Surfaces

| Surface | Component | Backing data |
|---|---|---|
| Billing manual review queue | `AdminBillingManualReview.tsx` | `checkout_fulfillments` where `status in ('manual_review','fulfilled_email_failed')`. Action writes `admin_fulfillment_overrides`. |
| Cancellations | `AdminCancellations.tsx` | `subscription_cancellations` joined to `profiles` for owner display. |
| Customer / account lookup | `AdminOwnerWorkspace.tsx`, `AdminUsers.tsx` | `profiles` + `accounts` + `entitlements` + on-demand Stripe pull via `admin-stripe-subscriptions`. |
| Payment history | `payment-history` edge function called from owner workspace | Stripe invoices for the linked customer. |
| Account impact | `get-account-impact` edge function | Computes downstream impact (members, files, storage) for a closure/deletion decision. |
| Stripe reconciliation | `StripeReconciliation.tsx` | Compares `entitlements.stripe_subscription_id` ↔ Stripe live state; surfaces drift. |

---

## 7. State Machine: `profiles.account_status`

```
                   (new signup, paid)
                          │
                          ▼
                       active ◄──────────────────────────┐
                          │                              │
        invoice.payment_failed                           │
                          ▼                              │
                  active (in grace, 7d)                  │
                          │                              │
              grace elapsed (hourly sweeper)             │
                          ▼                              │
                  expired_read_only ◄──────── invoice.payment_succeeded
                          │                              │
                          │                              │
            self-serve cancel (cancel_at_period_end)     │
                          ▼                              │
                 cancelled_billing_active ───reactivate──┘
                          │
              customer.subscription.deleted
                          ▼
                  expired_read_only
                          │
              user requests account deletion
                          ▼
              deletion_requested → scheduled_for_deletion → deleted
```

Protected statuses (`deletion_requested`, `scheduled_for_deletion`, `deleted`) are never overwritten by Stripe events — guarded in `applyAccountStatusFromStripe`.

---

## 8. Open Items for Launch Review

Launch closure note (2026-07-03): items 1, 3, 6, and 7 below are superseded for MVP by the webhook replay, gift-failure, dispute-review, and refund-review work described in section 2.1. Keep them here as historical context for future hardening, not as active P0 launch blockers.

1. **Unhandled Stripe events** — `charge.dispute.created/closed`, `charge.refunded`, `customer.subscription.trial_will_end`, `invoice.upcoming`. Disputes today are silent; refunds invisible in app DB.
2. **Single dunning reminder** — no day-3 / day-5 / day-7 escalation. Recommend a `dunning_attempts` table and graduated copy.
3. **Gift card-on-file gap** — `invoice.payment_failed` on a gift sub is meaningless. Should be filtered out so it doesn't pollute `subscribers.payment_failure_reminder_sent`.
4. **Storage overage UX** — hard reject at quota is jarring. Consider 5% soft tolerance + an in-app "Add 25 GB now?" prompt that one-clicks `add-storage-25gb`.
5. **Plan-change preview** — no proration preview before confirm. Stripe's `invoices.retrieveUpcoming` would solve.
6. **Refund flow** — no edge function to issue refunds from admin; today done manually in Stripe Dashboard with no app-side audit row.
7. **Chargeback flow** — `charge.dispute.created` should auto-flip account to `expired_read_only` + open an admin review item.
8. **Reconciliation alerting** — `StripeReconciliation.tsx` exists but there's no scheduled drift-detector emitting Slack/email alerts.
9. **Webhook signing key rotation** — documented in `docs/AssetSafe_Key_Rotation_Runbook.md`; the webhook still supports only one secret at a time, so dual-secret support remains a future hardening item.
10. **Receipt duplication** — both Stripe and `send-payment-receipt` send receipts; confirm intentional and reflected in transactional-email opt-out logic.
11. **Trial reminders** — `subscribers.trial_end` / `trial_reminder_sent` columns exist but no current cron is scheduled (legacy `check-trial-reminders` migration references a deleted function). Decision needed: keep or remove.
12. **Past-due → cancel hard stop** — if Stripe's smart retries exhaust and subscription goes to `unpaid`, we flip to `expired_read_only` but never delete the entitlement row; verify cleanup expectation.

---

## 9. Cron Schedule (Billing-Relevant)

| Job | Schedule (UTC) | Target |
|---|---|---|
| `check-payment-failures-daily` | `0 9 * * *` | `check-payment-failures` edge |
| `expire-subscription-grace-periods-hourly` | `17 * * * *` | `public.expire_grace_periods()` SQL |
| `check-gift-reminders-daily` | `0 9 * * *` | `check-gift-reminders` edge |
| (legacy locker) recovery grace sweeper | daily | `check-grace-period-expiry` edge |

All cron jobs use `pg_net.http_post` with the project anon key in the Authorization header (legacy migrations) or `x-internal-secret = service-role-key` (newer migrations). Recommend standardizing on `x-internal-secret` across all four jobs.
