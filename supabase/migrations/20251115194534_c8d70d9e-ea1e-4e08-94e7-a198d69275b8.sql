-- Create document_folders table similar to photo_folders and video_folders
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'from-blue-500 to-blue-600',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own document folders"
  ON public.document_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document folders"
  ON public.document_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document folders"
  ON public.document_folders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document folders"
  ON public.document_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_document_folders_updated_at
  BEFORE UPDATE ON public.document_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();