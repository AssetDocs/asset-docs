ALTER TABLE public.user_activity_logs
  ADD COLUMN IF NOT EXISTS actor_type text;

ALTER TABLE public.user_activity_logs
  DROP CONSTRAINT IF EXISTS user_activity_logs_actor_type_check;
ALTER TABLE public.user_activity_logs
  ADD CONSTRAINT user_activity_logs_actor_type_check
  CHECK (actor_type IS NULL OR actor_type IN ('owner','authorized_user','admin','service_role','system'));

-- Allow Authorized Users to record activity against the account they modified,
-- but never to impersonate another actor.
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (
    (actor_user_id IS NULL OR actor_user_id = auth.uid())
    AND (
      user_id = auth.uid()
      OR public.is_account_member(auth.uid(), public.get_user_account_id(user_id))
    )
  );

-- Owners should be able to see activity performed inside their account by others.
DROP POLICY IF EXISTS "Owners can view account activity logs" ON public.user_activity_logs;
CREATE POLICY "Owners can view account activity logs"
  ON public.user_activity_logs FOR SELECT TO authenticated
  USING (public.is_account_owner(auth.uid(), public.get_user_account_id(user_id)));

DELETE FROM public.content_audit_events WHERE record_label LIKE 'AUDIT TRIGGER SELFTEST%';