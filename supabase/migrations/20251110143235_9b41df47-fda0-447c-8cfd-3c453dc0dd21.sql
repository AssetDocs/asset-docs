-- Create source_websites table
CREATE TABLE IF NOT EXISTS public.source_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.source_websites ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own source websites" 
ON public.source_websites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own source websites" 
ON public.source_websites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own source websites" 
ON public.source_websites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own source websites" 
ON public.source_websites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_source_websites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_source_websites_updated_at
BEFORE UPDATE ON public.source_websites
FOR EACH ROW
EXECUTE FUNCTION public.update_source_websites_updated_at();