# Asset Safe Legal Request Runbook

Status: launch compliance operations runbook
Owner: Asset Safe operator / Legal
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`
- `docs/AssetSafe_Security_Incident_Response_Runbook.md`

## Purpose

This runbook defines how Asset Safe handles subpoenas, warrants, court orders, law-enforcement requests, civil discovery requests, preservation requests, and other legal demands for user or account data.

This is an operational checklist, not legal advice. Counsel or the business owner must review legal demands before production data is preserved, disclosed, or withheld from user notification.

## Request Types

| Type | Examples | Default posture |
|---|---|---|
| Informal request | Email or phone request without legal process | Do not disclose account data; ask for formal process |
| Preservation request | Request to preserve records pending legal process | Preserve narrowly after counsel/operator review |
| Subpoena / civil discovery | Civil subpoena, attorney request, discovery demand | Legal review required before production |
| Court order / warrant | Signed order or warrant from court or law enforcement | Legal review required; prioritize deadline |
| Emergency request | Imminent harm or emergency disclosure request | Escalate immediately to owner/counsel |
| User-authorized request | User asks Asset Safe to provide records to a third party | Verify user authority and scope |

## Intake

Create a legal request ticket immediately. Record:

- Date/time received.
- Requesting agency, court, attorney, or party.
- Requester name, contact, phone, email, and mailing address.
- Legal process type and jurisdiction.
- Deadline.
- Requested users, accounts, email addresses, phone numbers, Stripe/customer IDs, storage objects, or date ranges.
- Whether nondisclosure, sealing, or delayed-notice language is included.
- Whether preservation is requested.
- Initial owner and counsel/operator reviewer.

Store the original request document in a restricted evidence location. Do not paste sensitive legal documents into public issue trackers or support notes.

## Validation Before Disclosure

Before producing data:

1. Confirm the request is authentic and complete.
2. Confirm the request has jurisdiction and is properly served.
3. Confirm the requested scope is clear.
4. Narrow overly broad requests where possible.
5. Confirm whether user notification is permitted, required, delayed, or prohibited.
6. Confirm whether legal hold is required.
7. Confirm who approves production and who will transmit the response.

If authenticity is uncertain, verify through an official public contact channel for the requesting agency/court/firm. Do not rely solely on contact details in the request.

## Preservation And Legal Hold

Apply preservation only to the minimum necessary accounts, tables, objects, and date ranges.

Potential preservation targets:

- Account/user profile metadata.
- Uploaded files and storage object metadata.
- Account export audit rows.
- Audit and activity logs.
- Billing, checkout, Stripe, and cancellation records.
- Legal agreement signatures and consent records.
- Continuity requests, disputes, freezes, documents, and reviewer notes.
- Account closure/deletion requests and deleted-account tombstones.
- Provider logs from Supabase, Stripe, Resend, or GitHub where relevant.

If an account is scheduled for closure/deletion or retention purge, apply or confirm legal hold before the sweeper runs. Legal hold controls currently exist for pending closures and deleted-account tombstones in admin workflows; where table-specific hold does not exist, record the hold in the legal request ticket and pause any affected cleanup job if necessary.

## Data Production

Use the audit export procedure in `docs/AssetSafe_Audit_Log_Retention_Runbook.md`.

Production rules:

- Produce the minimum necessary data.
- Prefer structured exports with clear table/source names.
- Include date range, timezone, and query context.
- Redact unrelated users, unrelated accounts, secrets, internal credentials, and privileged notes unless counsel approves disclosure.
- Do not disclose raw service-role keys, webhook secrets, API keys, or internal security implementation details.
- Do not produce deleted/anonymized identity data beyond what is legally required and available under retention policy.

Record:

- Approver.
- Operator.
- Queries or admin surfaces used.
- Row counts.
- Storage objects included.
- Export file names.
- File hashes when practical.
- Delivery method and recipient.
- Date/time delivered.

## User Notification Review

Default posture: notify the affected user before or after production when legally allowed and operationally safe.

Counsel/operator must decide:

- Whether notice is legally required.
- Whether notice is prohibited by court order or law.
- Whether notice should be delayed to prevent harm, preserve investigation integrity, or comply with law enforcement.
- What the notice should say.
- Whether support needs an internal brief.

Do not send user notice if the request includes nondisclosure, sealing, gag, delayed-notice, or similar language until counsel/operator clears it.

## Emergency Requests

For imminent harm requests:

1. Escalate immediately to owner/counsel.
2. Verify requester identity through an official channel.
3. Record the emergency facts asserted by the requester.
4. Disclose only the minimum necessary information approved by owner/counsel.
5. Require follow-up legal process when appropriate.
6. Preserve all request and disclosure evidence.

If the emergency request also suggests account compromise, data exposure, or active abuse, follow `docs/AssetSafe_Security_Incident_Response_Runbook.md`.

## Rejection Or Narrowing

Reject or narrow requests when:

- They are informal and lack legal authority.
- They are overbroad or vague.
- They seek another user's data without adequate authority.
- They conflict with privacy, privilege, confidentiality, or legal hold obligations.
- They seek information Asset Safe does not have.
- They request secrets, internal credentials, or security details not required by law.

Keep a record of rejection/narrowing communications.

## Closeout

Do not close the legal request ticket until:

- The request and approval path are documented.
- Preservation/legal hold decisions are recorded.
- User notification decision is recorded.
- Production or rejection is complete.
- Export evidence is stored with hash/row counts where practical.
- Any legal hold review date is set.
- Any related incident/support/billing/continuity tickets are linked.

## Launch Gate

Before launch, confirm:

- A legal intake mailbox or owner path exists.
- The owner knows who reviews subpoenas and law-enforcement requests.
- Support knows not to disclose user data from informal requests.
- Audit export procedure is documented.
- Legal hold controls and manual fallback are documented.
- User notification policy requires counsel/operator review.
