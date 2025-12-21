-- Drop the existing check constraint and add a new one that includes 'canceling'
ALTER TABLE public.profiles DROP CONSTRAINT check_plan_status;

ALTER TABLE public.profiles ADD CONSTRAINT check_plan_status 
CHECK (plan_status = ANY (ARRAY['inactive'::text, 'active'::text, 'trialing'::text, 'canceled'::text, 'canceling'::text, 'past_due'::text, 'incomplete'::text, 'incomplete_expired'::text]));