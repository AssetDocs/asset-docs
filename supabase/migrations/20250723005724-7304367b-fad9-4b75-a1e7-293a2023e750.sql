-- Update the handle_new_user function to send welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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