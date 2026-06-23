# Asset Safe Security Incident Response Runbook

Status: launch security operations runbook
Owner: Security Lead / Asset Safe operator
Production project: `leotcbfpqiekgkgumecn`
Companion docs:
- `docs/AssetSafe_Key_Rotation_Runbook.md`
- `docs/AssetSafe_Backup_Restore_Runbook.md`
- `docs/AssetSafe_Data_Lifecycle_External_Controls_Runbook.md`
- `docs/AssetSafe_Continuity_Incident_Tabletop_Runbook.md`
- `docs/AssetSafe_Vulnerability_Scan_Runbook.md`
- `docs/AssetSafe_Audit_Log_Retention_Runbook.md`
- `docs/AssetSafe_Legal_Request_Runbook.md`

## Purpose

This runbook defines the first-response process for suspected security incidents, including data exposure, credential compromise, unauthorized account access, payment/webhook compromise, email abuse, storage leakage, or suspicious admin activity.

This is an operational runbook, not legal advice. The Security Lead must involve counsel for breach-notification deadlines, state-specific requirements, law enforcement requests, regulator notices, and customer notification language.

## Severity Levels

| Severity | Example | Response target | Owner |
|---|---|---:|---|
| Sev 1 | Confirmed user data exposure, service-role leak, active attacker, public storage exposure | Immediate, within 15 minutes | Security Lead |
| Sev 2 | Suspected credential compromise, unauthorized admin access, webhook forgery, high-volume account abuse | Within 1 hour | Security Lead / Platform |
| Sev 3 | Isolated suspicious login, failed exploit attempt, single provider alert without user impact | Same business day | Platform / Support |
| Sev 4 | False positive, routine scanner finding, low-risk hygiene issue | Next planning cycle | Platform |

Escalate one level higher when the incident may involve uploaded files, payment records, legal/consent records, account recovery, continuity actions, or deleted-account tombstone data.

## Intake And Triage

Create an incident ticket immediately. Record:

- Reporter and detection source.
- Time detected and estimated time started.
- Affected environment.
- Suspected data classes.
- Affected user/account IDs, if known.
- Current user-facing impact.
- Whether maintenance mode is active.
- Whether credentials were rotated.
- Current severity and incident commander.

Common detection sources:

- Admin Monitoring: cron, Stripe webhook, email deliverability, edge function health.
- Vulnerability scans and manual security tests from `docs/AssetSafe_Vulnerability_Scan_Runbook.md`.
- Audit review findings from `docs/AssetSafe_Audit_Log_Retention_Runbook.md`.
- Supabase Edge Function logs.
- Supabase Auth and database logs.
- Stripe webhook failures, disputes, or suspicious billing activity.
- Resend bounce/complaint spikes or webhook verification failures.
- User/support reports.
- GitHub secret scanning or accidental disclosure.

## First 15 Minutes

1. Assign one incident commander.
2. Preserve evidence before changing systems: screenshots, log links, event IDs, timestamps, affected accounts, provider audit logs.
3. Decide whether to activate maintenance mode.
4. Stop active harm:
   - Disable or rotate exposed credentials.
   - Pause affected cron jobs if they are causing damage.
   - Disable compromised webhook endpoints.
   - Temporarily restrict admin/support access if needed.
   - Revoke suspicious sessions or accounts where practical.
5. Record every containment action in the incident ticket.

Maintenance mode:

Use maintenance mode when write activity could deepen harm or contaminate evidence. Typical triggers include suspected write-path compromise, storage leakage, destructive account actions, or restore preparation.

```sql
select public.activate_maintenance_mode(
  'Security incident response in progress. Records remain available where possible, but changes may be temporarily paused.',
  'security_incident',
  now() + interval '2 hours',
  jsonb_build_object('incident_id', '<incident-ticket-id>')
);
```

## Containment Playbooks

### Credential Exposure

1. Follow `docs/AssetSafe_Key_Rotation_Runbook.md`.
2. Rotate the exposed secret first, then adjacent secrets if blast radius is unclear.
3. Review provider audit logs for use of the old credential.
4. Recreate any cron jobs that embed `x-internal-secret`.
5. Confirm Admin Monitoring returns to healthy.

### Storage Or File Exposure

1. Confirm the affected bucket, path prefix, object IDs, and whether the bucket is public.
2. Disable public access immediately if unexpected.
3. Preserve object metadata and access logs where available.
4. Quarantine affected paths if supported.
5. Run storage orphan/deletion checks only after evidence is preserved.
6. Involve counsel if user-uploaded files may have been accessed by an unauthorized party.

### Unauthorized Account Or Admin Access

1. Identify the actor user ID, account ID, IP, device/session details, and affected actions.
2. Revoke sessions or disable the compromised user/admin account where possible.
3. Review `audit_logs`, `user_activity_logs`, account recovery support issues, and continuity/admin action logs.
4. Apply account freeze or maintenance mode if ownership, continuity, deletion, export, or billing actions may be unsafe.
5. Require MFA reset or account recovery review before restoring access.

