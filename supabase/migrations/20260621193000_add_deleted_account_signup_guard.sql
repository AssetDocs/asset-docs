CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.is_deleted_account_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.deleted_accounts da
    WHERE lower(da.email) = lower(trim(p_email))
       OR da.email_hash = encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex')
  );
$$;

REVOKE ALL ON FUNCTION public.is_deleted_account_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_deleted_account_email(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  account_num TEXT;
  new_account_id UUID;
  owner_first_name TEXT;
BEGIN
  IF public.is_deleted_account_email(NEW.email) THEN
    RAISE EXCEPTION 'account_reuse_blocked'
      USING ERRCODE = '23514';
  END IF;

  account_num := 'AS' || LPAD(nextval('account_number_seq')::TEXT, 6, '0');
  owner_first_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'first_name'), '');

  INSERT INTO public.profiles (user_id, first_name, last_name, account_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    account_num
  );

  INSERT INTO public.accounts (owner_user_id, account_name)
  VALUES (NEW.id, COALESCE(owner_first_name || '''s Account', 'My Account'))
  RETURNING id INTO new_account_id;

  INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
  VALUES (new_account_id, NEW.id, 'owner', 'active', now());

  RETURN NEW;
END;
$function$;
