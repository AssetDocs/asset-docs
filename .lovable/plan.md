# Hardened Subscription / Auth / Account Flow — v2.2

## Overview
Refactor the end-to-end payment → auth → account creation flow to be more resilient, secure, and auditable. This plan hardens checkout creation, makes the Stripe webhook the authoritative fulfillment path, simplifies finalize-checkout to a recovery/status endpoint, adds a shared fulfillment module with verified ownership, enforces strict route guards, and surfaces manual-review cases to an admin queue with a strong override safeguard.

---

## 1. `create-checkout` — auth gating, customer reuse, abuse controls

**File:** `supabase/functions/create-checkout/index.ts`

- Server-side `lookup_key` allow-list (`asset_safe_monthly`, `asset_safe_annual`, `asset_safe_gift_annual`, `storage_25gb_monthly`). Unknown key → 400.
- **Anonymous allowed only for base plans.** Storage add-ons require a valid bearer token → 401 otherwise.
- Anonymous: always pass `customer_email` to Stripe; never call `stripe.customers.list` or `stripe.customers.search`.
- Authenticated: reuse the `stripe_customer_id` already on that user's `entitlements` row. If missing, omit `customer` and pass `customer_email`.
- Storage add-on guards: authenticated AND active/trialing base entitlement AND non-null `stripe_customer_id`.
- Abuse controls: per-IP 5/15 min, per-email 3/15 min (`rate_limits`). Optional Turnstile token verified server-side when env flag is set.
- One `checkout_session_audit` row per attempt (IP, user agent, email, lookup key, session ID, outcome).
- **Server-resolved consent version:** read canonical `current_terms_version` from `public.legal_terms_versions`. Client may pass `displayed_terms_version` (informational only).
- Metadata (non-PII): `plan_lookup_key`, `user_id` (auth only), `checkout_origin`, `current_terms_version`, `displayed_terms_version`.

---

## 2. `stripe-webhook` — authoritative fulfillment, correct idempotency

**File:** `supabase/functions/stripe-webhook/index.ts`

For `checkout.session.completed`:

1. Verify Stripe signature.
2. **Claim the event:** `INSERT INTO stripe_events (stripe_event_id, status) VALUES (…, 'claimed') ON CONFLICT DO NOTHING`. If existing row is `processed` → return 200. If `claimed`/`failed_retryable` and older than 10 min → re-attempt.
3. Retrieve session with `expand: ['customer','subscription','subscription.items.data.price','customer_details']`.
4. Guard: `payment_status='paid'` AND `mode='subscription'` AND `lookup_key` in allow-list. Unknown key → `status='rejected_unknown_lookup_key'`, return 200.
5. Call `fulfillCheckout()` (§4).
6. Only after success: set `stripe_events.processed_at=now()`, `status='processed'`, `outcome=<json>`.
7. Transient error → `status='failed_retryable'`, return 500 (Stripe retries).
8. Permanent/verification error → `status='failed_permanent'`, return 200, write a `manual_review` row.

Existing renewal/cancellation handlers delegate to a shared `upsertEntitlementFromStripe()` helper.

---

## 3. `finalize-checkout` — recovery/status only, re-verifies Stripe

**File:** `supabase/functions/finalize-checkout/index.ts`

- Input: `{ session_id }` from `/subscription-success`.
- **Always re-fetches the session from Stripe before any recovery fulfillment** (`stripe.checkout.sessions.retrieve(session_id, { expand: [...] })`) and re-asserts `payment_status='paid'`, `mode='subscription'`, allow-listed `lookup_key`, customer/email match. Never trusts a local row as authoritative for triggering side effects.
- Returns: `{status:'fulfilled'}`, `{status:'pending'}`, `{status:'recovered'}`, `{status:'fulfilled_email_failed'}`, `{status:'manual_review'}`, or `{status:'error', errorId}`.
- If no `checkout_fulfillments` row after ~10 s polling, calls the same `fulfillCheckout()` routine, tagging `fulfillment_source='finalize-checkout-recovery'`. No user-create or entitlement logic of its own.

---

## 4. Shared `_shared/fulfillment.ts`

**New file:** `supabase/functions/_shared/fulfillment.ts`

Single `fulfillCheckout(stripe, supabaseAdmin, session, { source, adminOverride? })` used by webhook and finalize-checkout.

