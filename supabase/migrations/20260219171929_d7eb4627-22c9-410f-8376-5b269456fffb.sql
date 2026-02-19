
CREATE TABLE public.emergency_instructions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  primary_contact jsonb DEFAULT '{}',
  secondary_contact jsonb DEFAULT '{}',
  first_actions jsonb DEFAULT '{}',
  access_notes jsonb DEFAULT '{}',
  property_assets jsonb DEFAULT '{}',
  professionals jsonb DEFAULT '[]',
  family_notes text DEFAULT ''
);

ALTER TABLE public.emergency_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emergency instructions"
  ON public.emergency_instructions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency instructions"
  ON public.emergency_instructions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency instructions"
  ON public.emergency_instructions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency instructions"
  ON public.emergency_instructions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_emergency_instructions_updated_at
  BEFORE UPDATE ON public.emergency_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
