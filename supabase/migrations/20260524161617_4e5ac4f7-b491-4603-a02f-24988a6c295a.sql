ALTER TABLE public.account_memberships ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_account_memberships_email ON public.account_memberships(email);

COMMENT ON COLUMN public.account_memberships.email IS 'The email address of the invited user, stored at acceptance for display purposes.';