
-- Helper: membership-based access check using account_memberships + accounts
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
        WHEN 'read_only'   THEN am.role IN ('owner','full_access','read_only')
        WHEN 'full_access' THEN am.role IN ('owner','full_access')
        WHEN 'owner'       THEN am.role = 'owner'
      END
  );
$$;

-- ===== properties =====
DROP POLICY IF EXISTS "Contributors can view properties with access" ON public.properties;
DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

CREATE POLICY "Account members can view properties" ON public.properties
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- ===== items =====
DROP POLICY IF EXISTS "Contributors can view items with access" ON public.items;
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

CREATE POLICY "Account members can view items" ON public.items
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- ===== property_files =====
DROP POLICY IF EXISTS "Contributors can view property files with access" ON public.property_files;
DROP POLICY IF EXISTS "Users can create their own property files" ON public.property_files;
DROP POLICY IF EXISTS "Users can update their own property files" ON public.property_files;
DROP POLICY IF EXISTS "Users can delete their own property files" ON public.property_files;
DROP POLICY IF EXISTS "Users can view their own property files" ON public.property_files;

CREATE POLICY "Account members can view property files" ON public.property_files
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create property files" ON public.property_files
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update property files" ON public.property_files
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete property files" ON public.property_files
  FOR DELETE USING (auth.uid() = user_id);

-- ===== user_documents =====
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.user_documents;
DROP POLICY IF EXISTS "Contributors can view documents with access" ON public.user_documents;

CREATE POLICY "Account members can view documents" ON public.user_documents
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create documents" ON public.user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update documents" ON public.user_documents
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete documents" ON public.user_documents
  FOR DELETE USING (auth.uid() = user_id);

-- ===== receipts =====
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Contributors can view receipts with access" ON public.receipts;

CREATE POLICY "Account members can view receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);

-- ===== insurance_policies =====
DROP POLICY IF EXISTS "Users can view their own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can create their own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can update their own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can delete their own insurance policies" ON public.insurance_policies;

CREATE POLICY "Account members can view insurance policies" ON public.insurance_policies
  FOR SELECT USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'read_only'));
CREATE POLICY "Full access can create insurance policies" ON public.insurance_policies
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Full access can update insurance policies" ON public.insurance_policies
  FOR UPDATE USING (auth.uid() = user_id OR public.has_account_access(auth.uid(), user_id, 'full_access'));
CREATE POLICY "Owners can delete insurance policies" ON public.insurance_policies
  FOR DELETE USING (auth.uid() = user_id);
