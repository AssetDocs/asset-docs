-- Add household_income column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS household_income text;