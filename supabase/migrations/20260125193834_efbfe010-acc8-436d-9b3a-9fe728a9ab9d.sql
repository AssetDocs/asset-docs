-- Add Verified+ columns to account_verification table
ALTER TABLE public.account_verification
ADD COLUMN has_2fa BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_verified_plus BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN verified_plus_at TIMESTAMPTZ;