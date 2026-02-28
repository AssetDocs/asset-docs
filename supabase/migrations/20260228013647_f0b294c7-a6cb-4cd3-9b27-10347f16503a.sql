
-- P1: Create lifetime_codes table for revocable, usage-tracked gift codes
CREATE TABLE IF NOT EXISTS public.lifetime_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  max_uses INTEGER NOT NULL DEFAULT 1,
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lifetime_codes ENABLE ROW LEVEL SECURITY;

-- Only service_role (edge functions) can read/write lifetime_codes — no client access
CREATE POLICY "Service role only on lifetime_codes"
  ON public.lifetime_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Seed the existing code
INSERT INTO public.lifetime_codes (code, description, max_uses, times_redeemed, is_active)
VALUES ('ASL2025', 'Asset Safe Lifetime 2025 launch code', 100, 0, true)
ON CONFLICT (code) DO NOTHING;

-- P4: Add INSERT RLS policy on events table so anon client can insert analytics rows
CREATE POLICY "Anyone can insert analytics events"
  ON public.events
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = auth.uid()
  );
