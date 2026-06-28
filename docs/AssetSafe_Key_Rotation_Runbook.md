# Asset Safe Key Rotation Runbook

Status: launch security operations runbook
Owner: Asset Safe operator / Platform & Ops
Production project: `leotcbfpqiekgkgumecn`

## Purpose

This runbook defines how Asset Safe rotates production secrets, who owns each rotation, when rotations are required, and what evidence must be retained.

Secrets must never be committed to git, pasted into migrations, or shared in chat transcripts. Store production values only in the provider dashboards, Supabase Edge Function secrets, and approved password/secret management systems.

## Rotation Inventory

| Secret | Primary owner | Default cadence | Rotate immediately when | Rotation impact |
|---|---|---:|---|---|
| `STRIPE_SECRET_KEY` | Billing / Ops | 180 days | Stripe dashboard access change, suspected billing compromise, leaked logs, staff/offboarding event | All Stripe-calling edge functions fail until Supabase secret is updated |
| `STRIPE_WEBHOOK_SECRET` | Billing / Ops | 180 days | Webhook endpoint changed, Stripe webhook signing error spike, suspected endpoint compromise | `stripe-webhook` rejects Stripe events until the active secret matches |
| AssetSafe internal cron secret (`sb_secret_...`) | Platform / Ops | 180 days | Any cron secret exposure, contractor/offboarding event, accidental paste, repo/chat/screenshot leak | Internal cron jobs using `x-internal-secret` return 401 until Edge Function Secrets and cron schedules are updated |
| `RESEND_API_KEY` | Platform / Ops | 180 days | Resend account access change, bounce/complaint investigation requiring credential hygiene, suspected email abuse | Outbound email functions fail until Supabase secret is updated |
| `RESEND_WEBHOOK_SECRET` | Platform / Ops | 180 days | Webhook endpoint changed, signature verification failures, suspected webhook replay/forgery | `resend-webhook` rejects events until the active secret matches |
| Supabase anon key | Platform / Ops | Annual or incident-driven | Public client key changed by Supabase, project migration, misuse requiring project credential rotation | Frontend config and any anon-authenticated cron/webhook paths must be refreshed |

## Standard Rotation Window

Schedule routine rotations during a low-traffic maintenance window.

1. Open a security operations ticket with the secret name, owner, target environment, and planned window.
2. Confirm the current Admin Monitoring tab is healthy for cron, Stripe webhook, email deliverability, and edge function health.
3. Generate the new secret in the provider dashboard.
4. Update the matching Supabase Edge Function secret.
5. Redeploy or restart affected edge functions if the platform does not pick up secret changes immediately.
6. Run the validation checks for the specific secret below.
7. Record evidence in the ticket: timestamp, operator, affected environment, validation result, and any follow-up work.
8. Destroy or disable the old secret after validation, unless the provider supports a short dual-secret overlap and the old key is explicitly scheduled for removal.

## Emergency Rotation

Use this path for any suspected exposure.

For incidents involving possible user data, account access, billing records, storage objects, or email integrity, run this together with `docs/AssetSafe_Security_Incident_Response_Runbook.md`.

1. Treat the old value as compromised.
2. Generate and install the replacement immediately.
3. Disable the old credential as soon as the new path is validated.
4. Review provider audit logs for unauthorized usage.
5. Review Supabase Edge Function logs and Admin Monitoring health for failures or suspicious spikes.
6. Open an incident record if user data, payment data, account access, or email integrity may have been affected.
7. Preserve evidence before deleting logs or rotating additional related credentials.

## Stripe Secret Key

Affected functions include checkout, billing portal, plan changes, storage add-ons, payment history, gift checkout, subscription sync, admin Stripe tooling, and account deletion billing cleanup.

Rotation steps:

1. In Stripe Dashboard, create or reveal the replacement restricted/live secret key according to the current Stripe account policy.
2. In Supabase production, update Edge Function secret `STRIPE_SECRET_KEY`.
3. Validate:
   - Create a test checkout session in the application or Stripe test environment.
   - Open the billing portal for a known internal test account.
   - Run a payment-history lookup for a known Stripe customer.
   - Confirm no new Stripe-related edge function failures appear in Admin Monitoring.
4. Revoke the old Stripe key.

Evidence:

- Stripe key creation/revocation timestamps.
- Supabase secret update timestamp.
- Successful checkout or billing portal validation.

## Stripe Webhook Signing Secret

The current `stripe-webhook` function reads one `STRIPE_WEBHOOK_SECRET`. Because the code does not accept multiple webhook secrets at once, keep the cutover tight.

Preferred rotation steps:

1. In Stripe Dashboard, create a new webhook endpoint or rotate the signing secret for the existing endpoint.
2. Immediately update Supabase Edge Function secret `STRIPE_WEBHOOK_SECRET`.
3. Send a Stripe test event to the production webhook endpoint:
   `https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/stripe-webhook`
4. Confirm the event reaches `stripe_events` and is processed or safely idempotent.
5. Confirm the Stripe webhook health monitor remains `ok`.
6. Remove or disable any old endpoint/secret path.

Validation query:

```sql
select stripe_event_id, event_type, status, processed_at, error_id
from public.stripe_events
order by created_at desc
limit 10;
```

Known risk:

- Stripe may retry events signed with the old secret during the cutover. If a retry storm occurs, temporarily pause non-critical billing changes, confirm the new secret is active, then use Stripe's retry controls after validation.

## Supabase Secret API Keys And Internal Cron Secret

