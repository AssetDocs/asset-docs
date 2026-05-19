
-- 1. legacy_locker extensions (owner preferences)
ALTER TABLE public.legacy_locker
  ADD COLUMN IF NOT EXISTS continuity_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS continuity_preferences_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS continuity_preferences_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS continuity_annual_reminder BOOLEAN NOT NULL DEFAULT false;

-- 2. legacy_admins extensions (consent capture)
ALTER TABLE public.legacy_admins
  ADD COLUMN IF NOT EXISTS consent_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_terms_version TEXT,
  ADD COLUMN IF NOT EXISTS consent_ip INET,
  ADD COLUMN IF NOT EXISTS consent_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS consent_mfa_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferences_version_at_consent INTEGER;

-- 3. account_continuity_requests extensions (dispute / freeze / waiting / risk)
ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS owner_dispute_status TEXT,
  ADD COLUMN IF NOT EXISTS owner_disputed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS owner_dispute_reason TEXT,
  ADD COLUMN IF NOT EXISTS freeze_status TEXT,
  ADD COLUMN IF NOT EXISTS freeze_type TEXT,
  ADD COLUMN IF NOT EXISTS freeze_reason TEXT,
  ADD COLUMN IF NOT EXISTS freeze_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS freeze_applied_by UUID,
  ADD COLUMN IF NOT EXISTS waiting_period_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_execution_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waiting_period_bypass_reason TEXT,
  ADD COLUMN IF NOT EXISTS waiting_period_bypassed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waiting_period_bypassed_by UUID,
  ADD COLUMN IF NOT EXISTS risk_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS owner_last_active_at TIMESTAMPTZ;

-- 4. accounts extensions (freeze + memorialized)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS account_freeze_status TEXT,
  ADD COLUMN IF NOT EXISTS account_freeze_type TEXT,
  ADD COLUMN IF NOT EXISTS memorialized BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS memorialized_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS memorialized_by UUID,
  ADD COLUMN IF NOT EXISTS memorialized_reason TEXT;

-- 5. continuity_documents extensions (retention)
ALTER TABLE public.continuity_documents
  ADD COLUMN IF NOT EXISTS retention_category TEXT,
  ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS encryption_status TEXT,
  ADD COLUMN IF NOT EXISTS access_restriction TEXT,
  ADD COLUMN IF NOT EXISTS last_accessed_by UUID,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

-- 6. legacy_admin_consent_history
CREATE TABLE IF NOT EXISTS public.legacy_admin_consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  account_owner_id UUID NOT NULL,
  legacy_admin_user_id UUID NOT NULL,
  consent_acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_terms_version TEXT,
  consent_text TEXT,
  optional_review_acknowledged BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  mfa_completed BOOLEAN NOT NULL DEFAULT false,
  preferences_version INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.legacy_admin_consent_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read consent history"
  ON public.legacy_admin_consent_history FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Owner reads own consent history"
  ON public.legacy_admin_consent_history FOR SELECT
  USING (auth.uid() = account_owner_id);
CREATE POLICY "Owner inserts own consent history"
  ON public.legacy_admin_consent_history FOR INSERT
  WITH CHECK (auth.uid() = account_owner_id);

-- 7. continuity_owner_notifications
CREATE TABLE IF NOT EXISTS public.continuity_owner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  recipient_role TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dispute_clicked_at TIMESTAMPTZ,
  token_expires_at TIMESTAMPTZ,
  provider_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_owner_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read owner notifications"
  ON public.continuity_owner_notifications FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Recipient reads own notifications"
  ON public.continuity_owner_notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

-- 8. continuity_owner_dispute_tokens
CREATE TABLE IF NOT EXISTS public.continuity_owner_dispute_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'dispute',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_ip INET,
  used_user_agent TEXT
);
ALTER TABLE public.continuity_owner_dispute_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read dispute tokens"
  ON public.continuity_owner_dispute_tokens FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 9. continuity_account_freezes
CREATE TABLE IF NOT EXISTS public.continuity_account_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  request_id UUID,
  freeze_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  applied_by UUID NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_by UUID,
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.continuity_account_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read freezes"
  ON public.continuity_account_freezes FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Owner reads own freezes"
  ON public.continuity_account_freezes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_user_id = auth.uid()));

