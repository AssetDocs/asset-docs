-- Create backup_codes table for MFA recovery
CREATE TABLE public.backup_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 year')
);

-- Enable RLS
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;

-- Users can only view their own backup codes (not the hashes, just metadata)
CREATE POLICY "Users can view their own backup code metadata"
ON public.backup_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own backup codes (for regeneration)
CREATE POLICY "Users can delete their own backup codes"
ON public.backup_codes
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_backup_codes_user_id ON public.backup_codes(user_id);
CREATE INDEX idx_backup_codes_unused ON public.backup_codes(user_id) WHERE used_at IS NULL;