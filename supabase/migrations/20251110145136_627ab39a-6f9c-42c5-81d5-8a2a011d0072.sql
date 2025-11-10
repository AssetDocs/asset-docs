-- Create photo_folders table
CREATE TABLE IF NOT EXISTS public.photo_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'from-blue-500 to-blue-600',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photo_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own photo folders" 
ON public.photo_folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photo folders" 
ON public.photo_folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo folders" 
ON public.photo_folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photo folders" 
ON public.photo_folders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add folder_id to property_files table
ALTER TABLE public.property_files 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.photo_folders(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates on photo_folders
CREATE TRIGGER update_photo_folders_updated_at
BEFORE UPDATE ON public.photo_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();