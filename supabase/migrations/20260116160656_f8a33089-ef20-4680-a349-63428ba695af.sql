-- Create damage_reports table to store incident details
CREATE TABLE public.damage_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date_of_damage DATE,
  approximate_time TEXT,
  incident_types TEXT[] DEFAULT '{}',
  other_incident_type TEXT,
  areas_affected TEXT[] DEFAULT '{}',
  other_area TEXT,
  impact_buckets TEXT[] DEFAULT '{}',
  belongings_items TEXT[] DEFAULT '{}',
  other_belongings TEXT,
  visible_damage TEXT[] DEFAULT '{}',
  damage_ongoing TEXT,
  safety_concerns TEXT[] DEFAULT '{}',
  actions_taken TEXT[] DEFAULT '{}',
  estimated_cost TEXT,
  contacted_someone TEXT,
  professionals_contacted TEXT[] DEFAULT '{}',
  claim_number TEXT,
  company_names TEXT,
  additional_observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own damage reports" 
ON public.damage_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own damage reports" 
ON public.damage_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own damage reports" 
ON public.damage_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own damage reports" 
ON public.damage_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_damage_reports_updated_at
BEFORE UPDATE ON public.damage_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();