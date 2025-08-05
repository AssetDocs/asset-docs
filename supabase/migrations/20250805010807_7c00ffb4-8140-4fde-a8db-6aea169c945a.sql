-- Enable cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable HTTP requests extension if not already enabled  
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule the gift reminder check to run daily at 9 AM UTC
SELECT cron.schedule(
  'check-gift-reminders-daily',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3RjYmZwcWlla2drZ3VtZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzMzODcsImV4cCI6MjA2ODIwOTM4N30.s-Z38v63W56Ynb_6Y9boNYmGAMECM4I7mEvepMIh24U"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);