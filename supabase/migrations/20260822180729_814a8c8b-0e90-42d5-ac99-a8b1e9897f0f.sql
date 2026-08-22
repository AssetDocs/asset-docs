-- =========================================================
-- Recovery Delegate -> Legacy Admin consolidation
-- =========================================================

-- 1. Eligibility helper: active Full Access authorized user of the account
CREATE OR REPLACE FUNCTION public.is_eligible_legacy_admin(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_memberships m
    WHERE m.user_id = _user_id
      AND m.account_id = _account_id
      AND m.role = 'full_access'::membership_role
      AND m.status = 'active'
      AND m.accepted_at IS NOT NULL
      AND m.revoked_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_eligible_legacy_admin(uuid, uuid) TO authenticated, service_role;

-- 2. Revocation of recovery artifacts tied to a former Legacy Admin
CREATE OR REPLACE FUNCTION public.revoke_legacy_admin_recovery_artifacts(_owner_user_id uuid, _admin_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.legacy_admin_sync', 'on', true);

  UPDATE public.vault_delegate_grants
     SET status = 'revoked', revoked_at = now()
   WHERE owner_user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id
     AND status = 'active';

  UPDATE public.recovery_requests
     SET status = 'revoked',
         responded_at = COALESCE(responded_at, now())
   WHERE owner_user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id
     AND status IN ('pending', 'approved', 'grace_period_expired', 'acknowledged');

  UPDATE public.legacy_locker
     SET recovery_status = NULL,
         recovery_requested_at = NULL,
         updated_at = now()
   WHERE user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_legacy_admin_recovery_artifacts(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_legacy_admin_recovery_artifacts(uuid, uuid) TO service_role;

-- 3. Assignment RPC (single authority)
CREATE OR REPLACE FUNCTION public.assign_legacy_admin(_account_id uuid, _user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_prev  uuid;
  v_id    uuid;
BEGIN
  SELECT owner_user_id INTO v_owner FROM public.accounts WHERE id = _account_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> v_owner THEN
    RAISE EXCEPTION 'Only the account owner may assign a Legacy Admin' USING ERRCODE = '42501';
  END IF;
  IF _user_id = v_owner THEN
    RAISE EXCEPTION 'The account owner cannot be their own Legacy Admin' USING ERRCODE = '22023';
  END IF;
  IF NOT public.is_eligible_legacy_admin(_user_id, _account_id) THEN
    RAISE EXCEPTION 'Legacy Admin must be an active Full Access authorized user of this account'
      USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('app.legacy_admin_sync', 'on', true);

  SELECT legacy_admin_user_id INTO v_prev
    FROM public.legacy_admins
   WHERE account_id = _account_id AND status = 'active'
   LIMIT 1;

  IF v_prev IS NOT NULL AND v_prev <> _user_id THEN
    PERFORM public.revoke_legacy_admin_recovery_artifacts(v_owner, v_prev);
  END IF;

  UPDATE public.legacy_admins
     SET status = 'removed', updated_at = now()
   WHERE account_id = _account_id
     AND status = 'active'
     AND legacy_admin_user_id <> _user_id;

  UPDATE public.legacy_admins
     SET status = 'active',
         assigned_by_owner_id = v_owner,
         assigned_at = now(),
         updated_at = now()
   WHERE account_id = _account_id
     AND legacy_admin_user_id = _user_id
   RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    INSERT INTO public.legacy_admins (account_id, legacy_admin_user_id, assigned_by_owner_id, status)
    VALUES (_account_id, _user_id, v_owner, 'active')
    RETURNING id INTO v_id;
  END IF;

  -- Keep the Secure Vault recovery pointer in sync (system-maintained mirror)
  UPDATE public.legacy_locker
     SET delegate_user_id = _user_id, updated_at = now()
   WHERE user_id = v_owner;

  INSERT INTO public.user_activity_logs
    (user_id, actor_user_id, actor_type, action_type, action_category, resource_type, resource_id, details)
  VALUES
    (v_owner, v_owner, 'owner', 'legacy_admin_assigned', 'security', 'legacy_admin', _user_id::text,
     jsonb_build_object('account_id', _account_id, 'previous_legacy_admin', v_prev));

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_legacy_admin(uuid, uuid) TO authenticated;

-- 4. Clear RPC
CREATE OR REPLACE FUNCTION public.clear_legacy_admin(_account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_prev  uuid;
BEGIN
  SELECT owner_user_id INTO v_owner FROM public.accounts WHERE id = _account_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> v_owner THEN
    RAISE EXCEPTION 'Only the account owner may clear the Legacy Admin' USING ERRCODE = '42501';
  END IF;

  SELECT legacy_admin_user_id INTO v_prev
    FROM public.legacy_admins
   WHERE account_id = _account_id AND status = 'active'
   LIMIT 1;

  IF v_prev IS NULL THEN
    RETURN false;
  END IF;

  PERFORM set_config('app.legacy_admin_sync', 'on', true);
  PERFORM public.revoke_legacy_admin_recovery_artifacts(v_owner, v_prev);

  UPDATE public.legacy_admins
     SET status = 'removed', updated_at = now()
   WHERE account_id = _account_id AND status = 'active';

  UPDATE public.legacy_locker
     SET delegate_user_id = NULL, updated_at = now()
   WHERE user_id = v_owner;

  INSERT INTO public.user_activity_logs
    (user_id, actor_user_id, actor_type, action_type, action_category, resource_type, resource_id, details)
  VALUES
    (v_owner, v_owner, 'owner', 'legacy_admin_cleared', 'security', 'legacy_admin', v_prev::text,
     jsonb_build_object('account_id', _account_id));

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.clear_legacy_admin(uuid) TO authenticated;

-- 5. Automatic clearing when the AU loses eligibility
CREATE OR REPLACE FUNCTION public.enforce_legacy_admin_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid;
  v_acct  uuid;
  v_owner uuid;
BEGIN
  v_uid  := COALESCE(NEW.user_id, OLD.user_id);
  v_acct := COALESCE(NEW.account_id, OLD.account_id);

  IF EXISTS (
    SELECT 1 FROM public.legacy_admins
     WHERE account_id = v_acct AND legacy_admin_user_id = v_uid AND status = 'active'
  ) AND NOT public.is_eligible_legacy_admin(v_uid, v_acct) THEN

    SELECT owner_user_id INTO v_owner FROM public.accounts WHERE id = v_acct;

    PERFORM set_config('app.legacy_admin_sync', 'on', true);

    UPDATE public.legacy_admins
       SET status = 'removed', updated_at = now()
     WHERE account_id = v_acct AND legacy_admin_user_id = v_uid AND status = 'active';

    UPDATE public.legacy_locker
       SET delegate_user_id = NULL, updated_at = now()
     WHERE user_id = v_owner AND delegate_user_id = v_uid;

    PERFORM public.revoke_legacy_admin_recovery_artifacts(v_owner, v_uid);

    INSERT INTO public.user_activity_logs
      (user_id, actor_user_id, actor_type, action_type, action_category, resource_type, resource_id, details)
    VALUES
      (v_owner, COALESCE(auth.uid(), v_owner), 'system',
       'legacy_admin_removed_due_to_au_ineligibility', 'security', 'legacy_admin', v_uid::text,
       jsonb_build_object('account_id', v_acct, 'trigger_op', TG_OP));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_legacy_admin_eligibility ON public.account_memberships;
CREATE TRIGGER trg_enforce_legacy_admin_eligibility
AFTER UPDATE OR DELETE ON public.account_memberships
FOR EACH ROW EXECUTE FUNCTION public.enforce_legacy_admin_eligibility();

-- 6. One Legacy Admin maximum per account
CREATE UNIQUE INDEX IF NOT EXISTS legacy_admins_one_active_per_account
  ON public.legacy_admins (account_id)
  WHERE status = 'active';

-- 7. legacy_locker.delegate_user_id becomes a protected mirror
CREATE OR REPLACE FUNCTION public.validate_legacy_locker_delegate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trusted boolean := COALESCE(current_setting('app.legacy_admin_sync', true), '') = 'on'
                       OR public.is_service_role();
BEGIN
  IF NEW.delegate_user_id IS NOT NULL AND NEW.delegate_user_id = NEW.user_id THEN
    RAISE EXCEPTION 'delegate_user_id cannot equal user_id';
  END IF;

  IF NOT v_trusted THEN
    IF TG_OP = 'INSERT' AND NEW.delegate_user_id IS NOT NULL THEN
      RAISE EXCEPTION 'Secure Vault recovery participant is system-maintained: assign a Legacy Admin instead'
        USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.delegate_user_id IS DISTINCT FROM OLD.delegate_user_id THEN
      RAISE EXCEPTION 'Secure Vault recovery participant is system-maintained: assign a Legacy Admin instead'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 8. Recovery request guard honours the controlled sync context
CREATE OR REPLACE FUNCTION public.recovery_requests_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_service boolean := public.is_service_role()
                          OR COALESCE(current_setting('app.legacy_admin_sync', true), '') = 'on';
BEGIN
  IF NEW.legacy_locker_id IS DISTINCT FROM OLD.legacy_locker_id
     OR NEW.owner_user_id   IS DISTINCT FROM OLD.owner_user_id
     OR NEW.delegate_user_id IS DISTINCT FROM OLD.delegate_user_id
     OR NEW.requested_at    IS DISTINCT FROM OLD.requested_at
     OR NEW.grace_period_ends_at IS DISTINCT FROM OLD.grace_period_ends_at THEN
    RAISE EXCEPTION 'recovery_requests: identity/timeline columns are immutable'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF v_is_service THEN
      IF NOT (
        (OLD.status = 'pending'  AND NEW.status IN ('approved','rejected','grace_period_expired','revoked')) OR
        (OLD.status = 'approved' AND NEW.status IN ('acknowledged','revoked','grace_period_expired')) OR
        (OLD.status = 'grace_period_expired' AND NEW.status IN ('acknowledged','revoked')) OR
        (OLD.status = 'acknowledged' AND NEW.status = 'revoked')
      ) THEN
        RAISE EXCEPTION 'recovery_requests: illegal status transition % -> %', OLD.status, NEW.status
          USING ERRCODE = '42501';
      END IF;
    ELSE
      IF NOT (OLD.status = 'pending' AND NEW.status IN ('approved','rejected')) THEN
        RAISE EXCEPTION 'recovery_requests: only service role may set status %', NEW.status
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 9. Recovery requests may only be opened by the current Legacy Admin (fails closed on desync)
DROP POLICY IF EXISTS "Delegates can submit recovery requests" ON public.recovery_requests;
CREATE POLICY "Legacy admin submits recovery requests"
ON public.recovery_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = delegate_user_id
  AND EXISTS (
    SELECT 1
    FROM public.legacy_locker ll
    JOIN public.accounts a ON a.owner_user_id = ll.user_id
    JOIN public.legacy_admins la
      ON la.account_id = a.id
     AND la.status = 'active'
     AND la.legacy_admin_user_id = auth.uid()
    WHERE ll.id = recovery_requests.legacy_locker_id
      AND ll.user_id = recovery_requests.owner_user_id
      AND ll.delegate_user_id = auth.uid()
  )
);

-- 10. Legacy Admin records are written exclusively through the definer RPCs
DROP POLICY IF EXISTS "Owner assigns legacy admin" ON public.legacy_admins;
DROP POLICY IF EXISTS "Owner updates legacy admin" ON public.legacy_admins;
DROP POLICY IF EXISTS "Owner deletes legacy admin" ON public.legacy_admins;
REVOKE INSERT, UPDATE, DELETE ON public.legacy_admins FROM authenticated;
GRANT SELECT ON public.legacy_admins TO authenticated;
GRANT ALL ON public.legacy_admins TO service_role;

-- 11. Retire secondary Legacy Admin architecture and the unused delegate key field
DROP TABLE IF EXISTS public.continuity_secondary_legacy_admins;
ALTER TABLE public.legacy_locker DROP COLUMN IF EXISTS encryption_key_encrypted_for_delegate;

-- 12. Verification milestone: Legacy Admin instead of Recovery Delegate
ALTER TABLE public.account_verification
  RENAME COLUMN has_recovery_delegate TO has_legacy_admin;

CREATE OR REPLACE FUNCTION public.compute_user_verification(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

  SELECT EXISTS(
    SELECT 1 FROM contributors
    WHERE account_owner_id = target_user_id AND status = 'accepted'
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