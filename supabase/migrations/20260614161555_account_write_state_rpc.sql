-- M6 launch fix: expose active workspace writability without exposing owner billing details.
CREATE OR REPLACE FUNCTION public.get_account_write_state(p_account_id uuid)
RETURNS TABLE (
  account_id uuid,
  owner_user_id uuid,
  owner_account_status text,
  is_read_only boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_user_id uuid;
  v_status text;
BEGIN
  SELECT a.owner_user_id
    INTO v_owner_user_id
  FROM public.accounts a
  JOIN public.account_memberships m
    ON m.account_id = a.id
   AND m.user_id = auth.uid()
   AND m.status = 'active'
  WHERE a.id = p_account_id;

  IF v_owner_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(p.account_status, 'active')
    INTO v_status
  FROM public.profiles p
  WHERE p.user_id = v_owner_user_id;

  RETURN QUERY
  SELECT
    p_account_id,
    v_owner_user_id,
    COALESCE(v_status, 'active'),
    COALESCE(v_status, 'active') IN (
      'expired_read_only',
      'deletion_requested',
      'scheduled_for_deletion',
      'deleted',
      'inactive'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_account_write_state(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_account_write_state(uuid) TO authenticated;
