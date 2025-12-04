-- Create trust_information table for Legacy Locker Trust section
CREATE TABLE public.trust_information (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Trust Basics
  trust_name TEXT,
  trust_type TEXT, -- Revocable Living, Irrevocable, Testamentary, Special Needs, Other
  effective_date DATE,
  amendment_count INTEGER DEFAULT 0,
  trust_purpose TEXT,
  
  -- Key People - stored as JSONB arrays for flexibility
  grantors JSONB DEFAULT '[]'::jsonb, -- [{name, email, phone, relationship}]
  current_trustees JSONB DEFAULT '[]'::jsonb, -- [{name, contact, authority_notes}]
  successor_trustees JSONB DEFAULT '[]'::jsonb,
  attorney_name TEXT,
  attorney_firm TEXT,
  attorney_phone TEXT,
  attorney_email TEXT,
  cpa_name TEXT,
  cpa_firm TEXT,
  cpa_phone TEXT,
  cpa_email TEXT,
  
  -- Beneficiaries - stored as JSONB array
  beneficiaries JSONB DEFAULT '[]'::jsonb, -- [{name, contact, relationship, type, notes, allocation_percent}]
  
  -- Trust Assets - links to existing inventory
  trust_assets JSONB DEFAULT '[]'::jsonb, -- [{asset_id, category, ownership_type}]
  
  -- Original Documents Storage
  originals_location TEXT, -- Safe Deposit Box, Home Safe, Attorney File, Other
  physical_access_instructions TEXT,
  keyholder_name TEXT,
  keyholder_contact TEXT,
  
  -- Uploaded Documents metadata
  trust_documents JSONB DEFAULT '[]'::jsonb, -- [{file_name, file_path, doc_type, description, upload_date, is_encrypted}]
  
  -- Encryption support
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trust_information ENABLE ROW LEVEL SECURITY;

-- Create policies - Owner full access
CREATE POLICY "Users can view their own trust information" 
ON public.trust_information 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trust information" 
ON public.trust_information 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trust information" 
ON public.trust_information 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trust information" 
ON public.trust_information 
FOR DELETE 
USING (auth.uid() = user_id);

-- Administrator contributors can view trust information
CREATE POLICY "Administrator contributors can view trust information" 
ON public.trust_information 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = trust_information.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trust_information_updated_at
BEFORE UPDATE ON public.trust_information
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();