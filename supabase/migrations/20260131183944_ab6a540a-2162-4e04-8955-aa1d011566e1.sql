-- Create table to store legal agreement signatures
CREATE TABLE public.legal_agreement_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_type TEXT NOT NULL, -- 'confidentiality', 'offshore', 'contractor', 'equity'
  signer_role TEXT NOT NULL, -- 'company', 'developer', 'subcontractor_1', etc.
  signer_name TEXT,
  signer_email TEXT,
  signer_location TEXT,
  signature_text TEXT,
  signature_date DATE,
  acknowledgments JSONB DEFAULT '{}', -- stores checkbox states
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_agreement_signatures ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage legal signatures
CREATE POLICY "Admins can view all legal signatures"
  ON public.legal_agreement_signatures
  FOR SELECT
  USING (has_app_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages legal signatures"
  ON public.legal_agreement_signatures
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_legal_signatures_agreement_type ON public.legal_agreement_signatures(agreement_type);
CREATE INDEX idx_legal_signatures_signer_role ON public.legal_agreement_signatures(signer_role);