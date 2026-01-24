-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Service role can manage deleted accounts" ON public.deleted_accounts;

-- Allow anyone to check if an email is in deleted_accounts (for login validation)
CREATE POLICY "Anyone can check deleted accounts"
ON public.deleted_accounts
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (from edge functions)
CREATE POLICY "Only service role can insert deleted accounts"
ON public.deleted_accounts
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update deleted accounts"
ON public.deleted_accounts
FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete deleted accounts"
ON public.deleted_accounts
FOR DELETE
USING (auth.role() = 'service_role');