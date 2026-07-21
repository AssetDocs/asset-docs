-- Purchaser-code gift checkout creates an unassigned gift first; the recipient
-- is only known when the code is claimed. Reassert the required schema at the
-- latest migration point so production cannot retain the old NOT NULL shape.
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'recipient_email',
  ALTER COLUMN recipient_email DROP NOT NULL;

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
      recipient_email = CASE
        WHEN v_delivery_method = 'purchaser_code' THEN lower(_user_email)
        ELSE recipient_email
      END,
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
    25,
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
      plan_id = 'standard',
      current_period_end = v_activation_end,
      storage_quota_gb = 25,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.subscribers (
    user_id,
    email,
    subscribed,
    subscription_tier,
    subscription_end,
    updated_at
  )
  VALUES (
    _user_id,
    _user_email,
    true,
    'standard',
    v_activation_end,
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    subscribed = true,
    subscription_tier = 'standard',
    subscription_end = EXCLUDED.subscription_end,
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

NOTIFY pgrst, 'reload schema';
