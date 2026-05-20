
-- Continuity & Preservation refactor (uses has_any_app_role / has_dev_workspace_access)

CREATE TABLE IF NOT EXISTS public.memorialized_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.account_continuity_requests(id) ON DELETE SET NULL,
  memorialized_by_admin_id UUID,
  memorialized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  steward_access_level TEXT NOT NULL DEFAULT 'view_only',
  export_allowed BOOLEAN NOT NULL DEFAULT false,
  billing_handling_status TEXT NOT NULL DEFAULT 'paused',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.memorialized_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read memorialized" ON public.memorialized_accounts
  FOR SELECT USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Admins write memorialized" ON public.memorialized_accounts
  FOR ALL USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE TABLE IF NOT EXISTS public.preservation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.account_continuity_requests(id) ON DELETE SET NULL,
  state_type TEXT NOT NULL,
  applied_by_admin_id UUID,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  restrictions JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.preservation_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read preservation" ON public.preservation_states
  FOR SELECT USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Admins write preservation" ON public.preservation_states
  FOR ALL USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE TABLE IF NOT EXISTS public.closure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.account_continuity_requests(id) ON DELETE SET NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  requested_by_user_id UUID,
  approved_by_admin_id UUID,
  status TEXT NOT NULL DEFAULT 'closure_under_review',
  waiting_period_starts_at TIMESTAMPTZ,
  waiting_period_ends_at TIMESTAMPTZ,
  snapshot_reference TEXT,
  completed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.closure_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read closure" ON public.closure_requests
  FOR SELECT USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Admins write closure" ON public.closure_requests
  FOR ALL USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE TABLE IF NOT EXISTS public.continuity_export_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.account_continuity_requests(id) ON DELETE SET NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  authorized_by_admin_id UUID,
  authorized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  download_limit INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  sensitive_areas_included BOOLEAN NOT NULL DEFAULT false,
  internal_reason TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.continuity_export_authorizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read exports" ON public.continuity_export_authorizations
  FOR SELECT USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Admins write exports" ON public.continuity_export_authorizations
  FOR ALL USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

COMMENT ON TABLE public.continuity_ownership_transfers IS
  'DEPRECATED: Ownership transfer flow is hidden in the Continuity & Preservation refactor. Retained for audit history only.';

DO $$ BEGIN
  REVOKE EXECUTE ON FUNCTION public.execute_ownership_transfer(uuid, text, uuid, text) FROM PUBLIC, authenticated, anon;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RPCs

