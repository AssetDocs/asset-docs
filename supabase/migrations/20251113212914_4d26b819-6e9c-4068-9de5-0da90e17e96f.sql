-- Create financial_accounts table for storing encrypted financial account information
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_type TEXT NOT NULL,
  account_name TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  current_balance NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own financial accounts" 
ON public.financial_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial accounts" 
ON public.financial_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial accounts" 
ON public.financial_accounts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial accounts" 
ON public.financial_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_accounts_updated_at
BEFORE UPDATE ON public.financial_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();