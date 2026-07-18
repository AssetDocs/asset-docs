-- Product decision: a retained deleted-account tombstone should continue to
-- block sign-in/reuse for that email unless an operator explicitly clears it.
-- This keeps unpaid/deleted emails from re-entering just because auth.users
-- still contains or later receives a live row for the same address.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.is_deleted_account_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.deleted_accounts da
    WHERE lower(da.email) = lower(trim(p_email))
       OR da.email_hash = encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex')
  );
$$;

REVOKE ALL ON FUNCTION public.is_deleted_account_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_deleted_account_email(text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.is_deleted_account_email(text) IS
  'Blocks deleted-account email reuse/sign-in by retained plaintext email or email hash. Operators must explicitly clear or override tombstones for re-entry.';

NOTIFY pgrst, 'reload schema';
