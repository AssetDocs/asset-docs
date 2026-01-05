-- Update the handle_new_user function to use 'AS' prefix instead of 'AD'
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  account_num TEXT;
BEGIN
  -- Generate account number with format AS + 6-digit number (changed from AD to AS for Asset Safe)
  account_num := 'AS' || LPAD(nextval('account_number_seq')::TEXT, 6, '0');
  
  INSERT INTO public.profiles (user_id, first_name, last_name, account_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    account_num
  );

  RETURN NEW;
END;
$function$;