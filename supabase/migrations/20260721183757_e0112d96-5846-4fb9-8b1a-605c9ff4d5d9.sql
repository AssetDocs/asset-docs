DROP INDEX IF EXISTS public.uniq_email_deliverability_provider_event;
ALTER TABLE public.email_deliverability_events
  DROP CONSTRAINT IF EXISTS email_deliverability_events_provider_event_unique;
ALTER TABLE public.email_deliverability_events
  ADD CONSTRAINT email_deliverability_events_provider_event_unique
  UNIQUE (provider, provider_event_id);

NOTIFY pgrst, 'reload schema';