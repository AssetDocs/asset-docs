-- Fix the broken leads table RLS policy
-- The current policy blocks ALL authenticated users from viewing leads
-- This fixes the lead management functionality

-- Drop the broken policy that prevents anyone from viewing leads
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

-- Create a new policy that allows authenticated users to view leads
-- This assumes leads should be viewable by staff/administrators
CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Note: If you need more granular access control (e.g., only admins can view leads),
-- you may want to implement a proper role system and restrict this further