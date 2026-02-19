-- Allow anonymous users to submit the form (no auth required)
DROP POLICY IF EXISTS "Authenticated users can submit photographer interest" ON public.photographer_interest;

CREATE POLICY "Anyone can submit photographer interest"
ON public.photographer_interest
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