Asset Safe no longer uses the legacy service-role key as the primary `x-internal-secret` value for lifecycle cron. Internal cron calls use a fresh Supabase secret API key value (`sb_secret_...`) stored in Edge Function Secrets.

Supported Edge Function secret names:

- `assetsafe_secret_keys`
- `ASSETSAFE_SECRET_KEYS`
- `SUPABASE_SECRET_KEYS` as a platform fallback
- `SUPABASE_SERVICE_ROLE_KEY` as a legacy transition fallback only

The cron jobs embed the internal secret in `pg_cron` job definitions at scheduling time. After rotating the internal cron secret, every cron job that sends `x-internal-secret` must be unscheduled and recreated with the new value.

Rotation steps:

1. Create a fresh `sb_secret_...` value in Supabase.
2. Update Supabase Edge Function secret `assetsafe_secret_keys` or `ASSETSAFE_SECRET_KEYS` with the fresh value.
3. Redeploy affected Edge Functions if the internal auth helper changed.
4. Unschedule all internal cron schedules that pass `x-internal-secret`.
5. Recreate those schedules with the fresh value in the `x-internal-secret` header.
6. Smoke test each critical internal function from Supabase SQL Editor and confirm each returned request ID resolves to HTTP `200` in `net._http_response`.
7. Confirm `cron_job_health_status` returns to `ok` after the next scheduled run window.

Use static JSON headers in `net.http_post` schedule definitions:

```sql
headers := '{"Content-Type":"application/json","x-internal-secret":"<INTERNAL_CRON_SECRET>"}'::jsonb
```

Do not select or screenshot `cron.job.command`; it contains the embedded secret value. Verify schedules with `jobid`, `jobname`, `schedule`, and `active` only.

Critical cron runbooks:

- `docs/AssetSafe_Storage_Deletion_Cron_Runbook.md`
- `docs/AssetSafe_Expired_Export_Cron_Runbook.md`
- `docs/AssetSafe_Restore_Drill_Reminder_Cron_Runbook.md`

Verification query:

```sql
select
  job_name,
  health_status,
  last_status,
  consecutive_failures,
  last_succeeded_at,
  last_error
from public.cron_job_health_status
order by job_name;
```

Do not mark the rotation complete while any launch-critical cron is `failed` or still producing new 401 responses. A `page` row with `last_status='succeeded'`, `consecutive_failures=0`, and no `last_error` is usually a stale-window condition; re-check after that job's next scheduled run before treating it as a function failure.

## Resend API Key

Affected functions include auth email, gift emails, billing notices, continuity notifications, support/account-assistance emails, and security alerts.

Rotation steps:

1. In Resend, create a new API key with the minimum required sending scope.
2. Update Supabase Edge Function secret `RESEND_API_KEY`.
3. Send a test email through the app's existing test/support email path.
4. Confirm the message arrives.
5. Confirm email deliverability monitoring does not show new provider errors.
6. Revoke the old Resend API key.

Evidence:

- Resend key creation/revocation timestamps.
- Successful test message ID.
- Admin Monitoring email deliverability screenshot or query result.

## Resend Webhook Secret

The `resend-webhook` function verifies Svix signatures when `RESEND_WEBHOOK_SECRET` is configured.

Rotation steps:

1. In Resend, create or rotate the webhook signing secret for:
   `https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/resend-webhook`
2. Update Supabase Edge Function secret `RESEND_WEBHOOK_SECRET`.
3. Send a Resend webhook test event.
4. Confirm a row lands in `email_deliverability_events`.
5. Confirm Admin Monitoring email deliverability status remains healthy.
6. Remove the old webhook secret or endpoint if a parallel endpoint was used.

Validation query:

```sql
select event_type, recipient_email, provider_message_id, occurred_at
from public.email_deliverability_events
order by occurred_at desc
limit 10;
```

## Supabase Anon Key

The anon key is public by design, but changing it can break the frontend and any legacy cron paths still using anon Authorization.

Rotation steps:

1. Identify all references in hosted app environment variables, Lovable/project config, and any cron jobs still using anon Authorization.
2. Update the frontend deployment environment.
3. Rebuild/redeploy the app.
4. Confirm login, dashboard load, and one authenticated read path.
5. Replace any legacy cron Authorization headers with the new anon key or migrate the job to `x-internal-secret`.

## Post-Rotation Checklist

| Check | Required result |
|---|---|
| Admin Monitoring: cron health | No launch-critical `page`, `failed`, or stale jobs |
| Admin Monitoring: Stripe webhook health | No pending webhook backlog or new error spike |
| Admin Monitoring: email deliverability | No new provider/auth error spike |
| Admin Monitoring: edge function health | No new function failure cluster |
| Provider audit logs | No unexplained usage after old secret revocation |
| Operations ticket | Evidence attached and next rotation date recorded |

## Rotation Calendar

Maintain the next due date outside the codebase in the operations calendar or ticketing system.

| Secret group | Routine cadence | Suggested recurring month |
|---|---:|---|
| Stripe API + webhook secrets | 180 days | January / July |
| Supabase secret API/internal cron secret | 180 days | February / August |
| Resend API + webhook secrets | 180 days | March / September |
| Supabase anon key review | Annual | October |

## Open Decisions

- Choose the approved secret manager for production operators.
- Decide whether to add dual-secret support for `stripe-webhook` and `resend-webhook` to reduce cutover risk.
- Decide whether routine service-role rotation should be done in a maintenance window with user-facing maintenance mode enabled.
