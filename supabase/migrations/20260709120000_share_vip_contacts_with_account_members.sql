-- Align VIP Contacts with the owner-scoped workspace access model.
-- Rows remain scoped by vip_contacts.user_id = account owner user id.
-- Owners and Full Access members can manage rows while Read Only members can view.

DROP POLICY IF EXISTS "Users can view their own contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Account members can view VIP contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Full access can create VIP contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Full access can update VIP contacts" ON public.vip_contacts;
DROP POLICY IF EXISTS "Full access can delete VIP contacts" ON public.vip_contacts;

CREATE POLICY "Account members can view VIP contacts"
  ON public.vip_contacts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'read_only')
  );

CREATE POLICY "Full access can create VIP contacts"
  ON public.vip_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

CREATE POLICY "Full access can update VIP contacts"
  ON public.vip_contacts
  FOR UPDATE
  TO authenticated
  USING (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

CREATE POLICY "Full access can delete VIP contacts"
  ON public.vip_contacts
  FOR DELETE
  TO authenticated
  USING (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

DROP POLICY IF EXISTS "Users can view their own contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Users can create their own contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Users can update their own contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Users can delete their own contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Account members can view contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Full access can create contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Full access can update contact attachments" ON public.vip_contact_attachments;
DROP POLICY IF EXISTS "Full access can delete contact attachments" ON public.vip_contact_attachments;

CREATE POLICY "Account members can view contact attachments"
  ON public.vip_contact_attachments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_account_access(auth.uid(), user_id, 'read_only')
  );

CREATE POLICY "Full access can create contact attachments"
  ON public.vip_contact_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

CREATE POLICY "Full access can update contact attachments"
  ON public.vip_contact_attachments
  FOR UPDATE
  TO authenticated
  USING (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  )
  WITH CHECK (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

CREATE POLICY "Full access can delete contact attachments"
  ON public.vip_contact_attachments
  FOR DELETE
  TO authenticated
  USING (
    public.is_owner_account_writable(user_id)
    AND (
      auth.uid() = user_id
      OR public.has_account_access(auth.uid(), user_id, 'full_access')
    )
  );

DROP POLICY IF EXISTS "Users can view their own contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload contact attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contact-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Account members can view contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Full access can upload contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Full access can update contact attachments in storage" ON storage.objects;
DROP POLICY IF EXISTS "Full access can delete contact attachments in storage" ON storage.objects;

CREATE POLICY "Account members can view contact attachments in storage"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contact-attachments'
    AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.has_account_access(
      auth.uid(),
      public._safe_uuid((storage.foldername(name))[1]),
      'read_only'
    )
  );

CREATE POLICY "Full access can upload contact attachments in storage"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contact-attachments'
    AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.has_account_access(
      auth.uid(),
      public._safe_uuid((storage.foldername(name))[1]),
      'full_access'
    )
  );

CREATE POLICY "Full access can update contact attachments in storage"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contact-attachments'
    AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.has_account_access(
      auth.uid(),
      public._safe_uuid((storage.foldername(name))[1]),
      'full_access'
    )
  )
  WITH CHECK (
    bucket_id = 'contact-attachments'
    AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.has_account_access(
      auth.uid(),
      public._safe_uuid((storage.foldername(name))[1]),
      'full_access'
    )
  );

CREATE POLICY "Full access can delete contact attachments in storage"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contact-attachments'
    AND public._safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.has_account_access(
      auth.uid(),
      public._safe_uuid((storage.foldername(name))[1]),
      'full_access'
    )
  );
