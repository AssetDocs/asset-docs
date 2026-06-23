# Asset Safe DMCA / Content Takedown Runbook

Status: launch compliance operations runbook
Owner: Asset Safe operator / Legal
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Legal_Request_Runbook.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_Retention_Operations.md`

## Purpose

This runbook defines how Asset Safe handles copyright complaints, DMCA-style takedown notices, counter-notices, and other complaints about user-uploaded content.

Asset Safe is primarily a private documentation platform. Most uploaded content is private account content, not public publishing. Even so, complaints may arrive if a user uploads copyrighted photos, contractor documents, scans, receipts, reports, or other materials claimed by a third party.

This is an operational checklist, not legal advice. Counsel or the business owner must approve takedown, restoration, repeat-infringer, and user-notification decisions.

## Intake

Create a takedown ticket immediately. Record:

- Date/time received.
- Complainant name, organization, contact, and claimed authority.
- Claimed copyrighted work or other complained-of content.
- Asset Safe account/user identifiers, if provided.
- URLs, object paths, filenames, screenshots, hashes, or other locating details.
- Requested action.
- Whether the complaint includes a sworn statement, signature, or legal demand.
- Whether any deadline is asserted.
- Initial reviewer and counsel/operator owner.

Store the original notice in a restricted evidence location. Do not paste sensitive documents or object paths into public issue trackers.

## Validate Scope

Before taking action:

1. Confirm the complaint identifies content hosted or stored by Asset Safe.
2. Confirm the content can be located without browsing unrelated user records.
3. Confirm whether the content is private user data, shared content, public marketing content, or system-owned content.
4. Confirm whether the complaint is copyright/IP, privacy, law enforcement, abuse, or general support.
5. Escalate to `docs/AssetSafe_Legal_Request_Runbook.md` if the complaint is tied to subpoena, court order, law enforcement, or civil discovery.

If the complaint lacks enough detail to locate content, request clarification and do not browse broadly through user files.

## Preservation Before Action

Before removing, quarantining, or restoring content, preserve minimum evidence:

- Notice received.
- Object path or record ID.
- Account/user ID.
- Filename and metadata.
- Hash of the object where practical.
- Current access state.
- Reviewer and decision timestamp.

Do not preserve more content than needed. If the content may involve litigation, legal hold, or law enforcement, coordinate with counsel before deletion.

## Action Options

| Action | When to use | Notes |
|---|---|---|
| No action / request clarification | Notice is vague, unauthenticated, or unrelated | Keep ticket open until deadline/reviewer decision |
| Notify user only | Low-confidence complaint or user action needed | Avoid disclosing complainant private details unless approved |
| Quarantine | Content should be temporarily inaccessible while preserving evidence | Preferred when legal review is pending |
| Remove/delete | Valid takedown and no preservation need blocks deletion | Record object IDs and deletion evidence |
| Restore | Valid counter-notice or complaint withdrawn | Record approval and restoration timestamp |
| Account action | Repeat or abusive infringing uploads | Owner/counsel decision required |

Quarantine means the content is removed from normal user access or moved/flagged for restricted review while the evidence needed to resolve the complaint is preserved.

## User Notice

Default posture: notify the affected account owner when content is quarantined or removed, unless counsel/operator determines notice should be delayed or withheld.

Notice should include:

- That a complaint was received.
- The affected file/content at a high level.
- The action taken.
- How the user can respond.
- Any deadline.

Do not include legal conclusions or unnecessary complainant personal data.

## Counter-Notice / Dispute

If the user disputes the takedown:

1. Record the counter-notice/dispute in the takedown ticket.
2. Confirm identity and account authority.
3. Preserve the removed/quarantined content until counsel/operator decision.
4. Notify the complainant only through an approved channel.
5. Restore content only after counsel/operator approval.
6. Record all timestamps and communications.

If the dispute becomes litigation, legal hold, law enforcement, or civil discovery, follow `docs/AssetSafe_Legal_Request_Runbook.md`.

## Repeat Complaints

Track repeat complaints at the account level.

Escalate to owner/counsel when:

- Multiple valid complaints involve the same account.
- The user reuploads removed content.
- The complaint involves fraud, harassment, doxxing, identity documents, child safety, threats, or other non-copyright safety concerns.
- The complaint may expose private records of another person.

Repeat-infringer suspension or termination is a business/legal decision and should not be automated at launch.

## Closeout

Do not close the takedown ticket until:

- Intake details are recorded.
- Content scope and evidence are documented.
- Action decision and approver are recorded.
- User notice decision is recorded.
- Counter-notice/dispute window is resolved or explicitly not applicable.
- Any legal hold, law enforcement, or incident linkage is recorded.
- Any storage deletion/quarantine follow-up is complete.

## Launch Gate

Before launch, confirm:

- A takedown/abuse intake path exists.
- Support knows to route content complaints to owner/legal review.
- Operators know not to browse unrelated private files.
- Quarantine/delete decisions preserve evidence first.
- User notice and counter-notice decisions require owner/counsel review.
