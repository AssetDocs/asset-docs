
-- New gifts table (token-based redemption)
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  gift_message TEXT,
  term TEXT NOT NULL DEFAULT 'yearly',
  expires_at TIMESTAMPTZ,
  redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_by_user_id UUID,
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own gift"
  ON public.gifts FOR SELECT
  USING (redeemed_by_user_id = auth.uid() OR recipient_email = auth.email());

-- user_consents table for audit trail
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log consent"
  ON public.user_consents FOR INSERT
  WITH CHECK (true);

-- Add billing_status to entitlements if not present
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active';

-- Add expires_at to entitlements if not present
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
