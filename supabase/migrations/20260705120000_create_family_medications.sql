-- Optional Family Archive Medication List for personal/family reference.
-- This is not clinical guidance; it stores owner-entered reference details.

CREATE TABLE IF NOT EXISTS public.family_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  medication_name text NOT NULL,
  dosage text,
  frequency_instructions text,
  reason text,
  prescribing_doctor text,
  pharmacy_name text,
  pharmacy_phone text,
  start_date date,
  end_date date,
  currently_taking boolean NOT NULL DEFAULT true,
  refill_number text,
  prescription_number text,
  medication_category text,
  caregiver_notes text,
  notes text,
  file_path text,
  file_url text,
  file_name text,
  file_size bigint,
  bucket_name text,
  pending_delete boolean NOT NULL DEFAULT false,
  pending_delete_at timestamptz,
  delete_processing_at timestamptz,
  delete_error text,
  delete_attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'family_medications_file_size_nonneg_chk'
      AND conrelid = 'public.family_medications'::regclass
  ) THEN
    ALTER TABLE public.family_medications
      ADD CONSTRAINT family_medications_file_size_nonneg_chk
      CHECK (file_size IS NULL OR file_size >= 0);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_medications TO authenticated;

ALTER TABLE public.family_medications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS family_medications_user_id_idx
  ON public.family_medications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS family_medications_pending_delete_idx
  ON public.family_medications (pending_delete)
  WHERE pending_delete = true;

DROP POLICY IF EXISTS "Account members can view family medications" ON public.family_medications;
CREATE POLICY "Account members can view family medications"
  ON public.family_medications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'read_only')
  );

DROP POLICY IF EXISTS "Full access can create family medications" ON public.family_medications;
CREATE POLICY "Full access can create family medications"
  ON public.family_medications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "Full access can update family medications" ON public.family_medications;
CREATE POLICY "Full access can update family medications"
  ON public.family_medications
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "Full access can delete family medications" ON public.family_medications;
CREATE POLICY "Full access can delete family medications"
  ON public.family_medications
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'full_access')
  );

DROP POLICY IF EXISTS "hide_pending_delete_family_medications" ON public.family_medications;
CREATE POLICY "hide_pending_delete_family_medications"
  ON public.family_medications
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (pending_delete = false);

DROP TRIGGER IF EXISTS update_family_medications_updated_at ON public.family_medications;
CREATE TRIGGER update_family_medications_updated_at
  BEFORE UPDATE ON public.family_medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Keep the new active application-state table aligned with the tombstone
-- deletion routine: billing/legal evidence is anonymized, active app state is purged.
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

  DELETE FROM public.family_medications WHERE user_id = p_user_id;
  DELETE FROM public.entitlements WHERE user_id = p_user_id;

  RETURN v_tombstone_id;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_data(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_user_data(uuid, text, text) TO service_role;
