DROP POLICY IF EXISTS "Admins can read admin-docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload admin-docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update admin-docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete admin-docs" ON storage.objects;

CREATE POLICY "Admins can read admin-docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role)
);

CREATE POLICY "Admins can upload admin-docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-docs'
  AND public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role)
);

CREATE POLICY "Admins can update admin-docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'admin-docs'
  AND public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete admin-docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-docs'
  AND public.get_admin_role(auth.uid()) IN ('owner'::public.app_role, 'admin'::public.app_role)
);
