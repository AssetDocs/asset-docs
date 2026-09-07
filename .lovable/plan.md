# ENV-02E — Edge Functions + Cron Inheritance Map (read-only audit)

Scope: current source only. 124 functions plus `_shared` in `supabase/functions/`. No builds, runtime calls, sends, checkouts, or secret reads. Production backend refs appear in config and several functions/migrations generically (project ref hardcoded); values not reproduced here beyond what config already contains.

## Verified facts behind this map

- 124 function directories exist in source (+ `_shared`).
- `supabase/config.toml` marks a large set as `verify_jwt = false`, several explicitly documented as cron-invoked sweepers authenticating via an `x-internal-secret` header.
- Only one `cron.schedule('...')` literal exists in migrations: `check-gift-deliveries-every-15-min`. One `cron.unschedule` literal: `expire-subscription-grace-periods-hourly`.
- Function URLs referenced from migrations: `check-gift-deliveries`, `check-gift-reminders`, `send-welcome-email`, `check-payment-failures`, `check-trial-reminders`.
- `check-trial-reminders` is referenced by a migration but has **no directory in source** — a scheduled callback with no repo code.
- Callers were resolved via `functions.invoke(...)` and `/functions/v1/...` scans; `AuthorizedUsersTab.tsx` invokes a dynamic slug variable, so AU-related functions are called even where a literal is absent.

## Classification by workstream

### 1. Contributor-era — DELETE/RETIRE
`accept-contributor-invitation`, `invite-contributor`, `send-contributor-invitation`, `complete-contributor-signup`
Contributor system is retired; Authorized Users are `account_memberships`. These paths create membership-like state outside the new model and must not exist in DEV.

### 2. Authorized Users / invites — KEEP CONCEPT, REWRITE BEFORE DEV
`invite-accept` family: `accept-invite`, `send-invite`, `resend-invite`, `cancel-invite`, `confirm-invite-email`, `revoke-authorized-user`, `update-authorized-user-role`, `get-account-impact`
Reason: these mint or change cross-account access. Each must be re-derived from `account_memberships` only, with owner-only authorization, single-use tokens, and no contributor fallbacks. Rewrite (not port) so no retired role can grant access.

### 3. Dev/internal team invites — DEFER/OPTIONAL
`invite-dev-team-member`, `accept-dev-invite`, `verify-dev-invite`, `verify-construction-password`, `verify-admin-password`
Reason: staff-access surface; only rebuild if Support Staff Access is part of DEV scope. `verify-*-password` gates must be rewritten if kept (password-style gates are weak trust anchors).

### 4. Legacy Admin / recovery / continuity-era — REWRITE BEFORE DEV (against Legacy Contact model)
`submit-recovery-request`, `respond-recovery-request`, `send-recovery-request-email`, `send-recovery-approved-email`, `send-recovery-rejected-email`, `acknowledge-delegate-access`, `send-delegate-access-email`, `send-legacy-admin-notification`, `dispatch-continuity-event`, `notify-continuity-request`, `send-continuity-notification`, `notify-visitor-access`
Reason: this is the highest-trust surface in the product — it can release vault material to a non-owner. Product term is being redesigned into Legacy Contact/legacy-release, so the approval flow, mirror integrity checks, and key-material handling must be rebuilt on the new model rather than inherited. Delegate-era naming and any implicit access must not survive.

### 5. Secure Vault (Digital Access + Legacy Locker) support — KEEP CONCEPT, REWRITE
`secure-delete-file`, `secure-delete-contact`, `secure-delete-property`, `download-account-export-bundle`
Reason: service-role functions that act on bucket/path values sourced from database rows and, in at least one case, permissive CORS. Rewrite with a validated storage gateway, strict origin allow-list, and server-side ownership re-check.

### 6. Storage / deletion / retention sweepers — KEEP CONCEPT, REWRITE (DEV DISABLED initially)
`process-storage-deletion-jobs`, `process-storage-orphans`, `process-storage-usage-drift`, `process-retention-expirations`, `process-expired-exports`, `process-account-closures`, `request-account-closure`, `reverse-account-closure`, `submit-deletion-request`, `respond-deletion-request`, `send-deletion-confirmation`, `delete-account`, `list-pending-file-deletions`, `list-pending-property-deletions`, `list-storage-deletion-jobs`, `send-storage-warning`, `add-storage`, `add-storage-25gb`
Reason: destructive service-role operations authenticated by a shared internal header. In DEV they must be disabled or dry-run only; `delete-account` still contains contributor cleanup that must be removed.

