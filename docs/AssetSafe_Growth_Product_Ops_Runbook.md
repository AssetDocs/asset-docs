# Asset Safe Growth / Product Ops Runbook

Status: launch product operations runbook
Owner: Product / Growth
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Billing_Revenue_Operations.md`
- `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`

## Purpose

This runbook defines how Asset Safe reviews onboarding analytics, churn, referrals/affiliates, and in-app product messaging. It turns existing CRM metrics, event tracking, cancellation records, and release/changelog tooling into a repeatable operating cadence.

Growth analysis must respect user privacy. Use aggregate metrics where possible, minimize raw event review, and avoid adding new analytics vendors or marketing trackers without privacy/cookie review.

## Current Product Signals

| Signal | Current source | Primary use |
|---|---|---|
| Event tracking | `track` edge function and events table | Lightweight funnel/event analysis |
| Activation funnel | `get_activation_funnel` RPC and CRM/Admin CRM views | Signup to activation trend |
| Feature adoption | Enhanced CRM feature adoption surfaces | Identify unused or sticky features |
| Churn metrics | Enhanced CRM revenue metrics | 30-day churn review |
| Cancellation reasons | `subscription_cancellations` | Churn reason analysis |
| At-risk customers | CRM at-risk customer surface | Identify inactivity risk |
| Releases/changelog | Dev workspace release tracking | Internal release history and user-facing changelog source |

## Onboarding Funnel

Minimum launch funnel:

1. Visitor or lead captured.
2. Signup or checkout started.
3. Checkout completed or account created.
4. Magic link / password setup completed.
5. Onboarding complete.
6. First property or first asset created.
7. First file/photo/receipt uploaded.
8. First export generated or meaningful dashboard return visit.

Activation definition for launch:

- A user is activated when they create at least one real account/property record and upload at least one file/photo/receipt, or when the existing `get_activation_funnel` definition marks them activated.

Weekly review:

1. Review activation rate by week.
2. Compare drop-off at checkout, password setup, onboarding, first property, and first upload.
3. Inspect only aggregate counts unless a support ticket or explicit user consent justifies account-level review.
4. Create one product follow-up for the largest drop-off.
5. Record whether the issue is copy, UX, billing, trust/security, technical failure, or unclear value.

## Event Naming

When adding new tracking events, use stable names and avoid PII.

Recommended naming:

- `signup_started`
- `checkout_started`
- `checkout_completed`
- `password_set`
- `onboarding_started`
- `onboarding_completed`
- `property_created`
- `asset_created`
- `file_uploaded`
- `export_started`
- `export_completed`
- `authorized_user_invited`
- `legacy_admin_added`
- `subscription_cancel_started`
- `subscription_cancel_completed`

Event properties should be coarse:

- plan, source, feature area, step, status, duration bucket.

Do not include:

- names, emails, phone numbers, addresses, uploaded file names, free-text user content, full URLs containing tokens, or legal/support notes.

## Churn Review

Review churn monthly and after pricing/billing changes.

Inputs:

- Enhanced CRM churn rate.
- `subscription_cancellations.reason`.
- `subscription_cancellations.comments` only when needed and with privacy care.
- Stripe churn/cancellation data.
- Support issues tagged billing, account recovery, export, storage, or UX.

Recommended cancellation reason groups:

- Price / budget.
- Not enough value.
- Setup too hard.
- Missing feature.
- Storage limit.
- Trust/security concern.
- Billing/payment issue.
- Switching product.
- Temporary need completed.
- Gift expired / recipient did not continue.
- Other.

Monthly review:

1. Count cancellations by reason group.
2. Compare churn by plan, acquisition source, and activation status.
3. Identify whether churn came before activation or after meaningful use.
4. Pick one retention experiment or product fix.
5. Confirm any customer outreach respects notification and marketing preferences.

## Win-Back And Retention Messaging

Win-back messaging should be conservative at launch.

Allowed without extra marketing review:

- Transactional cancellation confirmation.
- Account deletion/closure reminders.
- Expired gift reminders.
- Billing failure reminders.
- Product-critical account status notices.

Requires product/legal/privacy review:

- Promotional win-back discounts.
- Marketing drip campaigns.
- New third-party marketing automation.
- Behavioral targeting beyond coarse product lifecycle state.

Suggested lifecycle messages:

- Day 0 cancellation confirmation with export reminder.
- 7 days before access/status change, if applicable.
- After gift expiration reminder, invite recipient to choose a paid plan.
- Inactive but paying customer: helpful setup reminder, not fear-based pressure.

## Referral / Affiliate Program

Do not launch paid referral or affiliate payouts until the following are defined:

- Referral code model.
- Stripe/customer metadata mapping.
- Commission eligibility rules.
- Fraud and self-referral rules.
- Tax/reporting responsibilities.
- Partner terms and disclosure language.
- Privacy review for partner-shared user data.
- Admin reconciliation report.

MVP referral tracking can be limited to source/campaign attribution without payouts.

Recommended staged rollout:

1. Organic source tracking only.
2. Non-paid referral codes for attribution.
3. Partner pilot with manual payout review.
4. Automated affiliate dashboard only after reconciliation and legal terms are approved.

## In-App Messaging And Changelog

Use release/changelog entries to explain meaningful product changes.

Message when:

- A user-visible feature ships.
- A workflow changes materially.
- A security/privacy/legal control changes.
- A known issue is resolved.
- A deprecation affects user behavior.

Do not message every internal fix. Avoid marketing-heavy copy inside operational workflows.

Required release entry fields:

- Title.
- Date.
- Feature area.
- User impact.
- Whether user action is required.
- Support notes.
- Related ticket/commit/release ID.

Legal/Privacy changes must follow `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`, not only changelog publication.

## Metrics Review Cadence

| Cadence | Review |
|---|---|
| Weekly | Activation funnel, top onboarding drop-off, top support friction |
| Monthly | Churn reasons, at-risk customers, feature adoption, cancellation comments sample |
| Quarterly | Referral/affiliate readiness, lifecycle messaging, privacy review for analytics |
| After major release | Changelog entry, feature adoption watch, support issue watch |

## Launch Gate

Before launch, confirm:

- Activation definition is agreed.
- CRM activation/churn views are accessible to the product owner.
- Cancellation reasons are captured and reviewed.
- Win-back messaging is limited to approved transactional/lifecycle messages.
- Referral/affiliate program is not promised unless terms, tracking, and payouts are defined.
- Changelog/release process has an owner.
- Analytics tracking avoids PII and respects consent/cookie posture.
