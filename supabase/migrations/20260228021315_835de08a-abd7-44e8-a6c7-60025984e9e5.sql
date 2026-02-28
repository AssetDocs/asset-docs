
-- ============================================================
-- CRITICAL SECURITY FIX: has_contributor_access owner scoping
-- ============================================================
-- Root cause: has_contributor_access(uid, role) has no knowledge
-- of which account owner's data is being accessed. It answers
-- "is this user a contributor somewhere?" — NOT "is this user a
-- contributor for THIS specific row's owner?"
--
-- Fix: Add _account_owner_id parameter so the function is scoped
-- to the specific row being accessed. Update all affected policies.
-- ============================================================

-- Step 1: Replace the function with owner-scoped version
CREATE OR REPLACE FUNCTION public.has_contributor_access(
  _user_id uuid,
  _account_owner_id uuid,
  _required_role contributor_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contributors c
    WHERE c.contributor_user_id = _user_id
      AND c.account_owner_id = _account_owner_id
      AND c.status = 'accepted'
      AND CASE _required_role
            WHEN 'viewer'        THEN c.role IN ('viewer', 'contributor', 'administrator')
            WHEN 'contributor'   THEN c.role IN ('contributor', 'administrator')
            WHEN 'administrator' THEN c.role = 'administrator'
          END
  )
$$;

-- ============================================================
-- Step 2: Fix items policies
-- ============================================================
DROP POLICY IF EXISTS "Contributors can view items with access" ON public.items;
CREATE POLICY "Contributors can view items with access"
  ON public.items FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), items.user_id, 'viewer')
  );

DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), items.user_id, 'contributor')
  );

DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;
CREATE POLICY "Users can delete their own items"
  ON public.items FOR DELETE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), items.user_id, 'administrator')
  );

-- ============================================================
-- Step 3: Fix properties policies
-- ============================================================
DROP POLICY IF EXISTS "Contributors can view properties with access" ON public.properties;
CREATE POLICY "Contributors can view properties with access"
  ON public.properties FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), properties.user_id, 'viewer')
  );

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), properties.user_id, 'contributor')
  );

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), properties.user_id, 'administrator')
  );

-- ============================================================
-- Step 4: Fix property_files policies (SELECT, UPDATE, DELETE, INSERT)
-- ============================================================
DROP POLICY IF EXISTS "Contributors can view property files with access" ON public.property_files;
CREATE POLICY "Contributors can view property files with access"
  ON public.property_files FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), property_files.user_id, 'viewer')
  );

DROP POLICY IF EXISTS "Users can update their own property files" ON public.property_files;
CREATE POLICY "Users can update their own property files"
  ON public.property_files FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), property_files.user_id, 'contributor')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), property_files.user_id, 'contributor')
  );

DROP POLICY IF EXISTS "Users can delete their own property files" ON public.property_files;
CREATE POLICY "Users can delete their own property files"
  ON public.property_files FOR DELETE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), property_files.user_id, 'administrator')
  );

-- Fix property_files INSERT: enforce that property belongs to same owner (Fix 2 — A2b)
DROP POLICY IF EXISTS "Users can create their own property files" ON public.property_files;
CREATE POLICY "Users can create their own property files"
  ON public.property_files FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), property_files.user_id, 'contributor')
      AND (
        property_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.properties p
          WHERE p.id = property_files.property_id
            AND p.user_id = property_files.user_id
        )
      )
    )
  );

-- ============================================================
-- Step 5: Fix receipts policies — drop all and recreate
-- ============================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'receipts' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.receipts', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users and contributors can view receipts"
  ON public.receipts FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), receipts.user_id, 'viewer')
  );

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), receipts.user_id, 'contributor')
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = receipts.user_id
          AND c.status = 'accepted'
      )
    )
  );

CREATE POLICY "Users and contributors can update receipts"
  ON public.receipts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), receipts.user_id, 'contributor')
  );

CREATE POLICY "Users and contributors can delete receipts"
  ON public.receipts FOR DELETE
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), receipts.user_id, 'administrator')
  );

-- ============================================================
-- Step 6: Fix storage_usage — drop SELECT and recreate
-- ============================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'storage_usage' AND cmd = 'SELECT' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.storage_usage', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users and contributors can view storage usage"
  ON public.storage_usage FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), storage_usage.user_id, 'viewer')
  );
