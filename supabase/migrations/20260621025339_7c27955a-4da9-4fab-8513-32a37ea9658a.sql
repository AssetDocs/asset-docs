
CREATE OR REPLACE FUNCTION public.anonymize_user_data(
  p_user_id uuid,
  p_email   text,
  p_deleted_by text DEFAULT 'self'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_tombstone_id uuid;
  v_hash text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'anonymize_user_data: p_user_id is required';
  END IF;

  v_hash := CASE
    WHEN p_email IS NOT NULL AND length(p_email) > 0
    THEN encode(extensions.digest(lower(p_email), 'sha256'), 'hex')
    ELSE NULL
  END;

  INSERT INTO public.deleted_accounts (email, original_user_id, deleted_by, email_hash)
  VALUES (COALESCE(lower(p_email), 'unknown-' || p_user_id::text), p_user_id, p_deleted_by, v_hash)
  ON CONFLICT (email) DO UPDATE
    SET original_user_id = EXCLUDED.original_user_id,
        deleted_by       = EXCLUDED.deleted_by,
        email_hash       = COALESCE(EXCLUDED.email_hash, public.deleted_accounts.email_hash)
  RETURNING id INTO v_tombstone_id;

  UPDATE public.payment_events             SET user_id = NULL, deleted_account_id = v_tombstone_id WHERE user_id = p_user_id;
  UPDATE public.subscribers                SET user_id = NULL, email = NULL, deleted_account_id = v_tombstone_id WHERE user_id = p_user_id;
  UPDATE public.user_activity_logs         SET user_id = NULL, deleted_account_id = v_tombstone_id WHERE user_id = p_user_id;
  UPDATE public.checkout_fulfillments      SET user_id = NULL, email = NULL, deleted_account_id = v_tombstone_id WHERE user_id = p_user_id;
  UPDATE public.checkout_session_audit     SET email = NULL, deleted_account_id = v_tombstone_id WHERE email = lower(p_email);
  UPDATE public.subscription_cancellations SET owner_user_id = NULL, deleted_account_id = v_tombstone_id WHERE owner_user_id = p_user_id;
  UPDATE public.account_closure_requests   SET owner_user_id = NULL, deleted_account_id = v_tombstone_id WHERE owner_user_id = p_user_id;

  UPDATE public.account_deletion_requests
     SET account_owner_id   = CASE WHEN account_owner_id   = p_user_id THEN NULL ELSE account_owner_id   END,
         requester_user_id  = CASE WHEN requester_user_id  = p_user_id THEN NULL ELSE requester_user_id  END,
         deleted_account_id = v_tombstone_id
   WHERE account_owner_id = p_user_id OR requester_user_id = p_user_id;

  UPDATE public.gift_subscriptions
     SET purchaser_user_id  = NULL,
         purchaser_email    = NULL,
         purchaser_deleted_account_id = v_tombstone_id
   WHERE purchaser_user_id = p_user_id
      OR lower(purchaser_email) = lower(p_email);

  UPDATE public.gift_subscriptions
     SET recipient_user_id   = NULL,
         recipient_email     = NULL,
         redeemed_by_user_id = CASE WHEN redeemed_by_user_id = p_user_id THEN NULL ELSE redeemed_by_user_id END,
         recipient_deleted_account_id = v_tombstone_id
   WHERE recipient_user_id = p_user_id
      OR redeemed_by_user_id = p_user_id
      OR lower(recipient_email) = lower(p_email);

  DELETE FROM public.entitlements WHERE user_id = p_user_id;

  RETURN v_tombstone_id;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_data(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(uuid, text, text) TO service_role;
