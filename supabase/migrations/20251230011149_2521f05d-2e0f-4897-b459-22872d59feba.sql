-- Create table for user documents (general document storage)
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  category TEXT NOT NULL DEFAULT 'general',
  document_name TEXT,
  description TEXT,
  tags TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.document_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own documents"
ON public.user_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
ON public.user_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.user_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.user_documents
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_documents_updated_at
BEFORE UPDATE ON public.user_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();