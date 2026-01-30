-- Create upgrade_repairs table
CREATE TABLE IF NOT EXISTS public.upgrade_repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date_completed date,
  location text,
  repair_type text,
  item_cost numeric DEFAULT 0,
  labor_cost numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create upgrade_repair_vendors table for multiple vendors per project
CREATE TABLE IF NOT EXISTS public.upgrade_repair_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upgrade_repair_id uuid NOT NULL REFERENCES public.upgrade_repairs(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upgrade_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_repair_vendors ENABLE ROW LEVEL SECURITY;

-- RLS policies for upgrade_repairs
CREATE POLICY "Users can view their own upgrade repairs"
  ON public.upgrade_repairs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own upgrade repairs"
  ON public.upgrade_repairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upgrade repairs"
  ON public.upgrade_repairs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upgrade repairs"
  ON public.upgrade_repairs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for vendors (cascade through parent)
CREATE POLICY "Users can view vendors for their repairs"
  ON public.upgrade_repair_vendors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.upgrade_repairs ur 
    WHERE ur.id = upgrade_repair_id AND ur.user_id = auth.uid()
  ));

CREATE POLICY "Users can create vendors for their repairs"
  ON public.upgrade_repair_vendors FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.upgrade_repairs ur 
    WHERE ur.id = upgrade_repair_id AND ur.user_id = auth.uid()
  ));

CREATE POLICY "Users can update vendors for their repairs"
  ON public.upgrade_repair_vendors FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.upgrade_repairs ur 
    WHERE ur.id = upgrade_repair_id AND ur.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete vendors for their repairs"
  ON public.upgrade_repair_vendors FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.upgrade_repairs ur 
    WHERE ur.id = upgrade_repair_id AND ur.user_id = auth.uid()
  ));