### 4.1 Extract
`email`, `customer_id`, `subscription_id`, `price_id`, `lookup_key`, `customer_name`, and `metadata.user_id`, `metadata.current_terms_version`, `metadata.displayed_terms_version`.

### 4.2 Claim row before any side effects
Atomic claim using UNIQUE(`stripe_session_id`):

```sql
INSERT INTO public.checkout_fulfillments
  (stripe_session_id, stripe_subscription_id, stripe_customer_id, email,
   plan_lookup_key, fulfillment_source, status, processing_started_at)
VALUES (…, 'processing', now())
ON CONFLICT (stripe_session_id) DO UPDATE
   SET status='processing',
       processing_started_at=now(),
       fulfillment_source=EXCLUDED.fulfillment_source
 WHERE checkout_fulfillments.status IN ('pending','failed_retryable')
    OR (checkout_fulfillments.status='processing'
        AND checkout_fulfillments.processing_started_at < now() - interval '10 minutes')
RETURNING id, status;
```

- If `RETURNING` is empty and existing status is `fulfilled`/`fulfilled_email_failed`/`processed` → return `{status:'already_done'}`.
- If existing status is fresh `processing` → return `{status:'in_progress'}`; caller polls.
- Only after a successful claim does the function proceed to user creation, entitlement writes, account/profile creation, magic-link send.

### 4.3 Verified ownership (do not trust `metadata.user_id`)
- If `metadata.user_id` present: `auth.admin.getUserById(...)` must succeed; user's email (case-insensitive) must equal Stripe `customer_details.email` **OR** user's existing `entitlements.stripe_customer_id` must equal Stripe's `customer_id`. For `storage_25gb_monthly`, must also have active base entitlement.
- Any mismatch → set `checkout_fulfillments.status='manual_review'`, insert `fulfillment_audit` row (`reason`, both sides), **do not** mutate entitlements/auth/email. Return `{status:'manual_review'}`.
- If no `metadata.user_id`: base plans only. `auth.admin.createUser({email, email_confirm:true})`; on 422 use filtered admin lookup `GET /auth/v1/admin/users?filter=email.eq.<urlencoded>` (replaces 1000-row scan).

### 4.4 Storage add-on path
Resolved user must have active base + matching `customer_id`. UPDATE entitlement (`extra_storage_gb += 25`, store `stripe_storage_addon_subscription_id`). No user creation, no magic link, no new workspace. Insert `fulfillment_audit`.

### 4.5 Complete workspace creation for base plans (idempotent)
- `auth.users`
- `public.profiles` (upsert; never clobber returning customer)
- `public.entitlements` (upsert keyed by `user_id`, source `stripe`)
- `public.accounts` (owner workspace + `account_number`)
- `public.account_memberships` (owner row, `role='owner'`)
- `public.notification_preferences` (defaults)

All use `ON CONFLICT DO NOTHING`/keyed upsert.

### 4.6 Consent
Insert `user_consents` with `consent_type='post_payment_terms'`, `terms_version=current_terms_version` (server). Also store `displayed_terms_version` if it differs.

### 4.7 Magic-link delivery — §5.

### 4.8 Finalize row
Update `checkout_fulfillments` with final `status`, `user_id`, `magic_link_sent_at`, `magic_link_delivery_status`, `last_email_error`, `completed_at`.

---

## 5. Magic-link delivery — auth-class transactional

**Files:**
- `supabase/functions/_shared/transactional-email-templates/payment-confirmed-magic-link.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/registry.ts` (register new template)
- `supabase/functions/send-transactional-email/index.ts` (update)

- New template `payment-confirmed-magic-link`, sender `noreply@assetsafe.net`.
- Marked `emailClass='auth_critical'` on invocation.
- `send-transactional-email` consults `suppressed_emails.reason`. For `auth_critical`, suppress **only** on `hard_bounce | invalid_address | abuse_complaint | explicit_transactional_block`. Marketing/general unsubscribes do **not** block auth emails.
- Never return `status:'fulfilled'` when email fails → `fulfilled_email_failed`; success page surfaces resend button + support link.

### `resend-magic-link` — `session_id` only
**New file:** `supabase/functions/resend-magic-link/index.ts`

