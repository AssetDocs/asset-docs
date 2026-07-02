-- Launch security must-fix: prevent cross-user reads of encrypted delegate key material.
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
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own delegate keypair"
  ON public.vault_delegate_keypairs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON public.vault_delegate_keypairs FROM PUBLIC;
REVOKE ALL ON public.vault_delegate_keypairs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_delegate_keypairs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_delegate_keypairs TO service_role;

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
       SELECT 1 FROM public.vault_delegate_grants vg
       WHERE vg.owner_user_id = auth.uid()
         AND vg.delegate_user_id = p_delegate_user_id
         AND vg.status = 'active'
     )
     AND NOT EXISTS (
       SELECT 1 FROM public.recovery_requests rr
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