CREATE OR REPLACE FUNCTION public.execute_memorialization(
  _request_id UUID,
  _steward_access_level TEXT DEFAULT 'view_only',
  _export_allowed BOOLEAN DEFAULT false,
  _billing_handling_status TEXT DEFAULT 'paused',
  _reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_account UUID; v_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  PERFORM public.enforce_continuity_execution_guard(_request_id);
  SELECT account_id INTO v_account FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'request_not_found'; END IF;

  INSERT INTO public.memorialized_accounts(account_id, request_id, memorialized_by_admin_id,
    steward_access_level, export_allowed, billing_handling_status, reason)
  VALUES (v_account, _request_id, auth.uid(), _steward_access_level, _export_allowed, _billing_handling_status, _reason)
  RETURNING id INTO v_id;

  -- Mirror into accounts.memorialized flag
  UPDATE public.accounts
    SET memorialized = true, memorialized_at = now(),
        memorialized_by = auth.uid(), memorialized_reason = _reason, updated_at = now()
    WHERE id = v_account;

  UPDATE public.account_continuity_requests
    SET status = 'completed_memorialization', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'memorialization_activated',
    'Account placed in memorialized mode',
    jsonb_build_object('memorialization_id', v_id, 'steward_access_level', _steward_access_level,
                       'export_allowed', _export_allowed, 'billing_handling_status', _billing_handling_status),
    v_account);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.execute_memorialization(uuid, text, boolean, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_memorialization(uuid, text, boolean, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.execute_preservation_mode(
  _request_id UUID,
  _state_type TEXT,
  _restrictions JSONB DEFAULT '{}'::jsonb,
  _reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_account UUID; v_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  PERFORM public.enforce_continuity_execution_guard(_request_id);
  SELECT account_id INTO v_account FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'request_not_found'; END IF;

  INSERT INTO public.preservation_states(account_id, request_id, state_type, applied_by_admin_id, restrictions, reason)
  VALUES (v_account, _request_id, _state_type, auth.uid(), _restrictions, _reason)
  RETURNING id INTO v_id;

  UPDATE public.account_continuity_requests
    SET status = 'completed_preservation', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'preservation_activated',
    'Preservation mode activated',
    jsonb_build_object('preservation_id', v_id, 'state_type', _state_type, 'restrictions', _restrictions),
    v_account);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.execute_preservation_mode(uuid, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_preservation_mode(uuid, text, jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_closure_request(
  _request_id UUID,
  _waiting_days INTEGER DEFAULT 30,
  _reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_account UUID; v_id UUID; v_ends TIMESTAMPTZ;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  PERFORM public.enforce_continuity_execution_guard(_request_id);
  SELECT account_id INTO v_account FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'request_not_found'; END IF;

  v_ends := now() + (COALESCE(_waiting_days, 30) || ' days')::interval;
  INSERT INTO public.closure_requests(request_id, account_id, approved_by_admin_id,
    status, waiting_period_starts_at, waiting_period_ends_at)
  VALUES (_request_id, v_account, auth.uid(), 'closure_waiting_period', now(), v_ends)
  RETURNING id INTO v_id;

  UPDATE public.account_continuity_requests
    SET status = 'closure_waiting_period', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'closure_waiting_period_started',
    'Closure approved — waiting period started',
    jsonb_build_object('closure_id', v_id, 'ends_at', v_ends, 'reason', _reason),
    v_account);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.approve_closure_request(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_closure_request(uuid, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_closure(
  _closure_id UUID,
  _override BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_request UUID; v_account UUID; v_ends TIMESTAMPTZ; v_snap TEXT;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  SELECT request_id, account_id, waiting_period_ends_at INTO v_request, v_account, v_ends
    FROM public.closure_requests WHERE id = _closure_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'closure_not_found'; END IF;
  IF v_ends IS NOT NULL AND v_ends > now() AND NOT _override THEN
    RAISE EXCEPTION 'waiting_period_not_elapsed';
  END IF;

  BEGIN
    v_snap := public.create_continuity_snapshot(v_request);
  EXCEPTION WHEN OTHERS THEN v_snap := NULL;
  END;

  UPDATE public.closure_requests
    SET status = 'closure_completed', completed_at = now(),
        snapshot_reference = COALESCE(v_snap, snapshot_reference)
    WHERE id = _closure_id;

  IF v_request IS NOT NULL THEN
    UPDATE public.account_continuity_requests
      SET status = 'closure_completed', updated_at = now()
      WHERE id = v_request;
    PERFORM public.log_continuity_event(v_request, 'closure_completed',
      'Account closure completed after waiting period',
      jsonb_build_object('closure_id', _closure_id, 'snapshot_reference', v_snap, 'override', _override),
      v_account);
  END IF;
  RETURN _closure_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.complete_closure(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_closure(uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_closure(
  _closure_id UUID,
  _reason TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_request UUID; v_account UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  SELECT request_id, account_id INTO v_request, v_account FROM public.closure_requests WHERE id = _closure_id;
  UPDATE public.closure_requests
    SET status = 'closure_cancelled', cancellation_reason = _reason
    WHERE id = _closure_id;
  IF v_request IS NOT NULL THEN
    UPDATE public.account_continuity_requests SET status = 'under_review', updated_at = now() WHERE id = v_request;
    PERFORM public.log_continuity_event(v_request, 'closure_cancelled',
      'Closure cancelled before completion',
      jsonb_build_object('closure_id', _closure_id, 'reason', _reason),
      v_account);
  END IF;
  RETURN _closure_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.cancel_closure(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_closure(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.authorize_continuity_export(
  _request_id UUID,
  _scope JSONB,
  _expires_at TIMESTAMPTZ,
  _download_limit INTEGER DEFAULT NULL,
  _sensitive_areas_included BOOLEAN DEFAULT false,
  _internal_reason TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_account UUID; v_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  PERFORM public.enforce_continuity_execution_guard(_request_id);
  SELECT account_id INTO v_account FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account IS NULL THEN RAISE EXCEPTION 'request_not_found'; END IF;

  INSERT INTO public.continuity_export_authorizations(request_id, account_id, authorized_by_admin_id,
    expires_at, scope, download_limit, sensitive_areas_included, internal_reason)
  VALUES (_request_id, v_account, auth.uid(), _expires_at, _scope, _download_limit, _sensitive_areas_included, _internal_reason)
  RETURNING id INTO v_id;

  UPDATE public.account_continuity_requests
    SET status = 'approved_export', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'export_authorized',
    'Continuity export authorized',
    jsonb_build_object('authorization_id', v_id, 'scope', _scope, 'expires_at', _expires_at,
                       'sensitive', _sensitive_areas_included),
    v_account);
  RETURN v_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.authorize_continuity_export(uuid, jsonb, timestamptz, integer, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.authorize_continuity_export(uuid, jsonb, timestamptz, integer, boolean, text) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_memorialized_account ON public.memorialized_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_preservation_account ON public.preservation_states(account_id);
CREATE INDEX IF NOT EXISTS idx_closure_account ON public.closure_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_closure_status ON public.closure_requests(status);
CREATE INDEX IF NOT EXISTS idx_export_auth_request ON public.continuity_export_authorizations(request_id);
