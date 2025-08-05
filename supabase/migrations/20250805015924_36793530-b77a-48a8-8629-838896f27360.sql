-- Create cron job to check for payment failures daily at 9 AM UTC
SELECT cron.schedule(
  'check-payment-failures-daily',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-payment-failures',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3RjYmZwcWlla2drZ3VtZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzMzODcsImV4cCI6MjA2ODIwOTM4N30.s-Z38v63W56Ynb_6Y9boNYmGAMECM4I7mEvepMIh24U"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);