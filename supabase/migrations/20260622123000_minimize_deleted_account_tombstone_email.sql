-- Minimize deleted account tombstones: keep email_hash for signup/fraud
-- checks, but do not retain plaintext email on deleted_accounts.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.deleted_accounts
  ALTER COLUMN email DROP NOT NULL;

UPDATE public.deleted_accounts
SET email_hash = COALESCE(email_hash, encode(extensions.digest(lower(trim(email)), 'sha256'), 'hex'))
WHERE email IS NOT NULL
  AND trim(email) <> ''
  AND email_hash IS NULL;

UPDATE public.deleted_accounts
SET email = NULL
WHERE email IS NOT NULL;

COMMENT ON COLUMN public.deleted_accounts.email IS
  'Deprecated/minimized. Plaintext email must be NULL after tombstone creation; use email_hash for lookup.';

COMMENT ON COLUMN public.deleted_accounts.email_hash IS
  'SHA-256 hash of lower(trim(email)) retained for deleted-account signup/fraud guard without storing plaintext email.';

CREATE OR REPLACE FUNCTION public.anonymize_user_data(
  p_user_id uuid,
  p_email text,
  p_deleted_by text DEFAULT 'self'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_tombstone_id uuid;
  v_hash text;
  v_now timestamptz := now();
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'anonymize_user_data: p_user_id is required';
  END IF;

  v_hash := CASE
    WHEN p_email IS NOT NULL AND length(trim(p_email)) > 0
    THEN encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex')
    ELSE NULL
  END;

  SELECT id
    INTO v_tombstone_id
  FROM public.deleted_accounts
  WHERE original_user_id = p_user_id
     OR (v_hash IS NOT NULL AND email_hash = v_hash)
  ORDER BY
    CASE WHEN original_user_id = p_user_id THEN 0 ELSE 1 END,
    deleted_at DESC
  LIMIT 1;

  IF v_tombstone_id IS NULL THEN
    INSERT INTO public.deleted_accounts (
      email,
      original_user_id,
      deleted_by,
      email_hash,
      former_user_id_hash
    )
    VALUES (
      NULL,
      p_user_id,
      p_deleted_by,
      v_hash,
      encode(extensions.digest(p_user_id::text, 'sha256'), 'hex')
    )
    RETURNING id INTO v_tombstone_id;
  ELSE
    UPDATE public.deleted_accounts
       SET email = NULL,
           original_user_id = COALESCE(original_user_id, p_user_id),
           deleted_by = p_deleted_by,
           email_hash = COALESCE(email_hash, v_hash),
           former_user_id_hash = COALESCE(
             former_user_id_hash,
             encode(extensions.digest(p_user_id::text, 'sha256'), 'hex')
           )
     WHERE id = v_tombstone_id;
  END IF;

  UPDATE public.payment_events
     SET user_id = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE user_id = p_user_id;

  UPDATE public.subscribers
     SET user_id = NULL,
         email = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE user_id = p_user_id;

  UPDATE public.user_activity_logs
     SET user_id = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE user_id = p_user_id;

  UPDATE public.checkout_fulfillments
     SET user_id = NULL,
         email = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE user_id = p_user_id;

  UPDATE public.checkout_session_audit
     SET email = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE v_hash IS NOT NULL
     AND lower(trim(email)) = lower(trim(p_email));

  UPDATE public.subscription_cancellations
     SET owner_user_id = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE owner_user_id = p_user_id;

  UPDATE public.account_closure_requests
     SET owner_user_id = NULL,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE owner_user_id = p_user_id;

  UPDATE public.account_deletion_requests
     SET account_owner_id = CASE WHEN account_owner_id = p_user_id THEN NULL ELSE account_owner_id END,
         requester_user_id = CASE WHEN requester_user_id = p_user_id THEN NULL ELSE requester_user_id END,
         deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE account_owner_id = p_user_id
      OR requester_user_id = p_user_id;

  UPDATE public.gift_subscriptions
     SET purchaser_user_id = NULL,
         purchaser_email = NULL,
         purchaser_deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE purchaser_user_id = p_user_id
      OR (p_email IS NOT NULL AND lower(trim(purchaser_email)) = lower(trim(p_email)));

  UPDATE public.gift_subscriptions
     SET recipient_user_id = NULL,
         recipient_email = NULL,
         redeemed_by_user_id = CASE WHEN redeemed_by_user_id = p_user_id THEN NULL ELSE redeemed_by_user_id END,
         recipient_deleted_account_id = v_tombstone_id,
         email_hash = COALESCE(email_hash, v_hash),
         anonymized_at = COALESCE(anonymized_at, v_now)
   WHERE recipient_user_id = p_user_id
      OR redeemed_by_user_id = p_user_id
      OR (p_email IS NOT NULL AND lower(trim(recipient_email)) = lower(trim(p_email)));

  DELETE FROM public.entitlements WHERE user_id = p_user_id;

  RETURN v_tombstone_id;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_data(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(uuid, text, text) TO service_role;
