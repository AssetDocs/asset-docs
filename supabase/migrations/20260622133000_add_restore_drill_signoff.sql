ALTER TABLE public.restore_drill_runs
  ADD COLUMN IF NOT EXISTS signoff_status TEXT NOT NULL DEFAULT 'not_ready'
    CHECK (signoff_status IN ('not_ready', 'ready_for_review', 'signed_off', 'rejected')),
  ADD COLUMN IF NOT EXISTS signoff_notes TEXT,
  ADD COLUMN IF NOT EXISTS signed_off_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signed_off_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_restore_drill_runs_signoff
  ON public.restore_drill_runs(signoff_status, completed_at DESC);

UPDATE public.restore_drill_runs
SET signoff_status = CASE
  WHEN approved_by_user_id IS NOT NULL THEN 'signed_off'
  WHEN status IN ('passed', 'failed') THEN 'ready_for_review'
  ELSE 'not_ready'
END,
signed_off_at = CASE
  WHEN approved_by_user_id IS NOT NULL THEN COALESCE(signed_off_at, completed_at, updated_at, now())
  ELSE signed_off_at
END,
signed_off_by = COALESCE(signed_off_by, approved_by_user_id)
WHERE signoff_status = 'not_ready';

CREATE OR REPLACE FUNCTION public.sign_off_restore_drill_run(
  p_restore_drill_run_id uuid,
  p_signoff_status text,
  p_signoff_notes text DEFAULT NULL
)
RETURNS public.restore_drill_runs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.restore_drill_runs;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF p_signoff_status NOT IN ('signed_off', 'rejected') THEN
    RAISE EXCEPTION 'invalid_signoff_status' USING ERRCODE = '22023';
  END IF;

  UPDATE public.restore_drill_runs
  SET
    signoff_status = p_signoff_status,
    signoff_notes = NULLIF(trim(COALESCE(p_signoff_notes, '')), ''),
    signed_off_at = now(),
    signed_off_by = auth.uid(),
    approved_by_user_id = CASE
      WHEN p_signoff_status = 'signed_off' THEN auth.uid()
      ELSE approved_by_user_id
    END,
    updated_at = now()
  WHERE id = p_restore_drill_run_id
    AND status IN ('passed', 'failed')
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'restore_drill_run_not_ready_for_signoff' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  )
  VALUES (
    auth.uid(),
    'restore_drill_signoff_updated',
    'restore_drill_runs',
    p_restore_drill_run_id,
    jsonb_build_object(
      'signoff_status', p_signoff_status,
      'has_notes', NULLIF(trim(COALESCE(p_signoff_notes, '')), '') IS NOT NULL
    )
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.sign_off_restore_drill_run(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_off_restore_drill_run(uuid, text, text) TO authenticated;
