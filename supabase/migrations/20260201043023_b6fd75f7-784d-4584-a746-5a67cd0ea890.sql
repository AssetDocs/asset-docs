-- Fix the last remaining permissive policy on events table
-- Require that either user_id matches auth.uid() OR it's null (for anonymous tracking)
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;

-- Allow both authenticated and anonymous users to insert events
-- but authenticated users must use their own user_id if provided
CREATE POLICY "Users can insert own events"
ON public.events
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);