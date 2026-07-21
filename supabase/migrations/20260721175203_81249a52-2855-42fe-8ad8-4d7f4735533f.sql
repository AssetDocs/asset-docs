-- Harden gift redemption for launch
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'recipient_email',
  ADD COLUMN IF NOT EXISTS term text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS delivery_attempted_at timestamptz,
  ADD COLUMN IF NOT EXISTS redemption_status text NOT NULL DEFAULT 'unredeemed',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid,
  ADD COLUMN IF NOT EXISTS purchaser_user_id uuid,
  ADD COLUMN IF NOT EXISTS recipient_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS purchaser_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivery_error text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS claim_token_hash text,
  ADD COLUMN IF NOT EXISTS resend_recipient_email_id text,
  ADD COLUMN IF NOT EXISTS resend_purchaser_email_id text,
  ADD COLUMN IF NOT EXISTS success_token_hash text,
  ADD COLUMN IF NOT EXISTS success_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS manually_voided_at timestamptz;

ALTER TABLE public.gift_subscriptions
  ALTER COLUMN recipient_email DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gift_subscriptions_delivery_method_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_delivery_method_check
      CHECK (delivery_method IN ('recipient_email', 'purchaser_code'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gift_subscriptions_delivery_status_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_delivery_status_check
      CHECK (delivery_status IN ('not_sent','sending','sent','failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gift_subscriptions_redemption_status_check') THEN
    ALTER TABLE public.gift_subscriptions
      ADD CONSTRAINT gift_subscriptions_redemption_status_check
      CHECK (redemption_status IN ('unredeemed','redeemed','expired'));
  END IF;
END $$;

ALTER TABLE public.gift_subscriptions
  DROP CONSTRAINT IF EXISTS gift_subscriptions_payment_status_check;

ALTER TABLE public.gift_subscriptions
  ADD CONSTRAINT gift_subscriptions_payment_status_check
  CHECK (payment_status IN ('pending','paid','refunded','canceled','failed','expired'));

CREATE INDEX IF NOT EXISTS gift_subscriptions_delivery_method_idx
  ON public.gift_subscriptions (delivery_method);

ALTER TABLE public.entitlements
  DROP CONSTRAINT IF EXISTS entitlements_source_check;

ALTER TABLE public.entitlements
  ADD CONSTRAINT entitlements_source_check
  CHECK (entitlement_source IN ('stripe', 'lifetime', 'admin', 'gift'));

CREATE INDEX IF NOT EXISTS gift_subscriptions_pending_cleanup_idx
  ON public.gift_subscriptions (payment_status, created_at)
  WHERE payment_status = 'pending';

CREATE OR REPLACE FUNCTION public.cleanup_abandoned_gift_checkouts(
  _older_than interval DEFAULT interval '24 hours'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  UPDATE public.gift_subscriptions
  SET
    payment_status = 'canceled',
    status = 'canceled',
    delivery_status = CASE
      WHEN delivery_status = 'sent' THEN delivery_status
      ELSE 'failed'
    END,
    cancelled_at = COALESCE(cancelled_at, now()),
    last_delivery_error = COALESCE(last_delivery_error, 'Abandoned checkout expired before payment'),
    updated_at = now()
  WHERE payment_status = 'pending'
    AND created_at < now() - _older_than;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_abandoned_gift_checkouts(interval) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_abandoned_gift_checkouts(interval) TO service_role;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace n
    JOIN pg_proc p ON p.pronamespace = n.oid
    WHERE n.nspname = 'cron'
      AND p.proname = 'schedule'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-abandoned-gift-checkouts-daily',
      '17 9 * * *',
      'SELECT public.cleanup_abandoned_gift_checkouts(interval ''24 hours'');'
    );
  ELSIF EXISTS (
    SELECT 1
    FROM pg_namespace n
    JOIN pg_proc p ON p.pronamespace = n.oid
    WHERE n.nspname = 'extensions'
      AND p.proname = 'schedule'
  ) THEN
    PERFORM extensions.cron.schedule(
      'cleanup-abandoned-gift-checkouts-daily',
      '17 9 * * *',
      'SELECT public.cleanup_abandoned_gift_checkouts(interval ''24 hours'');'
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN unique_violation THEN NULL;
  WHEN undefined_function THEN NULL;
END $$;

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

    IF r.recipient_email IS NULL OR lower(r.recipient_email) <> v_normalized_email THEN
      RETURN jsonb_build_object('success', false, 'reason', 'wrong_email');
    END IF;
  END IF;

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
        ELSE lower(recipient_email)
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
    user_id = EXCLUDED.user_id,
    subscribed = true,
    subscription_tier = 'standard',
    subscription_end = GREATEST(COALESCE(public.subscribers.subscription_end, '-infinity'::timestamptz), EXCLUDED.subscription_end),
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