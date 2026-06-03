
# Stripe-driven grace period + read-only transitions

Make Stripe webhook events the single source of truth for `profiles.account_status`. Add a 7-day grace period before flipping to `expired_read_only`, and recover cleanly on payment success. No data deletion.

## 1. Migration (one)

Add to `public.profiles`:
- `payment_failed_at timestamptz null`
- `grace_period_ends_at timestamptz null`

Add helper (SECURITY DEFINER):
- `public.expire_grace_periods()` — for each profile where `account_status = 'active'` AND `grace_period_ends_at IS NOT NULL` AND `grace_period_ends_at < now()`, set `account_status = 'expired_read_only'`. Returns count. Used by a scheduled invocation so an account flips even if no further Stripe event fires.

No new tables. No changes to existing RLS shape beyond what `is_account_read_only()` already does (already enforced on write paths per plan.md).

## 2. Stripe webhook changes (`supabase/functions/stripe-webhook/index.ts` only)

Treat `customer.subscription.updated` as the source of truth; other events are signals that trigger a status recompute.

Add a single helper `applyAccountStatusFromStripe(supabase, userId, stripeStatus, opts)` that writes `profiles` deterministically:

| Stripe status | profiles.account_status | payment_failed_at | grace_period_ends_at |
|---|---|---|---|
| `active`, `trialing` | `active` (only if currently `active`, `cancelled_billing_active`, or `expired_read_only` from billing — never override `deletion_requested`/`scheduled_for_deletion`/`deleted`) | `null` | `null` |
| `past_due` | keep `active` while `now() < grace_period_ends_at`; else `expired_read_only` | set to `now()` if null | set to `payment_failed_at + 7 days` if null |
| `unpaid`, `incomplete_expired` | `expired_read_only` | preserve | preserve |
| `canceled` (subscription ended, not user-initiated closure) | `expired_read_only` | preserve | preserve |

Wire it in:
- **`customer.subscription.updated` / `.created`** → after the existing entitlements upsert, call helper with `subscription.status`.
- **`customer.subscription.deleted`** → call helper with `'canceled'`.
- **`invoice.payment_failed`** → call helper with `'past_due'` (starts grace period if not already started). Do **not** flip to read-only here.
- **`invoice.paid` / `invoice.payment_succeeded`** → call helper with `'active'`, clearing past-due markers and `cancellation_notice_sent_at` only if it was set due to billing failure (leave intact for user-initiated cancel-at-period-end).

Guards:
- Skip if entitlement's `stripe_subscription_id` doesn't match (existing stale-event guard already covers this — extend to also short-circuit the status write).
- Dedup via existing `stripe_events` table (already implemented).
- Never write `account_status` for accounts in `deletion_requested`, `scheduled_for_deletion`, or `deleted` — explicit allow-list check before writing.

## 3. Scheduled grace-period expiration

New edge function `expire-subscription-grace-periods` (mirrors existing `check-grace-period-expiry` pattern, guarded by `x-internal-secret`):
- Calls `public.expire_grace_periods()` RPC.
- Idempotent. Safe to run hourly.

User adds a Supabase scheduled trigger (hourly) — note in deliverable; no code-side scheduling.

## 4. Frontend — owner-only grace warning

New `src/components/GracePeriodBanner.tsx`:
- Reads new fields via extended `useAccountStatus()` (returns `paymentFailedAt`, `gracePeriodEndsAt`, `isInGracePeriod`).
- Visible only when `accountStatus === 'active'` AND `gracePeriodEndsAt > now()`.
- Owner-only: hidden for Authorized Users (check `useAccount()` — if not owner of current workspace, do not render).
- Copy: "We couldn't process your latest payment. Your account remains active until {date}. Update your payment method to avoid read-only access." CTA → existing `customer-portal` function.
- Render in same locations as `ExpiredSubscriptionBanner` (Account page, dashboard wrapper).

Extend `src/hooks/useAccountStatus.ts`:
- Select `payment_failed_at, grace_period_ends_at` alongside `account_status`.
- Expose `isInGracePeriod`, `gracePeriodEndsAt`.

`ExpiredSubscriptionBanner` already covers post-expiration; no changes needed beyond confirming the "Reactivate" CTA opens the customer portal.

## 5. Authorized User suppression

`GracePeriodBanner` and any payment-update CTAs check `account.role === 'owner'` (existing AccountContext). AUs see neither billing warning, portal link, Stripe IDs, nor failure reasons. `useCanWrite()` already returns false for AUs when owner workspace is read-only via the existing `has_account_access` membership rules (per plan.md §1) — no change needed there.

## 6. Read-only enforcement (already in place — verify only)

`is_account_read_only()` + RLS write guards from the existing migration cover items, properties, files, folders, legacy locker, password catalog, vip contacts, memberships. Export and download paths in `ExportService` / signed-URL flows: add a `useCanWrite()` gate in `ExportAssetsButton` and bulk-download triggers to disable client-side; storage RLS already restricts uploads.

No new RLS policies in this plan — relying on the existing read-only helper, just driven by the new webhook transitions.

## 7. What is explicitly NOT changed

- `subscribers`/`entitlements` columns — webhook keeps writing them as today.
- User-initiated cancel flow (`request-account-closure`, `cancel-subscription`) — independent path; webhook helper respects `deletion_requested` states.
- No data deletion, no Stripe ID exposure to AUs, no new secrets.

## Technical details

Files touched:
- new `supabase/migrations/<ts>_grace_period.sql` (2 columns + 1 function)
- `supabase/functions/stripe-webhook/index.ts` — add helper + 5 call sites
- new `supabase/functions/expire-subscription-grace-periods/index.ts`
- new `src/components/GracePeriodBanner.tsx`
- `src/hooks/useAccountStatus.ts` — extend return
- `src/pages/Account.tsx` + dashboard layout — mount `<GracePeriodBanner />`
- `src/components/ExportAssetsButton.tsx` — `useCanWrite()` gate

## Verification

- Simulated `invoice.payment_failed` → profile stays `active`, `grace_period_ends_at` set 7d out, owner sees banner, AU does not.
- Run `expire-subscription-grace-periods` past expiry → flips to `expired_read_only`, `ExpiredSubscriptionBanner` shows, write CTAs disabled, RLS blocks inserts.
- `invoice.paid` after recovery → clears markers, banner gone, writes work.
- `customer.subscription.deleted` → immediate `expired_read_only`.
- Account in `deletion_requested` receiving stray Stripe events → status untouched.
