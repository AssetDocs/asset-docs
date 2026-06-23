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
  signoff_status,
  signed_off_at,
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
order by bucket_id;

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
-- ============================================================================

select
  type,
  priority,
  support_tier,
  status,
  sla_status,
  count(*) as issue_count,
  min(resolution_due_at) as earliest_resolution_due_at
from public.dev_support_issues
where status in ('new', 'investigating', 'in_progress')
group by type, priority, support_tier, status, sla_status
order by earliest_resolution_due_at nulls last;

-- ============================================================================
-- 05 Monitoring: alert routing policies
-- ============================================================================

select
  monitor_key,
  severity,
  route,
  enabled,
  warn_after_minutes,
  page_after_minutes
from public.monitoring_alert_policies
order by monitor_key;

-- ============================================================================
-- 05 Monitoring: recent email deliverability events
-- ============================================================================

select
  event_type,
  recipient_email,
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
  user_id,
  consent_type,
  terms_version,
  consented_at
from public.user_consents
order by consented_at desc
limit 50;

