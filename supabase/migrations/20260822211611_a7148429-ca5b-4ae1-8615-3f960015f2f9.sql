-- 1) Narrow, explicit validator for the system-maintained recovery mirror.
CREATE OR REPLACE FUNCTION public.validate_legacy_locker_delegate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_trusted boolean := COALESCE(current_setting('app.legacy_admin_sync', true), '') = 'on'
                       OR public.is_service_role();
  v_active_admin uuid;
BEGIN
  -- Always reject self-designation.
  IF NEW.delegate_user_id IS NOT NULL AND NEW.delegate_user_id = NEW.user_id THEN
    RAISE EXCEPTION 'delegate_user_id cannot equal user_id';
  END IF;

  IF NOT v_trusted THEN
    IF TG_OP = 'INSERT' AND NEW.delegate_user_id IS NOT NULL THEN
      -- Allowed only when it equals the single active Legacy Admin for this owner's account,
      -- i.e. the value the BEFORE INSERT seed trigger just populated.
      SELECT la.legacy_admin_user_id INTO v_active_admin
        FROM public.legacy_admins la
        JOIN public.accounts a ON a.id = la.account_id
       WHERE a.owner_user_id = NEW.user_id
         AND la.status = 'active'
       LIMIT 1;

      IF v_active_admin IS NULL OR v_active_admin <> NEW.delegate_user_id THEN
        RAISE EXCEPTION 'Secure Vault recovery participant is system-maintained: assign a Legacy Admin instead'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.delegate_user_id IS DISTINCT FROM OLD.delegate_user_id THEN
      RAISE EXCEPTION 'Secure Vault recovery participant is system-maintained: assign a Legacy Admin instead'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Record when the mirror cannot exist yet (no vault row) vs. was written.
CREATE OR REPLACE FUNCTION public.assign_legacy_admin(_account_id uuid, _user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_owner uuid;
  v_prev  uuid;
  v_id    uuid;
  v_mirrored integer := 0;
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

  -- Keep the Secure Vault recovery pointer in sync (system-maintained mirror).
  UPDATE public.legacy_locker
     SET delegate_user_id = _user_id, updated_at = now()
   WHERE user_id = v_owner;
  GET DIAGNOSTICS v_mirrored = ROW_COUNT;

  INSERT INTO public.user_activity_logs
    (user_id, actor_user_id, actor_type, action_type, action_category, resource_type, resource_id, details)
  VALUES
    (v_owner, v_owner, 'owner', 'legacy_admin_assigned', 'security', 'legacy_admin', _user_id::text,
     jsonb_build_object(
       'account_id', _account_id,
       'previous_legacy_admin', v_prev,
       'mirror_pending', (v_mirrored = 0)
     ));

  RETURN v_id;
END;
$function$;
