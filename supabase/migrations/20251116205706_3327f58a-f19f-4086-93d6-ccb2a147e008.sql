-- Create legacy_locker table for storing will and testament information
CREATE TABLE public.legacy_locker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  
  -- Personal Information
  full_legal_name TEXT,
  address TEXT,
  
  -- Executor Information
  executor_name TEXT,
  executor_relationship TEXT,
  executor_contact TEXT,
  backup_executor_name TEXT,
  backup_executor_contact TEXT,
  
  -- Guardian Information (for minor children)
  guardian_name TEXT,
  guardian_relationship TEXT,
  guardian_contact TEXT,
  backup_guardian_name TEXT,
  backup_guardian_contact TEXT,
  
  -- Asset Distribution (stored as JSON for flexibility)
  specific_bequests JSONB,
  general_bequests JSONB,
  residuary_estate TEXT,
  
  -- Digital Assets
  digital_assets JSONB,
  
  -- Real Estate
  real_estate_instructions TEXT,
  
  -- Debts and Expenses
  debts_expenses TEXT,
  
  -- Funeral Wishes
  funeral_wishes TEXT,
  burial_or_cremation TEXT,
  ceremony_preferences TEXT,
  organ_donation BOOLEAN,
  
  -- Additional Instructions
  no_contest_clause BOOLEAN DEFAULT true,
  letters_to_loved_ones TEXT,
  pet_care_instructions TEXT,
  business_succession_plan TEXT,
  ethical_will TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.legacy_locker ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own legacy locker
CREATE POLICY "Users can view their own legacy locker"
ON public.legacy_locker
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own legacy locker
CREATE POLICY "Users can insert their own legacy locker"
ON public.legacy_locker
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own legacy locker
CREATE POLICY "Users can update their own legacy locker"
ON public.legacy_locker
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own legacy locker
CREATE POLICY "Users can delete their own legacy locker"
ON public.legacy_locker
FOR DELETE
USING (auth.uid() = user_id);

-- Allow contributors to view non-encrypted legacy lockers
CREATE POLICY "Contributors can view non-encrypted legacy lockers"
ON public.legacy_locker
FOR SELECT
USING (
  is_encrypted = false
  AND EXISTS (
    SELECT 1
    FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = legacy_locker.user_id
    AND c.status = 'accepted'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_legacy_locker_updated_at
BEFORE UPDATE ON public.legacy_locker
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();