- Input: `{ session_id }` **only**. No raw email parameter.
- Resolves email from Stripe via `stripe.checkout.sessions.retrieve(session_id, { expand:['customer_details'] })` and from the `checkout_fulfillments` row; they must match.
- Requires a `checkout_fulfillments` row in a fulfilled or fulfilled-but-email-failed state within the last 24 h. Anything else → uniform success response (no link generated, no information leak).
- Rate limits: 3 sends per `session_id` per 30 min; 5 per IP per hour; 5 per email per hour.
- Generates a fresh magic link, re-enqueues `payment-confirmed-magic-link` (`auth_critical`), updates `magic_link_sent_at`.

### `/subscription-success` UI
**File:** `src/pages/SubscriptionSuccess.tsx`

- Polls `finalize-checkout` with backoff up to ~30 s.
- "Check your inbox at j***@example.com. The sign-in link is time-limited (1 hour). Didn't get it? [Resend]". Resend button posts `{ session_id }` only.
- `fulfilled_email_failed` → error copy + Resend + Contact Support.
- `manual_review` → "We need a moment to verify this purchase. Our team has been notified." + Contact Support.

---

## 6. Route guard — strict, with safe exceptions

**File:** `src/components/ProtectedRoute.tsx`

1. No session → `/auth`.
2. Session present and `profile.password_set===false` → force `/welcome/create-password`. **Always allow:** `/welcome/create-password`, `/auth`, `/auth/callback`, `/logout`, `/subscription-success`, `/account-assistance`, `/contact`, `/legal`, `/terms`, `/cookie-policy`.
3. `password_set===true` & `onboarding_complete===false` → same redirect, same exceptions.
4. Otherwise allow.
5. Account-closure banner renders independently.

Server-side mirror: data-mutation edge functions reject when `profiles.password_set=false`.

---

## 7. Consent ledger

- `pre_checkout_email_typed` — best-effort, unverified email.
- `post_payment_terms` — written in `fulfillCheckout()` against Stripe-verified email, with server `current_terms_version`.
- `post_auth_terms` — written on `/welcome/create-password` submit (strongest record).

View `v_authoritative_consent` returns strongest per user (`post_auth > post_payment > pre_checkout`).

**Server-resolved terms:** `public.legal_terms_versions` (single row, admin-managed).

---

## 8. New tables / migration

- `public.checkout_fulfillments`
  - `id`, `stripe_session_id` UNIQUE, `stripe_subscription_id`, `stripe_customer_id`, `user_id` (nullable), `email`, `plan_lookup_key`, `fulfillment_source`, `status`, `processing_started_at`, `magic_link_sent_at`, `magic_link_delivery_status`, `last_email_error`, `completed_at`, `created_at`, `updated_at`, `manual_review_reason`, `manual_review_resolved_at`, `manual_review_resolved_by`.
  - GRANT: `SELECT` to `authenticated` (own rows only via RLS), `ALL` to `service_role`.

- `public.checkout_session_audit`
  - `id`, `created_at`, `ip`, `user_agent`, `email`, `lookup_key`, `stripe_session_id`, `outcome`, `error_message`.
  - GRANT: `ALL` to `service_role`.

- `public.legal_terms_versions`
  - `id`, `current_version`, `effective_at`, `notes`.
  - GRANT: `SELECT` to `authenticated` and `anon`; `ALL` to `service_role`.

- `public.stripe_events` additions
  - `status`, `outcome` JSONB, `processed_at`.

- `public.admin_fulfillment_overrides` (append-only audit ledger)
  - `id`, `created_at`, `admin_user_id`, `fulfillment_id`, `stripe_session_id`, `stripe_customer_id`, `original_metadata_user_id`, `override_user_id`, `stripe_email`, `override_user_email`, `email_matched`, `decision`, `override_reason`, `notes`, `outcome`, `manual_review_reason_at_decision`.
  - GRANT: `SELECT` to `authenticated` (admin role check via RLS), `ALL` to `service_role`. **No UPDATE or DELETE policies**.

- View: `public.v_authoritative_consent` (one row per user, strongest consent record).

All new tables: full GRANT block + `ENABLE ROW LEVEL SECURITY` + policies in the same migration.

---

## 9. Admin / support surfaces `manual_review`

