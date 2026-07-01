ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

ALTER TABLE public.gift_subscriptions
  DROP CONSTRAINT IF EXISTS gift_subscriptions_payment_status_check;

ALTER TABLE public.gift_subscriptions
  ADD CONSTRAINT gift_subscriptions_payment_status_check
  CHECK (payment_status IN ('pending','paid','refunded','canceled','failed','expired'));