### 7. Stripe / billing — DEFER/OPTIONAL, DEV DISABLED
`create-checkout`, `finalize-checkout`, `stripe-webhook`, `customer-portal`, `change-plan`, `cancel-subscription`, `check-subscription`, `sync-subscription`, `check-payment-failures`, `check-grace-period-expiry`, `payment-history`, `send-payment-receipt`, `send-payment-receipt-internal`, `send-payment-reminder`, `send-cancellation-emails`, `send-cancellation-notice`, `admin-stripe-subscriptions`, `admin-link-stripe-customer`, `admin-stripe-webhook-health`, `admin-request-stripe-event-replay`, `admin-approve-fulfillment`, `validate-lifetime-code`
Reason: no live money movement in DEV; keep concepts, wire only to test credentials later.

### 8. Gifts — DEFER/OPTIONAL
`create-gift-checkout`, `get-gift-status`, `redeem-gift`, `resend-gift-email`, `send-gift-email`, `check-gift-deliveries`, `check-gift-reminders`, `expire-gift-entitlements`, `backfill-gift-session`, `list-purchased-gifts`, `start-gift-email-verification`, `verify-gift-email-code`, `validate-gift-signup-email`, `track-gift-login`
Reason: revenue-adjacent, not core to V2 rebuild; defer until billing returns.

### 9. Auth / MFA / session — KEEP CONCEPT, REWRITE
`send-auth-email`, `mint-magic-link`, `resend-magic-link`, `mfa-step-up`, `mfa-unenroll`, `manage-backup-codes`, `check-verification`, `send-verification-email`, `request-email-change`, `confirm-email-change`, `force-signout`
Reason: all are `verify_jwt = false` or privileged; rewrite with explicit signature/token verification, durable rate limiting, and no user-supplied identity.

### 10. Email delivery — KEEP CONCEPT, DEV DISABLED
`send-welcome-email`, `send-subscription-welcome-email`, `send-security-alert`, `send-property-update`, `send-reminder-email`, `send-feedback-email`, `send-contact-email`, `send-test-email`, `resend-webhook`
Reason: outbound sending must be off or sandboxed in DEV to avoid mailing real users.

### 11. Public intake — SPLIT
- KEEP: `rebuild-update-signup` (already minimal, origin-scoped, rate-limited).
- REWRITE BEFORE DEV: `lead-capture`, `submit-lead`, `submit-account-assistance`, `log-consent`, `track`, `rate-limit-check` — unauthenticated write surfaces; need input allow-lists, durable per-IP limiting, generic responses.
- DELETE: ActiveCampaign is out of scope → `sync-activecampaign` retires.

### 12. Admin / internal ops — DEFER/OPTIONAL
`admin-get-user-emails`, `list-cron-job-health`, `notify-manual-review-backlog`, `scrub-old-support-pii`, `quarterly-restore-drill-reminder`, `security-headers`
Reason: operational tooling; `admin-get-user-emails` needs rewrite if kept (PII egress).

### 13. AI / lookup utilities — KEEP CONCEPT
`ai-support-chat`, `mls-property-lookup`, `property-tax-lookup`
Reason: no privileged data writes; keep with cost caps and auth.

## Caller gaps

- **Referenced but missing from source:** `check-trial-reminders` (migration-scheduled only).
- **In source with no literal caller found:** `backfill-gift-session`, `check-grace-period-expiry`, `notify-manual-review-backlog`, `quarterly-restore-drill-reminder`, `scrub-old-support-pii`, `resend-webhook`, `security-headers`, `send-verification-email`, `send-reminder-email`, `send-cancellation-notice`, `send-continuity-notification`, `send-legacy-admin-notification`, `send-recovery-approved-email`, `send-recovery-rejected-email`, `send-payment-receipt`, `stripe-webhook`, plus the `list-*`/`process-*` sweepers and `download-account-export-bundle`. Most are provider-webhook, cron, or server-to-server targets, so absence of a literal caller is expected — but each needs an owner-confirmed trigger before DEV. Contributor-era functions have no live caller at all.

## Cron classification under V2

Only one schedule is defined in repo migrations; the remaining sweepers are documented in config as cron-invoked but their schedules are not in source (dashboard-created — unverified).

- `check-gift-deliveries-every-15-min` — DEV DISABLED (gifts deferred).
- `expire-subscription-grace-periods-hourly` — already unscheduled in a migration; DELETE.
- Callback targets referenced from migrations: `check-gift-reminders`, `send-welcome-email`, `check-payment-failures` → DEV DISABLED; `check-trial-reminders` → DELETE (no code).
- Storage/retention/closure sweepers → REWRITE, DEV DISABLED at first.
- Continuity/legacy dispatch (`dispatch-continuity-event`) → REWRITE under Legacy Contact, never enabled in DEV.
- `scrub-old-support-pii`, `quarterly-restore-drill-reminder`, `process-storage-usage-drift` → KEEP LATER (production hygiene only).

## Recommended next step

Confirm the full production cron inventory from the Supabase dashboard (out-of-repo schedules), then take the DELETE groups first — contributor-era and ActiveCampaign — before any DEV provisioning.

No files, migrations, settings, secrets, or backend state were changed or invoked during this audit.
