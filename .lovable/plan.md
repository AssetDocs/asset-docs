# Account Closure, Subscription Cancellation & Post-Expiration Access

Split today's combined flow into two distinct workflows (Cancel Subscription, Delete Account), preserve all data after cancellation, convert expired accounts to read-only, and add admin tracking + confirmation emails.

---

## 1. Database (single migration)

**New tables**

- `subscription_cancellations` — `account_id`, `owner_user_id`, `cancelled_at`, `period_end`, `reason`, `comments`, `plan`, `stripe_subscription_id`
- `account_closure_requests` — `account_id`, `owner_user_id`, `request_date`, `deletion_scheduled_date`, `reason`, `comments`, `subscription_status`, `current_period_end`, `status` (`pending|scheduled|reversed|completed`), `reversed_at`, `completed_at`
- `subscription_email_events` — `account_id`, `user_id`, `event_type`, `recipient_email`, `sent_at`, `status`, `resend_message_id`; **unique index on `(account_id, event_type, recipient_email)`** to block duplicate webhook sends

**Profile additions**

- `profiles.account_status` enum-text: `active | cancelled_billing_active | expired_read_only | deletion_requested | scheduled_for_deletion | deleted`
- `profiles.cancellation_notice_sent_at timestamptz`
- Derived in a SECURITY DEFINER function `public.compute_account_status(uuid)` that reads from subscribers/entitlements/closure-requests so all surfaces agree.

**Read-only enforcement helper**

- `public.is_account_read_only(uuid)` returns true when status is `expired_read_only`.
- New RLS policy fragments added to write-paths on: `items`, `properties`, `property_files`, `damage_reports`, `insurance_policies`, `legacy_locker*`, `document_folders`, `photo_folders`, `video_folders`, `password_catalog`, `vip_contacts`, `account_memberships` (insert). Each adds: `WITH CHECK (NOT public.is_account_read_only(auth.uid()))` while leaving SELECT untouched so owners can still read everything.

**Authorized-user access cutoff**

- Update `public.has_account_access(account_id)` (or equivalent membership helper) so AUs get `false` when the owner's account status is `expired_read_only`, `deletion_requested`, `scheduled_for_deletion`, or `deleted`. Owner-self SELECT remains allowed.

All new tables ship with GRANTs (`authenticated`, `service_role`) and RLS:
- Owner can SELECT own rows.
- Admins SELECT all via `has_role(auth.uid(),'admin')`.
- Writes restricted to `service_role`.

---

## 2. Frontend — Cancel Subscription wizard

`src/components/billing/CancelSubscriptionDialog.tsx` (new) replacing the single button:

1. **Info screen** — bulleted reassurance using the approved retention copy ("records remain securely stored and available in read-only mode… reactivate, export, or request permanent deletion at any time"). Buttons: `Keep Subscription` / `Continue`.
2. **Optional exit survey** — reason radio list + comments textarea. Fully skippable.
3. **Final confirm** — shows calculated billing end date, "No data will be deleted." Buttons: `Go Back` / `Confirm Cancellation`.
4. On confirm → `cancel-subscription` with `{ action:'cancel', reason, comments }`. Toast: "Your subscription cancellation has been confirmed. We've sent a confirmation email to you and notified any active authorized users."

`Keep Subscription` and `Cancel Subscription` are equally prominent — no dark patterns, no retention loops.

## 3. Frontend — Delete Account wizard

`src/components/account/DeleteAccountDialog.tsx` (new, replaces current delete confirm):

1. **Info screen** — permanent-deletion warning + **Account Impact Summary** (assets, files, AUs, properties, Legacy Locker present, Password Catalog present) from new `get-account-impact` edge function. Buttons: `Export My Data` / `Continue` / `Cancel`.
2. **Re-auth** — password input → `supabase.auth.signInWithPassword` re-verification.
3. **Optional exit survey** — separate reason set (includes Privacy concerns). Stored separately from cancellation.
4. **Final destructive confirm** — must type `DELETE MY ACCOUNT` exactly; button disabled until match.
5. On confirm → `request-account-closure` edge function. Creates `account_closure_requests` row (`status='scheduled'`, `deletion_scheduled_date = current_period_end || now()+30d`), flips `account_status` accordingly, ensures Stripe cancel-at-period-end. **Does NOT destroy data.**
6. **Closure confirmation screen** — schedule + reversal note.

Self-service end-to-end — no support contact required.

## 4. Post-Expiration Read-Only Experience

- `SubscriptionContext` exposes `accountStatus` and `isReadOnly` from the new function.
- New `<ExpiredSubscriptionBanner>` shown persistently on dashboard + key pages when `isReadOnly`. Title "Subscription Expired", approved body copy, three buttons: `Reactivate Subscription`, `Export My Data`, `Delete Account`.
- All "upload / create / edit / add AU / generate report" CTAs gated through a small `useCanWrite()` hook → buttons disabled with tooltip "Read-only mode. Reactivate to enable." Affected pages/components: Properties, Items, Documents, Photos, Videos, MemorySafe, LegacyLocker, PasswordCatalog, DamageReports, InsuranceForm, ReportGenerator, AuthorizedUsersTab.
- Owner retains: login, dashboard, View All Assets, Family Archive view, Legacy Locker view, Password Catalog view, Export, Reactivate, Delete Account.
- AUs hitting `/account` while account is expired/deleting are shown an `AccessRevokedScreen` and signed out of that workspace context.

