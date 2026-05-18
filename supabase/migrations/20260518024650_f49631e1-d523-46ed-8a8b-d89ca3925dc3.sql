
-- Extend existing continuity requests with admin review fields
ALTER TABLE public.account_continuity_requests
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_reviewer_id UUID,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preservation_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preservation_hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS preservation_hold_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preservation_hold_applied_by UUID;

-- Documents
CREATE TABLE IF NOT EXISTS public.continuity_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  document_category TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_status TEXT NOT NULL DEFAULT 'unreviewed',
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.continuity_documents ENABLE ROW LEVEL SECURITY;

-- Checklist items
CREATE TABLE IF NOT EXISTS public.continuity_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, item_key)
);
ALTER TABLE public.continuity_checklist_items ENABLE ROW LEVEL SECURITY;

-- Internal notes
CREATE TABLE IF NOT EXISTS public.continuity_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  note_category TEXT NOT NULL DEFAULT 'general',
  note_body TEXT NOT NULL,
  internal_only BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_notes ENABLE ROW LEVEL SECURITY;

-- Outbound messages
CREATE TABLE IF NOT EXISTS public.continuity_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL,
  sent_to UUID,
  sent_to_email TEXT,
  subject TEXT,
  message_body TEXT NOT NULL,
  template_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_messages ENABLE ROW LEVEL SECURITY;

-- Timeline events
CREATE TABLE IF NOT EXISTS public.continuity_timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT,
  actor_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_timeline_events ENABLE ROW LEVEL SECURITY;

-- Temporary access grants
CREATE TABLE IF NOT EXISTS public.continuity_temporary_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  legacy_admin_id UUID NOT NULL,
  account_holder_id UUID NOT NULL,
  account_id UUID,
  granted_by UUID NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  revoked_by UUID,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT continuity_temporary_access_expires_after_start CHECK (expires_at > starts_at)
);
ALTER TABLE public.continuity_temporary_access ENABLE ROW LEVEL SECURITY;

-- Ownership transfers
CREATE TABLE IF NOT EXISTS public.continuity_ownership_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.account_continuity_requests(id) ON DELETE CASCADE,
  account_id UUID,
  current_owner_id UUID NOT NULL,
  proposed_owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'recommended',
  recommended_by UUID NOT NULL,
  recommended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recommendation_rationale TEXT NOT NULL,
  senior_approved_by UUID,
  senior_approved_at TIMESTAMPTZ,
  senior_approval_notes TEXT,
  invitation_sent_at TIMESTAMPTZ,
  invitation_opened_at TIMESTAMPTZ,
  identity_confirmed_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  executed_by UUID,
  executed_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_ownership_transfers ENABLE ROW LEVEL SECURITY;

-- Audit log (immutable)
CREATE TABLE IF NOT EXISTS public.continuity_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.account_continuity_requests(id) ON DELETE SET NULL,
  admin_user_id UUID NOT NULL,
  admin_role TEXT,
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  affected_account_id UUID,
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.continuity_audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_continuity_documents_request ON public.continuity_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_checklist_request ON public.continuity_checklist_items(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_notes_request ON public.continuity_notes(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_messages_request ON public.continuity_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_timeline_request ON public.continuity_timeline_events(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_temp_access_request ON public.continuity_temporary_access(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_temp_access_status ON public.continuity_temporary_access(status);
CREATE INDEX IF NOT EXISTS idx_continuity_ownership_request ON public.continuity_ownership_transfers(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_audit_request ON public.continuity_audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_continuity_audit_admin ON public.continuity_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_continuity_audit_created ON public.continuity_audit_logs(created_at DESC);

-- Updated_at triggers
CREATE TRIGGER trg_continuity_checklist_updated
  BEFORE UPDATE ON public.continuity_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_continuity_temp_access_updated
  BEFORE UPDATE ON public.continuity_temporary_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_continuity_ownership_updated
  BEFORE UPDATE ON public.continuity_ownership_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: admins (owner/admin/dev_lead/developer/qa) only. Audit logs are insert+select only.
-- Documents
CREATE POLICY "Admins manage continuity documents"
  ON public.continuity_documents FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Checklist
CREATE POLICY "Admins manage continuity checklist"
  ON public.continuity_checklist_items FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Notes
CREATE POLICY "Admins manage continuity notes"
  ON public.continuity_notes FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Messages
CREATE POLICY "Admins manage continuity messages"
  ON public.continuity_messages FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Timeline
CREATE POLICY "Admins manage continuity timeline"
  ON public.continuity_timeline_events FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Temporary access
CREATE POLICY "Admins manage continuity temp access"
  ON public.continuity_temporary_access FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Ownership transfers
CREATE POLICY "Admins manage continuity ownership transfers"
  ON public.continuity_ownership_transfers FOR ALL TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

-- Audit logs (insert + select only, no update/delete policy = immutable)
CREATE POLICY "Admins read continuity audit logs"
  ON public.continuity_audit_logs FOR SELECT TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));
CREATE POLICY "Admins insert continuity audit logs"
  ON public.continuity_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_dev_workspace_access(auth.uid()) AND admin_user_id = auth.uid());

-- Helper: log a continuity event + audit entry in one call
CREATE OR REPLACE FUNCTION public.log_continuity_event(
  _request_id UUID,
  _event_type TEXT,
  _event_description TEXT,
  _action_details JSONB DEFAULT '{}'::jsonb,
  _affected_account_id UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF NOT public.has_dev_workspace_access(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  SELECT role::text INTO v_role FROM public.user_roles
   WHERE user_id = auth.uid()
   ORDER BY CASE role
     WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'dev_lead' THEN 3
     WHEN 'developer' THEN 4 WHEN 'qa' THEN 5 ELSE 9 END
   LIMIT 1;

  INSERT INTO public.continuity_timeline_events (request_id, event_type, event_description, actor_id, metadata)
  VALUES (_request_id, _event_type, _event_description, auth.uid(), _action_details);

  INSERT INTO public.continuity_audit_logs (request_id, admin_user_id, admin_role, action_type, action_details, affected_account_id)
  VALUES (_request_id, auth.uid(), v_role, _event_type, _action_details, _affected_account_id);
END;
$$;
