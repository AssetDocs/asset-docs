-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.claim_gift_subscription(p_gift_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fix: Set search_path to prevent injection
AS $$
DECLARE
    v_gift_id UUID;
    v_user_id UUID;
    v_user_email TEXT;
    v_recipient_email TEXT;
    v_result JSONB;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- Get user email
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    -- Find the gift subscription
    SELECT id, recipient_email INTO v_gift_id, v_recipient_email
    FROM public.gift_subscriptions
    WHERE gift_code = p_gift_code
    AND redeemed = false
    AND status = 'paid'
    FOR UPDATE;
    
    -- Check if gift exists
    IF v_gift_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Gift code not found or already redeemed');
    END IF;
    
    -- Verify email matches
    IF v_user_email != v_recipient_email THEN
        RETURN jsonb_build_object('success', false, 'error', 'Gift code is not for your email address');
    END IF;
    
    -- Update the gift subscription
    UPDATE public.gift_subscriptions
    SET 
        redeemed = true,
        redeemed_at = NOW(),
        redeemed_by_user_id = v_user_id,
        recipient_user_id = v_user_id
    WHERE id = v_gift_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Gift successfully claimed');
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;