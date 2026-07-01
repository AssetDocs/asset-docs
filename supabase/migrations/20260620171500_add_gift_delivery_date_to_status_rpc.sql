-- Expose scheduled delivery date through the guest-safe success-page RPC.
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
  SELECT payment_status, delivery_status, delivery_date, created_at, delivered_at, recipient_email
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
    'delivery_date', r.delivery_date,
    'created_at', r.created_at,
    'delivered_at', r.delivered_at,
    'recipient_email_masked', v_masked
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_status_by_session_and_token(text, text) TO service_role;
