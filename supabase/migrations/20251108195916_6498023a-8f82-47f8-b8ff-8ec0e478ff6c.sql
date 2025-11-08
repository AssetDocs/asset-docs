-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  square_footage INTEGER,
  year_built INTEGER,
  estimated_value NUMERIC,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Users can view their own properties
CREATE POLICY "Users can view their own properties"
  ON public.properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own properties
CREATE POLICY "Users can create their own properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own properties
CREATE POLICY "Users can update their own properties"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own properties
CREATE POLICY "Users can delete their own properties"
  ON public.properties
  FOR DELETE
  USING (auth.uid() = user_id);

-- Contributors can view properties
CREATE POLICY "Contributors can view properties with access"
  ON public.properties
  FOR SELECT
  USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Create property_files table to track all files associated with properties
CREATE TABLE IF NOT EXISTS public.property_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'video', 'document', 'floor-plan')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.property_files ENABLE ROW LEVEL SECURITY;

-- Users can view their own property files
CREATE POLICY "Users can view their own property files"
  ON public.property_files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own property files
CREATE POLICY "Users can create their own property files"
  ON public.property_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own property files
CREATE POLICY "Users can delete their own property files"
  ON public.property_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Contributors can view property files
CREATE POLICY "Contributors can view property files with access"
  ON public.property_files
  FOR SELECT
  USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Add trigger for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_property_files_property_id ON public.property_files(property_id);
CREATE INDEX idx_property_files_user_id ON public.property_files(user_id);
CREATE INDEX idx_property_files_file_type ON public.property_files(file_type);