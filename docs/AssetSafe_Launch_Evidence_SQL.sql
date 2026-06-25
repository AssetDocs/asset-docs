-- Asset Safe Launch Evidence SQL
-- Status: read-only evidence query bundle
-- Date: 2026-06-23
-- Production project: leotcbfpqiekgkgumecn
--
-- Use this file with docs/AssetSafe_Launch_Evidence_Collection_Runbook.md.
-- Run in Supabase SQL Editor and save each result set to the launch evidence folder.
-- Do not paste secrets, private files, service-role keys, tokens, MFA codes, or full payment details into launch notes.

-- ============================================================================
-- 01 Billing: Stripe webhook errors
-- ============================================================================

select
  stripe_event_id,
  event_type,
  outcome,
  created_at,
  processed_at
from public.stripe_events
where outcome = 'error'
order by created_at desc;

-- ============================================================================
-- 01 Billing: 7-day Stripe event outcome summary
-- ============================================================================

select
  event_type,
  outcome,
  count(*) as event_count,
  max(created_at) as latest_seen
from public.stripe_events
where created_at > now() - interval '7 days'
group by event_type, outcome
order by latest_seen desc;

-- ============================================================================
-- 01 Billing: manual checkout fulfillment review queue
-- ============================================================================

select
  id,
  stripe_session_id,
  email,
  status,
  manual_review_reason,
  created_at
from public.checkout_fulfillments
where status in ('manual_review', 'fulfilled_email_failed')
order by created_at asc;

-- ============================================================================
-- 02 Data lifecycle: latest passed restore drill
-- Note: some environments may not have the later signoff columns yet.
-- If signoff_status/signed_off_at are absent, use approved_by_user_id plus
-- an operator evidence note as the sign-off signal.
-- ============================================================================

select
  id,
  environment,
  drill_type,
  status,
  restore_point_at,
  completed_at,
  rpo_minutes,
  rto_minutes,
  db_smoke_passed,
  storage_smoke_passed,
  auth_smoke_passed,
  edge_smoke_passed,
  signed_url_smoke_passed,
  approved_by_user_id,
  findings,
  follow_up_actions
from public.restore_drill_runs
where status = 'passed'
order by completed_at desc
limit 1;

-- ============================================================================
-- 02 Data lifecycle: storage bucket list
-- ============================================================================

select
  id,
  name,
  public,
  created_at,
  updated_at
from storage.buckets
order by id;

-- ============================================================================
-- 02 Data lifecycle: storage lifecycle policy status
-- If this function is unavailable in an environment, record that as evidence.
-- ============================================================================

select *
from public.get_storage_bucket_lifecycle_status()
order by bucket;

-- ============================================================================
-- 02/05 Data lifecycle + monitoring: launch cron health
-- ============================================================================

select
  job_name,
  health_status,
  last_status,
  last_succeeded_at,
  minutes_since_success,
  consecutive_failures,
  last_error
from public.cron_job_health_status
where job_name in (
  'process-account-closures',
  'process-expired-exports',
  'process-storage-deletion-jobs',
  'process-storage-orphans',
  'process-storage-usage-drift',
  'process-retention-expirations',
  'scrub-old-support-pii',
  'quarterly-restore-drill-reminder',
  'check-payment-failures'
)
order by job_name;

-- ============================================================================
-- 04 Support: open support backlog by SLA state
-- Note: support_tier / sla_status columns require the support SLA migration.
-- This query intentionally uses base columns that exist in older schemas.
-- ============================================================================

select
  type,
  priority,
  status,
  count(*) as issue_count,
  min(created_at) as oldest_issue_created_at
from public.dev_support_issues
where status in ('new', 'investigating', 'in_progress')
group by type, priority, status
order by oldest_issue_created_at nulls last;

-- ============================================================================
-- 05 Monitoring: alert routing policies
-- ============================================================================

select
  monitor_key,
  monitor_label,
  owner_team,
  warning_channel,
  page_channel,
  warn_rule,
  page_rule,
  runbook_url,
  enabled,
  updated_at
from public.monitoring_alert_policies
order by monitor_key;

-- ============================================================================
-- 05 Monitoring: recent email deliverability events
-- ============================================================================

select
  event_type,
  recipient_email_hash,
  recipient_domain,
  provider_message_id,
  occurred_at,
  created_at
from public.email_deliverability_events
order by occurred_at desc nulls last, created_at desc
limit 50;

-- ============================================================================
-- 07 Legal/compliance: recent consent evidence
-- Use for sanity check only; legal approval still requires owner/counsel sign-off.
-- ============================================================================

select
  user_email,
  consent_type,
  terms_version,
  created_at
from public.user_consents
order by created_at desc
limit 50;
