-- Fix security vulnerability: Remove email-based access policy for subscribers table
-- This prevents potential data theft where attackers could access subscription data 
-- by knowing a user's email address

-- Drop the vulnerable email-based SELECT policy
DROP POLICY IF EXISTS "Users can view own subscription by email" ON public.subscribers;

-- The remaining policies provide secure access:
-- 1. "Users can view own subscription by user_id" - Secure user_id based access
-- 2. "Users can view their own subscription" - Also user_id based
-- 3. Service role policies for backend operations

-- Ensure user_id column is not nullable for security
-- (This prevents rows without user_id that could bypass security)
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;