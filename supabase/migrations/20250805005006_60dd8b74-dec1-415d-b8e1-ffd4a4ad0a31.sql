-- Add columns to track gift usage and reminder emails
ALTER TABLE public.gift_subscriptions 
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of gifts needing reminders
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_reminder_check 
ON public.gift_subscriptions (first_login_at, reminder_email_sent) 
WHERE redeemed = true AND reminder_email_sent = false;