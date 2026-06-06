
-- Ensure pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. New columns
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS delivery_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS redemption_status text NOT NULL DEFAULT 'unredeemed',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS recipient_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS purchaser_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivery_error text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS claim_token_hash text,
  ADD COLUMN IF NOT EXISTS resend_recipient_email_id text,
  ADD COLUMN IF NOT EXISTS resend_purchaser_email_id text,
  ADD COLUMN IF NOT EXISTS success_token_hash text,
  ADD COLUMN IF NOT EXISTS success_token_expires_at timestamptz;

-- 2. Domain checks (use simple CHECK on enum-like text)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='gift_subscriptions_payment_status_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_payment_status_check
      CHECK (payment_status IN ('pending','paid','refunded','canceled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='gift_subscriptions_delivery_status_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_delivery_status_check
      CHECK (delivery_status IN ('not_sent','sending','sent','failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='gift_subscriptions_redemption_status_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_redemption_status_check
      CHECK (redemption_status IN ('unredeemed','redeemed','expired'));
  END IF;
END $$;

-- 3. Backfill from legacy columns
UPDATE public.gift_subscriptions
SET payment_status = CASE
      WHEN status IN ('paid','delivered') THEN 'paid'
      WHEN status = 'refunded' THEN 'refunded'
      WHEN status = 'canceled' THEN 'canceled'
      ELSE 'pending'
    END,
    delivery_status = CASE
      WHEN status = 'delivered' THEN 'sent'
      ELSE 'not_sent'
    END,
    redemption_status = CASE
      WHEN redeemed = true THEN 'redeemed'
      ELSE 'unredeemed'
    END,
    paid_at = CASE WHEN status IN ('paid','delivered') THEN COALESCE(paid_at, updated_at) ELSE paid_at END,
    delivered_at = CASE WHEN status = 'delivered' THEN COALESCE(delivered_at, updated_at) ELSE delivered_at END,
    recipient_email_sent_at = CASE WHEN status = 'delivered' THEN COALESCE(recipient_email_sent_at, updated_at) ELSE recipient_email_sent_at END
WHERE payment_status = 'pending' OR delivery_status = 'not_sent' OR redemption_status = 'unredeemed';

-- 4. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS gift_subscriptions_stripe_session_id_unique
  ON public.gift_subscriptions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gift_subscriptions_success_lookup_idx
  ON public.gift_subscriptions (stripe_session_id, success_token_hash)
  WHERE success_token_hash IS NOT NULL;

-- 5. Guest-safe status lookup RPC (service_role only — edge function gateway)
CREATE OR REPLACE FUNCTION public.get_gift_status_by_session_and_token(
  _session_id text,
  _token_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
  v_local text;
  v_domain text;
  v_masked text;
  v_at int;
BEGIN
  SELECT payment_status, delivery_status, created_at, delivered_at, recipient_email
    INTO r
  FROM public.gift_subscriptions
  WHERE stripe_session_id = _session_id
    AND success_token_hash = _token_hash
    AND success_token_expires_at IS NOT NULL
    AND success_token_expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  v_at := position('@' in r.recipient_email);
  IF v_at > 0 THEN
    v_local := substring(r.recipient_email FROM 1 FOR v_at - 1);
    v_domain := substring(r.recipient_email FROM v_at);
    v_masked := substring(v_local FROM 1 FOR 1) || '***' || v_domain;
  ELSE
    v_masked := '***';
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'payment_status', r.payment_status,
    'delivery_status', r.delivery_status,
    'created_at', r.created_at,
    'delivered_at', r.delivered_at,
    'recipient_email_masked', v_masked
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) TO service_role;

-- 6. Redemption RPC (service_role only — edge function gateway)
CREATE OR REPLACE FUNCTION public.redeem_gift(
  _code text,
  _token_hash text,
  _user_email text,
  _user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  r RECORD;
BEGIN
  IF _user_id IS NULL OR _user_email IS NULL OR _code IS NULL OR _token_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
  END IF;

  SELECT *
    INTO r
  FROM public.gift_subscriptions
  WHERE gift_code = _code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_token');
  END IF;

  IF r.payment_status <> 'paid' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_paid');
  END IF;

  IF r.redemption_status = 'redeemed' OR r.redeemed = true THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_redeemed');
  END IF;

  IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'reason', 'expired');
  END IF;

  IF r.claim_token_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'legacy_link_needs_resend');
  END IF;

  IF r.claim_token_hash <> _token_hash THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_token');
  END IF;

  IF lower(r.recipient_email) <> lower(_user_email) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'wrong_email');
  END IF;

  UPDATE public.gift_subscriptions
  SET redemption_status = 'redeemed',
      redeemed = true,
      redeemed_at = now(),
      redeemed_by_user_id = _user_id,
      recipient_user_id = _user_id,
      updated_at = now()
  WHERE id = r.id;

  RETURN jsonb_build_object('success', true, 'gift_id', r.id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) TO service_role;
