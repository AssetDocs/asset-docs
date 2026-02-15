
-- Add new columns to account_verification
ALTER TABLE public.account_verification
  ADD COLUMN IF NOT EXISTS has_contributors boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_documents boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_vault_encryption boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_vault_data_and_passwords boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_recovery_delegate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS milestone_count integer NOT NULL DEFAULT 0;

-- Replace compute_user_verification function with new 9-milestone logic
CREATE OR REPLACE FUNCTION public.compute_user_verification(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_verified boolean;
  v_account_age_met boolean;
  v_profile_complete boolean;
  v_has_property boolean;
  v_upload_count integer;
  v_upload_count_met boolean;
  v_has_contributors boolean;
  v_has_documents boolean;
  v_has_vault_encryption boolean;
  v_has_vault_data_and_passwords boolean;
  v_has_recovery_delegate boolean;
  v_has_vault_data boolean;
  v_has_password_entries boolean;
  v_milestone_count integer;
  v_is_verified boolean;
BEGIN
  -- Email verified (informational, not a milestone)
  SELECT COALESCE(
    (SELECT (raw_user_meta_data->>'email_verified')::boolean
     FROM auth.users WHERE id = target_user_id),
    false
  ) INTO v_email_verified;

  -- Account age >= 14 days (hard gate, not a milestone)
  SELECT COALESCE(
    (SELECT created_at <= (now() - interval '14 days')
     FROM auth.users WHERE id = target_user_id),
    false
  ) INTO v_account_age_met;

  -- Milestone 1: Profile complete (first + last name)
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id = target_user_id
      AND first_name IS NOT NULL AND first_name != ''
      AND last_name IS NOT NULL AND last_name != ''
  ) INTO v_profile_complete;

  -- Milestone 2: Has property
  SELECT EXISTS(
    SELECT 1 FROM properties WHERE user_id = target_user_id
  ) INTO v_has_property;

  -- Milestone 3: Upload count (threshold lowered to 1)
  SELECT COUNT(*)::integer INTO v_upload_count
  FROM property_files WHERE user_id = target_user_id;

  v_upload_count_met := (v_upload_count >= 1);

  -- Milestone 4: Has contributors (accepted)
  SELECT EXISTS(
    SELECT 1 FROM contributors
    WHERE account_owner_id = target_user_id AND status = 'accepted'
  ) INTO v_has_contributors;

  -- Milestone 5: MFA (computed in edge function, not here)
  -- Will be added by edge function as the 9th milestone

  -- Milestone 6: Has documents
  SELECT EXISTS(
    SELECT 1 FROM property_files
    WHERE user_id = target_user_id AND file_type = 'document'
  ) INTO v_has_documents;

  -- Milestone 7: Vault encryption enabled
  SELECT COALESCE(
    (SELECT is_encrypted FROM legacy_locker WHERE user_id = target_user_id LIMIT 1),
    false
  ) INTO v_has_vault_encryption;

  -- Milestone 8: Vault data + password entries
  SELECT EXISTS(
    SELECT 1 FROM legacy_locker
    WHERE user_id = target_user_id
      AND (full_legal_name IS NOT NULL OR executor_name IS NOT NULL)
  ) INTO v_has_vault_data;

  SELECT EXISTS(
    SELECT 1 FROM password_catalog WHERE user_id = target_user_id
  ) INTO v_has_password_entries;

  v_has_vault_data_and_passwords := (v_has_vault_data AND v_has_password_entries);

  -- Milestone 9: Recovery delegate
  SELECT EXISTS(
    SELECT 1 FROM legacy_locker
    WHERE user_id = target_user_id AND delegate_user_id IS NOT NULL
  ) INTO v_has_recovery_delegate;

  -- Count 8 milestones (MFA is the 9th, added by edge function)
  v_milestone_count := (
    v_profile_complete::int +
    v_has_property::int +
    v_upload_count_met::int +
    v_has_contributors::int +
    v_has_documents::int +
    v_has_vault_encryption::int +
    v_has_vault_data_and_passwords::int +
    v_has_recovery_delegate::int
  );

  -- is_verified computed without MFA; edge function will recompute with MFA included
  v_is_verified := v_account_age_met AND (v_milestone_count >= 5);

  RETURN jsonb_build_object(
    'email_verified', v_email_verified,
    'account_age_met', v_account_age_met,
    'profile_complete', v_profile_complete,
    'has_property', v_has_property,
    'upload_count', v_upload_count,
    'upload_count_met', v_upload_count_met,
    'has_contributors', v_has_contributors,
    'has_documents', v_has_documents,
    'has_vault_encryption', v_has_vault_encryption,
    'has_vault_data_and_passwords', v_has_vault_data_and_passwords,
    'has_recovery_delegate', v_has_recovery_delegate,
    'milestone_count', v_milestone_count,
    'is_verified', v_is_verified
  );
END;
$$;
