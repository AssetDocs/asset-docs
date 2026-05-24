CREATE OR REPLACE FUNCTION public.handle_storage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
  raw_token TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    raw_token := OLD.path_tokens[1];
  ELSE
    raw_token := NEW.path_tokens[1];
  END IF;

  -- Safely cast first path token to UUID; if it's not a UUID (e.g., public
  -- intake buckets that prefix paths with 'submission/...'), skip usage tracking.
  BEGIN
    target_user_id := raw_token::UUID;
  EXCEPTION WHEN others THEN
    RETURN COALESCE(NEW, OLD);
  END;

  PERFORM public.update_user_storage_usage(target_user_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$;