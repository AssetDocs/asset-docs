-- 1. Add restrictive DELETE policy to subscribers table
CREATE POLICY "Only service role can delete subscribers" 
ON public.subscribers 
FOR DELETE 
USING (false);

-- 2. Create account_deletion_requests table for admin contributor deletion flow
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_owner_id UUID NOT NULL,
  requester_user_id UUID NOT NULL,
  reason TEXT,
  grace_period_days INTEGER NOT NULL DEFAULT 14,
  grace_period_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired'))
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Account owners can view and respond to deletion requests for their account
CREATE POLICY "Account owners can view deletion requests"
ON public.account_deletion_requests
FOR SELECT
USING (auth.uid() = account_owner_id);

CREATE POLICY "Account owners can update deletion requests"
ON public.account_deletion_requests
FOR UPDATE
USING (auth.uid() = account_owner_id);

-- Admin contributors can create and view deletion requests they initiated
CREATE POLICY "Admin contributors can create deletion requests"
ON public.account_deletion_requests
FOR INSERT
WITH CHECK (
  auth.uid() = requester_user_id 
  AND EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = account_deletion_requests.account_owner_id
    AND c.role = 'administrator'
    AND c.status = 'accepted'
  )
);

CREATE POLICY "Requesters can view their own requests"
ON public.account_deletion_requests
FOR SELECT
USING (auth.uid() = requester_user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_account_deletion_requests_updated_at
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();