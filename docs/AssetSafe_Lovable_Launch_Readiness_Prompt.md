# Asset Safe Lovable Launch Readiness Prompt

Status: copy-paste coordination prompt
Date: 2026-06-23
Owner: Asset Safe operator / project owner

## Prompt

Lovable, please review the launch readiness packet now in the repo.

Start here:

- `docs/AssetSafe_Launch_Packet_Index.md`
- `docs/AssetSafe_Launch_Handoff.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md`
- `docs/AssetSafe_Launch_Code_Workqueue.md`

Important instruction:

Do not implement every item in `AssetSafe_Launch_Code_Workqueue.md`.

First, help classify the P0 rows in `AssetSafe_Launch_Operator_Signoff_Checklist.md` as one of:

- `Accepted MVP`
- `Operator action required`
- `Code required`
- `Deferred`

Use `AssetSafe_Launch_Evidence_Collection_Runbook.md` to identify what evidence I need to collect for each `Operator action required` row.

Only after I explicitly mark a row as `Code required`, use the matching item in `AssetSafe_Launch_Code_Workqueue.md` as the implementation prompt.

Default MVP posture unless I override it:

- Manual Stripe Dashboard handling is acceptable for disputes and refunds.
- One app-side dunning reminder plus Stripe smart retries is acceptable.
- External alerting can remain dashboard/manual unless I decide otherwise.
- Dual-secret webhook support is deferred unless I decide maintenance-window rotation is unacceptable.
- Mobile app-store launch is deferred unless I explicitly add it to launch scope.
- Do not build referral/affiliate, app-store pipeline, cross-region storage replication, or other P2 items unless I explicitly mark them `Code required`.

Please return:

1. A first-pass classification of every P0 row.
2. A list of evidence I need to collect next.
3. A separate list of any rows you believe should be `Code required`, with reasoning.
4. No code changes unless I approve specific `Code required` rows.

