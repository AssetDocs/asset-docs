-- Launch fix: Emergency Instructions are owner-authored but visible to active
-- Authorized Users on the owner's account. Writes remain owner-only.

DROP POLICY IF EXISTS "Users can view their own emergency instructions"
  ON public.emergency_instructions;

DROP POLICY IF EXISTS "Account members can view emergency instructions"
  ON public.emergency_instructions;

CREATE POLICY "Account members can view emergency instructions"
  ON public.emergency_instructions FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'read_only')
  );
