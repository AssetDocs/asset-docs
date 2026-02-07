
-- Create notes_traditions table
CREATE TABLE public.notes_traditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  holiday TEXT,
  content TEXT,
  file_path TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  bucket_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_recipes table
CREATE TABLE public.family_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_name TEXT NOT NULL,
  created_by_person TEXT,
  details TEXT,
  file_path TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  bucket_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes_traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for notes_traditions
CREATE POLICY "Users can view their own notes" ON public.notes_traditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes_traditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes_traditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes_traditions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for family_recipes
CREATE POLICY "Users can view their own recipes" ON public.family_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recipes" ON public.family_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.family_recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.family_recipes FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_notes_traditions_updated_at
  BEFORE UPDATE ON public.notes_traditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_recipes_updated_at
  BEFORE UPDATE ON public.family_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
