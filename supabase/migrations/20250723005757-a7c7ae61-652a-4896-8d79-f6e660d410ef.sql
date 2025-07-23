-- Fix security definer functions by setting secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  account_num TEXT;
BEGIN
  -- Generate account number with format AD + 6-digit number
  account_num := 'AD' || LPAD(nextval('account_number_seq')::TEXT, 6, '0');
  
  INSERT INTO public.profiles (user_id, first_name, last_name, account_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    account_num
  );

  -- Call the send-welcome-email edge function
  PERFORM
    net.http_post(
      url := 'https://leotcbfpqiekgkgumecn.supabase.co/functions/v1/send-welcome-email',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id::text,
        'email', NEW.email,
        'first_name', NEW.raw_user_meta_data ->> 'first_name',
        'last_name', NEW.raw_user_meta_data ->> 'last_name'
      )::text
    );

  RETURN NEW;
END;
$function$;

-- Fix the other security definer function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;