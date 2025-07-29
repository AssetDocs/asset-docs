-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(target_user_id UUID)
RETURNS TABLE (
  bucket_name TEXT,
  file_count BIGINT,
  total_size_bytes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
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

-- Fix search path for update function
CREATE OR REPLACE FUNCTION public.update_user_storage_usage(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search path for trigger function
CREATE OR REPLACE FUNCTION public.handle_storage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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