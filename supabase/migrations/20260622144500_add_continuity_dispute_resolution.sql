ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS owner_dispute_resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS owner_dispute_resolved_by UUID,
  ADD COLUMN IF NOT EXISTS owner_dispute_resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS owner_dispute_resolution_outcome TEXT
    CHECK (
      owner_dispute_resolution_outcome IS NULL
      OR owner_dispute_resolution_outcome IN (
        'owner_confirmed',
        'requester_confirmed',
        'insufficient_evidence',
        'duplicate_or_mistaken',
        'other'
      )
    );

CREATE INDEX IF NOT EXISTS idx_account_continuity_requests_owner_disputes
  ON public.account_continuity_requests(owner_dispute_status, owner_disputed_at)
  WHERE owner_dispute_status = 'disputed';

CREATE OR REPLACE FUNCTION public.apply_owner_dispute_freeze(
  _request_id UUID,
  _reason TEXT,
  _applied_by UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_freeze_id UUID;
BEGIN
  SELECT r.id, r.account_id, a.owner_user_id INTO v_request
  FROM public.account_continuity_requests r
  JOIN public.accounts a ON a.id = r.account_id
  WHERE r.id = _request_id
  FOR UPDATE;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Continuity request not found';
  END IF;
  IF NOT (
    public.has_dev_workspace_access(auth.uid())
    OR public.is_service_role()
    OR auth.uid() = v_request.owner_user_id
    OR (auth.uid() IS NULL AND _applied_by = v_request.owner_user_id)
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_freeze_id
  FROM public.continuity_account_freezes
  WHERE request_id = _request_id
    AND freeze_type = 'legal_dispute'
    AND status = 'active'
  ORDER BY applied_at DESC
  LIMIT 1;

  IF v_freeze_id IS NULL THEN
    INSERT INTO public.continuity_account_freezes (
      account_id,
      request_id,
      freeze_type,
      reason,
      applied_by
    )
    VALUES (
      v_request.account_id,
      _request_id,
      'legal_dispute',
      COALESCE(NULLIF(trim(_reason), ''), 'Owner disputed continuity request'),
      COALESCE(_applied_by, auth.uid())
    )
    RETURNING id INTO v_freeze_id;
  END IF;

  UPDATE public.accounts
  SET account_freeze_status = 'active',
      account_freeze_type = 'legal_dispute',
      updated_at = now()
  WHERE id = v_request.account_id;

  UPDATE public.account_continuity_requests
  SET freeze_status = 'active',
      freeze_type = 'legal_dispute',
      freeze_reason = COALESCE(NULLIF(trim(_reason), ''), 'Owner disputed continuity request'),
      freeze_applied_at = COALESCE(freeze_applied_at, now()),
      freeze_applied_by = COALESCE(freeze_applied_by, _applied_by, auth.uid()),
      updated_at = now()
  WHERE id = _request_id;

  RETURN v_freeze_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_continuity_dispute(_token TEXT, _reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token RECORD;
  v_account_id UUID;
BEGIN
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Dispute reason is required';
  END IF;

  SELECT * INTO v_token FROM public.continuity_owner_dispute_tokens
    WHERE token_hash = encode(digest(_token, 'sha256'), 'hex')
    FOR UPDATE;

  IF v_token.id IS NULL THEN
    RAISE EXCEPTION 'Invalid dispute token';
  END IF;
  IF v_token.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Dispute token already used';
  END IF;
  IF v_token.expires_at < now() THEN
    RAISE EXCEPTION 'Dispute token expired';
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> v_token.owner_user_id THEN
    RAISE EXCEPTION 'Dispute token belongs to a different user';
  END IF;

  v_account_id := v_token.account_id;

  UPDATE public.continuity_owner_dispute_tokens
    SET used_at = now()
    WHERE id = v_token.id;

  UPDATE public.account_continuity_requests
    SET owner_dispute_status = 'disputed',
        owner_disputed_at = now(),
        owner_dispute_reason = _reason,
        owner_dispute_resolved_at = NULL,
        owner_dispute_resolved_by = NULL,
        owner_dispute_resolution_notes = NULL,
        owner_dispute_resolution_outcome = NULL,
        status = 'escalated',
        risk_flags = COALESCE(risk_flags,'{}'::jsonb) || jsonb_build_object('owner_disputed', true),
        updated_at = now()
    WHERE id = v_token.request_id;

  PERFORM public.apply_owner_dispute_freeze(
    v_token.request_id,
    'Owner disputed continuity request: ' || _reason,
    v_token.owner_user_id
  );

  BEGIN
    PERFORM public.log_continuity_event(v_token.request_id, 'owner_disputed_request',
      'Account owner disputed the continuity request and legal dispute freeze was applied',
      jsonb_build_object('reason', _reason, 'freeze_type', 'legal_dispute'), v_account_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object('success', true, 'request_id', v_token.request_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_continuity_dispute_for_case(
  _request_id UUID,
  _reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Dispute reason is required';
  END IF;

  SELECT r.id, r.account_id, a.owner_user_id
  INTO v_request
  FROM public.account_continuity_requests r
  JOIN public.accounts a ON a.id = r.account_id
  WHERE r.id = _request_id
  FOR UPDATE;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Continuity request not found';
  END IF;
  IF v_request.owner_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the account owner can dispute this request' USING ERRCODE = '42501';
  END IF;

  UPDATE public.account_continuity_requests
    SET owner_dispute_status = 'disputed',
        owner_disputed_at = now(),
        owner_dispute_reason = _reason,
        owner_dispute_resolved_at = NULL,
        owner_dispute_resolved_by = NULL,
        owner_dispute_resolution_notes = NULL,
        owner_dispute_resolution_outcome = NULL,
        status = 'escalated',
        risk_flags = COALESCE(risk_flags,'{}'::jsonb) || jsonb_build_object('owner_disputed', true),
        updated_at = now()
    WHERE id = _request_id;

  PERFORM public.apply_owner_dispute_freeze(
    _request_id,
    'Owner disputed continuity request: ' || _reason,
    auth.uid()
  );

  BEGIN
    PERFORM public.log_continuity_event(_request_id, 'owner_disputed_request',
      'Account owner disputed the continuity request and legal dispute freeze was applied',
      jsonb_build_object('reason', _reason, 'freeze_type', 'legal_dispute'), v_request.account_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object('success', true, 'request_id', _request_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_continuity_dispute(
  _request_id UUID,
  _outcome TEXT,
  _resolution_notes TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  IF NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Requires Continuity Reviewer permission' USING ERRCODE = '42501';
  END IF;
  IF _outcome NOT IN ('owner_confirmed', 'requester_confirmed', 'insufficient_evidence', 'duplicate_or_mistaken', 'other') THEN
    RAISE EXCEPTION 'Invalid dispute outcome';
  END IF;
  IF _resolution_notes IS NULL OR length(trim(_resolution_notes)) < 10 THEN
    RAISE EXCEPTION 'Dispute resolution notes are required';
  END IF;

  SELECT id, account_id, owner_dispute_status INTO v_request
  FROM public.account_continuity_requests
  WHERE id = _request_id
  FOR UPDATE;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Continuity request not found';
  END IF;
  IF v_request.owner_dispute_status <> 'disputed' THEN
    RAISE EXCEPTION 'Continuity request does not have an active owner dispute';
  END IF;

  UPDATE public.account_continuity_requests
  SET owner_dispute_status = 'resolved',
      owner_dispute_resolved_at = now(),
      owner_dispute_resolved_by = auth.uid(),
      owner_dispute_resolution_notes = _resolution_notes,
      owner_dispute_resolution_outcome = _outcome,
      risk_flags = COALESCE(risk_flags, '{}'::jsonb) - 'owner_disputed',
      updated_at = now()
  WHERE id = _request_id;

  PERFORM public.log_continuity_event(
    _request_id,
    'owner_dispute_resolved',
    'Owner dispute reviewed and marked resolved',
    jsonb_build_object(
      'outcome', _outcome,
      'resolution_notes', _resolution_notes,
      'freeze_removal_required_separately', true
    ),
    v_request.account_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_owner_dispute_freeze(UUID, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_continuity_dispute_for_case(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_continuity_dispute(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_owner_dispute_freeze(UUID, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_continuity_dispute_for_case(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_continuity_dispute(UUID, TEXT, TEXT) TO authenticated, service_role;
