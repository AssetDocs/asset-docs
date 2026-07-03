ALTER TABLE public.subscription_email_events ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_subscription_email_events_idempotency_key
  ON public.subscription_email_events (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.subscription_email_events.idempotency_key IS
  'Dedupe key used by send-payment-receipt-internal to prevent duplicate receipt sends across Stripe event retries/paths.';