
-- 1. Extend account_continuity_requests
ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS transfer_scope TEXT,
  ADD COLUMN IF NOT EXISTS execution_status TEXT,
  ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS executed_by UUID,
  ADD COLUMN IF NOT EXISTS senior_approver_id UUID,
  ADD COLUMN IF NOT EXISTS snapshot_reference TEXT,
  ADD COLUMN IF NOT EXISTS transfer_preview_reviewed_at TIMESTAMPTZ;

-- 2. Extend accounts table
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS owner_state TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS continuity_setup_required BOOLEAN NOT NULL DEFAULT false;

-- 3. ownership_transfer_history
CREATE TABLE IF NOT EXISTS public.ownership_transfer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  previous_owner_id UUID NOT NULL,
  new_owner_id UUID NOT NULL,
  executed_by_admin_id UUID NOT NULL,
  senior_approver_id UUID,
  request_id UUID,
  transfer_reason TEXT,
  transfer_type TEXT NOT NULL DEFAULT 'full_ownership',
  execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot_reference TEXT,
  rollback_eligible BOOLEAN NOT NULL DEFAULT false,
  previous_owner_final_state TEXT NOT NULL DEFAULT 'archived_owner',
  new_owner_role TEXT NOT NULL DEFAULT 'owner',
  audit_log_reference UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ownership_transfer_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read ownership transfer history"
  ON public.ownership_transfer_history FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 4. continuity_account_snapshots
CREATE TABLE IF NOT EXISTS public.continuity_account_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  snapshot_reference TEXT NOT NULL UNIQUE,
  snapshot_type TEXT NOT NULL DEFAULT 'pre_transfer',
  created_by_admin_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  included_assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  included_documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  included_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  included_user_relationships JSONB NOT NULL DEFAULT '{}'::jsonb,
  included_audit_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  checksum TEXT,
  storage_location TEXT
);
ALTER TABLE public.continuity_account_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read continuity snapshots"
  ON public.continuity_account_snapshots FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 5. continuity_execution_events
CREATE TABLE IF NOT EXISTS public.continuity_execution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  execution_type TEXT NOT NULL,
  executed_by_admin_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failure_reason TEXT,
  audit_log_reference UUID
);
ALTER TABLE public.continuity_execution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read continuity execution events"
  ON public.continuity_execution_events FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 6. continuity_archive_custodian_access
CREATE TABLE IF NOT EXISTS public.continuity_archive_custodian_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  custodian_user_id UUID NOT NULL,
  granted_by_admin_id UUID NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_export BOOLEAN NOT NULL DEFAULT true,
  can_download BOOLEAN NOT NULL DEFAULT true,
  can_modify BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  reason TEXT,
  audit_log_reference UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_archive_custodian_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read archive custodian access"
  ON public.continuity_archive_custodian_access FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 7. account_ownership_metadata
