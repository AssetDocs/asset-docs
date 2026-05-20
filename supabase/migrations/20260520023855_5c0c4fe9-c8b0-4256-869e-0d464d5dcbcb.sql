
-- ============================================================
-- External Account Assistance intake
-- ============================================================

-- Main requests table
CREATE TABLE public.external_account_assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Requester
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_relationship TEXT NOT NULL,
  -- Reported account
  account_holder_name TEXT NOT NULL,
  account_holder_email TEXT,
  account_holder_phone TEXT,
  account_holder_other_info TEXT,
  -- Contact reason
  reason_for_contact TEXT NOT NULL,
  explanation TEXT NOT NULL,
  -- Workflow state
  status TEXT NOT NULL DEFAULT 'submitted',
  risk_level TEXT NOT NULL DEFAULT 'low',
  assigned_reviewer_id UUID,
  -- Preservation / billing
  preservation_hold BOOLEAN NOT NULL DEFAULT false,
  preservation_hold_started_at TIMESTAMPTZ,
  preservation_hold_expires_at TIMESTAMPTZ,
  billing_review_notes TEXT,
  billing_action_taken TEXT,
  billing_action_timestamp TIMESTAMPTZ,
  -- Owner dispute
  owner_notified_at TIMESTAMPTZ,
  owner_dispute_status TEXT,
  owner_disputed_at TIMESTAMPTZ,
  owner_dispute_reason TEXT,
  -- Acknowledgements
  acknowledgements JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Misc
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_eaar_status ON public.external_account_assistance_requests(status);
CREATE INDEX idx_eaar_submitted_at ON public.external_account_assistance_requests(submitted_at DESC);
CREATE INDEX idx_eaar_account_holder_email ON public.external_account_assistance_requests(account_holder_email);

ALTER TABLE public.external_account_assistance_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can submit
CREATE POLICY "Public can submit assistance requests"
  ON public.external_account_assistance_requests
  FOR INSERT
  WITH CHECK (
    status = 'submitted'
    AND risk_level IN ('low','moderate','elevated','critical')
    AND length(requester_name) BETWEEN 1 AND 200
    AND length(requester_email) BETWEEN 3 AND 320
    AND length(account_holder_name) BETWEEN 1 AND 200
    AND length(explanation) BETWEEN 1 AND 5000
  );

-- Admins read/manage
CREATE POLICY "Admins can read assistance requests"
  ON public.external_account_assistance_requests FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins can update assistance requests"
  ON public.external_account_assistance_requests FOR UPDATE
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Owners can delete assistance requests"
  ON public.external_account_assistance_requests FOR DELETE
  USING (public.has_owner_workspace_access(auth.uid()));

-- ============================================================
-- Documents
-- ============================================================
CREATE TABLE public.external_assistance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.external_account_assistance_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  document_category TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unreviewed',
  reviewer_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ead_request_id ON public.external_assistance_documents(request_id);

ALTER TABLE public.external_assistance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can attach documents to fresh requests"
  ON public.external_assistance_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.external_account_assistance_requests r
      WHERE r.id = request_id
        AND r.submitted_at > now() - interval '30 minutes'
    )
  );

CREATE POLICY "Admins can read assistance documents"
  ON public.external_assistance_documents FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins can update assistance documents"
  ON public.external_assistance_documents FOR UPDATE
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Owners can delete assistance documents"
  ON public.external_assistance_documents FOR DELETE
  USING (public.has_owner_workspace_access(auth.uid()));

-- ============================================================
-- Internal candidate matches (admin-only)
-- ============================================================
CREATE TABLE public.external_assistance_account_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.external_account_assistance_requests(id) ON DELETE CASCADE,
  matched_account_id UUID,
  matched_user_id UUID,
  match_confidence TEXT NOT NULL DEFAULT 'unknown',
  match_method TEXT,
  matched_by UUID,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  internal_only BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

CREATE INDEX idx_eaam_request_id ON public.external_assistance_account_matches(request_id);

ALTER TABLE public.external_assistance_account_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read account matches"
  ON public.external_assistance_account_matches FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins insert account matches"
  ON public.external_assistance_account_matches FOR INSERT
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins update account matches"
  ON public.external_assistance_account_matches FOR UPDATE
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Owners delete account matches"
  ON public.external_assistance_account_matches FOR DELETE
  USING (public.has_owner_workspace_access(auth.uid()));

-- ============================================================
-- Audit logs (append-only)
-- ============================================================
CREATE TABLE public.external_assistance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.external_account_assistance_requests(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,           -- 'public_requester' | 'admin' | 'owner' | 'system'
  actor_id UUID,
  action_type TEXT NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eaal_request_id ON public.external_assistance_audit_logs(request_id);
CREATE INDEX idx_eaal_created_at ON public.external_assistance_audit_logs(created_at DESC);

ALTER TABLE public.external_assistance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can log a public action tied to a recent request
CREATE POLICY "Public can append public audit events"
  ON public.external_assistance_audit_logs FOR INSERT
  WITH CHECK (
    actor_type = 'public_requester'
    AND EXISTS (
      SELECT 1 FROM public.external_account_assistance_requests r
      WHERE r.id = request_id
        AND r.submitted_at > now() - interval '30 minutes'
    )
  );

CREATE POLICY "Admins read audit logs"
  ON public.external_assistance_audit_logs FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins insert audit logs"
  ON public.external_assistance_audit_logs FOR INSERT
  WITH CHECK (public.has_dev_workspace_access(auth.uid()) AND actor_type <> 'public_requester');

-- ============================================================
-- Notifications log
-- ============================================================
CREATE TABLE public.external_assistance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.external_account_assistance_requests(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,   -- 'owner' | 'requester' | 'admin'
  recipient_email TEXT,
  notification_type TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ean_request_id ON public.external_assistance_notifications(request_id);

ALTER TABLE public.external_assistance_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read assistance notifications"
  ON public.external_assistance_notifications FOR SELECT
  USING (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins write assistance notifications"
  ON public.external_assistance_notifications FOR INSERT
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE POLICY "Admins update assistance notifications"
  ON public.external_assistance_notifications FOR UPDATE
  USING (public.has_dev_workspace_access(auth.uid()));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_eaar_updated BEFORE UPDATE ON public.external_account_assistance_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ead_updated BEFORE UPDATE ON public.external_assistance_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Storage bucket for optional public uploads
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('external-assistance-docs', 'external-assistance-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Public may upload into submission/<anything> folders only
CREATE POLICY "Public can upload assistance docs to submission folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'external-assistance-docs'
    AND (storage.foldername(name))[1] = 'submission'
  );

CREATE POLICY "Admins can read assistance doc objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'external-assistance-docs'
    AND public.has_dev_workspace_access(auth.uid())
  );

CREATE POLICY "Admins can update assistance doc objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'external-assistance-docs'
    AND public.has_dev_workspace_access(auth.uid())
  );

CREATE POLICY "Owners can delete assistance doc objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'external-assistance-docs'
    AND public.has_owner_workspace_access(auth.uid())
  );
