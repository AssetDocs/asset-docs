-- M6: enforce expired/read-only account state at the database write boundary.
-- Read access remains intact, but owner/full-access writes are blocked when the
-- owner profile is in a read-only lifecycle state.

CREATE OR REPLACE FUNCTION public.is_owner_account_writable(_owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT COALESCE(p.account_status, 'active') NOT IN (
      'expired_read_only',
      'deletion_requested',
      'scheduled_for_deletion',
      'deleted',
      'inactive'
    )
    FROM public.profiles p
    WHERE p.user_id = _owner_user_id
  ), false);
$$;

REVOKE ALL ON FUNCTION public.is_owner_account_writable(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner_account_writable(uuid) TO authenticated, service_role;

-- Remove legacy direct-owner storage policies that predate account/workspace RLS.
-- The account-member storage policies now flow through has_account_access(), which
-- requires writability for full_access/owner operations.
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own floor plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own floor plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own floor plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own floor-plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own floor-plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own floor-plans" ON storage.objects;

CREATE OR REPLACE FUNCTION public.has_account_access(
  _user_id uuid,
  _owner_user_id uuid,
  _min_role text
) RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_memberships am
    JOIN public.accounts a ON a.id = am.account_id
    WHERE am.user_id = _user_id
      AND am.status = 'active'
      AND a.owner_user_id = _owner_user_id
      AND CASE _min_role
        WHEN 'read_only' THEN am.role IN ('owner','full_access','read_only')
        WHEN 'full_access' THEN am.role IN ('owner','full_access')
          AND public.is_owner_account_writable(_owner_user_id)
        WHEN 'owner' THEN am.role = 'owner'
          AND public.is_owner_account_writable(_owner_user_id)
        ELSE false
      END
  );
$$;

-- ===== properties =====
DROP POLICY IF EXISTS "Full access can create properties" ON public.properties;
DROP POLICY IF EXISTS "Full access can update properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete properties" ON public.properties;

CREATE POLICY "Full access can create properties" ON public.properties
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update properties" ON public.properties
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete properties" ON public.properties
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );

-- ===== items =====
DROP POLICY IF EXISTS "Full access can create items" ON public.items;
DROP POLICY IF EXISTS "Full access can update items" ON public.items;
DROP POLICY IF EXISTS "Owners can delete items" ON public.items;

CREATE POLICY "Full access can create items" ON public.items
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update items" ON public.items
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete items" ON public.items
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );

-- ===== property_files =====
DROP POLICY IF EXISTS "Full access can create property files" ON public.property_files;
DROP POLICY IF EXISTS "Full access can update property files" ON public.property_files;
DROP POLICY IF EXISTS "Owners can delete property files" ON public.property_files;

CREATE POLICY "Full access can create property files" ON public.property_files
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update property files" ON public.property_files
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete property files" ON public.property_files
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );

-- ===== user_documents =====
DROP POLICY IF EXISTS "Full access can create documents" ON public.user_documents;
DROP POLICY IF EXISTS "Full access can update documents" ON public.user_documents;
DROP POLICY IF EXISTS "Owners can delete documents" ON public.user_documents;

CREATE POLICY "Full access can create documents" ON public.user_documents
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update documents" ON public.user_documents
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete documents" ON public.user_documents
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );

-- ===== receipts =====
DROP POLICY IF EXISTS "Full access can create receipts" ON public.receipts;
DROP POLICY IF EXISTS "Full access can update receipts" ON public.receipts;
DROP POLICY IF EXISTS "Owners can delete receipts" ON public.receipts;

CREATE POLICY "Full access can create receipts" ON public.receipts
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update receipts" ON public.receipts
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete receipts" ON public.receipts
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );

-- ===== insurance_policies =====
DROP POLICY IF EXISTS "Full access can create insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Full access can update insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Owners can delete insurance policies" ON public.insurance_policies;

CREATE POLICY "Full access can create insurance policies" ON public.insurance_policies
  FOR INSERT WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Full access can update insurance policies" ON public.insurance_policies
  FOR UPDATE USING (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'))
  );

CREATE POLICY "Owners can delete insurance policies" ON public.insurance_policies
  FOR DELETE USING (
    auth.uid() = user_id
    AND public.is_owner_account_writable(user_id)
  );
