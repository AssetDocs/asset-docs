
-- =========================================================================
-- Retention / Deletion Policy Matrix migration
-- =========================================================================

-- 1. Tombstone: add email_hash column + index
ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS email_hash text;

CREATE INDEX IF NOT EXISTS deleted_accounts_email_hash_idx
  ON public.deleted_accounts (email_hash);

-- 2. Add deleted_account_id FK to every anonymize table
ALTER TABLE public.payment_events             ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.subscribers                ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.user_activity_logs         ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.checkout_fulfillments      ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.checkout_session_audit     ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.subscription_cancellations ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.account_closure_requests   ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.account_deletion_requests  ADD COLUMN IF NOT EXISTS deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
-- gift_subscriptions can be linked from either purchaser- or recipient-side deletion
ALTER TABLE public.gift_subscriptions         ADD COLUMN IF NOT EXISTS purchaser_deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.gift_subscriptions         ADD COLUMN IF NOT EXISTS recipient_deleted_account_id uuid REFERENCES public.deleted_accounts(id) ON DELETE SET NULL;

-- 3. Relax NOT NULL on columns we need to null during anonymization
ALTER TABLE public.account_closure_requests   ALTER COLUMN owner_user_id      DROP NOT NULL;
ALTER TABLE public.account_deletion_requests  ALTER COLUMN account_owner_id   DROP NOT NULL;
ALTER TABLE public.account_deletion_requests  ALTER COLUMN requester_user_id  DROP NOT NULL;
ALTER TABLE public.subscribers                ALTER COLUMN user_id            DROP NOT NULL;
ALTER TABLE public.subscribers                ALTER COLUMN email              DROP NOT NULL;
ALTER TABLE public.subscription_cancellations ALTER COLUMN owner_user_id      DROP NOT NULL;
ALTER TABLE public.user_activity_logs         ALTER COLUMN user_id            DROP NOT NULL;
ALTER TABLE public.gift_subscriptions         ALTER COLUMN purchaser_email    DROP NOT NULL;
ALTER TABLE public.gift_subscriptions         ALTER COLUMN recipient_email    DROP NOT NULL;

-- 4. anonymize_user_data: matrix executor
CREATE OR REPLACE FUNCTION public.anonymize_user_data(
  p_user_id uuid,
  p_email   text,
  p_deleted_by text DEFAULT 'self'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    THEN encode(digest(lower(p_email), 'sha256'), 'hex')
    ELSE NULL
  END;

  -- Insert tombstone (or reuse if email already tombstoned)
  INSERT INTO public.deleted_accounts (email, original_user_id, deleted_by, email_hash)
  VALUES (COALESCE(lower(p_email), 'unknown-' || p_user_id::text), p_user_id, p_deleted_by, v_hash)
  ON CONFLICT (email) DO UPDATE
    SET original_user_id = EXCLUDED.original_user_id,
        deleted_by       = EXCLUDED.deleted_by,
        email_hash       = COALESCE(EXCLUDED.email_hash, public.deleted_accounts.email_hash)
  RETURNING id INTO v_tombstone_id;

  -- payment_events: anonymize
  UPDATE public.payment_events
     SET user_id = NULL,
         deleted_account_id = v_tombstone_id
   WHERE user_id = p_user_id;

  -- subscribers: anonymize
  UPDATE public.subscribers
     SET user_id = NULL,
         email   = NULL,
         deleted_account_id = v_tombstone_id
   WHERE user_id = p_user_id;

  -- user_activity_logs: anonymize (strip user_id; ip/user_agent are not separate cols on this table)
  UPDATE public.user_activity_logs
     SET user_id = NULL,
         deleted_account_id = v_tombstone_id
   WHERE user_id = p_user_id;

  -- checkout_fulfillments: anonymize
  UPDATE public.checkout_fulfillments
     SET user_id = NULL,
         email   = NULL,
         deleted_account_id = v_tombstone_id
   WHERE user_id = p_user_id;

  -- checkout_session_audit: anonymize
  UPDATE public.checkout_session_audit
     SET email = NULL,
         deleted_account_id = v_tombstone_id
   WHERE email = lower(p_email);

  -- subscription_cancellations: anonymize
  UPDATE public.subscription_cancellations
     SET owner_user_id = NULL,
         deleted_account_id = v_tombstone_id
   WHERE owner_user_id = p_user_id;

  -- account_closure_requests: anonymize
  UPDATE public.account_closure_requests
     SET owner_user_id = NULL,
         deleted_account_id = v_tombstone_id
   WHERE owner_user_id = p_user_id;

  -- account_deletion_requests: anonymize (both sides)
  UPDATE public.account_deletion_requests
     SET account_owner_id   = CASE WHEN account_owner_id   = p_user_id THEN NULL ELSE account_owner_id   END,
         requester_user_id  = CASE WHEN requester_user_id  = p_user_id THEN NULL ELSE requester_user_id  END,
         deleted_account_id = v_tombstone_id
   WHERE account_owner_id = p_user_id OR requester_user_id = p_user_id;

  -- gift_subscriptions: split anonymize
  --   If user is purchaser: null purchaser_user_id + purchaser_email
  UPDATE public.gift_subscriptions
     SET purchaser_user_id  = NULL,
         purchaser_email    = NULL,
         purchaser_deleted_account_id = v_tombstone_id
   WHERE purchaser_user_id = p_user_id
      OR lower(purchaser_email) = lower(p_email);

  --   If user is recipient or redeemer: null recipient + redeemed_by fields
  UPDATE public.gift_subscriptions
     SET recipient_user_id   = NULL,
         recipient_email     = NULL,
         redeemed_by_user_id = CASE WHEN redeemed_by_user_id = p_user_id THEN NULL ELSE redeemed_by_user_id END,
         recipient_deleted_account_id = v_tombstone_id
   WHERE recipient_user_id = p_user_id
      OR redeemed_by_user_id = p_user_id
      OR lower(recipient_email) = lower(p_email);

  -- entitlements: hard purge
  DELETE FROM public.entitlements WHERE user_id = p_user_id;

  RETURN v_tombstone_id;
END;
$$;

-- Service-role only; revoke from PUBLIC
REVOKE ALL ON FUNCTION public.anonymize_user_data(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(uuid, text, text) TO service_role;
