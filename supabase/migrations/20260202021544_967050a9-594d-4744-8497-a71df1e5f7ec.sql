-- Add new admin roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'qa';