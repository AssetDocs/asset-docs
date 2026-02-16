-- Add RLS policies for recovery_requests table

-- Delegates can view their own recovery requests
CREATE POLICY "Delegates can view their own recovery requests"
ON public.recovery_requests FOR SELECT
USING (auth.uid() = delegate_user_id);

-- Owners can view recovery requests for their account
CREATE POLICY "Owners can view recovery requests for their account"
ON public.recovery_requests FOR SELECT
USING (auth.uid() = owner_user_id);

-- Delegates can submit recovery requests (only if they are the delegate on the legacy locker)
CREATE POLICY "Delegates can submit recovery requests"
ON public.recovery_requests FOR INSERT
WITH CHECK (
  auth.uid() = delegate_user_id
  AND EXISTS (
    SELECT 1 FROM public.legacy_locker
    WHERE id = legacy_locker_id
    AND delegate_user_id = auth.uid()
  )
);

-- Owners can respond to (update) recovery requests
CREATE POLICY "Owners can respond to recovery requests"
ON public.recovery_requests FOR UPDATE
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);