### Stripe Or Billing Incident

1. Pause risky billing/admin actions if active abuse is suspected.
2. Check `stripe_events`, payment events, checkout fulfillments, and Stripe Dashboard.
3. Rotate Stripe secrets if webhook signing or API access is suspect.
4. Preserve disputed/refunded charge records.
5. Coordinate refund, chargeback, and customer communications through Billing / Ops.

### Email Abuse Or Deliverability Incident

1. Check `email_deliverability_events` and Resend dashboard.
2. Rotate `RESEND_API_KEY` or `RESEND_WEBHOOK_SECRET` if compromise is plausible.
3. Pause affected send paths if abusive or incorrect emails are being sent.
4. Preserve provider message IDs, recipient domains, and templates involved.
5. Review bounce/complaint thresholds in Admin Monitoring.

## Evidence Queries

Recent audit activity:

```sql
select created_at, user_id, action, resource_type, resource_id, metadata
from public.audit_logs
order by created_at desc
limit 100;
```

Recent user activity:

```sql
select created_at, user_id, action, resource_type, resource_id, metadata
from public.user_activity_logs
order by created_at desc
limit 100;
```

Stripe webhook health:

```sql
select stripe_event_id, event_type, status, processed_at, error_id
from public.stripe_events
order by created_at desc
limit 50;
```

Email deliverability:

```sql
select event_type, recipient_email, provider_message_id, occurred_at
from public.email_deliverability_events
order by occurred_at desc
limit 50;
```

Cron health:

```sql
select job_name, health_status, last_status, consecutive_failures, last_succeeded_at, last_error
from public.cron_job_health_status
order by job_name;
```

Maintenance windows:

```sql
select id, status, reason, message, starts_at, ends_at, metadata
from public.system_maintenance_windows
order by starts_at desc
limit 20;
```

## Legal And Notification Handoff

Involve counsel when any of the following may be true:

- Personal information was accessed, acquired, disclosed, or altered without authorization.
- User-uploaded files were publicly exposed or accessed by another user.
- Auth credentials, MFA factors, recovery codes, or account recovery evidence were exposed.
- Billing/payment records, Stripe identifiers, legal agreement evidence, consent records, or deleted-account tombstones were exposed.
- Law enforcement, regulator, insurer, or payment processor notification may be required.

Counsel should determine:

- Whether the event is a notifiable breach.
- Which state, federal, payment, or contractual notice rules apply.
- Whether user notice is required and by what deadline.
- Whether regulator, attorney general, payment processor, or law enforcement notice is required.
- Whether user notification should be delayed to preserve investigation or comply with law enforcement.

Law-enforcement, subpoena, warrant, preservation, and civil discovery workflows are covered in `docs/AssetSafe_Legal_Request_Runbook.md`.

Do not send breach-notification language without counsel/operator approval.

## Customer And Support Communications

Before customer contact:

1. Confirm facts and affected scope.
2. Prepare a short plain-language summary.
3. Provide concrete protective steps, if any.
4. Avoid speculation and avoid admitting legal conclusions.
5. Route support through a single approved channel.

Minimum internal support brief:

- What happened.
- Who may be affected.
- What users may notice.
- What support can say.
- What support must escalate.
- Whether refunds, account recovery, legal hold, or deletion requests are paused.

## Recovery

Recovery is complete only when:

- Active harm is stopped.
- Affected credentials are rotated or confirmed safe.
- Critical monitors are healthy.
- Affected cron jobs are rescheduled and succeeding.
- Data integrity has been checked.
- Maintenance mode is ended or has a documented reason to remain active.
- Counsel/operator has decided whether external notification is required.

End maintenance mode:

```sql
select public.end_maintenance_mode(
  '<maintenance-window-id>',
  'Incident contained; normal operations restored.'
);
```

## Post-Incident Review

Complete within 5 business days for Sev 1 or Sev 2.

Record:

- Timeline: detection, triage, containment, recovery, notification decisions.
- Root cause.
- Affected systems and data classes.
- What worked.
- What failed or was unclear.
- Customer/support impact.
- Legal notification decision and counsel owner.
- Follow-up actions, owner, priority, and due date.

Do not close the incident while any P0 follow-up lacks an owner and due date.

## Tabletop Drill

Run one tabletop before launch, then at least annually or within 10 business days of a material incident.

Recommended launch scenario:

1. Assume a private storage object was briefly accessible outside its owner account.
2. Triage severity and affected data class.
3. Activate maintenance mode in staging.
4. Preserve evidence using the queries above.
5. Rotate one mock secret using the key-rotation runbook.
6. Draft internal support guidance.
7. Decide what counsel must answer before user notification.
8. Record follow-up gaps.

Pass criteria:

- Incident commander is clear.
- Evidence is preserved before cleanup.
- Maintenance mode and secret rotation paths are understood.
- Notification decision is explicitly handed to counsel/operator.
- Follow-up actions have owner and due date.
