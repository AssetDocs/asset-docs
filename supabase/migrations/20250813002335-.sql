-- Create items table for inventory tracking
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_value DECIMAL(10,2),
  category TEXT,
  item_type TEXT,
  property_upgrade TEXT,
  property_id TEXT,
  location TEXT,
  condition TEXT,
  brand TEXT,
  model TEXT,
  ai_generated BOOLEAN DEFAULT false,
  confidence INTEGER,
  is_manual_entry BOOLEAN DEFAULT false,
  photo_url TEXT,
  photo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Users can view their own items" 
ON public.items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" 
ON public.items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" 
ON public.items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" 
ON public.items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Contributors can view items they have access to
CREATE POLICY "Contributors can view items with access" 
ON public.items 
FOR SELECT 
USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  receipt_name TEXT NOT NULL,
  receipt_url TEXT NOT NULL,
  receipt_path TEXT NOT NULL,
  file_size INTEGER,
  purchase_date DATE,
  purchase_amount DECIMAL(10,2),
  merchant_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for receipts
CREATE POLICY "Users can view their own receipts" 
ON public.receipts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts" 
ON public.receipts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts" 
ON public.receipts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts" 
ON public.receipts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Contributors can view receipts for items they have access to
CREATE POLICY "Contributors can view receipts with access" 
ON public.receipts 
FOR SELECT 
USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Create trigger for automatic timestamp updates on items
CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on receipts
CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_item_type ON public.items(item_type);
CREATE INDEX idx_receipts_item_id ON public.receipts(item_id);
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);