-- Create password_catalog table for storing website credentials
CREATE TABLE IF NOT EXISTS public.password_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  password TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.password_catalog ENABLE ROW LEVEL SECURITY;

-- Users can only view their own passwords
CREATE POLICY "Users can view their own passwords"
  ON public.password_catalog
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own passwords
CREATE POLICY "Users can insert their own passwords"
  ON public.password_catalog
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own passwords
CREATE POLICY "Users can update their own passwords"
  ON public.password_catalog
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own passwords
CREATE POLICY "Users can delete their own passwords"
  ON public.password_catalog
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_password_catalog_user_id ON public.password_catalog(user_id);

-- Add updated_at trigger
CREATE TRIGGER update_password_catalog_updated_at
  BEFORE UPDATE ON public.password_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();