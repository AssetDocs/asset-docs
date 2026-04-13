
-- 1. Create membership_role enum
CREATE TYPE public.membership_role AS ENUM ('owner', 'full_access', 'read_only');

-- 2. Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_accounts_owner ON public.accounts (owner_user_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 3. Create account_memberships table
CREATE TABLE public.account_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.membership_role NOT NULL DEFAULT 'read_only',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (account_id, user_id)
);
CREATE INDEX idx_memberships_user ON public.account_memberships (user_id, status);
CREATE INDEX idx_memberships_account ON public.account_memberships (account_id, status);

ALTER TABLE public.account_memberships ENABLE ROW LEVEL SECURITY;

-- 4. Create invites table
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.membership_role NOT NULL DEFAULT 'read_only',
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invites_no_owner_role CHECK (role != 'owner')
);
CREATE INDEX idx_invites_token_hash ON public.invites (token_hash);
CREATE INDEX idx_invites_email ON public.invites (email, status);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 5. Helper function: get account_id for a user
CREATE OR REPLACE FUNCTION public.get_user_account_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id
  FROM public.account_memberships
  WHERE user_id = _user_id
    AND status = 'active'
    AND role = 'owner'
  LIMIT 1;
$$;

-- 6. Helper function: check if user is member of an account
CREATE OR REPLACE FUNCTION public.is_account_member(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_memberships
    WHERE user_id = _user_id
      AND account_id = _account_id
      AND status = 'active'
  );
$$;

-- 7. Helper function: check if user is owner of an account
CREATE OR REPLACE FUNCTION public.is_account_owner(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_memberships
    WHERE user_id = _user_id
      AND account_id = _account_id
      AND role = 'owner'
      AND status = 'active'
  );
$$;

-- 8. RLS policies for accounts
CREATE POLICY "Members can view their accounts"
  ON public.accounts FOR SELECT
  USING (public.is_account_member(auth.uid(), id));

CREATE POLICY "System creates accounts via trigger"
  ON public.accounts FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- 9. RLS policies for account_memberships
CREATE POLICY "Members can view memberships for their accounts"
  ON public.account_memberships FOR SELECT
  USING (public.is_account_member(auth.uid(), account_id));

CREATE POLICY "Owners can insert memberships"
  ON public.account_memberships FOR INSERT
  WITH CHECK (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Owners can update memberships"
  ON public.account_memberships FOR UPDATE
  USING (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Owners can delete memberships"
  ON public.account_memberships FOR DELETE
  USING (public.is_account_owner(auth.uid(), account_id));

-- 10. RLS policies for invites
CREATE POLICY "Members can view invites for their accounts"
  ON public.invites FOR SELECT
  USING (public.is_account_member(auth.uid(), account_id));

CREATE POLICY "Owners can create invites"
  ON public.invites FOR INSERT
  WITH CHECK (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Owners can update invites"
  ON public.invites FOR UPDATE
  USING (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Owners can delete invites"
  ON public.invites FOR DELETE
  USING (public.is_account_owner(auth.uid(), account_id));

-- 11. Extend handle_new_user trigger to create account + membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  account_num TEXT;
  new_account_id UUID;
BEGIN
  -- Generate account number
  account_num := 'AS' || LPAD(nextval('account_number_seq')::TEXT, 6, '0');
  
  INSERT INTO public.profiles (user_id, first_name, last_name, account_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    account_num
  );

  -- Create account for this user
  INSERT INTO public.accounts (owner_user_id)
  VALUES (NEW.id)
  RETURNING id INTO new_account_id;

  -- Create owner membership
  INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
  VALUES (new_account_id, NEW.id, 'owner', 'active', now());

  RETURN NEW;
END;
$function$;

-- 12. Backfill: create accounts and memberships for ALL existing users
DO $$
DECLARE
  r RECORD;
  new_account_id UUID;
BEGIN
  FOR r IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT owner_user_id FROM public.accounts)
  LOOP
    INSERT INTO public.accounts (owner_user_id)
    VALUES (r.id)
    RETURNING id INTO new_account_id;

    INSERT INTO public.account_memberships (account_id, user_id, role, status, accepted_at)
    VALUES (new_account_id, r.id, 'owner', 'active', now());
  END LOOP;
END;
$$;