### 9.1 Manual Review Queue
**New tab:** Admin → Billing → **Manual Review Queue**

- Lists `checkout_fulfillments` where `status='manual_review'`, newest first.
- Columns: created_at, Stripe session ID (link to Stripe dashboard), email from Stripe, `lookup_key`, `manual_review_reason`, claimed `metadata.user_id` (if any).
- Actions (admin-only, audit-logged):
  - **Approve & fulfill** — re-runs `fulfillCheckout()` server-side with an explicit `override_user_id` parameter (admin asserts identity).
  - **Reject** — leaves entitlement untouched; records reason; does not auto-refund.
- Sidebar badge shows unresolved `manual_review` count.
- Backed by a new admin RPC: `admin_resolve_manual_review(fulfillment_id, decision, override_user_id, override_reason, notes)` gated by `has_role(auth.uid(),'admin')`.

### 9.2 Admin override safeguard *(new in v2.2)*

When "Approve & fulfill" calls the shared `fulfillCheckout()` with an `adminOverride` context, these safeguards are non-negotiable:

1. **Override user must exist.**
   `auth.admin.getUserById(override_user_id)` must succeed. Missing user → reject, leave status as `manual_review`, write `admin_fulfillment_overrides` row with `outcome='rejected_user_not_found'`. No side effects.

2. **Email match OR explicit written reason.**
   Compare the override user's email (case-insensitive) against the **live** Stripe `customer_details.email` (re-fetched from Stripe — never trusted from the stored row).
   - **Match** → proceed; `override_reason` optional but stored if provided.
   - **Mismatch** → `override_reason` is **required** and must be a non-empty, trimmed string of at least 20 characters. If missing/too short, reject with `outcome='rejected_missing_reason'`, leave status unchanged, write the audit row. Admin UI enforces this: Approve button disabled until reason is supplied when the queue flags a mismatch.

3. **Plan appropriateness.**
   Storage add-ons still require the override user to have an active base entitlement and a matching `stripe_customer_id`. Failures reject with `outcome='rejected_plan_mismatch'`.

4. **Full audit trail.**
   On every override attempt, insert one row into `public.admin_fulfillment_overrides` (see §8 columns) **before** entitlement/auth side effects so a crash mid-fulfillment still leaves a record of intent. On success, stamp `checkout_fulfillments.manual_review_resolved_at` / `_by`.

5. **No silent attachments.**
   A paid subscription can never be attached to a user whose email does not match the Stripe customer unless `email_matched=false` AND `override_reason` is recorded AND `outcome='fulfilled_with_email_mismatch'`. That outcome is highlighted in the queue history and the daily backlog/anomaly email so a second admin can review after the fact.

6. **Different user override.**
   If `override_user_id` differs from `metadata.user_id`, that fact is recorded explicitly (`original_metadata_user_id` vs `override_user_id` are distinct columns) and counts as a mismatch case regardless of email — `override_reason` required.

### 9.3 Override History
**New tab:** Admin → Billing → **Override History**

- Lists `admin_fulfillment_overrides` rows, newest first.
- Shows admin who acted, Stripe session, override user, email match status, outcome, reason, notes.
- Purely read-only for all roles.

### 9.4 Backlog notification
**New edge function:** `supabase/functions/notify-manual-review-backlog/index.ts`
- Daily cron emails the admin distribution list if any `checkout_fulfillments` row has been in `manual_review` or `processing` >10 min for >24 h.

---

## 10. File / function impact

