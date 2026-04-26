-- =========================================================
-- 1. Legacy Admin designation
-- =========================================================
CREATE TABLE IF NOT EXISTS public.legacy_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  legacy_admin_user_id UUID NOT NULL,
  assigned_by_owner_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS legacy_admins_one_active_per_account
  ON public.legacy_admins(account_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS legacy_admins_user_idx
  ON public.legacy_admins(legacy_admin_user_id);

ALTER TABLE public.legacy_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views legacy admins"
  ON public.legacy_admins FOR SELECT
  TO authenticated
  USING (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Legacy admin views own designation"
  ON public.legacy_admins FOR SELECT
  TO authenticated
  USING (legacy_admin_user_id = auth.uid());

CREATE POLICY "Owner assigns legacy admin"
  ON public.legacy_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_account_owner(auth.uid(), account_id)
    AND assigned_by_owner_id = auth.uid()
    AND public.is_account_member(legacy_admin_user_id, account_id)
  );

CREATE POLICY "Owner updates legacy admin"
  ON public.legacy_admins FOR UPDATE
  TO authenticated
  USING (public.is_account_owner(auth.uid(), account_id))
  WITH CHECK (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Owner deletes legacy admin"
  ON public.legacy_admins FOR DELETE
  TO authenticated
  USING (public.is_account_owner(auth.uid(), account_id));

CREATE TRIGGER update_legacy_admins_updated_at
  BEFORE UPDATE ON public.legacy_admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. Legacy Locker continuity instructions (owner-only via existing RLS)
-- =========================================================
ALTER TABLE public.legacy_locker
  ADD COLUMN IF NOT EXISTS continuity_preference TEXT
    CHECK (continuity_preference IN ('maintain','export','close')),
  ADD COLUMN IF NOT EXISTS continuity_notes TEXT,
  ADD COLUMN IF NOT EXISTS continuity_notes_encrypted TEXT;

-- =========================================================
-- 3. Helper: is this user the active Legacy Admin for the account?
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_active_legacy_admin(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.legacy_admins
    WHERE legacy_admin_user_id = _user_id
      AND account_id = _account_id
      AND status = 'active'
  );
$$;

-- =========================================================
-- 4. Account continuity requests (review workflow)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.account_continuity_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  requested_by_user_id UUID NOT NULL,
  legacy_admin_id UUID REFERENCES public.legacy_admins(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('closure','export','ownership_transfer')),
  reason TEXT NOT NULL,
  notes TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','approved','declined','completed')),
  reviewed_by_admin_id UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS acr_account_idx ON public.account_continuity_requests(account_id);
CREATE INDEX IF NOT EXISTS acr_requester_idx ON public.account_continuity_requests(requested_by_user_id);
CREATE INDEX IF NOT EXISTS acr_status_idx ON public.account_continuity_requests(status);

ALTER TABLE public.account_continuity_requests ENABLE ROW LEVEL SECURITY;

-- Active Legacy Admin can create requests for their assigned account
CREATE POLICY "Legacy admin creates continuity request"
  ON public.account_continuity_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by_user_id = auth.uid()
    AND public.is_active_legacy_admin(auth.uid(), account_id)
    AND status = 'submitted'
    AND reviewed_by_admin_id IS NULL
    AND reviewed_at IS NULL
    AND admin_notes IS NULL
  );

-- Legacy Admin views their own submitted requests
CREATE POLICY "Legacy admin views own requests"
  ON public.account_continuity_requests FOR SELECT
  TO authenticated
  USING (requested_by_user_id = auth.uid());

-- Account owner views requests on their account
CREATE POLICY "Owner views continuity requests"
  ON public.account_continuity_requests FOR SELECT
  TO authenticated
  USING (public.is_account_owner(auth.uid(), account_id));

-- Internal Asset Safe admins can view all requests
CREATE POLICY "Internal admins view all continuity requests"
  ON public.account_continuity_requests FOR SELECT
  TO authenticated
  USING (public.has_owner_workspace_access(auth.uid()));

-- Only internal admins can update status / review fields
CREATE POLICY "Internal admins update continuity requests"
  ON public.account_continuity_requests FOR UPDATE
  TO authenticated
  USING (public.has_owner_workspace_access(auth.uid()))
  WITH CHECK (public.has_owner_workspace_access(auth.uid()));

-- No DELETE policy — requests are append-only audit trail (admins can use service role if ever needed)

CREATE TRIGGER update_acr_updated_at
  BEFORE UPDATE ON public.account_continuity_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
