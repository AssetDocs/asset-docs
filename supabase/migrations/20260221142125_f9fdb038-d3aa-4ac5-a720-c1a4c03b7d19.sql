
-- Tax Return Folders
CREATE TABLE public.tax_return_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_return_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax return folders" ON public.tax_return_folders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tax Returns
CREATE TABLE public.tax_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.tax_return_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  tax_year TEXT,
  notes TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'documents',
  tags TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax returns" ON public.tax_returns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tax_returns_updated_at BEFORE UPDATE ON public.tax_returns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial Loan Folders
CREATE TABLE public.financial_loan_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_loan_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial loan folders" ON public.financial_loan_folders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financial Loans
CREATE TABLE public.financial_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.financial_loan_folders(id) ON DELETE SET NULL,
  loan_type TEXT,
  institution TEXT,
  loan_terms TEXT,
  total_amount NUMERIC,
  apr NUMERIC,
  monthly_payment NUMERIC,
  start_date DATE,
  maturity_date DATE,
  account_number TEXT,
  notes TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'documents',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial loans" ON public.financial_loans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_loans_updated_at BEFORE UPDATE ON public.financial_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
