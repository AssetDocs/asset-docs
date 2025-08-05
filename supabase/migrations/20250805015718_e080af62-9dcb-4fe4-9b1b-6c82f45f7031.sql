-- Add payment failure tracking columns to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS payment_failure_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_failure_reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_failure_check TIMESTAMPTZ;