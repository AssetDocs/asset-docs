# Asset Safe Launch Handoff

Status: launch handoff note
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Packet_Index.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md`
- `docs/AssetSafe_Launch_Code_Workqueue.md`
- `docs/AssetSafe_Lovable_Launch_Readiness_Prompt.md`
- `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md`
- `docs/AssetSafe_Operational_Readiness_Sweep.md`

## Purpose

This is the routing note for the launch readiness packet. It explains what the operator should do, what Lovable should build only if requested, and what remains deferred.

## Launch Packet

| Doc | Audience | Use |
|---|---|---|
| `docs/AssetSafe_Launch_Packet_Index.md` | Operator / developer | One-page launch packet map |
| `docs/AssetSafe_Operational_Readiness_Sweep.md` | Operator / developer | Current readiness by operational area |
| `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` | Operator | Final P0/P1/P2 decision sheet |
| `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` | Operator | Exact queries, screenshots, approvals, and tickets to collect |
| `docs/AssetSafe_Launch_Code_Workqueue.md` | Lovable / developer | Conditional implementation prompts for rows marked `Code required` |
| `docs/AssetSafe_Lovable_Launch_Readiness_Prompt.md` | Operator / Lovable | Copy-paste prompt for classification before implementation |
| `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md` | Operator / Lovable | Lovable's current first-pass P0 classification |

## Operator Instructions

1. Open `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.
2. For every P0 row, assign:
   - owner,
   - decision,
   - evidence link,
   - date.
3. Use `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` to gather evidence.
4. If a row is accepted as MVP, record the accepted risk.
5. If a row is deferred, record why it is out of current launch scope.
6. If a row is marked `Code required`, copy the matching item from `docs/AssetSafe_Launch_Code_Workqueue.md` to Lovable.
7. Do not mark launch ready while any P0 row lacks owner, decision, evidence, or date.

## Lovable / Developer Instructions

Do not build every workqueue item automatically.

Build only items that the operator marks `Code required` in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.

For each selected work item:

1. Use the matching section in `docs/AssetSafe_Launch_Code_Workqueue.md`.
2. Preserve existing authorization and audit boundaries.
3. Add migrations, edge functions, admin surfaces, and tests only where the selected work item requires them.
4. Update the sign-off checklist with:
   - commit SHA,
   - migration name,
   - deployment evidence,
   - smoke test result,
   - remaining risk.

## Default MVP Posture

Unless the operator changes the decision, the current default posture is:

| Area | Default |
|---|---|
| Stripe disputes | Manual Stripe Dashboard handling |
| Refunds | Manual Stripe Dashboard handling |
| Dunning escalation | One app reminder plus Stripe smart retries |
| Trial reminders | Do not market trials until reminder path is restored or removed |
| Receipts | Operator chooses Stripe, Asset Safe, or both intentionally |
| Gift payment failures | Verify behavior; build explicit filter only if not verified |
| Webhook replay | Manual daily repair accepted unless operator requires admin replay tooling |
| External alerting | Admin dashboard/manual monitoring accepted unless operator requires push routing |
| Dual-secret webhooks | Deferred unless maintenance-window rotation is not accepted |
| Mobile app store | Deferred unless operator chooses app-store launch scope |

## Do Not Build Yet

Do not start these unless the operator explicitly marks them `Code required` or adds them to launch scope:

- Admin refund flow.
- Stripe dispute webhook automation.
- Escalated dunning campaign.
- Trial reminder rebuild.
- Dual-secret webhook verification.
- External Slack/pager alert dispatcher.
- Mobile app-store release pipeline.
- Referral/affiliate program.
- Secondary/cross-region object storage replication.

## Immediate Next Action

The operator should fill the first pass of `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md` using the evidence runbook.

The first decision checkpoint is whether any P0 row becomes `Code required`. If none do, launch readiness becomes an operator/legal/provider evidence exercise rather than an engineering sprint.
