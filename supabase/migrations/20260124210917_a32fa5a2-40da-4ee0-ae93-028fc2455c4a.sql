-- Create a table to track deleted accounts to prevent re-login
CREATE TABLE public.deleted_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  original_user_id UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_by TEXT DEFAULT 'self' -- 'self', 'admin', 'system'
);

-- Enable RLS
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert/read (for edge functions)
CREATE POLICY "Service role can manage deleted accounts"
ON public.deleted_accounts
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create index for fast email lookups
CREATE INDEX idx_deleted_accounts_email ON public.deleted_accounts(email);

-- Add comment explaining purpose
COMMENT ON TABLE public.deleted_accounts IS 'Tracks emails of deleted accounts to prevent re-login attempts';