CREATE TABLE IF NOT EXISTS public.account_ownership_metadata (
  account_id UUID PRIMARY KEY,
  ownership_origin TEXT,
  continuity_case_id UUID,
  transfer_date TIMESTAMPTZ,
  previous_owner_id UUID,
  new_owner_id UUID,
  executed_by_admin_id UUID,
  senior_approver_id UUID,
  snapshot_reference TEXT,
  continuity_setup_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.account_ownership_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read account ownership metadata"
  ON public.account_ownership_metadata FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_oth_account ON public.ownership_transfer_history(account_id);
CREATE INDEX IF NOT EXISTS idx_oth_request ON public.ownership_transfer_history(request_id);
CREATE INDEX IF NOT EXISTS idx_cas_request ON public.continuity_account_snapshots(request_id);
CREATE INDEX IF NOT EXISTS idx_cee_request ON public.continuity_execution_events(request_id);
CREATE INDEX IF NOT EXISTS idx_ccaa_request ON public.continuity_archive_custodian_access(request_id);

-- 8. RPCs
CREATE OR REPLACE FUNCTION public.create_continuity_snapshot(_request_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_ref TEXT;
  v_assets JSONB;
  v_docs JSONB;
  v_perms JSONB;
  v_rels JSONB;
  v_audit JSONB;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions to create snapshot' USING ERRCODE = '42501';
  END IF;

  SELECT account_id INTO v_account_id
  FROM public.account_continuity_requests WHERE id = _request_id;
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Request not found' USING ERRCODE = 'P0002';
  END IF;

  v_ref := 'snap_' || to_char(now(),'YYYYMMDDHH24MISS') || '_' || substr(_request_id::text,1,8);

  SELECT to_jsonb(COALESCE(jsonb_agg(to_jsonb(p)), '[]'::jsonb))
    FROM public.properties p WHERE p.user_id = (SELECT owner_user_id FROM public.accounts WHERE id = v_account_id)
    INTO v_assets;

  SELECT to_jsonb(COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb))
    FROM public.user_documents d WHERE d.user_id = (SELECT owner_user_id FROM public.accounts WHERE id = v_account_id)
    INTO v_docs;

  SELECT to_jsonb(COALESCE(jsonb_agg(to_jsonb(am)), '[]'::jsonb))
    FROM public.account_memberships am WHERE am.account_id = v_account_id
    INTO v_perms;

  SELECT to_jsonb(COALESCE(jsonb_agg(to_jsonb(la)), '[]'::jsonb))
    FROM public.legacy_admins la WHERE la.account_id = v_account_id
    INTO v_rels;

  v_audit := jsonb_build_object('captured_at', now());

  INSERT INTO public.continuity_account_snapshots (
    request_id, account_id, snapshot_reference, snapshot_type, created_by_admin_id,
    included_assets, included_documents, included_permissions, included_user_relationships, included_audit_history,
    checksum
  ) VALUES (
    _request_id, v_account_id, v_ref, 'pre_transfer', auth.uid(),
    COALESCE(v_assets,'[]'::jsonb), COALESCE(v_docs,'[]'::jsonb), COALESCE(v_perms,'[]'::jsonb),
    COALESCE(v_rels,'[]'::jsonb), v_audit,
    md5(v_ref || COALESCE(v_assets::text,'') || COALESCE(v_docs::text,'') || COALESCE(v_perms::text,''))
  );

  UPDATE public.account_continuity_requests
    SET snapshot_reference = v_ref, updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'snapshot_created', 'Pre-execution snapshot created',
    jsonb_build_object('snapshot_reference', v_ref), v_account_id);

  RETURN v_ref;
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_temporary_stewardship(
  _request_id UUID, _permissions JSONB, _expires_at TIMESTAMPTZ, _reason TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_account_id UUID; v_legacy_admin_id UUID; v_grant_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF _expires_at IS NULL OR _expires_at <= now() THEN
    RAISE EXCEPTION 'Temporary stewardship requires a future expiration date';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT account_id, requester_user_id INTO v_account_id, v_legacy_admin_id
    FROM public.account_continuity_requests WHERE id = _request_id;

  INSERT INTO public.continuity_temporary_access (
    request_id, account_id, legacy_admin_id, granted_by_admin_id,
    permissions, starts_at, expires_at, status, reason
  ) VALUES (
    _request_id, v_account_id, v_legacy_admin_id, auth.uid(),
    COALESCE(_permissions,'{}'::jsonb), now(), _expires_at, 'active', _reason
  ) RETURNING id INTO v_grant_id;

  INSERT INTO public.continuity_execution_events (request_id, account_id, execution_type, executed_by_admin_id, status, completed_at)
  VALUES (_request_id, v_account_id, 'temporary_stewardship', auth.uid(), 'completed', now());

  UPDATE public.account_continuity_requests
    SET execution_status = 'temporary_stewardship_granted',
        executed_at = now(), executed_by = auth.uid(), transfer_scope = 'temporary',
        status = 'approved_temporary', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'temporary_stewardship_granted',
    'Temporary stewardship access granted',
    jsonb_build_object('grant_id', v_grant_id, 'expires_at', _expires_at, 'reason', _reason),
    v_account_id);

  RETURN v_grant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_archive_custodian(
  _request_id UUID, _permissions JSONB, _expires_at TIMESTAMPTZ, _reason TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_account_id UUID; v_custodian_id UUID; v_grant_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT account_id, requester_user_id INTO v_account_id, v_custodian_id
    FROM public.account_continuity_requests WHERE id = _request_id;

  INSERT INTO public.continuity_archive_custodian_access (
    request_id, account_id, custodian_user_id, granted_by_admin_id,
    can_view, can_export, can_download, can_modify, can_delete,
    starts_at, expires_at, status, reason
  ) VALUES (
    _request_id, v_account_id, v_custodian_id, auth.uid(),
    COALESCE((_permissions->>'can_view')::boolean, true),
    COALESCE((_permissions->>'can_export')::boolean, true),
    COALESCE((_permissions->>'can_download')::boolean, true),
    false, false,
    now(), _expires_at, 'active', _reason
  ) RETURNING id INTO v_grant_id;

  INSERT INTO public.continuity_execution_events (request_id, account_id, execution_type, executed_by_admin_id, status, completed_at)
  VALUES (_request_id, v_account_id, 'archive_custodian', auth.uid(), 'completed', now());

  UPDATE public.account_continuity_requests
    SET execution_status = 'archive_custodian_granted',
        executed_at = now(), executed_by = auth.uid(), transfer_scope = 'archive',
        status = 'completed', updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'archive_custodian_granted',
    'Archive custodian access granted',
    jsonb_build_object('grant_id', v_grant_id, 'expires_at', _expires_at, 'reason', _reason),
    v_account_id);

  RETURN v_grant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_ownership_transfer(
  _request_id UUID, _reason TEXT, _senior_approver_id UUID, _snapshot_reference TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_account_id UUID; v_prev_owner UUID; v_new_owner UUID;
  v_history_id UUID; v_snap_ok BOOLEAN;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin']::app_role[]) THEN
    RAISE EXCEPTION 'Requires Ownership Administrator permission' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Transfer reason is required';
  END IF;
  IF _senior_approver_id IS NULL THEN
    RAISE EXCEPTION 'Senior approver is required';
  END IF;
  IF _snapshot_reference IS NULL THEN
    RAISE EXCEPTION 'Snapshot reference is required before transfer';
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.continuity_account_snapshots
                 WHERE snapshot_reference = _snapshot_reference AND request_id = _request_id)
    INTO v_snap_ok;
  IF NOT v_snap_ok THEN
    RAISE EXCEPTION 'Snapshot not found for this case';
  END IF;

  SELECT account_id, requester_user_id INTO v_account_id, v_new_owner
    FROM public.account_continuity_requests WHERE id = _request_id;

  SELECT owner_user_id INTO v_prev_owner FROM public.accounts WHERE id = v_account_id;

  -- Archive original owner
  UPDATE public.accounts
    SET owner_state = 'archived_owner',
        continuity_setup_required = true,
        owner_user_id = v_new_owner,
        updated_at = now()
    WHERE id = v_account_id;

  UPDATE public.account_memberships
    SET role = 'archived_owner', updated_at = now()
    WHERE account_id = v_account_id AND user_id = v_prev_owner;

  -- Promote new owner
  INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
  VALUES (v_account_id, v_new_owner, 'owner', 'active', now())
  ON CONFLICT (account_id, user_id) DO UPDATE
    SET role = 'owner', status = 'active', accepted_at = now(), updated_at = now();

  INSERT INTO public.ownership_transfer_history (
    account_id, previous_owner_id, new_owner_id, executed_by_admin_id, senior_approver_id,
    request_id, transfer_reason, transfer_type, snapshot_reference,
    rollback_eligible, previous_owner_final_state, new_owner_role, notes
  ) VALUES (
    v_account_id, v_prev_owner, v_new_owner, auth.uid(), _senior_approver_id,
    _request_id, _reason, 'full_ownership', _snapshot_reference,
    false, 'archived_owner', 'owner', NULL
  ) RETURNING id INTO v_history_id;

  INSERT INTO public.account_ownership_metadata (
    account_id, ownership_origin, continuity_case_id, transfer_date,
    previous_owner_id, new_owner_id, executed_by_admin_id, senior_approver_id,
    snapshot_reference, continuity_setup_required
  ) VALUES (
    v_account_id, 'transferred_via_legacy_continuity', _request_id, now(),
    v_prev_owner, v_new_owner, auth.uid(), _senior_approver_id,
    _snapshot_reference, true
  ) ON CONFLICT (account_id) DO UPDATE SET
    ownership_origin = EXCLUDED.ownership_origin,
    continuity_case_id = EXCLUDED.continuity_case_id,
    transfer_date = EXCLUDED.transfer_date,
    previous_owner_id = EXCLUDED.previous_owner_id,
    new_owner_id = EXCLUDED.new_owner_id,
    executed_by_admin_id = EXCLUDED.executed_by_admin_id,
    senior_approver_id = EXCLUDED.senior_approver_id,
    snapshot_reference = EXCLUDED.snapshot_reference,
    continuity_setup_required = true,
    updated_at = now();

  INSERT INTO public.continuity_execution_events (request_id, account_id, execution_type, executed_by_admin_id, status, completed_at)
  VALUES (_request_id, v_account_id, 'full_ownership_transfer', auth.uid(), 'completed', now());

  UPDATE public.account_continuity_requests
    SET execution_status = 'ownership_transferred',
        executed_at = now(), executed_by = auth.uid(),
        senior_approver_id = _senior_approver_id,
        snapshot_reference = _snapshot_reference,
        transfer_scope = 'transfer',
        status = 'completed', completed_at = now(), updated_at = now()
    WHERE id = _request_id;

  PERFORM public.log_continuity_event(_request_id, 'ownership_transferred',
    'Full ownership transferred via Legacy Continuity',
    jsonb_build_object(
      'previous_owner_id', v_prev_owner,
      'new_owner_id', v_new_owner,
      'snapshot_reference', _snapshot_reference,
      'senior_approver_id', _senior_approver_id,
      'history_id', v_history_id,
      'reason', _reason
    ), v_account_id);

  RETURN v_history_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_continuity_access(
  _grant_id UUID, _grant_type TEXT, _reason TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_request_id UUID; v_account_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Revocation reason is required';
  END IF;

  IF _grant_type = 'temporary' THEN
    UPDATE public.continuity_temporary_access
      SET status = 'revoked', updated_at = now()
      WHERE id = _grant_id
      RETURNING request_id, account_id INTO v_request_id, v_account_id;
  ELSIF _grant_type = 'archive' THEN
    UPDATE public.continuity_archive_custodian_access
      SET status = 'revoked', updated_at = now()
      WHERE id = _grant_id
      RETURNING request_id, account_id INTO v_request_id, v_account_id;
  ELSE
    RAISE EXCEPTION 'Unknown grant type: %', _grant_type;
  END IF;

  PERFORM public.log_continuity_event(v_request_id, 'access_revoked',
    'Continuity access grant revoked',
    jsonb_build_object('grant_id', _grant_id, 'grant_type', _grant_type, 'reason', _reason),
    v_account_id);
END;
$$;
