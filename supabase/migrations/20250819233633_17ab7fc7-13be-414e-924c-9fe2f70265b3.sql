-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.validate_service_role_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role access from specific edge functions or webhooks
  RETURN current_setting('role') = 'service_role' AND (
    current_setting('request.path', true) LIKE '%webhook%' OR
    current_setting('request.path', true) LIKE '%checkout%' OR
    current_setting('request.path', true) LIKE '%subscription%' OR
    current_setting('request.path', true) LIKE '%gift%'
  );
END;
$$;