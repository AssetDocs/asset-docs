-- Add explicit SELECT policy so users can read only their own consent records
CREATE POLICY "Users can view their own consent records"
ON public.user_consents
FOR SELECT
TO authenticated
USING (auth.email() = user_email);