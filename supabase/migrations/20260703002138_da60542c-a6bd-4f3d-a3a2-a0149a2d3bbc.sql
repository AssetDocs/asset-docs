DROP POLICY IF EXISTS "Service role manages stripe event replay requests" ON public.stripe_event_replay_requests;

CREATE POLICY "Service role manages stripe event replay requests"
ON public.stripe_event_replay_requests
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);