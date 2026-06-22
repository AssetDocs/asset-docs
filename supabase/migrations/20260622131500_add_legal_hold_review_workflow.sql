ALTER TABLE public.account_closure_requests
  ADD COLUMN IF NOT EXISTS legal_hold_review_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (legal_hold_review_status IN ('not_required', 'needs_review', 'in_review', 'resolved')),
  ADD COLUMN IF NOT EXISTS legal_hold_assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_review_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_hold_review_notes TEXT;

ALTER TABLE public.deleted_accounts
  ADD COLUMN IF NOT EXISTS legal_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_hold_released_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_review_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (legal_hold_review_status IN ('not_required', 'needs_review', 'in_review', 'resolved')),
  ADD COLUMN IF NOT EXISTS legal_hold_assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_review_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_hold_review_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_account_closure_requests_legal_hold_review
  ON public.account_closure_requests(legal_hold_review_status, legal_hold_review_due_at)
  WHERE legal_hold = true;

CREATE INDEX IF NOT EXISTS idx_deleted_accounts_legal_hold_review
  ON public.deleted_accounts(legal_hold_review_status, legal_hold_review_due_at)
  WHERE legal_hold = true;

UPDATE public.account_closure_requests
SET
  legal_hold_review_status = 'needs_review',
  legal_hold_review_due_at = COALESCE(legal_hold_review_due_at, now() + interval '7 days')
WHERE legal_hold = true
  AND legal_hold_review_status = 'not_required';

UPDATE public.deleted_accounts
SET
  legal_hold_review_status = 'needs_review',
  legal_hold_review_due_at = COALESCE(legal_hold_review_due_at, now() + interval '7 days')
WHERE legal_hold = true
  AND legal_hold_review_status = 'not_required';

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
    legal_hold_review_status = 'needs_review',
    legal_hold_assigned_to = COALESCE(legal_hold_assigned_to, auth.uid()),
    legal_hold_review_due_at = COALESCE(legal_hold_review_due_at, now() + interval '7 days'),
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
    legal_hold_review_status = 'resolved',
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
    legal_hold_reason = NULLIF(trim(COALESCE(p_reason, '')), ''),
    legal_hold_applied_at = now(),
    legal_hold_applied_by = auth.uid(),
    legal_hold_released_at = NULL,
    legal_hold_released_by = NULL,
    legal_hold_review_status = 'needs_review',
    legal_hold_assigned_to = COALESCE(legal_hold_assigned_to, auth.uid()),
    legal_hold_review_due_at = COALESCE(legal_hold_review_due_at, now() + interval '7 days'),
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
    legal_hold_released_at = now(),
    legal_hold_released_by = auth.uid(),
    legal_hold_review_status = 'resolved',
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

CREATE OR REPLACE FUNCTION public.update_legal_hold_review(
  p_record_type text,
  p_record_id uuid,
  p_review_status text,
  p_assigned_to uuid DEFAULT NULL,
  p_review_due_at timestamptz DEFAULT NULL,
  p_review_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_id uuid;
BEGIN
  IF NOT public.has_owner_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF p_review_status NOT IN ('needs_review', 'in_review', 'resolved') THEN
    RAISE EXCEPTION 'invalid_review_status' USING ERRCODE = '22023';
  END IF;

  IF p_record_type = 'closure' THEN
    UPDATE public.account_closure_requests
    SET
      legal_hold_review_status = p_review_status,
      legal_hold_assigned_to = p_assigned_to,
      legal_hold_review_due_at = p_review_due_at,
      legal_hold_review_notes = NULLIF(trim(COALESCE(p_review_notes, '')), ''),
      updated_at = now()
    WHERE id = p_record_id
      AND legal_hold = true
    RETURNING id INTO v_updated_id;
  ELSIF p_record_type = 'deleted' THEN
    UPDATE public.deleted_accounts
    SET
      legal_hold_review_status = p_review_status,
      legal_hold_assigned_to = p_assigned_to,
      legal_hold_review_due_at = p_review_due_at,
      legal_hold_review_notes = NULLIF(trim(COALESCE(p_review_notes, '')), '')
    WHERE id = p_record_id
      AND legal_hold = true
    RETURNING id INTO v_updated_id;
  ELSE
    RAISE EXCEPTION 'invalid_record_type' USING ERRCODE = '22023';
  END IF;

  IF v_updated_id IS NULL THEN
    RAISE EXCEPTION 'legal_hold_record_not_found' USING ERRCODE = 'P0002';
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
    'legal_hold_review_updated',
    CASE WHEN p_record_type = 'closure' THEN 'account_closure_requests' ELSE 'deleted_accounts' END,
    p_record_id,
    jsonb_build_object(
      'review_status', p_review_status,
      'assigned_to', p_assigned_to,
      'review_due_at', p_review_due_at,
      'has_notes', NULLIF(trim(COALESCE(p_review_notes, '')), '') IS NOT NULL
    )
  );

  RETURN jsonb_build_object('id', v_updated_id, 'review_status', p_review_status);
END;
$$;

REVOKE ALL ON FUNCTION public.update_legal_hold_review(text, uuid, text, uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_legal_hold_review(text, uuid, text, uuid, timestamptz, text) TO authenticated;
