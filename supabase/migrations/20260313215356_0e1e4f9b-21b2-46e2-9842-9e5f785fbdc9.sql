
-- Fix 1: Add missing columns to gift_subscriptions that the webhook expects
ALTER TABLE public.gift_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS term text DEFAULT 'yearly',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Backfill stripe_checkout_session_id from stripe_session_id for existing rows
UPDATE public.gift_subscriptions
SET stripe_checkout_session_id = stripe_session_id
WHERE stripe_checkout_session_id IS NULL AND stripe_session_id IS NOT NULL;

-- Fix 3: Replace claim_gift_subscription to also activate entitlement
CREATE OR REPLACE FUNCTION public.claim_gift_subscription(p_gift_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_gift_id UUID;
    v_user_id UUID;
    v_user_email TEXT;
    v_recipient_email TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

    SELECT id, recipient_email, expires_at
    INTO v_gift_id, v_recipient_email, v_expires_at
    FROM public.gift_subscriptions
    WHERE gift_code = p_gift_code
      AND redeemed = false
      AND status = 'paid'
    FOR UPDATE;

    IF v_gift_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Gift code not found or already redeemed');
    END IF;

    IF lower(v_user_email) != lower(v_recipient_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Gift code is not for your email address');
    END IF;

    UPDATE public.gift_subscriptions
    SET
        redeemed = true,
        redeemed_at = NOW(),
        redeemed_by_user_id = v_user_id,
        recipient_user_id = v_user_id,
        updated_at = NOW()
    WHERE id = v_gift_id;

    INSERT INTO public.entitlements (
        user_id, plan, status, entitlement_source,
        base_storage_gb, storage_addon_blocks_qty, cancel_at_period_end,
        current_period_end, expires_at, billing_status, updated_at
    )
    VALUES (
        v_user_id, 'standard', 'active', 'gift',
        50, 0, false,
        COALESCE(v_expires_at, NOW() + INTERVAL '1 year'),
        COALESCE(v_expires_at, NOW() + INTERVAL '1 year'),
        'gifted', NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan = 'standard',
        status = 'active',
        entitlement_source = 'gift',
        base_storage_gb = 50,
        storage_addon_blocks_qty = 0,
        cancel_at_period_end = false,
        current_period_end = COALESCE(EXCLUDED.current_period_end, NOW() + INTERVAL '1 year'),
        expires_at = COALESCE(EXCLUDED.expires_at, NOW() + INTERVAL '1 year'),
        billing_status = 'gifted',
        updated_at = NOW();

    UPDATE public.profiles
    SET plan_status = 'active', subscription_tier = 'standard', storage_quota_gb = 50, updated_at = NOW()
    WHERE user_id = v_user_id;

    UPDATE public.subscribers
    SET subscribed = true, subscription_tier = 'standard',
        subscription_end = COALESCE(v_expires_at, NOW() + INTERVAL '1 year'),
        plan_status = 'active', updated_at = NOW()
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Gift successfully claimed');

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
