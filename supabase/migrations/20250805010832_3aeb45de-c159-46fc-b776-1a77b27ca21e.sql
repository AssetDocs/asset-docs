-- Move extensions to the extensions schema instead of public
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop extensions from public schema if they exist there
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS http CASCADE;

-- Install extensions in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http SCHEMA extensions;

-- Re-schedule the gift reminder check using the properly installed cron
SELECT extensions.cron.schedule(
  'check-gift-reminders-daily',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    extensions.http_post(
        'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/check-gift-reminders',
        '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3RjYmZwcWlla2drZ3VtZWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzMzODcsImV4cCI6MjA2ODIwOTM4N30.s-Z38v63W56Ynb_6Y9boNYmGAMECM4I7mEvepMIh24U"}',
        '{}'
    );
  $$
);