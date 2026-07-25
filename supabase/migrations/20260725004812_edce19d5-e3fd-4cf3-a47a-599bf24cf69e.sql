CREATE OR REPLACE FUNCTION public.start_gift_email_verification(
  _verification_id uuid,
  _gift_subscription_id uuid,
  _claiming_user_id uuid,
  _recipient_email text,
  _claim_token_hash text,
  _code_hash text,
  _expires_at timestamptz,
  _request_ip_hash text DEFAULT NULL,
  _user_agent_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF _verification_id IS NULL
     OR _gift_subscription_id IS NULL
     OR _claiming_user_id IS NULL
     OR _recipient_email IS NULL
     OR _code_hash IS NULL
     OR _expires_at IS NULL
     OR _expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_input');
  END IF;

  PERFORM 1
  FROM public.gift_subscriptions
  WHERE id = _gift_subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_gift');
  END IF;

  UPDATE public.gift_email_verifications
  SET status = 'cancelled',
      updated_at = now()
  WHERE gift_subscription_id = _gift_subscription_id
    AND claiming_user_id = _claiming_user_id
    AND status = 'pending';

  INSERT INTO public.gift_email_verifications (
    id,
    gift_subscription_id,
    claiming_user_id,
    recipient_email,
    recipient_email_normalized,
    claim_token_hash,
    code_hash,
    expires_at,
    last_sent_at,
    request_ip_hash,
    user_agent_hash
  )
  VALUES (
    _verification_id,
    _gift_subscription_id,
    _claiming_user_id,
    lower(trim(_recipient_email)),
    lower(trim(_recipient_email)),
    _claim_token_hash,
    _code_hash,
    _expires_at,
    now(),
    _request_ip_hash,
    _user_agent_hash
  );

  UPDATE public.gift_subscriptions
  SET claim_status = 'verification_sent',
      recipient_email_normalized = lower(trim(_recipient_email)),
      updated_at = now()
  WHERE id = _gift_subscription_id;

  RETURN jsonb_build_object(
    'success', true,
    'verification_id', _verification_id,
    'expires_at', _expires_at
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.start_gift_email_verification(uuid, uuid, uuid, text, text, text, timestamptz, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_gift_email_verification(uuid, uuid, uuid, text, text, text, timestamptz, text, text)
  TO service_role;

NOTIFY pgrst, 'reload schema';