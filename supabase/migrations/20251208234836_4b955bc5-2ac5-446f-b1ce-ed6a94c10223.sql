-- Add phone_verified column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Add phone_verified_at timestamp for tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified_at timestamp with time zone;