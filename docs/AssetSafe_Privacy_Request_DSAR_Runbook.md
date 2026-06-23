# Asset Safe Privacy Request / DSAR Runbook

Status: launch compliance operations runbook
Owner: Asset Safe operator / Legal
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Retention_Deletion_Policy_Matrix.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Legal_Request_Runbook.md`

## Purpose

This runbook defines how Asset Safe handles privacy requests, including access/export, deletion, correction, restriction, opt-out, and other data subject requests. It is designed for US-first operations, including CCPA/CPRA-style expectations, while leaving final legal interpretation to counsel/operator review.

This is an operational checklist, not legal advice. Counsel or the business owner must approve denials, deadline extensions, and any response involving minors, disputed authority, legal hold, law enforcement, or sensitive family/continuity facts.

## Request Types

| Request | Examples | Default path |
|---|---|---|
| Access / copy | "Send me my data" | Use account export flow where possible |
| Deletion | "Delete my account/data" | Use closure/deletion workflow, subject to grace/legal hold |
| Correction | "Fix inaccurate profile/account data" | Verify identity and update through product/admin path |
| Restriction / pause | "Stop processing" or disputed use | Escalate to owner/counsel; may require manual restriction |
| Opt-out | Marketing/comms opt-out | Use consent/preferences tooling where available |
| Authorized agent | Agent requests on user's behalf | Verify agent authority and user identity |
| Appeal / complaint | User disputes denial or incomplete response | Escalate to owner/counsel |

## Intake

Create a privacy request ticket. Record:

- Date/time received.
- Requester name and contact.
- User/account ID, email, or other identifiers.
- Request type.
- Jurisdiction or state if known.
- Deadline target.
- Identity verification status.
- Whether requester is the account owner, Authorized User, Legacy Admin, support contact, or external agent.
- Whether account has legal hold, continuity dispute, billing dispute, security incident, or scheduled deletion.

Recommended response target:

- Acknowledge within 10 business days where practical.
- Complete within 45 calendar days where practical.
- If more time is required, document the reason and owner/counsel approval before extending.

## Identity And Authority Verification

Do not disclose or delete data until the requester is verified.

Minimum verification:

- Logged-in account owner using existing authenticated session for self-service export/deletion.
- Email ownership plus additional account-control checks for support-mediated requests.
- Admin review for lost-email, lost-MFA, or account recovery scenarios.
- Written authorization plus user verification for authorized agents.
- Continuity/Legacy Admin requests must follow continuity workflows, not ordinary DSAR shortcuts.

Escalate to account recovery or legal review when:

- The requester cannot access the account email.
- Multiple people claim authority.
- The account owner is deceased/incapacitated.
- There is a legal dispute, account freeze, or continuity request.
- The request would reveal another person's data.

## Access / Export Requests

Prefer self-service export when the verified account owner can log in.

Operational steps:

1. Confirm identity and account scope.
2. Ask the requester to use the account export flow when possible.
3. Confirm managed export bundle behavior:
   - Bundle stored in private `exports` bucket.
   - Short signed URL window.
   - Download cap enforced.
   - `account_export_audit` row recorded.
4. For support-mediated export, use the audit export procedure in `docs/AssetSafe_Audit_Log_Retention_Runbook.md`.
5. Redact unrelated users, counterparty data, internal notes, secrets, and privileged/security details unless counsel approves disclosure.
6. Record export date, scope, method, and audit ID.

Do not use DSAR export to bypass continuity review, legal hold, billing dispute, or security incident controls.

## Deletion Requests

Prefer the existing account closure/deletion workflow.

Operational steps:

1. Confirm requester identity and authority.
2. Confirm the requester understands deletion consequences.
3. Check for legal hold, billing dispute, chargeback/dispute, continuity dispute, account recovery review, or law-enforcement preservation.
4. Use `submit-deletion-request`, owner self-service closure, or the approved admin-mediated path.
5. Respect the configured grace/reversal window.
6. Confirm `delete-account` creates the `deleted_accounts` tombstone and applies the retention/deletion matrix.
7. Confirm retained records are minimized, anonymized, or tombstone-linked where applicable.
8. Record completion or denial reason in the privacy request ticket.

Deletion may be denied, delayed, or partially fulfilled when records are needed for legal, tax, security, fraud, billing, dispute, consent, audit, or legal hold purposes.

## Correction Requests

For account/profile correction:

1. Verify identity.
2. Confirm the requested correction and affected fields.
3. Use normal product settings where possible.
4. Use admin correction only when self-service is unavailable or unsafe.
5. Preserve audit evidence for material changes to identity, email, billing, legal, or continuity data.

Do not alter historical legal agreement signatures, consent records, billing records, audit logs, or security evidence merely because a user asks to "correct" history. Add explanatory notes or updated current-state records where appropriate and approved.

## Denial Or Partial Fulfillment

Owner/counsel review is required before denying or narrowing a privacy request.

Common reasons:

- Identity could not be verified.
- Requester lacks authority.
- Request would reveal another person's data.
- Data is retained for legal, tax, billing, fraud, security, consent, audit, or dispute purposes.
- Legal hold, court order, law enforcement preservation, or active investigation applies.
- Request is excessive, duplicative, or technically infeasible as phrased.

Record the reason, reviewer, and user-facing response.

## Closeout

Do not close the privacy request ticket until:

- Identity/authority verification is recorded.
- Request scope and deadline are recorded.
- Export/deletion/correction actions are complete or denial is approved.
- User response is sent or intentionally withheld with owner/counsel approval.
- Any legal hold or incident linkage is documented.
- Any retained data categories are explained at a high level when appropriate.

## Launch Gate

Before launch, confirm:

- Privacy request intake path exists.
- Support knows how to route DSAR/privacy requests.
- Self-service export and deletion paths are tested.
- Admin/support-mediated requests require identity verification.
- Retention exceptions are documented in public policy and internal runbooks.
- Counsel/operator owns denial, extension, and authorized-agent decisions.
