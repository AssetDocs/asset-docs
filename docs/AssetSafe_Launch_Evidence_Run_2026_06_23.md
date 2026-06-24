# Asset Safe Launch Evidence Run - 2026-06-23

Status: first evidence pass
Owner: Asset Safe operator / project owner
Companion docs:
- `docs/AssetSafe_Launch_Evidence_SQL.sql`
- `docs/AssetSafe_Launch_Operator_Signoff_Checklist.md`
- `docs/AssetSafe_Lovable_P0_Launch_Readiness_Classification.md`

## Summary

The first database evidence pass found no immediate billing webhook error blocker, but it did reveal several schema/query mismatches and pending operator evidence items.

No P0 item is promoted to `Code required` from this pass alone.

## Results

| Evidence item | Result | Classification |
|---|---|---|
| `stripe_events.outcome = 'error'` | Query succeeded; no error rows reported | Evidence accepted for current pass |
| 7-day Stripe event summary | Query succeeded; `customer.subscription.deleted` with `success` reported | Evidence accepted for current pass |
| Billing manual checkout review | Query succeeded; no blocking row details reported | Evidence accepted for current pass |
| Restore drill query | Failed because live DB lacks `signoff_status` | Operator action required |
| Storage bucket list | Query succeeded; bucket `public = false` reported | Evidence accepted for current pass, confirm bucket IDs/screenshots |
| Storage lifecycle status | Query failed because result column is `bucket`, not `bucket_id` | Query bundle corrected |
| Cron health | Query succeeded but returned NULL values for all requested fields | Operator action required |
| Support backlog query | Failed because live DB lacks `support_tier` | Operator action required / migration drift check |
| Monitoring alert policies | Supabase fetch failed | Re-run required |
| Email deliverability events | Query failed because table uses `recipient_email_hash` / `recipient_domain`, not `recipient_email` | Query bundle corrected |
| User consents | Query failed because table uses `user_email` / `created_at`, not `user_id` / `consented_at` | Query bundle corrected |

## Action Items

### Re-run Corrected Queries

Use the updated `docs/AssetSafe_Launch_Evidence_SQL.sql` for:

- Restore drill evidence.
- Storage lifecycle status.
- Support backlog.
- Email deliverability events.
- User consent evidence.

### Operator Evidence Still Needed

- PITR enabled screenshot and recovery window.
- Restore drill row with smoke checks and operator sign-off evidence.
- Cron health rows with real successful runs, not all NULL values.
- Monitoring alert policies query or Admin Monitoring screenshot.
- Stripe Dashboard settings screenshots.
- Gift payment-failure verification.
- Support owner/backup and escalation matrix.
- Legal/privacy/counsel approvals.
- Security scan and incident contact/tabletop evidence.

### Migration Drift To Confirm

Live DB appears to lack at least:

- `restore_drill_runs.signoff_status` / `signed_off_at`.
- `dev_support_issues.support_tier` / SLA columns.

These may be acceptable if the operator records equivalent evidence manually, but if the UI depends on these columns then the missing migrations should be investigated before launch.

## Current Code-Required Status

No workqueue item is currently promoted to `Code required`.

Conditional items remain:

- `BILL-06` if gift payment-failure behavior cannot be verified.
- `BILL-05` if duplicate receipt risk is not accepted.
- `BILL-07` if trial reminder promises remain in user-facing copy.
- `BILL-01` if manual webhook error review is rejected.

