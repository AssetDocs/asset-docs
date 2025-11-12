-- Create video_folders table
CREATE TABLE IF NOT EXISTS public.video_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own video folders" 
  ON public.video_folders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video folders" 
  ON public.video_folders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video folders" 
  ON public.video_folders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video folders" 
  ON public.video_folders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_video_folders_updated_at
  BEFORE UPDATE ON public.video_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();