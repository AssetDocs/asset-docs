-- Create insurance_policies table
CREATE TABLE public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_type TEXT NOT NULL DEFAULT 'homeowners',
  insurance_company TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  policy_start_date DATE,
  policy_end_date DATE,
  premium_amount NUMERIC,
  deductible NUMERIC,
  coverage_amount NUMERIC,
  coverage_details TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own insurance policies" 
ON public.insurance_policies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insurance policies" 
ON public.insurance_policies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies" 
ON public.insurance_policies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies" 
ON public.insurance_policies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_insurance_policies_updated_at
BEFORE UPDATE ON public.insurance_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();