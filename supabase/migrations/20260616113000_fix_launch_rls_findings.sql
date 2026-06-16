-- Launch Must-Fix: close vault delegate keypair, assistance upload, and realtime topic exposure findings.

-- ============================================================
-- 1. vault_delegate_keypairs: no cross-user table reads
-- ============================================================
ALTER TABLE public.vault_delegate_keypairs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'vault_delegate_keypairs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vault_delegate_keypairs', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_delegate_keypairs TO authenticated;

CREATE OR REPLACE FUNCTION public.get_vault_delegate_public_key(p_delegate_user_id uuid)
RETURNS TABLE(public_key_jwk jsonb, key_version integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF auth.uid() <> p_delegate_user_id
     AND NOT EXISTS (
       SELECT 1
       FROM public.vault_delegate_grants vg
       WHERE vg.owner_user_id = auth.uid()
         AND vg.delegate_user_id = p_delegate_user_id
         AND vg.status = 'active'
     )
     AND NOT EXISTS (
       SELECT 1
       FROM public.recovery_requests rr
       WHERE rr.owner_user_id = auth.uid()
         AND rr.delegate_user_id = p_delegate_user_id
         AND rr.status IN ('approved', 'acknowledged')
     )
  THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT vdk.public_key_jwk::jsonb, COALESCE(vdk.key_version, 1)
  FROM public.vault_delegate_keypairs vdk
  WHERE vdk.user_id = p_delegate_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_vault_delegate_public_key(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_vault_delegate_public_key(uuid) TO authenticated;

-- ============================================================
-- 2. external-assistance-docs: uploads must belong to a fresh request
-- ============================================================
DROP POLICY IF EXISTS "Public can upload assistance docs to submission folder"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can upload assistance docs to recent request folder"
  ON storage.objects;

CREATE POLICY "Public can upload assistance docs to recent request folder"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'external-assistance-docs'
    AND (storage.foldername(name))[1] = 'submission'
    AND public._safe_uuid((storage.foldername(name))[2]) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.external_account_assistance_requests r
      WHERE r.id = public._safe_uuid((storage.foldername(name))[2])
        AND r.submitted_at > now() - interval '30 minutes'
    )
  );

-- ============================================================
-- 3. realtime.messages: restrict subscriptions to known launch topics
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'realtime'
      AND c.relname = 'messages'
  ) THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can send realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive scoped realtime messages" ON realtime.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can send scoped realtime messages" ON realtime.messages';

    EXECUTE $policy$
      CREATE POLICY "Authenticated users can receive scoped realtime messages"
        ON realtime.messages
        FOR SELECT
        TO authenticated
        USING (
          realtime.topic() IN (
            'user-notifications',
            'protection-score-files',
            'protection-score-items',
            'protection-score-contributors',
            'protection-score-receipts'
          )
          OR realtime.topic() = 'calendar-events:user:' || auth.uid()::text
          OR realtime.topic() = 'account-memberships-' || auth.uid()::text
          OR realtime.topic() = 'owner-profile-status-' || auth.uid()::text
          OR EXISTS (
            SELECT 1
            FROM public.account_memberships am
            JOIN public.accounts a ON a.id = am.account_id
            WHERE am.user_id = auth.uid()
              AND am.status = 'active'
              AND realtime.topic() = 'owner-profile-status-' || a.owner_user_id::text
          )
          OR (
            realtime.topic() = 'dev-workspace-changes'
            AND public.has_dev_workspace_access(auth.uid())
          )
        )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Authenticated users can send scoped realtime messages"
        ON realtime.messages
        FOR INSERT
        TO authenticated
        WITH CHECK (
          realtime.topic() IN (
            'user-notifications',
            'protection-score-files',
            'protection-score-items',
            'protection-score-contributors',
            'protection-score-receipts'
          )
          OR realtime.topic() = 'calendar-events:user:' || auth.uid()::text
          OR realtime.topic() = 'account-memberships-' || auth.uid()::text
          OR realtime.topic() = 'owner-profile-status-' || auth.uid()::text
          OR EXISTS (
            SELECT 1
            FROM public.account_memberships am
            JOIN public.accounts a ON a.id = am.account_id
            WHERE am.user_id = auth.uid()
              AND am.status = 'active'
              AND realtime.topic() = 'owner-profile-status-' || a.owner_user_id::text
          )
          OR (
            realtime.topic() = 'dev-workspace-changes'
            AND public.has_dev_workspace_access(auth.uid())
          )
        )
    $policy$;
  END IF;
END $$;
