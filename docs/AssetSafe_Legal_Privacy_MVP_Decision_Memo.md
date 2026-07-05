# Asset Safe Legal / Privacy MVP Decision Memo

Status: Owner-approved MVP posture
Date: 2026-07-05
Owner: Michael Lewis
Support escalation inbox: `support@assetsafe.net`

## Purpose

This memo records the owner decisions needed to close the remaining P0 legal/privacy policy rows for MVP launch. It does not replace counsel review. It confirms that the existing runbooks are acceptable for limited MVP operation when paired with manual owner review, restricted evidence handling, and escalation to counsel for higher-risk legal decisions.

## Accepted MVP Decisions

| Launch row | MVP decision | Owner / reviewer | Evidence / runbook |
|---|---|---|---|
| Terms and Privacy active version approved | Accepted for MVP by owner before accepting real users. Counsel review may remain pending/recommended if not complete. Material future changes require owner/counsel classification, versioning, notice, and re-consent decision. | Michael Lewis | `docs/AssetSafe_Terms_Privacy_Update_Runbook.md` |
| DSAR/privacy request intake path approved | Manual MVP intake through `support@assetsafe.net`. Michael Lewis or the support owner reviews, verifies identity/authority, logs the request, follows export/delete/correction workflows, and applies retention/legal-hold exceptions. | Michael Lewis / support owner | `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md` |
| DMCA/content complaint intake path approved | Manual MVP intake through `support@assetsafe.net`. Operator reviews the complaint, preserves/logs evidence, restricts access if needed, and escalates to counsel for formal DMCA notices, counter-notices, restoration, repeat-infringer decisions, or disputed legal issues. | Michael Lewis / support owner | `docs/AssetSafe_DMCA_Takedown_Runbook.md` |
| Legal request intake path approved | Manual MVP intake through `support@assetsafe.net`. Michael Lewis reviews and escalates. Counsel is required for subpoenas, law enforcement requests, court orders, preservation demands, disclosure decisions, and breach/privacy notice questions. Legal hold overrides deletion, anonymization, and expiration. | Michael Lewis / legal reviewer | `docs/AssetSafe_Legal_Request_Runbook.md` |

## Decision Details

### Terms And Privacy

Asset Safe may launch MVP using owner-approved active Terms and Privacy versions. The current launch gate is owner approval that the public terms, privacy language, subscription posture, data retention language, and support/legal contact path are acceptable for MVP.

Counsel review remains recommended and may be recorded as pending if it is not complete at launch. Any material change after launch should follow `docs/AssetSafe_Terms_Privacy_Update_Runbook.md`, including versioning, effective date, notice decision, re-consent decision, and rollback plan.

### DSAR / Privacy Requests

Privacy and DSAR requests are accepted for MVP through the manual support path at `support@assetsafe.net`.

Minimum operating posture:

- Record date/time received, requester identity, account identifiers, request type, jurisdiction if known, deadline target, and reviewer.
- Verify identity and authority before disclosure, export, correction, deletion, or restriction.
- Prefer self-service export/deletion when the verified account owner can use the app.
- Use support/admin review for lost access, authorized agents, disputed authority, deceased/incapacitated owners, or requests involving another person's data.
- Apply legal hold, continuity freeze, billing dispute, and retention exceptions before deleting or anonymizing records.
- Escalate denial, deadline extension, minors, legal hold, law enforcement, or sensitive continuity/family facts to owner/counsel review.

### Legal Requests

Legal requests are accepted for MVP through `support@assetsafe.net` with immediate owner review and counsel escalation for formal or high-risk requests.

Counsel is required before production data is preserved, disclosed, withheld from user notification, or produced for:

- Subpoenas or civil discovery.
- Law enforcement requests.
- Court orders or warrants.
- Preservation demands.
- Disclosure decisions.
- Breach/privacy notice questions.
- Any request with nondisclosure, sealing, emergency, or disputed-authority concerns.

Legal hold overrides account deletion, anonymization, export expiration, support PII scrubbing, retention sweepers, and storage cleanup. Where a table-specific hold field is unavailable, the hold must be recorded in the legal request ticket and affected automation paused or reviewed before cleanup.

### DMCA / Content Complaints

DMCA and content complaints are accepted for MVP through `support@assetsafe.net`.

Minimum operating posture:

- Record complainant identity, contact, claimed authority, affected content, requested action, deadline, reviewer, and evidence location.
- Validate that the complained-of content is hosted or stored by Asset Safe and can be located without broad browsing of unrelated user records.
- Preserve minimum evidence before quarantine, removal, restoration, or user notice.
- Restrict access or quarantine content when needed while review is pending.
- Escalate to counsel for formal DMCA notices, counter-notices, restoration, repeat-infringer decisions, litigation risk, or disputed legal issues.
- Escalate to the legal request runbook if the matter involves subpoenas, court orders, law enforcement, or civil discovery.

## Launch Rationale

These manual flows are acceptable for MVP because launch volume is expected to be low, the routes are owner-reviewed, and the supporting runbooks define identity checks, evidence handling, escalation points, and legal-hold boundaries. No automated legal disclosure, automated DMCA takedown, or automatic DSAR approval is required for MVP.

## Open Follow-Ups

| Follow-up | Timing | Owner |
|---|---|---|
| Complete counsel review of active Terms, Privacy, retention, legal request, DSAR, and DMCA posture | P1 / before broader rollout | Michael Lewis |
| Add structured admin ticket fields or labels for privacy/legal/content complaint intake if support volume increases | P1 | Support owner |
| Name backup owner for legal/privacy intake coverage | P1 / before broader rollout | Michael Lewis |

