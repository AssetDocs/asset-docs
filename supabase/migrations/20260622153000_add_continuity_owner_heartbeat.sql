ALTER TABLE public.legacy_locker
  ADD COLUMN IF NOT EXISTS continuity_heartbeat_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS continuity_heartbeat_interval_days INTEGER NOT NULL DEFAULT 90
    CHECK (continuity_heartbeat_interval_days IN (30, 60, 90, 180, 365)),
  ADD COLUMN IF NOT EXISTS continuity_last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS continuity_next_heartbeat_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS continuity_heartbeat_status TEXT NOT NULL DEFAULT 'disabled'
    CHECK (continuity_heartbeat_status IN ('disabled', 'current', 'due', 'overdue'));

CREATE INDEX IF NOT EXISTS idx_legacy_locker_continuity_heartbeat_due
  ON public.legacy_locker(continuity_heartbeat_status, continuity_next_heartbeat_due_at)
  WHERE continuity_heartbeat_enabled = true;

CREATE OR REPLACE FUNCTION public.record_continuity_owner_heartbeat(
  _user_id UUID DEFAULT auth.uid()
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locker RECORD;
  v_next TIMESTAMPTZ;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id AND NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT id, continuity_heartbeat_enabled, continuity_heartbeat_interval_days
  INTO v_locker
  FROM public.legacy_locker
  WHERE user_id = _user_id
  FOR UPDATE;

  IF v_locker.id IS NULL THEN
    RAISE EXCEPTION 'Legacy locker not found';
  END IF;

  v_next := now() + make_interval(days => COALESCE(v_locker.continuity_heartbeat_interval_days, 90));

  UPDATE public.legacy_locker
  SET continuity_last_heartbeat_at = now(),
      continuity_next_heartbeat_due_at = CASE WHEN continuity_heartbeat_enabled THEN v_next ELSE NULL END,
      continuity_heartbeat_status = CASE WHEN continuity_heartbeat_enabled THEN 'current' ELSE 'disabled' END,
      continuity_preferences_reviewed_at = now(),
      updated_at = now()
  WHERE id = v_locker.id;

  RETURN jsonb_build_object(
    'success', true,
    'last_heartbeat_at', now(),
    'next_heartbeat_due_at', CASE WHEN v_locker.continuity_heartbeat_enabled THEN v_next ELSE NULL END,
    'heartbeat_enabled', v_locker.continuity_heartbeat_enabled
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_continuity_heartbeat_status()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.legacy_locker
  SET continuity_heartbeat_status = CASE
        WHEN continuity_heartbeat_enabled = false THEN 'disabled'
        WHEN continuity_next_heartbeat_due_at IS NULL THEN 'due'
        WHEN continuity_next_heartbeat_due_at < now() - interval '14 days' THEN 'overdue'
        WHEN continuity_next_heartbeat_due_at <= now() THEN 'due'
        ELSE 'current'
      END,
      updated_at = updated_at
  WHERE continuity_heartbeat_enabled = true
     OR continuity_heartbeat_status <> 'disabled';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_continuity_heartbeat_report()
RETURNS TABLE (
  user_id UUID,
  heartbeat_status TEXT,
  last_heartbeat_at TIMESTAMPTZ,
  next_heartbeat_due_at TIMESTAMPTZ,
  days_overdue NUMERIC,
  interval_days INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  PERFORM public.refresh_continuity_heartbeat_status();

  RETURN QUERY
  SELECT
    l.user_id,
    l.continuity_heartbeat_status,
    l.continuity_last_heartbeat_at,
    l.continuity_next_heartbeat_due_at,
    CASE
      WHEN l.continuity_next_heartbeat_due_at IS NULL OR l.continuity_next_heartbeat_due_at > now() THEN NULL
      ELSE ROUND((EXTRACT(EPOCH FROM (now() - l.continuity_next_heartbeat_due_at)) / 86400)::NUMERIC, 1)
    END AS days_overdue,
    l.continuity_heartbeat_interval_days
  FROM public.legacy_locker l
  WHERE l.continuity_heartbeat_enabled = true
    AND l.continuity_heartbeat_status IN ('due', 'overdue')
  ORDER BY l.continuity_next_heartbeat_due_at ASC NULLS FIRST;
END;
$$;

REVOKE ALL ON FUNCTION public.record_continuity_owner_heartbeat(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_continuity_heartbeat_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_continuity_heartbeat_report() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_continuity_owner_heartbeat(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_continuity_heartbeat_status() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_continuity_heartbeat_report() TO authenticated, service_role;
