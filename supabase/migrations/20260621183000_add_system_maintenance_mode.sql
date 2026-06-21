-- Data lifecycle P1: global maintenance/freeze-writes mode for restores.
-- This is intentionally global operational state, not an account lifecycle state.

CREATE TABLE IF NOT EXISTS public.system_maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  reason text NOT NULL,
  message text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS idx_system_maintenance_windows_active
  ON public.system_maintenance_windows (status, starts_at DESC)
  WHERE status IN ('scheduled', 'active');

ALTER TABLE public.system_maintenance_windows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev workspace can read maintenance windows"
  ON public.system_maintenance_windows;
CREATE POLICY "Dev workspace can read maintenance windows"
  ON public.system_maintenance_windows
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev workspace can manage maintenance windows"
  ON public.system_maintenance_windows;
CREATE POLICY "Dev workspace can manage maintenance windows"
  ON public.system_maintenance_windows
  FOR ALL
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

DROP TRIGGER IF EXISTS update_system_maintenance_windows_updated_at
  ON public.system_maintenance_windows;
CREATE TRIGGER update_system_maintenance_windows_updated_at
  BEFORE UPDATE ON public.system_maintenance_windows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_system_maintenance_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.system_maintenance_windows smw
    WHERE smw.status = 'active'
      AND smw.starts_at <= now()
      AND (smw.ends_at IS NULL OR smw.ends_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.is_system_maintenance_active() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_system_maintenance_active() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_active_maintenance_mode()
RETURNS TABLE (
  is_active boolean,
  id uuid,
  reason text,
  message text,
  started_at timestamptz,
  ends_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    true,
    smw.id,
    smw.reason,
    smw.message,
    smw.starts_at,
    smw.ends_at
  FROM public.system_maintenance_windows smw
  WHERE smw.status = 'active'
    AND smw.starts_at <= now()
    AND (smw.ends_at IS NULL OR smw.ends_at > now())
  ORDER BY smw.starts_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      false,
      NULL::uuid,
      NULL::text,
      NULL::text,
      NULL::timestamptz,
      NULL::timestamptz;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_maintenance_mode() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_maintenance_mode() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.activate_maintenance_mode(
  p_reason text,
  p_message text DEFAULT NULL,
  p_ends_at timestamptz DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  ) THEN
    RAISE EXCEPTION 'Only dev workspace users can activate maintenance mode'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(trim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Maintenance reason is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_ends_at IS NOT NULL AND p_ends_at <= now() THEN
    RAISE EXCEPTION 'Maintenance end time must be in the future'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.system_maintenance_windows (
    status,
    reason,
    message,
    ends_at,
    created_by,
    metadata
  )
  VALUES (
    'active',
    trim(p_reason),
    NULLIF(trim(p_message), ''),
    p_ends_at,
    auth.uid(),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_maintenance_mode(text, text, timestamptz, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_maintenance_mode(text, text, timestamptz, jsonb) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.end_maintenance_mode(p_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  ) THEN
    RAISE EXCEPTION 'Only dev workspace users can end maintenance mode'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.system_maintenance_windows smw
  SET
    status = 'ended',
    ends_at = now(),
    ended_by = auth.uid(),
    updated_at = now()
  WHERE smw.status = 'active'
    AND smw.starts_at <= now()
    AND (smw.ends_at IS NULL OR smw.ends_at > now())
    AND (p_id IS NULL OR smw.id = p_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.end_maintenance_mode(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_maintenance_mode(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_owner_account_writable(_owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    NOT public.is_system_maintenance_active()
    AND COALESCE((
      SELECT COALESCE(p.account_status, 'active') NOT IN (
        'expired_read_only',
        'deletion_requested',
        'scheduled_for_deletion',
        'deleted',
        'inactive'
      )
      FROM public.profiles p
      WHERE p.user_id = _owner_user_id
    ), false);
$$;

REVOKE ALL ON FUNCTION public.is_owner_account_writable(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner_account_writable(uuid) TO authenticated, service_role;

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
  v_maintenance_active boolean;
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

  v_maintenance_active := public.is_system_maintenance_active();

  RETURN QUERY
  SELECT
    p_account_id,
    v_owner_user_id,
    COALESCE(v_status, 'active'),
    v_maintenance_active
      OR COALESCE(v_status, 'active') IN (
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
