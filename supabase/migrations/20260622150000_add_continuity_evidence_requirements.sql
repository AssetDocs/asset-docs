CREATE TABLE IF NOT EXISTS public.continuity_evidence_requirements (
  request_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  requirement_level TEXT NOT NULL
    CHECK (requirement_level IN ('required', 'conditional', 'recommended')),
  requirement_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (request_type, item_key)
);

ALTER TABLE public.continuity_evidence_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read continuity evidence requirements"
  ON public.continuity_evidence_requirements;
CREATE POLICY "Admins read continuity evidence requirements"
  ON public.continuity_evidence_requirements FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

INSERT INTO public.continuity_evidence_requirements (
  request_type,
  item_key,
  category,
  label,
  requirement_level,
  requirement_notes,
  sort_order
) VALUES
  ('temporary_assistance', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Confirm the requester controls the email associated with the designated Legacy Admin identity.', 10),
  ('temporary_assistance', 'identity_phone', 'Legacy Admin Identity', 'Phone verified', 'recommended', 'Use when the request asks for broad or time-sensitive access.', 20),
  ('temporary_assistance', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'conditional', 'Required when temporary access includes export, billing, user management, or sensitive account settings.', 30),
  ('temporary_assistance', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved competing continuity request may remain before access is granted.', 40),
  ('temporary_assistance', 'safety_suspicious', 'Account Safety', 'Suspicious activity checked', 'required', 'Review account activity and recent relationship changes before granting access.', 50),

  ('data_export', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Confirm the requester identity before any export decision.', 10),
  ('data_export', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'required', 'Export requests require verified government ID or equivalent identity proof.', 20),
  ('data_export', 'identity_name_match', 'Legacy Admin Identity', 'Name matches documentation', 'required', 'Requester identity must match uploaded legal or authority documentation.', 30),
  ('data_export', 'legal_executor', 'Legal Authority', 'Executor documentation reviewed', 'conditional', 'Required when export is requested after owner death or estate administration.', 40),
  ('data_export', 'legal_poa', 'Legal Authority', 'Power of attorney reviewed', 'conditional', 'Required when export is requested for incapacity under power of attorney.', 50),
  ('data_export', 'legal_court', 'Legal Authority', 'Court documentation reviewed', 'conditional', 'Required when authority depends on a court order.', 60),
  ('data_export', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved competing request or owner dispute may remain before export authorization.', 70),

  ('preservation', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Confirm requester identity before preservation review.', 10),
  ('preservation', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'required', 'Preservation requires identity verification because it may freeze or restrict the owner account.', 20),
  ('preservation', 'legal_death_cert', 'Legal Authority', 'Death certificate reviewed, if applicable', 'conditional', 'Required for death-based preservation.', 30),
  ('preservation', 'legal_poa', 'Legal Authority', 'Power of attorney reviewed', 'conditional', 'Required for incapacity-based preservation unless another legal basis applies.', 40),
  ('preservation', 'legal_guardianship', 'Legal Authority', 'Guardianship paperwork reviewed', 'conditional', 'Required when a guardian or conservator is acting.', 50),
  ('preservation', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved conflict or owner dispute may remain before preservation is activated.', 60),

  ('memorialization', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Confirm requester identity before memorialization review.', 10),
  ('memorialization', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'required', 'Memorialization requires verified requester identity.', 20),
  ('memorialization', 'legal_death_cert', 'Legal Authority', 'Death certificate reviewed, if applicable', 'required', 'Death evidence or comparable legal/family proof is required before memorialization.', 30),
  ('memorialization', 'identity_name_match', 'Legacy Admin Identity', 'Name matches documentation', 'required', 'Requester identity should match the supplied legal/family documentation.', 40),
  ('memorialization', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved competing request or owner dispute may remain before memorialization.', 50),

  ('account_closure', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Confirm requester identity before closure review.', 10),
  ('account_closure', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'required', 'Account closure requires verified requester identity.', 20),
  ('account_closure', 'identity_name_match', 'Legacy Admin Identity', 'Name matches documentation', 'required', 'Requester identity must match legal authority or estate documentation.', 30),
  ('account_closure', 'legal_death_cert', 'Legal Authority', 'Death certificate reviewed, if applicable', 'conditional', 'Required for death-based closure.', 40),
  ('account_closure', 'legal_executor', 'Legal Authority', 'Executor documentation reviewed', 'conditional', 'Required when estate authority is asserted.', 50),
  ('account_closure', 'legal_court', 'Legal Authority', 'Court documentation reviewed', 'conditional', 'Required when closure authority depends on court order.', 60),
  ('account_closure', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved competing request or owner dispute may remain before closure.', 70),
  ('account_closure', 'safety_recent_changes', 'Account Safety', 'Recent account changes reviewed', 'required', 'Review recent owner, billing, AU, delegate, and Legacy Admin changes before closure.', 80),

  ('ownership_transfer', 'identity_email', 'Legacy Admin Identity', 'Email verified', 'required', 'Legacy ownership transfer path requires requester identity verification.', 10),
  ('ownership_transfer', 'identity_gov_id', 'Legacy Admin Identity', 'Government ID reviewed', 'required', 'Legacy ownership transfer path requires verified government ID.', 20),
  ('ownership_transfer', 'identity_name_match', 'Legacy Admin Identity', 'Name matches documentation', 'required', 'Requester identity must match transfer authority documentation.', 30),
  ('ownership_transfer', 'legal_executor', 'Legal Authority', 'Executor documentation reviewed', 'conditional', 'Required when estate authority is asserted.', 40),
  ('ownership_transfer', 'legal_poa', 'Legal Authority', 'Power of attorney reviewed', 'conditional', 'Required when incapacity authority is asserted.', 50),
  ('ownership_transfer', 'safety_conflicts', 'Account Safety', 'Conflicting requests checked', 'required', 'No unresolved competing request or owner dispute may remain before transfer.', 60)
ON CONFLICT (request_type, item_key) DO UPDATE
SET category = EXCLUDED.category,
    label = EXCLUDED.label,
    requirement_level = EXCLUDED.requirement_level,
    requirement_notes = EXCLUDED.requirement_notes,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

INSERT INTO public.continuity_evidence_requirements (
  request_type,
  item_key,
  category,
  label,
  requirement_level,
  requirement_notes,
  sort_order
)
SELECT
  'closure',
  item_key,
  category,
  label,
  requirement_level,
  requirement_notes,
  sort_order
FROM public.continuity_evidence_requirements
WHERE request_type = 'account_closure'
ON CONFLICT (request_type, item_key) DO UPDATE
SET category = EXCLUDED.category,
    label = EXCLUDED.label,
    requirement_level = EXCLUDED.requirement_level,
    requirement_notes = EXCLUDED.requirement_notes,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

INSERT INTO public.continuity_evidence_requirements (
  request_type,
  item_key,
  category,
  label,
  requirement_level,
  requirement_notes,
  sort_order
)
SELECT
  'export',
  item_key,
  category,
  label,
  requirement_level,
  requirement_notes,
  sort_order
FROM public.continuity_evidence_requirements
WHERE request_type = 'data_export'
ON CONFLICT (request_type, item_key) DO UPDATE
SET category = EXCLUDED.category,
    label = EXCLUDED.label,
    requirement_level = EXCLUDED.requirement_level,
    requirement_notes = EXCLUDED.requirement_notes,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.get_continuity_evidence_requirements(_request_type TEXT)
RETURNS TABLE (
  request_type TEXT,
  item_key TEXT,
  category TEXT,
  label TEXT,
  requirement_level TEXT,
  requirement_notes TEXT,
  sort_order INTEGER
)
LANGUAGE plpgsql
STABLE
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

  RETURN QUERY
  SELECT
    r.request_type,
    r.item_key,
    r.category,
    r.label,
    r.requirement_level,
    r.requirement_notes,
    r.sort_order
  FROM public.continuity_evidence_requirements r
  WHERE r.request_type = _request_type
  ORDER BY r.sort_order, r.category, r.label;
END;
$$;

REVOKE ALL ON FUNCTION public.get_continuity_evidence_requirements(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_continuity_evidence_requirements(TEXT) TO authenticated, service_role;
