# Asset Safe Continuity Incident Tabletop Runbook

Status: quarter-one operating runbook
Owner: Asset Safe continuity reviewer / senior reviewer
Scope: tabletop drills for disputed death reports, competing executor requests, fraudulent documentation, and owner account recovery after a continuity freeze.

## Goals

1. Confirm reviewers can pause high-impact continuity actions before harm occurs.
2. Confirm owner-protection controls work: dispute intake, legal-dispute freeze, conflict detection, audit trail, and senior-review freeze removal.
3. Confirm evidence review is sufficient before export, preservation, memorialization, closure, or ownership transfer.
4. Confirm staff can explain the decision trail from admin UI, database records, and audit logs.

## Cadence

- Run one tabletop before broad continuity launch.
- Repeat quarterly during the first year.
- Repeat within 10 business days after a material continuity incident, disputed owner report, or meaningful workflow change.

## Participants

- Continuity reviewer.
- Senior reviewer.
- Support lead or operator.
- Engineering observer.
- Legal/counsel observer when available.

## Required Setup

- Use a staging account with at least one owner, one primary Legacy Admin, one secondary Legacy Admin, and one Authorized User.
- Prepare sample uploaded documents in `continuity-documents`; use fake documents only.
- Confirm the following admin surfaces are accessible:
  - Continuity Request Queue.
  - Owner & Risk tab.
  - Documents tab.
  - Evidence checklist.
  - Audit Log.
  - Continuity metrics cards.
- Confirm these controls are available:
  - `submit_continuity_dispute` or owner dispute page.
  - `apply_account_freeze`.
  - `resolve_continuity_request_conflict`.
  - `resolve_continuity_dispute`.
  - Separate senior-review `remove_account_freeze`.
  - `enforce_continuity_execution_guard`.

## Scenario 1: Disputed Death Report

Trigger: A Legacy Admin submits a memorialization, preservation, export, or closure request claiming the owner has died. The owner later disputes the claim.

Expected response:

1. Owner dispute is recorded on `account_continuity_requests`.
2. A `legal_dispute` freeze is active in `continuity_account_freezes`.
3. The case is blocked from export, closure, preservation, memorialization, and ownership transfer.
4. Reviewer records owner-contact notes and evidence review notes.
5. Reviewer resolves the dispute only with an outcome and internal resolution notes.
6. Freeze remains active after dispute resolution until a senior reviewer removes it separately with a reason.

Pass criteria:

- `owner_dispute_status` transitions from `disputed` to `resolved` only after notes are recorded.
- `freeze_status` remains active until separate senior-review removal.
- Audit log contains dispute submission, dispute resolution, and freeze removal events.

## Scenario 2: Competing Executor Requests

Trigger: Two different people submit continuity requests claiming executor or legal authority over the same account.

Expected response:

1. Conflict detection flags both active cases.
2. Admin queue shows competing continuity requests.
3. Execution remains blocked until reviewer records conflict resolution notes.
4. Reviewer requests additional legal authority evidence from both parties as needed.
5. Senior reviewer signs off before any high-impact action when the conflict involves export, ownership transfer, or closure.

Pass criteria:

- `has_active_conflict` is true while both requests remain unresolved.
- High-impact execution guard blocks action before conflict resolution.
- Conflict resolution notes identify the chosen path and rationale.

## Scenario 3: Fraudulent Documentation

Trigger: Reviewer suspects uploaded legal, death, identity, or executor documentation is forged, altered, or inconsistent.

Expected response:

1. Document verification status is changed to `suspicious` or `rejected`.
2. Retention review marks the document as `fraud_or_dispute` and applies legal hold when appropriate.
3. Case risk level is raised to `elevated` or `critical`.
4. Reviewer applies a continuity review or legal-dispute freeze if account harm is plausible.
5. Reviewer records rationale in internal notes and audit log.

Pass criteria:

- Document status and retention status are visible in the Documents tab.
- Suspicious document handling does not delete evidence.
- No high-impact action can execute while freeze/conflict/dispute controls remain active.

## Scenario 4: Owner Account Recovery After Freeze

Trigger: A legitimate owner regains access after a continuity freeze was applied due to dispute, suspicious activity, or conflicting authority.

Expected response:

1. Reviewer verifies owner identity and account-control signals.
2. Reviewer confirms there are no unresolved competing requests or legal disputes.
3. Reviewer records owner recovery notes.
4. Senior reviewer removes the freeze with a reason.
5. Reviewer confirms the account returns to normal owner-managed operation without granting continuity access.

Pass criteria:

- Freeze removal is separate from dispute resolution.
- Audit log explains the owner recovery decision.
- No temporary access, export authorization, ownership transfer, closure, or memorialization remains active unless separately approved.

## Evidence To Capture

- Case IDs and request types used in the drill.
- Screenshots or notes from Request Queue, Owner & Risk, Documents, and Audit Log.
- Which guardrail blocked execution, if tested.
- Any ambiguity in reviewer wording, labels, or status transitions.
- Follow-up owner, engineer, and due date.

## After-Action Review

Within 2 business days, record:

- What passed.
- What failed.
- Any missing admin affordance.
- Any legal/policy question requiring owner or counsel.
- Any migration, edge function, UI, or runbook change needed.

Do not mark the tabletop complete until every P0 follow-up has an owner and due date.
