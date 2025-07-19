-- Add account_number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_number TEXT UNIQUE;

-- Create a sequence for generating account numbers
CREATE SEQUENCE IF NOT EXISTS account_number_seq START 10000;

-- Update the handle_new_user function to generate account numbers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  RETURN NEW;
END;
$$;