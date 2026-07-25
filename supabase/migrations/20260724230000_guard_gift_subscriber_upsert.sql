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
  existing_entitlement RECORD;
  v_activation_start timestamptz;
  v_activation_end timestamptz;
  v_delivery_method text;
  v_normalized_email text;
  v_recipient_email_normalized text;
  v_verification_id uuid;
  v_verified_at timestamptz;
  v_verification_method text;
  v_owned_account_id uuid;
BEGIN
  IF _user_id IS NULL OR _user_email IS NULL OR _code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
  END IF;

  v_normalized_email := lower(trim(_user_email));

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
    IF r.redeemed_by_user_id = _user_id OR r.claimed_by_user_id = _user_id THEN
      RETURN jsonb_build_object(
        'success', true,
        'already_claimed', true,
        'gift_id', r.id,
        'expires_at', r.expires_at,
        'claimed_account_id', r.claimed_account_id
      );
    END IF;

    RETURN jsonb_build_object('success', false, 'reason', 'already_redeemed');
  END IF;

  v_verification_method := CASE WHEN v_delivery_method = 'purchaser_code' THEN 'purchaser_code' ELSE NULL END;
  v_verified_at := CASE WHEN v_delivery_method = 'purchaser_code' THEN now() ELSE NULL END;

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

    IF r.recipient_email IS NULL THEN
      RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
    END IF;

    v_recipient_email_normalized := lower(trim(r.recipient_email));

    IF v_recipient_email_normalized = v_normalized_email THEN
      v_verification_method := 'email_match';
      v_verified_at := now();
    ELSE
      SELECT gev.id, gev.verified_at
        INTO v_verification_id, v_verified_at
      FROM public.gift_email_verifications gev
      WHERE gev.gift_subscription_id = r.id
        AND gev.claiming_user_id = _user_id
        AND gev.recipient_email_normalized = v_recipient_email_normalized
        AND gev.claim_token_hash IS NOT DISTINCT FROM _token_hash
        AND gev.status = 'verified'
        AND gev.verified_at IS NOT NULL
        AND gev.expires_at > now()
      ORDER BY gev.verified_at DESC
      LIMIT 1
      FOR UPDATE;

      IF v_verification_id IS NULL THEN
        UPDATE public.gift_subscriptions
        SET claim_status = 'verification_required',
            recipient_email_normalized = v_recipient_email_normalized,
            updated_at = now()
        WHERE id = r.id;

        RETURN jsonb_build_object('success', false, 'reason', 'verification_required');
      END IF;

      v_verification_method := 'otp';
    END IF;
  END IF;

  SELECT a.id
    INTO v_owned_account_id
  FROM public.accounts a
  WHERE a.owner_user_id = _user_id
  ORDER BY a.created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF v_owned_account_id IS NULL THEN
    INSERT INTO public.accounts (owner_user_id)
    VALUES (_user_id)
    RETURNING id INTO v_owned_account_id;
  END IF;

  INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
  VALUES (v_owned_account_id, _user_id, 'owner', 'active', now())
  ON CONFLICT (account_id, user_id) DO UPDATE SET
    role = 'owner',
    status = 'active',
    accepted_at = COALESCE(public.account_memberships.accepted_at, EXCLUDED.accepted_at);

  SELECT *
    INTO existing_entitlement
  FROM public.entitlements
  WHERE user_id = _user_id
  FOR UPDATE;

  IF FOUND
     AND existing_entitlement.status IN ('active', 'trialing')
     AND COALESCE(existing_entitlement.entitlement_source, '') <> 'gift' THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'active_subscription_exists'
    );
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
        WHEN v_delivery_method = 'purchaser_code' THEN v_normalized_email
        ELSE recipient_email
      END,
      recipient_email_normalized = CASE
        WHEN v_delivery_method = 'purchaser_code' THEN v_normalized_email
        ELSE v_recipient_email_normalized
      END,
      claimed_by_user_id = _user_id,
      claimed_account_id = v_owned_account_id,
      claimed_auth_email = v_normalized_email,
      recipient_email_verified_at = v_verified_at,
      verification_method = v_verification_method,
      claim_status = 'claimed',
      claimed_at = now(),
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
    expires_at = GREATEST(COALESCE(public.entitlements.expires_at, '-infinity'::timestamptz), EXCLUDED.expires_at),
    billing_status = 'gifted',
    source_event_id = EXCLUDED.source_event_id,
    updated_at = now()
  WHERE COALESCE(public.entitlements.entitlement_source, '') = 'gift'
     OR public.entitlements.status NOT IN ('active', 'trialing');

  UPDATE public.profiles
  SET plan_status = 'active',
      plan_id = 'standard',
      current_period_end = GREATEST(COALESCE(current_period_end, '-infinity'::timestamptz), v_activation_end),
      storage_quota_gb = GREATEST(COALESCE(storage_quota_gb, 0), 25),
      last_used_account_id = v_owned_account_id,
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
    v_normalized_email,
    true,
    'standard',
    v_activation_end,
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = COALESCE(public.subscribers.user_id, EXCLUDED.user_id),
    subscribed = true,
    subscription_tier = 'standard',
    subscription_end = GREATEST(COALESCE(public.subscribers.subscription_end, '-infinity'::timestamptz), EXCLUDED.subscription_end),
    updated_at = now()
  WHERE public.subscribers.user_id IS NULL
     OR public.subscribers.user_id = EXCLUDED.user_id;

  IF v_verification_id IS NOT NULL THEN
    UPDATE public.gift_email_verifications
    SET status = 'consumed',
        consumed_at = now(),
        updated_at = now()
    WHERE id = v_verification_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'gift_id', r.id,
    'expires_at', v_activation_end,
    'claimed_account_id', v_owned_account_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift(text, text, text, uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
