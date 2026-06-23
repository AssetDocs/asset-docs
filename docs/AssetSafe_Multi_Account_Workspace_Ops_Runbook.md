# Asset Safe Multi-Account / Workspace Ops Runbook

Status: launch operations runbook
Owner: Product / Platform / Support
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Continuity_Legacy_Operations.md`
- `docs/AssetSafe_Billing_Revenue_Operations.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Privacy_Request_DSAR_Runbook.md`

## Purpose

This runbook defines operational handling for multi-account and workspace edge cases: owner workspace transfer outside the Legacy Admin continuity path, Authorized User seat/limit reconciliation after plan changes, and account-owner visibility across workspace activity.

The product principle is simple: account ownership, billing ownership, Authorized User access, and continuity authority are separate controls. Do not merge them during support review unless a documented workflow explicitly authorizes it.

## Workspace Model

| Concept | Operational meaning |
|---|---|
| Account owner | The user who owns the account/workspace and billing relationship |
| Authorized User | A member with role-scoped access to the owner account |
| Full Access AU | Can contribute to shared account data, but cannot manage billing or ownership |
| Read Only AU | Can view shared data only |
| Legacy Admin | Continuity role that can submit continuity requests, not ordinary ownership authority |
| Dev workspace/admin | Internal operator access; must be audited and restricted |

Authorized Users inherit access from the owner's account. They do not own the subscription, billing, legal consents, or deletion rights unless a separate approved process grants that authority.

## Ownership Transfer Outside Continuity

Use this section for business sale, divorce/property transfer, estate planning while owner is alive, owner-requested transfer, or entity/account restructuring. Do not use it for death/incapacity continuity cases; those follow `docs/AssetSafe_Continuity_Legacy_Operations.md`.

Default posture:

- No self-serve ownership transfer at launch unless a dedicated workflow exists.
- Support should collect the request and escalate to owner/legal/platform review.
- Existing Authorized User access does not prove transfer authority.
- Billing/customer ownership must be reconciled with Stripe before transfer is considered complete.

Minimum review checklist:

1. Verify the current account owner's identity.
2. Verify the proposed new owner's identity and email/account control.
3. Confirm both parties consent, unless legal/court documentation says otherwise.
4. Confirm there is no active continuity dispute, legal hold, deletion request, billing dispute, chargeback, or security incident.
5. Confirm ownership transfer scope: one account/workspace, all properties, billing, Authorized Users, Legacy Admin settings, Recovery Delegates, exports, and storage.
6. Confirm Stripe customer/subscription handling: transfer, cancel/recreate, or leave with original owner until end of term.
7. Capture a pre-transfer export or snapshot when appropriate.
8. Record reviewer, approver, rationale, and final action in audit notes.

If any legal authority is disputed or one party cannot consent, route through `docs/AssetSafe_Legal_Request_Runbook.md` or continuity review as appropriate.

## Seat / Authorized User Reconciliation

At launch, Asset Safe's main plan appears to include Authorized Users broadly, but future plan changes or downgrades may introduce limits. Use this policy if a plan limit is introduced or an account exceeds the allowed AU count after downgrade/cancellation.

Default posture:

- Do not silently delete Authorized Users.
- Do not revoke access without notice unless required for security, legal hold, abuse, or nonpayment lock.
- Prefer read-only preservation over destructive removal when the account is over limit.

Recommended reconciliation states:

| State | Meaning | User impact |
|---|---|---|
| `within_limit` | Active AU count is within plan | No action |
| `over_limit_notice` | Account exceeds current plan limit | Owner notified; no immediate removal |
| `owner_action_required` | Grace window elapsed or downgrade effective | Owner must remove users or upgrade |
| `restricted_invites` | No new AU invites allowed | Existing users remain as-is or read-only |
| `read_only_excess` | Excess AU access downgraded to read-only by policy | No destructive data changes |
| `revoked_excess` | Excess AU access revoked after notice/review | Audit required |

Suggested grace:

- 14 days after downgrade or plan-limit change before restricting existing AU access.
- Immediate block on new invites while over limit.
- Security/legal incidents can bypass grace with owner/operator approval.

Manual review steps:

1. Count active accepted Authorized Users by account.
2. Compare to current plan entitlement.
3. Notify owner of over-limit state and options.
4. Block new invites while over limit.
5. After grace, downgrade excess users to read-only or request owner selection before revocation.
6. Record all changes in `audit_logs` or `user_activity_logs`.

## Cross-Workspace Audit Visibility

Account owners should be able to understand activity on accounts they own, including Authorized User activity. They should not see unrelated private activity from another user's own account.

Default visibility:

- Owner can view activity scoped to their account/workspace.
- Authorized User can view their own relevant activity and shared account activity only where product role allows it.
- Dev/admin cross-workspace review requires an operational reason and follows `docs/AssetSafe_Audit_Log_Retention_Runbook.md`.

Owner-visible activity should include:

- AU invite accepted/revoked.
- AU dashboard access.
- Upload, edit, delete, export, or vault access events within the owner's account.
- Role changes.
- Security-sensitive access events.

Owner-visible activity should not include:

- Another user's unrelated personal account activity.
- Internal admin notes.
- Legal/counsel privileged notes.
- Raw provider logs or secrets.
- Support free-text unless explicitly approved.

## Support Escalation Matrix

| Case | Route |
|---|---|
| Owner asks to transfer account to another living person | Product/Legal/Platform review |
| Legacy Admin requests transfer after death/incapacity | Continuity review |
| Authorized User asks to become owner | Verify owner consent; otherwise deny/escalate |
| Business sale or divorce/court order | Legal request review |
| Over-limit AU after downgrade | Billing/Product support review |
| Owner disputes AU activity | Security/support review; apply freeze if needed |
| Cross-account data exposure suspected | Security incident response |

## Launch Gate

Before launch, confirm:

- Support understands Authorized Users do not own billing or account ownership.
- Ownership transfer outside continuity is manual-review only.
- Billing downgrade/AU over-limit behavior is documented before any plan limit is enforced.
- Owner activity visibility is account-scoped.
- Admin cross-workspace audit review requires an approved reason.
- Continuity ownership transfer remains separate from ordinary owner-requested transfer.
