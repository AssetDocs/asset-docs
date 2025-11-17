-- Create legacy_locker_folders table
CREATE TABLE IF NOT EXISTS public.legacy_locker_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legacy_locker_files table
CREATE TABLE IF NOT EXISTS public.legacy_locker_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.legacy_locker_folders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  bucket_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legacy_locker_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_locker_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legacy_locker_folders
CREATE POLICY "Users can view their own legacy locker folders"
  ON public.legacy_locker_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legacy locker folders"
  ON public.legacy_locker_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legacy locker folders"
  ON public.legacy_locker_folders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy locker folders"
  ON public.legacy_locker_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for legacy_locker_files
CREATE POLICY "Users can view their own legacy locker files"
  ON public.legacy_locker_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own legacy locker files"
  ON public.legacy_locker_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legacy locker files"
  ON public.legacy_locker_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updating updated_at timestamp
CREATE TRIGGER update_legacy_locker_folders_updated_at
  BEFORE UPDATE ON public.legacy_locker_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();