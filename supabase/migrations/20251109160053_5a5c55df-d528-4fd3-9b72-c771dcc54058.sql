-- Drop existing function CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.has_contributor_access(uuid, contributor_role) CASCADE;

-- Create security definer function to check contributor access
CREATE OR REPLACE FUNCTION public.has_contributor_access(_user_id uuid, _required_role contributor_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contributors c
    WHERE (c.contributor_user_id = _user_id OR c.account_owner_id = _user_id)
      AND c.status = 'accepted'
      AND (
        -- Account owner always has full access
        c.account_owner_id = _user_id
        OR
        -- Check contributor role hierarchy: administrator > contributor > viewer
        CASE _required_role
          WHEN 'viewer' THEN c.role IN ('viewer', 'contributor', 'administrator')
          WHEN 'contributor' THEN c.role IN ('contributor', 'administrator')
          WHEN 'administrator' THEN c.role = 'administrator'
        END
      )
  )
  -- Or if the user is the account owner (not a contributor)
  OR _user_id IN (
    SELECT user_id FROM public.profiles WHERE user_id = _user_id
  )
$$;

-- Update RLS policies for items table to respect contributor roles
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
DROP POLICY IF EXISTS "Contributors can view items with access" ON public.items;
CREATE POLICY "Contributors can view items with access"
ON public.items
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'viewer'::contributor_role)
);

-- Update items INSERT policy for contributors
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
CREATE POLICY "Users can create their own items"
ON public.items
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Update items UPDATE policy for contributors
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
CREATE POLICY "Users can update their own items"
ON public.items
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Update items DELETE policy - only administrators and owners
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;
CREATE POLICY "Users can delete their own items"
ON public.items
FOR DELETE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'administrator'::contributor_role)
);

-- Update RLS policies for properties table
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Contributors can view properties with access" ON public.properties;
CREATE POLICY "Contributors can view properties with access"
ON public.properties
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'viewer'::contributor_role)
);

-- Properties INSERT - contributors can add
DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
CREATE POLICY "Users can create their own properties"
ON public.properties
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Properties UPDATE - contributors can update
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
ON public.properties
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Properties DELETE - only administrators and owners
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
ON public.properties
FOR DELETE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'administrator'::contributor_role)
);

-- Update RLS policies for property_files table
DROP POLICY IF EXISTS "Users can view their own property files" ON public.property_files;
DROP POLICY IF EXISTS "Contributors can view property files with access" ON public.property_files;
CREATE POLICY "Contributors can view property files with access"
ON public.property_files
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'viewer'::contributor_role)
);

-- Property files INSERT - contributors can add
DROP POLICY IF EXISTS "Users can create their own property files" ON public.property_files;
CREATE POLICY "Users can create their own property files"
ON public.property_files
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Property files DELETE - only administrators and owners
DROP POLICY IF EXISTS "Users can delete their own property files" ON public.property_files;
CREATE POLICY "Users can delete their own property files"
ON public.property_files
FOR DELETE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'administrator'::contributor_role)
);

-- Update RLS policies for receipts table
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Contributors can view receipts with access" ON public.receipts;
CREATE POLICY "Contributors can view receipts with access"
ON public.receipts
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'viewer'::contributor_role)
);

-- Receipts INSERT - contributors can add
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;
CREATE POLICY "Users can create their own receipts"
ON public.receipts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Receipts UPDATE - contributors can update
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
CREATE POLICY "Users can update their own receipts"
ON public.receipts
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'contributor'::contributor_role)
);

-- Receipts DELETE - only administrators and owners
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
CREATE POLICY "Users can delete their own receipts"
ON public.receipts
FOR DELETE
USING (
  auth.uid() = user_id 
  OR has_contributor_access(auth.uid(), 'administrator'::contributor_role)
);

-- Recreate profiles policy
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Contributors view profiles" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Contributors view profiles"
ON public.profiles
FOR SELECT
USING (has_contributor_access(user_id, 'viewer'::contributor_role));

-- Recreate storage_usage policy
DROP POLICY IF EXISTS "Users and contributors can view storage usage" ON public.storage_usage;
CREATE POLICY "Users and contributors can view storage usage"
ON public.storage_usage
FOR SELECT
USING (has_contributor_access(user_id, 'viewer'::contributor_role));