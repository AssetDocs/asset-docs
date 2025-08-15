-- Update leads table to add security enhancements
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Remove anonymous lead insertion policy
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create new policy that only allows the edge function to insert leads
CREATE POLICY "Only edge functions can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');