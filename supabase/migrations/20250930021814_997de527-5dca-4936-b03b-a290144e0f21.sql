-- Add trial reminder tracking columns to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN trial_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN trial_reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add trial end date tracking (calculated as 30 days from creation if not set)
ALTER TABLE public.subscribers 
ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing records to set trial_end if they don't have it and are in trial
UPDATE public.subscribers 
SET trial_end = created_at + INTERVAL '30 days'
WHERE trial_end IS NULL 
AND subscribed = false;

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to check for trial reminders daily at 9 AM UTC
SELECT cron.schedule(
  'check-trial-reminders-daily',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-trial-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3RjYmZwcWlla2drZ3VtZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzMzODcsImV4cCI6MjA2ODIwOTM4N30.s-Z38v63W56Ynb_6Y9boNYmGAMECM4I7mEvepMIh24U"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);