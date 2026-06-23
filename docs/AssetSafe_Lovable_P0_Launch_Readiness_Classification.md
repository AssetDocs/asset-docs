# Asset Safe Lovable P0 Launch Readiness Classification

Status: Lovable first-pass classification
Date: 2026-06-23
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Packet_Index.md`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md`
- `docs/AssetSafe_Launch_Code_Workqueue.md`

## Summary

Lovable reviewed the launch readiness packet and made no code changes.

First-pass recommendation:

- No P0 row is currently recommended as `Code required`.
- Proceed with operator evidence collection.
- Keep `BILL-01` through `BILL-07`, `SEC-01`, and `MON-01` deferred or accepted as MVP unless evidence or operator preference changes.
- Final decisions still belong to the operator and should be recorded row-by-row in `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`.

## P0 Classifications

| # | Area | Gate | Lovable first-pass decision | Conditional work item |
|---:|---|---|---|---|
| 1 | Billing | Monitor/repair `stripe_events.outcome = 'error'` | Operator action required | `BILL-01` only if manual repair is rejected |
| 2 | Billing | Manual Stripe dispute handling | Accepted MVP | `BILL-02` only if manual handling is rejected |
| 3 | Billing | Manual Stripe refund handling | Accepted MVP | `BILL-03` only if manual refunds are rejected |
| 4 | Billing | Single app-side dunning reminder | Accepted MVP | `BILL-04` only if single reminder is rejected |
| 5 | Billing | Receipt strategy chosen | Operator action required | `BILL-05` if both receipts remain enabled with duplicate risk |
| 6 | Billing | Trial reminder posture chosen | Operator action required | `BILL-07` if trial reminders are promised before the path exists |
| 7 | Billing | Gift payment-failure behavior verified | Operator action required | `BILL-06` if verification fails |
| 8 | Billing | `check-payment-failures` and `expire-subscription-grace-periods-hourly` healthy | Operator action required | None by default |
| 9 | Data lifecycle | PITR enabled | Operator action required | None by default |
| 10 | Data lifecycle | PITR restore drill passed and signed off | Operator action required | None by default |
| 11 | Data lifecycle | Storage backup posture accepted | Operator action required | None by default |
| 12 | Data lifecycle | Bucket lifecycle policy accepted | Operator action required | None by default |
| 13 | Data lifecycle | Required data lifecycle cron health | Operator action required | None by default |
| 14 | Data lifecycle | Legal retention schedule reviewed | Operator action required | None by default |
| 15 | Continuity | Death/legal document retention decided | Operator action required | None by default |
| 16 | Continuity | Second-review rules for high-risk continuity cases | Operator action required | None by default |
| 17 | Continuity | 30-day continuity closure bypass authority | Operator action required | None by default |
| 18 | Continuity | Continuity tabletop completed or scheduled | Operator action required | None by default |
| 19 | Support | `support@assetsafe.net` owner and backup | Operator action required | None by default |
| 20 | Support | Support tiers, SLA, and escalation paths | Operator action required | None by default |
| 21 | Support | Account recovery is audited-review only | Accepted MVP | None by default |
| 22 | Support | No write-capable impersonation at launch | Accepted MVP | None by default |
| 23 | Monitoring | External alert routing chosen | Operator action required | `MON-01` only if dashboard-only monitoring is rejected |
| 24 | Monitoring | First real cron successes reviewed after scheduling | Operator action required | None by default |
| 25 | Security | Production secret manager chosen | Operator action required | None by default |
| 26 | Security | Pre-launch vulnerability scan has no untriaged High/Critical findings | Operator action required | None by default |
| 27 | Security | Incident contacts and escalation path | Operator action required | None by default |
| 28 | Security | Incident tabletop completed or scheduled | Operator action required | None by default |
| 29 | Legal/compliance | Terms and Privacy active version approved | Operator action required | None by default |
| 30 | Legal/compliance | DSAR intake path approved | Operator action required | None by default |
| 31 | Legal/compliance | DMCA intake path approved | Operator action required | None by default |
| 32 | Legal/compliance | Legal request intake path approved | Operator action required | None by default |
| 33 | Growth | MVP activation/churn metrics accepted | Accepted MVP | None by default |
| 34 | Workspace | Manual-review-only ownership transfer | Accepted MVP | None by default |
| 35 | Workspace | Authorized User over-limit downgrade posture | Accepted MVP | None by default |
| 36 | Mobile | App-store launch | Deferred | None by default |

