-- Create storage_usage table to track user storage consumption
CREATE TABLE public.storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket_name TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size_bytes BIGINT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, bucket_name)
);

-- Enable RLS on storage_usage
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage_usage
CREATE POLICY "Users can view their own storage usage" 
ON public.storage_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage usage" 
ON public.storage_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage usage" 
ON public.storage_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to calculate user storage usage
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(target_user_id UUID)
RETURNS TABLE (
  bucket_name TEXT,
  file_count BIGINT,
  total_size_bytes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id::TEXT as bucket_name,
    COUNT(*)::BIGINT as file_count,
    COALESCE(SUM(metadata->>'size')::BIGINT, 0) as total_size_bytes
  FROM storage.objects 
  WHERE path_tokens[1] = target_user_id::TEXT
  GROUP BY bucket_id;
END;
$$;

-- Create function to update storage usage for a user
CREATE OR REPLACE FUNCTION public.update_user_storage_usage(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_record RECORD;
BEGIN
  -- Clear existing records for this user
  DELETE FROM public.storage_usage WHERE user_id = target_user_id;
  
  -- Insert updated usage data
  FOR bucket_record IN 
    SELECT * FROM public.calculate_user_storage_usage(target_user_id)
  LOOP
    INSERT INTO public.storage_usage (user_id, bucket_name, file_count, total_size_bytes)
    VALUES (target_user_id, bucket_record.bucket_name, bucket_record.file_count, bucket_record.total_size_bytes);
  END LOOP;
END;
$$;

-- Create trigger function for automatic storage usage updates
CREATE OR REPLACE FUNCTION public.handle_storage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Extract user_id from path_tokens
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.path_tokens[1]::UUID;
  ELSE
    target_user_id := NEW.path_tokens[1]::UUID;
  END IF;
  
  -- Update storage usage for the affected user
  PERFORM public.update_user_storage_usage(target_user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on storage.objects for automatic updates
CREATE TRIGGER storage_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_change();