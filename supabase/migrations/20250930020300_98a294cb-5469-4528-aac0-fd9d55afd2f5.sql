-- Create payment_events table for audit logging
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  user_id UUID,
  customer_id TEXT,
  subscription_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT,
  event_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only service role can manage payment events"
ON public.payment_events
FOR ALL
USING (current_setting('role') = 'service_role');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_id ON public.payment_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON public.payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON public.payment_events(event_type);