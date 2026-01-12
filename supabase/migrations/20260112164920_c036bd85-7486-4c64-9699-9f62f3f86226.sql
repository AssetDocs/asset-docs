-- Add column to control admin access to Secure Vault
ALTER TABLE public.legacy_locker 
ADD COLUMN IF NOT EXISTS allow_admin_access BOOLEAN NOT NULL DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.legacy_locker.allow_admin_access IS 'Controls whether administrator contributors can access the Secure Vault. Default is true (allowed).';