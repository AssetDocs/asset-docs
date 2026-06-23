CREATE TABLE IF NOT EXISTS public.support_access_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_email TEXT,
  target_account_number TEXT,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 10),
  access_scope TEXT NOT NULL DEFAULT 'read_only_support_context'
    CHECK (access_scope IN ('read_only_support_context')),
  status TEXT NOT NULL DEFAULT 'logged'
    CHECK (status IN ('logged', 'completed', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '4 hours'),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_access_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev team can view support access reviews" ON public.support_access_reviews;
CREATE POLICY "Dev team can view support access reviews"
  ON public.support_access_reviews
  FOR SELECT
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()));

DROP POLICY IF EXISTS "Dev team can log support access reviews" ON public.support_access_reviews;
CREATE POLICY "Dev team can log support access reviews"
  ON public.support_access_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_dev_workspace_access(auth.uid())
    AND admin_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Dev team can complete support access reviews" ON public.support_access_reviews;
CREATE POLICY "Dev team can complete support access reviews"
  ON public.support_access_reviews
  FOR UPDATE
  TO authenticated
  USING (public.has_dev_workspace_access(auth.uid()))
  WITH CHECK (public.has_dev_workspace_access(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_support_access_reviews_target
  ON public.support_access_reviews(target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_access_reviews_admin
  ON public.support_access_reviews(admin_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_access_reviews_open
  ON public.support_access_reviews(status, expires_at)
  WHERE status = 'logged';

REVOKE ALL ON public.support_access_reviews FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.support_access_reviews TO authenticated;
GRANT ALL ON public.support_access_reviews TO service_role;