## 5. Reactivation

- Existing reactivate path (`cancel-subscription` with `action:'reactivate'`, plus checkout for fully-expired) → on success, set `account_status='active'`, clear `cancellation_notice_sent_at`. No data restore needed (nothing was removed). Banner disappears immediately on next status refresh.

## 6. Edge Functions

- **`cancel-subscription`** (extend) — accept `reason`/`comments`, write `subscription_cancellations`, then invoke `send-cancellation-emails`.
- **`request-account-closure`** (new) — JWT-validated owner-only; write `account_closure_requests`; ensure Stripe cancel-at-period-end; bump `account_status='deletion_requested'`; invoke `send-closure-emails`.
- **`reverse-account-closure`** (new) — owner-only; flips status to `reversed`, restores prior account_status.
- **`send-cancellation-emails`** (new, replaces `send-cancellation-notice`):
  - Recipients: owner + active non-owner `account_memberships`. Dedupe.
  - Per-recipient idempotency via unique index on `subscription_email_events`.
  - Owner subject: "Your Asset Safe subscription cancellation is confirmed" — `View Account` CTA → `https://www.getassetsafe.com/account`. Body uses retention-friendly language.
  - AU subject: "Asset Safe access update" — `Open Asset Safe` CTA → `https://www.getassetsafe.com/dashboard`. **No billing, no amounts, no Stripe IDs.** Calm, non-alarming.
  - Reuse Resend `noreply@assetsafe.net` + existing brand header/footer.
  - Log to `subscription_email_events` and `user_activity_log`.
  - Failures logged, never block cancellation.
- **`send-closure-emails`** (new) — owner closure confirmation + AU "closure requested" notice (no billing details).
- **`get-account-impact`** (new) — JWT-validated; returns counts only.
- **`stripe-webhook`** — on `customer.subscription.updated` with `cancel_at_period_end=true`, invoke `send-cancellation-emails` (idempotency-guarded). On `customer.subscription.deleted` (period end reached), set `account_status='expired_read_only'`.
- **`delete-account`** — unchanged executor; called by scheduled job after `deletion_scheduled_date`.

## 7. Admin Workspace

`AdminUsers.tsx` updates:

- **User Directory** — add `Account Status` column + filter chip group: Active / Cancelled (Billing Active) / Expired (Read Only) / Deletion Requested / Scheduled for Deletion / Deleted.
- **New tab: Subscription Cancellations** — table from `subscription_cancellations` joined to profiles: name, email, plan, cancelled_at, period_end, reason, comments, AU count. Filters: date range, reason, plan.
- **New tab: Closure Requests** — table from `account_closure_requests`: name, email, request_date, scheduled_deletion_date, status, reason, comments, asset count, AU count. Status chip filter. Row action `Reverse` (admin override).

`AdminCancellationAnalytics.tsx` (new) on Admin dashboard:
- Top cancellation reasons (bar)
- Top deletion reasons (bar)
- Monthly cancellation rate (line)
- Monthly deletion rate (line)

## 8. Copy & UX Principles

- All cancellation surfaces use the approved retention language: data remains securely stored, read-only after expiration, reactivate/export/delete available anytime.
- Never imply data deletion, account closure, or loss of ownership unless the user explicitly initiated the Delete Account workflow.
- Cancel and Delete are visually + functionally distinct entry points.
- No dark patterns, no hidden cancel option, no repeated "stay" prompts.

## 9. Test Cases (must pass)

- Cancel with no AUs → 1 owner email.
- Cancel with N active AUs → 1 owner + N AU emails, no billing data in AU emails.
- Pending/revoked invitees receive nothing.
- Duplicate webhook → no duplicate emails (unique index).
- Email failure → cancellation still succeeds.
- Expired owner login → banner + read-only enforcement; reads work, writes blocked at RLS and UI.
- Expired AU login → access denied screen.
- Reactivate → full functionality restored, banner gone, no data restore needed.
- Closure request → status changes propagate; owner can reverse before scheduled date.

## Technical Details

- New migration includes CREATE TABLE → GRANTs → RLS → POLICIES per platform rules. Includes the read-only helper function and updated membership-access function.
- All new edge functions validate JWT via `auth.getUser` and verify ownership before mutating.
- `src/integrations/supabase/types.ts` regenerates after migration approval.
- No changes to unrelated auth, media, or property domains beyond the read-only RLS guards.

## Out of Scope

- Scheduled cron job to execute hard-delete on `deletion_scheduled_date` — existing `delete-account` remains the executor; cron worker can be added later.
- Resend bounce/complaint webhook tracking.
