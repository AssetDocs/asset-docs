
CREATE OR REPLACE FUNCTION public.compute_user_verification(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_verified boolean;
  v_account_age_met boolean;
  v_upload_count integer;
  v_upload_count_met boolean;
  v_profile_complete boolean;
  v_has_property boolean;
  v_has_contributors boolean;
  v_has_documents boolean;
  v_has_vault_encryption boolean;
  v_has_vault_data_and_passwords boolean;
  v_has_recovery_delegate boolean;
  v_milestone_count integer;
BEGIN
  -- 1. Email verified
  SELECT EXISTS(
    SELECT 1 FROM auth.users
    WHERE id = target_user_id
      AND email_confirmed_at IS NOT NULL
  ) INTO v_email_verified;

  -- 2. Account age >= 14 days
  SELECT EXISTS(
    SELECT 1 FROM auth.users
    WHERE id = target_user_id
      AND created_at <= (now() - interval '14 days')
  ) INTO v_account_age_met;

  -- 3. Upload count (items + property_files)
  SELECT (
    (SELECT count(*) FROM items WHERE user_id = target_user_id) +
    (SELECT count(*) FROM property_files WHERE user_id = target_user_id)
  ) INTO v_upload_count;
  v_upload_count_met := v_upload_count >= 10;

  -- 4. Profile complete
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE user_id = target_user_id
      AND first_name IS NOT NULL AND first_name != ''
      AND last_name IS NOT NULL AND last_name != ''
  ) INTO v_profile_complete;

  -- 5. Has property
  SELECT EXISTS(
    SELECT 1 FROM properties
    WHERE user_id = target_user_id
  ) INTO v_has_property;

  -- 6. Has contributors
  SELECT EXISTS(
    SELECT 1 FROM contributors
    WHERE account_owner_id = target_user_id
      AND status = 'accepted'
  ) INTO v_has_contributors;

  -- 7. Has documents (check user_documents, property_files with doc types, AND legacy_locker_files)
  SELECT EXISTS(
    SELECT 1 FROM user_documents WHERE user_id = target_user_id
    UNION ALL
    SELECT 1 FROM property_files WHERE user_id = target_user_id
      AND file_type IN ('document', 'pdf', 'application/pdf')
    UNION ALL
    SELECT 1 FROM legacy_locker_files WHERE user_id = target_user_id
  ) INTO v_has_documents;

  -- 8. Has vault encryption
  SELECT EXISTS(
    SELECT 1 FROM legacy_locker
    WHERE user_id = target_user_id
      AND is_encrypted = true
  ) INTO v_has_vault_encryption;

  -- 9. Has vault data and passwords (check legacy_locker fields OR password_catalog entries)
  SELECT (
    EXISTS(
      SELECT 1 FROM legacy_locker
      WHERE user_id = target_user_id
        AND (
          (full_legal_name IS NOT NULL AND full_legal_name != '')
          OR (executor_name IS NOT NULL AND executor_name != '')
          OR digital_assets IS NOT NULL
          OR (spouse_name IS NOT NULL AND spouse_name != '')
          OR (attorney_name IS NOT NULL AND attorney_name != '')
          OR (guardian_name IS NOT NULL AND guardian_name != '')
          OR (funeral_wishes IS NOT NULL AND funeral_wishes != '')
          OR (letters_to_loved_ones IS NOT NULL AND letters_to_loved_ones != '')
          OR specific_bequests IS NOT NULL
          OR general_bequests IS NOT NULL
        )
    )
    OR EXISTS(
      SELECT 1 FROM password_catalog
      WHERE user_id = target_user_id
    )
  ) INTO v_has_vault_data_and_passwords;

  -- 10. Has recovery delegate
  SELECT EXISTS(
    SELECT 1 FROM legacy_locker
    WHERE user_id = target_user_id
      AND delegate_user_id IS NOT NULL
  ) INTO v_has_recovery_delegate;

  -- Count milestones (excluding MFA which is checked in the edge function)
  v_milestone_count := 0;
  IF v_email_verified THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_upload_count_met THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_profile_complete THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_property THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_contributors THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_documents THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_vault_encryption THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_vault_data_and_passwords THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_recovery_delegate THEN v_milestone_count := v_milestone_count + 1; END IF;

  RETURN jsonb_build_object(
    'email_verified', v_email_verified,
    'account_age_met', v_account_age_met,
    'upload_count', v_upload_count,
    'upload_count_met', v_upload_count_met,
    'profile_complete', v_profile_complete,
    'has_property', v_has_property,
    'has_contributors', v_has_contributors,
    'has_documents', v_has_documents,
    'has_vault_encryption', v_has_vault_encryption,
    'has_vault_data_and_passwords', v_has_vault_data_and_passwords,
    'has_recovery_delegate', v_has_recovery_delegate,
    'milestone_count', v_milestone_count
  );
END;
$$;