| File | Change |
|---|---|
| `supabase/functions/_shared/fulfillment.ts` | New shared module; accepts optional `adminOverride` context |
| `supabase/functions/create-checkout/index.ts` | Auth gating, abuse controls, server consent version, no customer search |
| `supabase/functions/add-storage-25gb/index.ts` | Drop `customers.list({email})`; require existing customer_id |
| `supabase/functions/stripe-webhook/index.ts` | Correct idempotency timing; delegate to shared routine |
| `supabase/functions/finalize-checkout/index.ts` | Status/recovery only; re-verifies Stripe session |
| `supabase/functions/resend-magic-link/index.ts` | New, `session_id`-only, rate-limited |
| `supabase/functions/send-transactional-email/index.ts` | Honor `emailClass='auth_critical'` suppression rules |
| `supabase/functions/_shared/transactional-email-templates/payment-confirmed-magic-link.tsx` | New template |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Register new template |
| `supabase/functions/notify-manual-review-backlog/index.ts` | New daily cron |
| `src/pages/SubscriptionSuccess.tsx` | Poll, masked email, resend button, expiration copy, `manual_review` state |
| `src/components/ProtectedRoute.tsx` | Strict gating + safe-route exceptions |
| `src/pages/Onboarding.tsx` | Collapse to redirect to `/welcome/create-password` |
| `src/pages/CreatePassword.tsx` | Insert `post_auth_terms` consent |
| `src/components/admin/AdminBillingManualReview.tsx` | New queue tab + sidebar badge + override form |
| `src/components/admin/AdminBillingOverrideHistory.tsx` | New audit-history view |
| Migration | All new tables/columns/view + `admin_resolve_manual_review` RPC |

---

## 11. Out of scope

- Gift checkout — unchanged.
- `customer-portal`, `check-subscription` — unchanged behavior.
- Admin billing beyond manual review queue and override history.
- Existing webhook handlers for renewals/cancellations still work after delegating to shared `upsertEntitlementFromStripe()`.

---

## 12. Verification

1. Anonymous base plan happy path — webhook fulfills end-to-end; magic link arrives; workspace + `account_number` created; `post_payment_terms` written with server version.
2. Tab closed mid-flow — webhook completes everything.
3. Webhook delayed — `/subscription-success` polls; `finalize-checkout` re-fetches Stripe session, then runs recovery; row tagged `finalize-checkout-recovery`.
4. Spoofed `metadata.user_id` — `manual_review`; no side effects; row appears in Admin Manual Review Queue with reason and badge increments.
5. Anonymous `storage_25gb_monthly` — 401.
6. Authenticated storage add-on — entitlement updated; no new auth user, no magic link, no new workspace.
7. Webhook + finalize-checkout race — durable claim ensures one wins; other gets `in_progress`/`already_done`.
8. Stale `processing` row >10 min — next call recovers.
9. Transient DB error — `failed_retryable`, Stripe retries, next attempt completes.
10. Resend with valid `session_id` — fresh link sent. Resend with stale/unknown `session_id` — uniform success response, no link generated, no info leak. 4th attempt in 30 min → rate-limited.
11. Marketing unsubscribe in `suppressed_emails` — payment magic link still delivers (auth_critical bypass); hard-bounce does suppress and surfaces `fulfilled_email_failed`.
12. `password_set=false` user — gated to `/welcome/create-password` but can still reach `/contact`, `/legal`, `/logout`, `/subscription-success`.
13. Turnstile env-flag on — missing token → 400; valid token → success; 6th anonymous attempt/IP/15min → 429.
14. Admin opens Manual Review Queue — sees rows, can Approve & fulfill (re-runs shared routine with `override_user_id`) or Reject; resolution audit-logged; backlog cron emails admins after 24 h unresolved.
15. Legal export via `v_authoritative_consent` — one row per user, post_auth > post_payment > pre_checkout.
16. Admin Approve & fulfill with **matching** email → succeeds; audit row `email_matched=true`, `outcome='fulfilled'`, `override_reason` optional.
17. Admin Approve & fulfill with **mismatched** email and **no reason** → blocked client-side; if forced via API → server rejects with `outcome='rejected_missing_reason'`, no entitlement created, audit row written.
18. Admin Approve & fulfill with **mismatched** email and **valid 20+ char reason** → succeeds; audit row `email_matched=false`, `outcome='fulfilled_with_email_mismatch'`, surfaced in Override History and daily anomaly email.
19. Admin override targeting a **nonexistent** `override_user_id` → `outcome='rejected_user_not_found'`, no side effects.
20. Storage add-on override where user has **no active base** → `outcome='rejected_plan_mismatch'`, no entitlement change.
21. Reject action → `outcome='rejected_by_admin'`, fulfillment status updated to `rejected`, audit row stored.
22. `admin_fulfillment_overrides` is append-only at the application/RPC layer: admin users cannot UPDATE/DELETE rows, and no update/delete RPCs or UI actions exist. Direct service-role database maintenance remains restricted to trusted backend/admin operations only.