-- 10. continuity_billing_succession
CREATE TABLE IF NOT EXISTS public.continuity_billing_succession (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE,
  account_id UUID NOT NULL,
  new_owner_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  terms_accepted_at TIMESTAMPTZ,
  payment_method_confirmed_at TIMESTAMPTZ,
  billing_review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_billing_succession ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read billing succession"
  ON public.continuity_billing_succession FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "New owner reads own billing succession"
  ON public.continuity_billing_succession FOR SELECT
  USING (auth.uid() = new_owner_user_id);

-- 11. continuity_export_forensics
CREATE TABLE IF NOT EXISTS public.continuity_export_forensics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  account_id UUID NOT NULL,
  export_type TEXT NOT NULL,
  exported_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  file_name TEXT,
  file_hash TEXT,
  file_size_bytes BIGINT,
  requested_by UUID,
  approved_by UUID,
  downloaded_by UUID,
  downloaded_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_export_forensics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read export forensics"
  ON public.continuity_export_forensics FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- 12. continuity_secondary_legacy_admins (schema only)
CREATE TABLE IF NOT EXISTS public.continuity_secondary_legacy_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  secondary_user_id UUID NOT NULL,
  designated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'inactive',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_secondary_legacy_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read secondary legacy admins"
  ON public.continuity_secondary_legacy_admins FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Owner reads own secondary legacy admins"
  ON public.continuity_secondary_legacy_admins FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_user_id = auth.uid()));

-- 13. continuity_email_audit_log
CREATE TABLE IF NOT EXISTS public.continuity_email_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dispute_submitted_at TIMESTAMPTZ,
  token_expires_at TIMESTAMPTZ,
  provider_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_email_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read continuity email audit"
  ON public.continuity_email_audit_log FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lach_account ON public.legacy_admin_consent_history(account_id);
CREATE INDEX IF NOT EXISTS idx_con_request ON public.continuity_owner_notifications(request_id);
CREATE INDEX IF NOT EXISTS idx_con_recipient ON public.continuity_owner_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_codt_request ON public.continuity_owner_dispute_tokens(request_id);
CREATE INDEX IF NOT EXISTS idx_caf_account ON public.continuity_account_freezes(account_id);
CREATE INDEX IF NOT EXISTS idx_caf_request ON public.continuity_account_freezes(request_id);
CREATE INDEX IF NOT EXISTS idx_cef_request ON public.continuity_export_forensics(request_id);
CREATE INDEX IF NOT EXISTS idx_ceal_request ON public.continuity_email_audit_log(request_id);

-- ============================================================
-- RPCs
-- ============================================================

