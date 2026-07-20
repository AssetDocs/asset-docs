-- Fix purchaser-code gift checkout schema: add delivery_method column and relax recipient_name NOT NULL
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'recipient_email';

ALTER TABLE public.gift_subscriptions
  ALTER COLUMN recipient_name DROP NOT NULL;

ALTER TABLE public.gift_subscriptions
  ADD CONSTRAINT gift_subscriptions_delivery_method_check
  CHECK (delivery_method IN ('recipient_email','purchaser_code'));

-- For purchaser_code gifts, recipient_email may be null until claimed.
-- For recipient_email gifts, ensure recipient_email is present.
ALTER TABLE public.gift_subscriptions
  ADD CONSTRAINT gift_subscriptions_recipient_email_required
  CHECK (
    delivery_method <> 'recipient_email'
    OR recipient_email IS NOT NULL
  );