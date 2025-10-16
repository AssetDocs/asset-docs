-- Fix calculate_user_storage_usage to correctly SUM file sizes as bigint
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(target_user_id uuid)
RETURNS TABLE(bucket_name text, file_count bigint, total_size_bytes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id::TEXT as bucket_name,
    COUNT(*)::BIGINT as file_count,
    COALESCE(SUM(
      CASE 
        WHEN (metadata->>'size') ~ '^[0-9]+$' THEN (metadata->>'size')::BIGINT
        ELSE 0
      END
    ), 0)::BIGINT as total_size_bytes
  FROM storage.objects 
  WHERE path_tokens[1] = target_user_id::TEXT
  GROUP BY bucket_id;
END;
$$;