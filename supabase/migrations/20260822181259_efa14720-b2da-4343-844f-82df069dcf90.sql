CREATE OR REPLACE FUNCTION public.seed_legacy_locker_legacy_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid;
BEGIN
  IF NEW.delegate_user_id IS NULL THEN
    SELECT la.legacy_admin_user_id INTO v_admin
      FROM public.legacy_admins la
      JOIN public.accounts a ON a.id = la.account_id
     WHERE a.owner_user_id = NEW.user_id
       AND la.status = 'active'
     LIMIT 1;

    IF v_admin IS NOT NULL AND v_admin <> NEW.user_id THEN
      NEW.delegate_user_id := v_admin;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_legacy_locker_legacy_admin ON public.legacy_locker;
CREATE TRIGGER trg_seed_legacy_locker_legacy_admin
BEFORE INSERT ON public.legacy_locker
FOR EACH ROW EXECUTE FUNCTION public.seed_legacy_locker_legacy_admin();