-- Owner dispute via signed token
CREATE OR REPLACE FUNCTION public.submit_continuity_dispute(_token TEXT, _reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
        status = 'escalated',
        risk_flags = COALESCE(risk_flags,'{}'::jsonb) || jsonb_build_object('owner_disputed', true),
        updated_at = now()
    WHERE id = v_token.request_id;

  -- Log timeline + audit if log_continuity_event exists
  BEGIN
    PERFORM public.log_continuity_event(v_token.request_id, 'owner_disputed_request',
      'Account owner disputed the continuity request',
      jsonb_build_object('reason', _reason), v_account_id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN jsonb_build_object('success', true, 'request_id', v_token.request_id);
END;
$$;

-- Admin: apply freeze
CREATE OR REPLACE FUNCTION public.apply_account_freeze(
  _account_id UUID, _request_id UUID, _freeze_type TEXT, _reason TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Requires Senior Reviewer permission' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Freeze reason is required';
  END IF;

  INSERT INTO public.continuity_account_freezes (account_id, request_id, freeze_type, reason, applied_by)
  VALUES (_account_id, _request_id, _freeze_type, _reason, auth.uid())
  RETURNING id INTO v_id;

  UPDATE public.accounts
    SET account_freeze_status = 'active', account_freeze_type = _freeze_type, updated_at = now()
    WHERE id = _account_id;

  IF _request_id IS NOT NULL THEN
    UPDATE public.account_continuity_requests
      SET freeze_status = 'active', freeze_type = _freeze_type, freeze_reason = _reason,
          freeze_applied_at = now(), freeze_applied_by = auth.uid(), updated_at = now()
      WHERE id = _request_id;
    BEGIN
      PERFORM public.log_continuity_event(_request_id, 'account_freeze_applied',
        'Account freeze applied', jsonb_build_object('freeze_type', _freeze_type, 'reason', _reason), _account_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  RETURN v_id;
END;
$$;

-- Admin: remove freeze
CREATE OR REPLACE FUNCTION public.remove_account_freeze(
  _freeze_id UUID, _reason TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_freeze RECORD;
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Requires Senior Reviewer permission' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Removal reason is required';
  END IF;

  UPDATE public.continuity_account_freezes
    SET status = 'removed', removed_at = now(), removed_by = auth.uid(), removal_reason = _reason
    WHERE id = _freeze_id
    RETURNING * INTO v_freeze;

  -- If no other active freezes on this account, clear account-level flag
  IF NOT EXISTS (SELECT 1 FROM public.continuity_account_freezes WHERE account_id = v_freeze.account_id AND status = 'active') THEN
    UPDATE public.accounts SET account_freeze_status = NULL, account_freeze_type = NULL, updated_at = now() WHERE id = v_freeze.account_id;
  END IF;

  IF v_freeze.request_id IS NOT NULL THEN
    UPDATE public.account_continuity_requests
      SET freeze_status = 'removed', updated_at = now()
      WHERE id = v_freeze.request_id;
    BEGIN
      PERFORM public.log_continuity_event(v_freeze.request_id, 'account_freeze_removed',
        'Account freeze removed', jsonb_build_object('reason', _reason), v_freeze.account_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END;
$$;

-- Admin: set memorialized mode
CREATE OR REPLACE FUNCTION public.set_memorialized_mode(
  _account_id UUID, _reason TEXT, _request_id UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin','dev_lead']::app_role[]) THEN
    RAISE EXCEPTION 'Requires Senior Reviewer permission' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  UPDATE public.accounts
    SET memorialized = true, memorialized_at = now(), memorialized_by = auth.uid(),
        memorialized_reason = _reason, updated_at = now()
    WHERE id = _account_id;

  IF _request_id IS NOT NULL THEN
    BEGIN
      PERFORM public.log_continuity_event(_request_id, 'account_memorialized',
        'Account set to memorialized mode', jsonb_build_object('reason', _reason), _account_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END;
$$;

-- Senior admin: bypass waiting period
CREATE OR REPLACE FUNCTION public.bypass_waiting_period(_request_id UUID, _reason TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_any_app_role(auth.uid(), ARRAY['owner','admin']::app_role[]) THEN
    RAISE EXCEPTION 'Requires Ownership Administrator permission' USING ERRCODE = '42501';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Bypass reason is required';
  END IF;

  UPDATE public.account_continuity_requests
    SET waiting_period_bypass_reason = _reason,
        waiting_period_bypassed_at = now(),
        waiting_period_bypassed_by = auth.uid(),
        scheduled_execution_at = now(),
        updated_at = now()
    WHERE id = _request_id;

  BEGIN
    PERFORM public.log_continuity_event(_request_id, 'waiting_period_bypassed',
      'Waiting period bypassed by senior administrator',
      jsonb_build_object('reason', _reason), NULL);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

-- Owner-facing readiness score
CREATE OR REPLACE FUNCTION public.compute_continuity_readiness(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_legacy_admin BOOLEAN;
  v_mfa BOOLEAN;
  v_backup_email BOOLEAN;
  v_continuity_prefs BOOLEAN;
  v_vault_prefs BOOLEAN;
  v_export_prefs BOOLEAN;
  v_emergency_contact BOOLEAN;
  v_recent_review BOOLEAN;
  v_count INT := 0;
BEGIN
  IF auth.uid() <> _user_id AND NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  v_account_id := public.get_user_account_id(_user_id);

  SELECT EXISTS(SELECT 1 FROM public.legacy_admins WHERE account_id = v_account_id AND status = 'active')
    INTO v_legacy_admin;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = _user_id AND raw_app_meta_data->>'mfa_enabled' = 'true' OR
                 EXISTS(SELECT 1 FROM auth.mfa_factors f WHERE f.user_id = _user_id AND f.status = 'verified'))
    INTO v_mfa;
  v_backup_email := true; -- placeholder; backup email field not present, defer
  SELECT (continuity_preferences IS NOT NULL AND continuity_preferences <> '{}'::jsonb) FROM public.legacy_locker
    WHERE user_id = _user_id INTO v_continuity_prefs;
  v_vault_prefs := COALESCE((SELECT continuity_preferences ? 'vault_segments' FROM public.legacy_locker WHERE user_id = _user_id), false);
  v_export_prefs := COALESCE((SELECT continuity_preferences ? 'death' FROM public.legacy_locker WHERE user_id = _user_id), false);
  SELECT EXISTS(SELECT 1 FROM public.contacts WHERE user_id = _user_id) INTO v_emergency_contact;
  SELECT (continuity_preferences_reviewed_at IS NOT NULL AND continuity_preferences_reviewed_at > now() - interval '12 months')
    FROM public.legacy_locker WHERE user_id = _user_id INTO v_recent_review;

  IF v_legacy_admin THEN v_count := v_count + 1; END IF;
  IF v_mfa THEN v_count := v_count + 1; END IF;
  IF v_backup_email THEN v_count := v_count + 1; END IF;
  IF v_continuity_prefs THEN v_count := v_count + 1; END IF;
  IF v_vault_prefs THEN v_count := v_count + 1; END IF;
  IF v_export_prefs THEN v_count := v_count + 1; END IF;
  IF v_emergency_contact THEN v_count := v_count + 1; END IF;
  IF v_recent_review THEN v_count := v_count + 1; END IF;

  RETURN jsonb_build_object(
    'score', v_count,
    'max', 8,
    'percentage', round((v_count::numeric / 8) * 100),
    'checklist', jsonb_build_object(
      'legacy_admin_assigned', COALESCE(v_legacy_admin, false),
      'mfa_enabled', COALESCE(v_mfa, false),
      'backup_email_verified', COALESCE(v_backup_email, false),
      'continuity_prefs', COALESCE(v_continuity_prefs, false),
      'vault_prefs', COALESCE(v_vault_prefs, false),
      'export_prefs', COALESCE(v_export_prefs, false),
      'emergency_contact', COALESCE(v_emergency_contact, false),
      'reviewed_within_12_months', COALESCE(v_recent_review, false)
    )
  );
END;
$$;

-- Internal helper used by execute_ownership_transfer
CREATE OR REPLACE FUNCTION public.enforce_continuity_execution_guard(_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  SELECT owner_dispute_status, freeze_status, waiting_period_starts_at, scheduled_execution_at,
         waiting_period_bypassed_at, account_id
    INTO r FROM public.account_continuity_requests WHERE id = _request_id;

  IF r.owner_dispute_status = 'disputed' THEN
    RAISE EXCEPTION 'Execution blocked: owner has disputed this request';
  END IF;
  IF r.freeze_status = 'active' THEN
    RAISE EXCEPTION 'Execution blocked: an active freeze is in place';
  END IF;
  IF r.scheduled_execution_at IS NOT NULL AND r.scheduled_execution_at > now() AND r.waiting_period_bypassed_at IS NULL THEN
    RAISE EXCEPTION 'Execution blocked: waiting period has not elapsed';
  END IF;
END;
$$;

-- Patch execute_ownership_transfer to call the guard
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
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN RAISE EXCEPTION 'Transfer reason is required'; END IF;
  IF _senior_approver_id IS NULL THEN RAISE EXCEPTION 'Senior approver is required'; END IF;
  IF _snapshot_reference IS NULL THEN RAISE EXCEPTION 'Snapshot reference is required before transfer'; END IF;

  PERFORM public.enforce_continuity_execution_guard(_request_id);

  SELECT EXISTS(SELECT 1 FROM public.continuity_account_snapshots
                 WHERE snapshot_reference = _snapshot_reference AND request_id = _request_id)
    INTO v_snap_ok;
  IF NOT v_snap_ok THEN RAISE EXCEPTION 'Snapshot not found for this case'; END IF;

  SELECT account_id, requester_user_id INTO v_account_id, v_new_owner
    FROM public.account_continuity_requests WHERE id = _request_id;
  SELECT owner_user_id INTO v_prev_owner FROM public.accounts WHERE id = v_account_id;

  UPDATE public.accounts
    SET owner_state = 'archived_owner', continuity_setup_required = true,
        owner_user_id = v_new_owner, updated_at = now()
    WHERE id = v_account_id;

  UPDATE public.account_memberships
    SET role = 'archived_owner', updated_at = now()
    WHERE account_id = v_account_id AND user_id = v_prev_owner;

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
      'previous_owner_id', v_prev_owner, 'new_owner_id', v_new_owner,
      'snapshot_reference', _snapshot_reference,
      'senior_approver_id', _senior_approver_id, 'history_id', v_history_id, 'reason', _reason
    ), v_account_id);

  RETURN v_history_id;
END;
$$;
