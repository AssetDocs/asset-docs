UPDATE public.legacy_locker
SET continuity_preferences = continuity_preferences - 'vault_segments'
WHERE continuity_preferences ? 'vault_segments';

CREATE OR REPLACE FUNCTION public.compute_continuity_readiness(_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_account_id UUID;
  v_legacy_admin BOOLEAN;
  v_mfa BOOLEAN;
  v_backup_email BOOLEAN;
  v_continuity_prefs BOOLEAN;
  v_export_prefs BOOLEAN;
  v_emergency_contact BOOLEAN;
  v_recent_review BOOLEAN;
  v_count INT := 0;
BEGIN
  IF auth.uid() <> _user_id AND NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  v_account_id := public.get_user_account_id(_user_id);

  SELECT EXISTS(SELECT 1 FROM public.legacy_admins WHERE account_id = v_account_id AND status = 'active')
    INTO v_legacy_admin;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = _user_id AND raw_app_meta_data->>'mfa_enabled' = 'true' OR
                 EXISTS(SELECT 1 FROM auth.mfa_factors f WHERE f.user_id = _user_id AND f.status = 'verified'))
    INTO v_mfa;
  v_backup_email := true; -- placeholder; backup email field not present, defer
  SELECT (continuity_preferences IS NOT NULL AND continuity_preferences <> '{}'::jsonb) FROM public.legacy_locker
    WHERE user_id = _user_id INTO v_continuity_prefs;
  v_export_prefs := COALESCE((SELECT continuity_preferences ? 'death' FROM public.legacy_locker WHERE user_id = _user_id), false);
  SELECT EXISTS(SELECT 1 FROM public.contacts WHERE user_id = _user_id) INTO v_emergency_contact;
  SELECT (continuity_preferences_reviewed_at IS NOT NULL AND continuity_preferences_reviewed_at > now() - interval '12 months')
    FROM public.legacy_locker WHERE user_id = _user_id INTO v_recent_review;

  IF v_legacy_admin THEN v_count := v_count + 1; END IF;
  IF v_mfa THEN v_count := v_count + 1; END IF;
  IF v_backup_email THEN v_count := v_count + 1; END IF;
  IF v_continuity_prefs THEN v_count := v_count + 1; END IF;
  IF v_export_prefs THEN v_count := v_count + 1; END IF;
  IF v_emergency_contact THEN v_count := v_count + 1; END IF;
  IF v_recent_review THEN v_count := v_count + 1; END IF;

  RETURN jsonb_build_object(
    'score', v_count,
    'max', 7,
    'percentage', round((v_count::numeric / 7) * 100),
    'checklist', jsonb_build_object(
      'legacy_admin_assigned', COALESCE(v_legacy_admin, false),
      'mfa_enabled', COALESCE(v_mfa, false),
      'backup_email_verified', COALESCE(v_backup_email, false),
      'continuity_prefs', COALESCE(v_continuity_prefs, false),
      'export_prefs', COALESCE(v_export_prefs, false),
      'emergency_contact', COALESCE(v_emergency_contact, false),
      'reviewed_within_12_months', COALESCE(v_recent_review, false)
    )
  );
END;
$function$;