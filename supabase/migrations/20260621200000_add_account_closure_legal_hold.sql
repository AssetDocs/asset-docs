ALTER TABLE public.account_closure_requests
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_hold_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_hold_released_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_account_closure_requests_legal_hold
  ON public.account_closure_requests(legal_hold, deletion_scheduled_date)
  WHERE status = 'scheduled';

CREATE OR REPLACE FUNCTION public.apply_account_closure_legal_hold(
  p_closure_request_id uuid,
  p_reason text
)
RETURNS public.account_closure_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.account_closure_requests;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_closure_requests
  SET
    legal_hold = true,
    legal_hold_reason = NULLIF(trim(p_reason), ''),
    legal_hold_applied_at = now(),
    legal_hold_applied_by = auth.uid(),
    legal_hold_released_at = NULL,
    legal_hold_released_by = NULL,
    updated_at = now()
  WHERE id = p_closure_request_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'closure_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_account_closure_legal_hold(
  p_closure_request_id uuid
)
RETURNS public.account_closure_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.account_closure_requests;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_closure_requests
  SET
    legal_hold = false,
    legal_hold_released_at = now(),
    legal_hold_released_by = auth.uid(),
    updated_at = now()
  WHERE id = p_closure_request_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'closure_request_not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_deleted_account_legal_hold(
  p_deleted_account_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS public.deleted_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.deleted_accounts;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.deleted_accounts
  SET
    legal_hold = true,
    retention_purge_status = 'legal_hold'
  WHERE id = p_deleted_account_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'deleted_account_not_found' USING ERRCODE = 'P0002';
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
    'deleted_account_legal_hold_applied',
    'deleted_accounts',
    p_deleted_account_id,
    jsonb_build_object('reason', NULLIF(trim(COALESCE(p_reason, '')), ''))
  );

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_deleted_account_legal_hold(
  p_deleted_account_id uuid
)
RETURNS public.deleted_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.deleted_accounts;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.deleted_accounts
  SET
    legal_hold = false,
    retention_purge_status = CASE
      WHEN retention_purged_at IS NOT NULL THEN 'purged'
      WHEN retention_expires_at IS NOT NULL AND retention_expires_at <= now() THEN 'eligible'
      ELSE 'not_due'
    END
  WHERE id = p_deleted_account_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'deleted_account_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id
  )
  VALUES (
    auth.uid(),
    'deleted_account_legal_hold_released',
    'deleted_accounts',
    p_deleted_account_id
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_account_closure_legal_hold(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_account_closure_legal_hold(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_deleted_account_legal_hold(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_deleted_account_legal_hold(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.apply_account_closure_legal_hold(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_account_closure_legal_hold(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_deleted_account_legal_hold(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_deleted_account_legal_hold(uuid) TO authenticated;
