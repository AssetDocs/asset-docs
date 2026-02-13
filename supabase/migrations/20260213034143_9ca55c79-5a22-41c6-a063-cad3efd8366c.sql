
-- Create memory_safe_folders table
CREATE TABLE public.memory_safe_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_name TEXT NOT NULL,
  description TEXT,
  gradient_color TEXT NOT NULL DEFAULT 'bg-gradient-to-br from-rose-500 to-pink-600',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_safe_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory folders" ON public.memory_safe_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own memory folders" ON public.memory_safe_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memory folders" ON public.memory_safe_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memory folders" ON public.memory_safe_folders FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_memory_safe_folders_updated_at BEFORE UPDATE ON public.memory_safe_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create memory_safe_items table
CREATE TABLE public.memory_safe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  folder_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_safe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory items" ON public.memory_safe_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own memory items" ON public.memory_safe_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memory items" ON public.memory_safe_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memory items" ON public.memory_safe_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_memory_safe_items_updated_at BEFORE UPDATE ON public.memory_safe_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create memory-safe storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('memory-safe', 'memory-safe', false);

-- Storage RLS policies
CREATE POLICY "Users can view their own memory files" ON storage.objects FOR SELECT USING (bucket_id = 'memory-safe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own memory files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-safe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own memory files" ON storage.objects FOR UPDATE USING (bucket_id = 'memory-safe' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own memory files" ON storage.objects FOR DELETE USING (bucket_id = 'memory-safe' AND auth.uid()::text = (storage.foldername(name))[1]);
