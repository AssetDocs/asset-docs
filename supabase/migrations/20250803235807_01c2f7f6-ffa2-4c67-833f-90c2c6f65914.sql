-- Create gift_subscriptions table to track gift subscription purchases
CREATE TABLE public.gift_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE,
  plan_type TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_name TEXT NOT NULL,
  purchaser_phone TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  gift_message TEXT,
  delivery_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  redeemed_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gift_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for gift subscriptions
CREATE POLICY "Users can view gifts they purchased" 
ON public.gift_subscriptions 
FOR SELECT 
USING (purchaser_email = auth.email()::text);

CREATE POLICY "Users can view gifts sent to them" 
ON public.gift_subscriptions 
FOR SELECT 
USING (recipient_email = auth.email()::text);

CREATE POLICY "Edge functions can manage gift subscriptions" 
ON public.gift_subscriptions 
FOR ALL 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_gift_subscriptions_gift_code ON public.gift_subscriptions(gift_code);
CREATE INDEX idx_gift_subscriptions_stripe_session ON public.gift_subscriptions(stripe_session_id);
CREATE INDEX idx_gift_subscriptions_recipient_email ON public.gift_subscriptions(recipient_email);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_gift_subscriptions_updated_at
  BEFORE UPDATE ON public.gift_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();