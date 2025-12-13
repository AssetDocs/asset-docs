-- Delete inactive test users and their related data
-- First delete from contacts table
DELETE FROM public.contacts WHERE user_id IN (
  '05298602-edfc-403b-a423-fb8636f64a50',
  '79691d07-a583-41c5-9c16-fa127e8383b4',
  '35dd74ce-a076-42ec-a2b3-109fbaa5289d',
  '903e28eb-8147-4fa2-9746-0d3b32f90b5a'
);

-- Delete from subscribers table
DELETE FROM public.subscribers WHERE user_id IN (
  '05298602-edfc-403b-a423-fb8636f64a50',
  '79691d07-a583-41c5-9c16-fa127e8383b4',
  '35dd74ce-a076-42ec-a2b3-109fbaa5289d',
  '903e28eb-8147-4fa2-9746-0d3b32f90b5a'
);

-- Delete from profiles table
DELETE FROM public.profiles WHERE user_id IN (
  '05298602-edfc-403b-a423-fb8636f64a50',
  '79691d07-a583-41c5-9c16-fa127e8383b4',
  '35dd74ce-a076-42ec-a2b3-109fbaa5289d',
  '903e28eb-8147-4fa2-9746-0d3b32f90b5a'
);

-- Fix the check constraint for plan_status to allow 'incomplete' status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_plan_status;
ALTER TABLE public.profiles ADD CONSTRAINT check_plan_status 
  CHECK (plan_status IN ('inactive', 'active', 'trialing', 'canceled', 'past_due', 'incomplete', 'incomplete_expired'));