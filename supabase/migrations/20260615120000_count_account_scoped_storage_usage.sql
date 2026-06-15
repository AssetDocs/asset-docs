-- Launch fix: count normalized account-scoped storage paths in storage usage.
-- Supports both legacy "{ownerUserId}/..." paths and newer
-- "accounts/{accountId}/..." paths without changing bucket RLS behavior.

CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(target_user_id uuid)
RETURNS TABLE(bucket_name text, file_count bigint, total_size_bytes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.bucket_id::text AS bucket_name,
    COUNT(*)::bigint AS file_count,
    COALESCE(SUM(
      CASE
        WHEN (o.metadata->>'size') ~ '^[0-9]+$' THEN (o.metadata->>'size')::bigint
        ELSE 0
      END
    ), 0)::bigint AS total_size_bytes
  FROM storage.objects o
  WHERE
    o.path_tokens[1] = target_user_id::text
    OR (
      o.path_tokens[1] = 'accounts'
      AND EXISTS (
        SELECT 1
        FROM public.accounts a
        WHERE a.id = public._safe_uuid(o.path_tokens[2])
          AND a.owner_user_id = target_user_id
      )
    )
  GROUP BY o.bucket_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_storage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
DECLARE
  target_user_id uuid;
  object_path text;
  path_parts text[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    object_path := OLD.name;
  ELSE
    object_path := NEW.name;
  END IF;

  path_parts := storage.foldername(object_path);

  IF path_parts[1] = 'accounts' THEN
    SELECT a.owner_user_id
      INTO target_user_id
    FROM public.accounts a
    WHERE a.id = public._safe_uuid(path_parts[2]);
  ELSE
    target_user_id := public._safe_uuid(path_parts[1]);
  END IF;

  IF target_user_id IS NOT NULL THEN
    PERFORM public.update_user_storage_usage(target_user_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE
  owner_id uuid;
BEGIN
  FOR owner_id IN
    SELECT DISTINCT owner_user_id
    FROM public.accounts
  LOOP
    PERFORM public.update_user_storage_usage(owner_id);
  END LOOP;
END $$;