Implicit confirmation:

- `SEC-01` dual-secret webhook rotation remains deferred under the default MVP posture.

## Evidence To Collect

Use `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md` for exact queries and screenshots.

### 01 Billing

- SQL: `stripe_events` errors.
- SQL: 7-day `event_type` / `outcome` summary.
- SQL: `checkout_fulfillments` in `manual_review` or `fulfilled_email_failed`.
- Stripe Dashboard screenshots: smart retry settings, hosted receipt settings, refund/dispute owner, trial settings.
- Written receipt-source decision.
- Gift verification: gift metadata present, admin gift view screenshot, and confirmation gift failures do not drive dunning.

### 02 Data Lifecycle

- Supabase PITR screenshot and recovery window.
- Latest `restore_drill_runs` row with all smoke checks true and sign-off.
- `storage.buckets` list and `get_storage_bucket_lifecycle_status()` result.
- Written storage backup/replication decision.
- `cron_job_health_status` for the named launch jobs.
- Counsel-approved retention schedule.

### 03 Continuity

- Signed decisions for document retention, second-review rules, and 30-day bypass authority.
- Continuity tabletop notes or scheduled date.

### 04 Support

- Named owner and backup for `support@assetsafe.net`.
- Tier/SLA/escalation matrix.
- Open `dev_support_issues` backlog.
- Cron health for `scrub-old-support-pii`.
- Confirmation that account recovery is audited-review only.
- Confirmation that no write-capable impersonation exists at launch.

### 05 Monitoring

- Written routing decision.
- `monitoring_alert_policies` query result.
- Admin Monitoring screenshot showing the Alert Routing Policy card populated.
- Cron health evidence.
- Resend webhook deliverability evidence after first events land in `email_deliverability_events`.

### 06 Security

- Secret manager decision and access owner.
- Vulnerability scan report.
- Dependency audit and secret scan results.
- Incident contact list.
- Incident tabletop notes or scheduled date.
- Written acceptance that single-active webhook secret is acceptable for MVP.

### 07 Legal / Compliance

- Counsel approvals for Terms, Privacy, DSAR, DMCA, legal request intake, retention schedule, and authorized-agent / denial / extension authority.
- Final public Terms/Privacy URLs and active version.

### 08 Growth / Workspace / Mobile

- Product/ops acceptance notes for activation/churn.
- Ownership transfer acceptance note.
- Authorized User over-limit downgrade acceptance note.
- Mobile app-store deferral note.

## Conditional Code Flips

Promote a row to `Code required` only if the evidence or operator decision requires it.

| Work item | Promote if |
|---|---|
| `BILL-06` gift payment-failure filter | Gift verification cannot be cleanly demonstrated |
| `BILL-05` receipt idempotency | Operator chooses both Stripe and Asset Safe receipts without disabling one side or accepting duplicate risk |
| `BILL-07` trial reminders | Marketing/legal copy promises trial reminders |
| `BILL-01` webhook replay | Operator rejects human daily `stripe_events` error review |
| `BILL-02` disputes | Operator rejects manual Stripe Dashboard dispute handling |
| `BILL-03` refunds | Operator rejects manual Stripe Dashboard refund handling |
| `BILL-04` dunning | Operator rejects single app reminder plus Stripe smart retries |
| `SEC-01` dual-secret webhooks | Operator rejects maintenance-window secret rotation |
| `MON-01` external alerts | Operator rejects dashboard/manual monitoring |

## Recommended Next Step

Proceed with evidence collection. Do not send any build prompt to Lovable until a sign-off checklist row is explicitly marked `Code required`.

