CREATE TABLE IF NOT EXISTS public.dashboard_resume_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  workspace_context TEXT NOT NULL CHECK (workspace_context IN ('owned', 'shared')),
  activity_type TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_resume_activities_label_length CHECK (char_length(activity_label) BETWEEN 1 AND 120),
  CONSTRAINT dashboard_resume_activities_route_length CHECK (char_length(destination_route) BETWEEN 1 AND 300)
);

ALTER TABLE public.dashboard_resume_activities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_dashboard_resume_user_account_created
  ON public.dashboard_resume_activities(user_id, account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_resume_account_created
  ON public.dashboard_resume_activities(account_id, created_at DESC);

DROP POLICY IF EXISTS "Users can view own dashboard resume activity"
  ON public.dashboard_resume_activities;
CREATE POLICY "Users can view own dashboard resume activity"
  ON public.dashboard_resume_activities
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.account_memberships membership
      WHERE membership.account_id = dashboard_resume_activities.account_id
        AND membership.user_id = auth.uid()
        AND membership.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert own dashboard resume activity"
  ON public.dashboard_resume_activities;
CREATE POLICY "Users can insert own dashboard resume activity"
  ON public.dashboard_resume_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.account_memberships membership
      WHERE membership.account_id = dashboard_resume_activities.account_id
        AND membership.user_id = auth.uid()
        AND membership.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can delete own dashboard resume activity"
  ON public.dashboard_resume_activities;
CREATE POLICY "Users can delete own dashboard resume activity"
  ON public.dashboard_resume_activities
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.dashboard_resume_activities TO authenticated;
GRANT ALL ON public.dashboard_resume_activities TO service_role;

COMMENT ON TABLE public.dashboard_resume_activities IS
  'Sanitized per-user dashboard resume metadata. Stores navigation labels only, never vault contents or private notes.';
