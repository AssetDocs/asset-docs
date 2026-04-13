
-- 1. Add account_name to accounts
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS account_name text;

-- 2. Add last_used_account_id to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_used_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL;

-- 3. Backfill account_name from owner's profile
UPDATE public.accounts a
SET account_name = COALESCE(
  (SELECT NULLIF(TRIM(p.first_name), '') || '''s Account'
   FROM public.profiles p
   WHERE p.user_id = a.owner_user_id
   LIMIT 1),
  'My Account'
)
WHERE a.account_name IS NULL;

-- 4. Update handle_new_user to set account_name on creation
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

-- 5. Update get_user_account_id to support multi-account (prefer last_used)
CREATE OR REPLACE FUNCTION public.get_user_account_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  preferred_id uuid;
  fallback_id uuid;
BEGIN
  -- Check last_used_account_id if set and still valid
  SELECT p.last_used_account_id INTO preferred_id
  FROM public.profiles p
  WHERE p.user_id = _user_id
    AND p.last_used_account_id IS NOT NULL;

  IF preferred_id IS NOT NULL THEN
    -- Validate membership is still active
    IF EXISTS (
      SELECT 1 FROM public.account_memberships
      WHERE user_id = _user_id AND account_id = preferred_id AND status = 'active'
    ) THEN
      RETURN preferred_id;
    END IF;
  END IF;

  -- Fallback: first active membership (prefer owner, then by created_at)
  SELECT am.account_id INTO fallback_id
  FROM public.account_memberships am
  WHERE am.user_id = _user_id AND am.status = 'active'
  ORDER BY
    CASE am.role WHEN 'owner' THEN 0 ELSE 1 END,
    am.created_at ASC
  LIMIT 1;

  RETURN fallback_id;
END;
$function$;
