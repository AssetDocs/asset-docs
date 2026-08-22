-- Stage 1a: repoint the Authorized User verification milestone to account_memberships
CREATE OR REPLACE FUNCTION public.compute_user_verification(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_has_legacy_admin boolean;
  v_milestone_count integer;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users
    WHERE id = target_user_id AND email_confirmed_at IS NOT NULL
  ) INTO v_email_verified;

  SELECT EXISTS(
    SELECT 1 FROM auth.users
    WHERE id = target_user_id AND created_at <= (now() - interval '14 days')
  ) INTO v_account_age_met;

  SELECT (
    (SELECT count(*) FROM items WHERE user_id = target_user_id) +
    (SELECT count(*) FROM property_files WHERE user_id = target_user_id)
  ) INTO v_upload_count;
  v_upload_count_met := v_upload_count >= 10;

  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE user_id = target_user_id
      AND first_name IS NOT NULL AND first_name != ''
      AND last_name IS NOT NULL AND last_name != ''
  ) INTO v_profile_complete;

  SELECT EXISTS(
    SELECT 1 FROM properties WHERE user_id = target_user_id
  ) INTO v_has_property;

  -- Authorized Users are tracked in account_memberships (Full Access / Read Only).
  -- The legacy contributors table is retired and is no longer consulted here.
  SELECT EXISTS(
    SELECT 1
    FROM account_memberships am
    JOIN accounts a ON a.id = am.account_id
    WHERE a.owner_user_id = target_user_id
      AND am.status = 'active'
      AND am.role <> 'owner'
  ) INTO v_has_contributors;

  SELECT EXISTS(
    SELECT 1 FROM user_documents WHERE user_id = target_user_id
    UNION ALL
    SELECT 1 FROM property_files WHERE user_id = target_user_id
      AND file_type IN ('document', 'pdf', 'application/pdf')
    UNION ALL
    SELECT 1 FROM legacy_locker_files WHERE user_id = target_user_id
  ) INTO v_has_documents;

  SELECT EXISTS(
    SELECT 1 FROM legacy_locker
    WHERE user_id = target_user_id AND is_encrypted = true
  ) INTO v_has_vault_encryption;

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
      SELECT 1 FROM password_catalog WHERE user_id = target_user_id
    )
  ) INTO v_has_vault_data_and_passwords;

  -- Legacy Admin designation (replaces the retired Recovery Delegate milestone)
  SELECT EXISTS(
    SELECT 1
    FROM legacy_admins la
    JOIN accounts a ON a.id = la.account_id
    WHERE a.owner_user_id = target_user_id
      AND la.status = 'active'
  ) INTO v_has_legacy_admin;

  v_milestone_count := 0;
  IF v_email_verified THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_upload_count_met THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_profile_complete THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_property THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_contributors THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_documents THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_vault_encryption THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_vault_data_and_passwords THEN v_milestone_count := v_milestone_count + 1; END IF;
  IF v_has_legacy_admin THEN v_milestone_count := v_milestone_count + 1; END IF;

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
    'has_legacy_admin', v_has_legacy_admin,
    'milestone_count', v_milestone_count
  );
END;
$function$;

-- Stage 1b: close the legacy contributor read path into Secure Vault data.
-- Each table keeps its owner-scoped "Users can view their own ..." SELECT policy,
-- so owner access is unaffected. Legacy Admin recovery is unchanged (it flows
-- through the recovery-request path and service-role edge functions).
DROP POLICY IF EXISTS "Administrator contributors can view legacy locker" ON public.legacy_locker;
DROP POLICY IF EXISTS "Administrator contributors can view legacy locker files" ON public.legacy_locker_files;
DROP POLICY IF EXISTS "Administrator contributors can view legacy locker folders" ON public.legacy_locker_folders;
DROP POLICY IF EXISTS "Administrator contributors can view voice notes" ON public.legacy_locker_voice_notes;
DROP POLICY IF EXISTS "Administrator contributors can view voice note attachments" ON public.voice_note_attachments;
DROP POLICY IF EXISTS "Administrator contributors can view trust information" ON public.trust_information;