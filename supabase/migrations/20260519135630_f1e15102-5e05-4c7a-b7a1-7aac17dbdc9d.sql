-- Idempotency: prevent duplicate notifications for same (request, event, recipient)
CREATE UNIQUE INDEX IF NOT EXISTS continuity_email_audit_unique_event
  ON public.continuity_email_audit_log (request_id, email_type, recipient_email);

-- Fast lookup of failed sends per request for the admin Owner & Risk tab
CREATE INDEX IF NOT EXISTS continuity_email_audit_failed_idx
  ON public.continuity_email_audit_log (request_id, created_at DESC)
  WHERE delivery_status <> 'sent';

CREATE INDEX IF NOT EXISTS continuity_owner_notifications_failed_idx
  ON public.continuity_owner_notifications (request_id, created_at DESC)
  WHERE delivery_status <> 'sent';