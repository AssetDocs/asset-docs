-- Add purchaser-owned Gift Codes as an alternate single-gift delivery method.
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'recipient_email',
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS manually_voided_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gift_subscriptions_delivery_method_check'
  ) THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_delivery_method_check
      CHECK (delivery_method IN ('recipient_email', 'purchaser_code'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS gift_subscriptions_delivery_method_idx
  ON public.gift_subscriptions (delivery_method);

-- Guest-safe checkout-success lookup. Gift Code and claim link are returned
-- only to the purchaser holding the short-lived success token.
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
  v_claim_link text;
BEGIN
  SELECT
    payment_status,
    delivery_status,
    delivery_date,
    created_at,
    delivered_at,
    recipient_email,
    delivery_method,
    gift_code
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

  IF r.recipient_email IS NOT NULL THEN
    v_at := position('@' in r.recipient_email);
    IF v_at > 0 THEN
      v_local := substring(r.recipient_email FROM 1 FOR v_at - 1);
      v_domain := substring(r.recipient_email FROM v_at);
      v_masked := substring(v_local FROM 1 FOR 1) || '***' || v_domain;
    ELSE
      v_masked := '***';
    END IF;
  END IF;

  IF r.delivery_method = 'purchaser_code' AND r.payment_status = 'paid' THEN
    v_claim_link := 'https://getassetsafe.com/gift-claim?code=' || r.gift_code;
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'payment_status', r.payment_status,
    'delivery_status', r.delivery_status,
    'delivery_date', r.delivery_date,
    'created_at', r.created_at,
    'delivered_at', r.delivered_at,
    'delivery_method', r.delivery_method,
    'recipient_email_masked', v_masked,
    'gift_code', CASE WHEN v_claim_link IS NOT NULL THEN r.gift_code ELSE NULL END,
    'claim_link', v_claim_link
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) TO service_role;

-- Token-bound recipient gifts still require claim_token_hash and recipient email.
-- Purchaser-code gifts are intentionally unassigned and can be claimed with the
-- Gift Code alone by the first authenticated user who redeems it.
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
  v_activation_start timestamptz;
  v_activation_end timestamptz;
  v_delivery_method text;
BEGIN
  IF _user_id IS NULL OR _user_email IS NULL OR _code IS NULL THEN
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

  v_delivery_method := COALESCE(r.delivery_method, 'recipient_email');

  IF r.payment_status <> 'paid' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_paid');
  END IF;

  IF r.refunded_at IS NOT NULL OR r.cancelled_at IS NOT NULL OR r.manually_voided_at IS NOT NULL
     OR r.status IN ('refunded', 'cancelled', 'canceled', 'voided') THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_claimable');
  END IF;

  IF r.redemption_status = 'redeemed' OR r.redeemed = true THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_redeemed');
  END IF;

  IF v_delivery_method = 'recipient_email' THEN
    IF _token_hash IS NULL THEN
      RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
    END IF;

    IF r.claim_token_hash IS NULL THEN
      RETURN jsonb_build_object('success', false, 'reason', 'legacy_link_needs_resend');
    END IF;

    IF r.claim_token_hash <> _token_hash THEN
      RETURN jsonb_build_object('success', false, 'reason', 'invalid_token');
    END IF;

    IF r.recipient_email IS NULL OR lower(r.recipient_email) <> lower(_user_email) THEN
      RETURN jsonb_build_object('success', false, 'reason', 'wrong_email');
    END IF;
  END IF;

  v_activation_start := COALESCE(r.first_login_at, now());
  v_activation_end := v_activation_start + interval '1 year';

  UPDATE public.gift_subscriptions
  SET redemption_status = 'redeemed',
      status = 'claimed',
      redeemed = true,
      redeemed_at = now(),
      redeemed_by_user_id = _user_id,
      recipient_user_id = _user_id,
      recipient_email = COALESCE(recipient_email, lower(_user_email)),
      first_login_at = COALESCE(first_login_at, v_activation_start),
      expires_at = v_activation_end,
      updated_at = now()
  WHERE id = r.id;

  INSERT INTO public.entitlements (
    user_id,
    plan,
    status,
    entitlement_source,
    stripe_subscription_id,
    plan_lookup_key,
    subscription_status,
    base_storage_gb,
    storage_addon_blocks_qty,
    cancel_at_period_end,
    current_period_end,
    expires_at,
    billing_status,
    source_event_id,
    updated_at
  )
  VALUES (
    _user_id,
    'standard',
    'active',
    'gift',
    r.stripe_subscription_id,
    'asset_safe_gift_annual',
    'active',
    50,
    0,
    true,
    v_activation_end,
    v_activation_end,
    'gifted',
    'gift:' || r.id::text,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'standard',
    status = 'active',
    entitlement_source = 'gift',
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    plan_lookup_key = EXCLUDED.plan_lookup_key,
    subscription_status = EXCLUDED.subscription_status,
    base_storage_gb = EXCLUDED.base_storage_gb,
    storage_addon_blocks_qty = 0,
    cancel_at_period_end = true,
    current_period_end = EXCLUDED.current_period_end,
    expires_at = EXCLUDED.expires_at,
    billing_status = 'gifted',
    source_event_id = EXCLUDED.source_event_id,
    updated_at = now();

  UPDATE public.profiles
  SET plan_status = 'active',
      subscription_tier = 'standard',
      current_period_end = v_activation_end,
      storage_quota_gb = 50,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.subscribers (
    user_id,
    email,
    subscribed,
    subscription_tier,
    subscription_end,
    plan_status,
    updated_at
  )
  VALUES (
    _user_id,
    _user_email,
    true,
    'standard',
    v_activation_end,
    'active',
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    subscribed = true,
    subscription_tier = 'standard',
    subscription_end = EXCLUDED.subscription_end,
    plan_status = 'active',
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'gift_id', r.id,
    'expires_at', v_activation_end
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) TO service_role;
