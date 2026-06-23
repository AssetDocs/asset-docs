# Asset Safe Terms / Privacy Update Runbook

Status: launch compliance operations runbook
Owner: Asset Safe operator / Legal
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`
- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Growth_Product_Ops_Runbook.md`
- `docs/AssetSafe_Mobile_Capacitor_Ops_Runbook.md`

## Purpose

This runbook defines how Asset Safe updates Terms of Service, Privacy Policy, Subscription terms, cookie disclosures, and other user-facing legal notices.

The goal is to ensure legal text changes are versioned, reviewed, communicated, and, when needed, re-accepted by users before they continue sensitive workflows.

This is an operational checklist, not legal advice. Counsel or the business owner must approve material legal changes and any re-consent requirement.

## Change Types

| Change type | Examples | Default handling |
|---|---|---|
| Editorial | Typos, formatting, broken links, non-substantive clarity | Version note; no user notice unless desired |
| Minor operational | Contact path, support wording, non-material process clarification | Version note; in-app/changelog notice optional |
| Material privacy change | New data category, new retention window, new sharing/disclosure, changed user rights | Counsel review, notice, likely re-consent |
| Material commercial change | Subscription, cancellation, refund, renewal, or billing terms changed | Counsel review, notice, likely re-consent before checkout/renewal-sensitive flows |
| Security/legal obligation change | Breach notice language, lawful request handling, legal hold, export/deletion policy | Counsel review and documented rollout |
| Cookie/marketing change | New analytics/marketing technology or changed consent purpose | Update cookie disclosure and consent preferences where applicable |
| Mobile distribution change | App-store launch, mobile SDK, push notification, crash reporting, or mobile data-collection change | Store privacy-label review, counsel/operator review, possible notice or re-consent |

When unsure, treat the change as material until counsel/operator decides otherwise.

## Versioning

Asset Safe has `legal_terms_versions`, `user_consents`, `legal_agreement_signatures`, and `v_authoritative_consent` surfaces. Use them to preserve evidence of what version a user accepted.

Minimum version record:

- Version ID, such as `v2026.06.23`.
- Document names affected.
- Effective date.
- Summary of changes.
- Whether re-consent is required.
- Approver.
- Rollback plan.

Do not overwrite historical acceptance evidence. New acceptance creates new consent/signature evidence.

## Approval Workflow

1. Draft the changed legal text.
2. Create a change ticket with affected documents, reason, and proposed effective date.
3. Compare against current production text.
4. Classify the change type.
5. Counsel/operator approves:
   - final text,
   - effective date,
   - whether notice is required,
   - whether re-consent is required,
   - affected users,
   - launch/rollback plan.
6. Update public legal pages.
7. Update `legal_terms_versions` or equivalent version source.
8. Validate acceptance/consent logging.
9. Record final evidence in the change ticket.

## User Notice

For material changes, prepare a short plain-language notice.

Notice should include:

- What changed.
- Effective date.
- Where to read the updated terms.
- Whether continued use means acceptance or explicit re-consent is required.
- How to contact support or request deletion/export if the user does not agree.

Possible notice channels:

- Email.
- In-app notification.
- Account settings banner.
- Checkout/signup consent copy.
- Changelog/support article.
- App Store / Google Play release notes when the change affects mobile users.

Do not use marketing opt-out status to suppress legally required transactional/legal notices.

## Re-Consent Gating

Re-consent is recommended when:

- Privacy data categories, purposes, sharing, retention, or user rights materially change.
- Subscription/billing/cancellation terms materially change.
- A new high-impact workflow requires explicit agreement.
- Counsel/operator requires fresh consent for enforceability.

Minimum gating behavior:

- New users must accept the current version during signup/onboarding or checkout.
- Existing users who need re-consent should be blocked from sensitive workflows until acceptance is logged.
- Sensitive workflows include checkout, plan changes, account deletion/closure, continuity high-impact actions, Authorized User invitations, and exports where counsel/operator requires it.
- Acceptance should write `user_consents` or `legal_agreement_signatures` with user ID, terms version, timestamp, and available request context.

If current code does not support a particular re-consent gate, document the gap before the legal change goes live.

## Validation

Before marking the rollout complete:

1. Public Terms/Privacy pages show the approved text.
2. Footer/onboarding/checkout links point to the updated pages.
3. `legal_terms_versions` reflects the active version.
4. New signup or checkout acceptance records the current version.
5. Re-consent gate appears for a test existing user when required.
6. Admin/legal evidence surfaces show the new consent/signature records.
7. Support has approved response language.

Suggested verification query:

```sql
select user_id, consent_type, terms_version, consented_at
from public.user_consents
order by consented_at desc
limit 50;
```

## Rollback

If a legal update is published incorrectly:

1. Notify owner/counsel immediately.
2. Restore the prior public text or publish corrected text.
3. Update version notes to preserve the publication history.
4. Decide whether erroneous acceptances need remediation or replacement consent.
5. Notify affected users if counsel/operator decides notice is required.
6. Record the incident/change ticket outcome.

Do not delete consent records merely because a rollout was mistaken. Add corrective evidence instead.

## Launch Gate

Before launch, confirm:

- Current Terms and Privacy Policy are counsel/operator approved.
- Current active legal version is recorded.
- Signup, checkout, and gift checkout record current-version consent where applicable.
- Material-change notice and re-consent process is documented.
- Support knows how to route questions from users who do not accept updated terms.
- Privacy request/deletion/export options are available for users who decline material changes.
