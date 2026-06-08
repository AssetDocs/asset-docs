
-- Add canceled_at/revoked_at timestamps for audit + helper RPC to clear last_used_account_id on revoke.

ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

ALTER TABLE public.account_memberships
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS role_changed_at timestamptz;

CREATE OR REPLACE FUNCTION public.clear_last_used_account_if_revoked(_user_id uuid, _account_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_other boolean;
  own_account uuid;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.account_memberships
    WHERE user_id = _user_id
      AND account_id = _account_id
      AND status = 'active'
  ) INTO has_other;

  IF has_other THEN
    RETURN;
  END IF;

  SELECT id INTO own_account FROM public.accounts WHERE owner_user_id = _user_id LIMIT 1;

  UPDATE public.profiles
     SET last_used_account_id = own_account
   WHERE user_id = _user_id
     AND last_used_account_id = _account_id;
END;
$$;

REVOKE ALL ON FUNCTION public.clear_last_used_account_if_revoked(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_last_used_account_if_revoked(uuid, uuid) TO service_role;
