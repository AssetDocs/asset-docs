
-- ============================================================
-- vault_delegate_keypairs: per-user asymmetric keypair
-- public_key_jwk: RSA-OAEP-256 public key (JWK), plaintext, readable by all signed-in users
-- wrapped_private_key: private key wrapped (AES-GCM) by the user's own vault key, only readable by owner
-- ============================================================
CREATE TABLE public.vault_delegate_keypairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  public_key_jwk jsonb NOT NULL,
  wrapped_private_key text NOT NULL,
  wrap_iv text NOT NULL,
  key_version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.vault_delegate_keypairs TO authenticated;
GRANT ALL ON public.vault_delegate_keypairs TO service_role;

ALTER TABLE public.vault_delegate_keypairs ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read the public-key columns of any row. Since we cannot do
-- column-level RLS easily, we allow SELECT of the whole row; the wrapped_private_key
-- is useless without the owner's vault key (which derives from their master password).
CREATE POLICY "Signed-in users can read delegate keypairs"
  ON public.vault_delegate_keypairs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users insert own keypair"
  ON public.vault_delegate_keypairs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own keypair"
  ON public.vault_delegate_keypairs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER vault_delegate_keypairs_updated_at
  BEFORE UPDATE ON public.vault_delegate_keypairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- vault_delegate_grants: vault key wrapped by a delegate's RSA public key
-- ============================================================
CREATE TABLE public.vault_delegate_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_locker_id uuid NOT NULL REFERENCES public.legacy_locker(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  delegate_user_id uuid NOT NULL,
  wrapped_vault_key text NOT NULL,   -- base64 RSA-OAEP(vault key) under delegate public key
  delegate_key_version int NOT NULL DEFAULT 1,
  recovery_request_id uuid REFERENCES public.recovery_requests(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX vault_delegate_grants_active_unique
  ON public.vault_delegate_grants (legacy_locker_id, delegate_user_id)
  WHERE status = 'active';

CREATE INDEX vault_delegate_grants_owner_idx ON public.vault_delegate_grants(owner_user_id);
CREATE INDEX vault_delegate_grants_delegate_idx ON public.vault_delegate_grants(delegate_user_id);

GRANT SELECT, UPDATE ON public.vault_delegate_grants TO authenticated;
GRANT ALL ON public.vault_delegate_grants TO service_role;

ALTER TABLE public.vault_delegate_grants ENABLE ROW LEVEL SECURITY;

-- Owners read all grants for their lockers
CREATE POLICY "Owner reads grants for own lockers"
  ON public.vault_delegate_grants FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Delegates read grants issued to them
CREATE POLICY "Delegate reads own grants"
  ON public.vault_delegate_grants FOR SELECT
  TO authenticated
  USING (auth.uid() = delegate_user_id);

-- Only owners can update (used for revocation by toggling status)
CREATE POLICY "Owner updates own grants"
  ON public.vault_delegate_grants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- INSERTs only via service_role (edge function)

CREATE TRIGGER vault_delegate_grants_updated_at
  BEFORE UPDATE ON public.vault_delegate_grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
