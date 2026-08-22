-- 1. Allow key material to be destroyed while preserving the audit row.
ALTER TABLE public.vault_delegate_grants ALTER COLUMN wrapped_vault_key DROP NOT NULL;

-- 2. Narrow recovery-only SELECT path on legacy_locker.
DROP POLICY IF EXISTS "Legacy admin reads owner locker during active recovery" ON public.legacy_locker;
CREATE POLICY "Legacy admin reads owner locker during active recovery"
ON public.legacy_locker
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND legacy_locker.delegate_user_id = auth.uid()
  AND legacy_locker.user_id <> auth.uid()
  AND EXISTS (
    SELECT 1
      FROM public.accounts a
      JOIN public.legacy_admins la
        ON la.account_id = a.id
       AND la.status = 'active'
       AND la.legacy_admin_user_id = auth.uid()
     WHERE a.owner_user_id = legacy_locker.user_id
  )
  AND EXISTS (
    SELECT 1
      FROM public.vault_delegate_grants g
     WHERE g.legacy_locker_id = legacy_locker.id
       AND g.owner_user_id = legacy_locker.user_id
       AND g.delegate_user_id = auth.uid()
       AND g.status = 'active'
       AND g.wrapped_vault_key IS NOT NULL
  )
);

-- 3. Status-scope the delegate grant read.
DROP POLICY IF EXISTS "Delegate reads own grants" ON public.vault_delegate_grants;
CREATE POLICY "Delegate reads own active grants"
ON public.vault_delegate_grants
FOR SELECT
TO authenticated
USING (
  auth.uid() = delegate_user_id
  AND status = 'active'
);

-- 4. Destroy wrapped key material on every revocation path (single shared helper).
CREATE OR REPLACE FUNCTION public.revoke_legacy_admin_recovery_artifacts(_owner_user_id uuid, _admin_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM set_config('app.legacy_admin_sync', 'on', true);

  -- Preserve the audit row (id, owner/delegate, status, key version, timestamps)
  -- but destroy the usable wrapped key material.
  UPDATE public.vault_delegate_grants
     SET status = 'revoked',
         revoked_at = now(),
         wrapped_vault_key = NULL,
         updated_at = now()
   WHERE owner_user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id
     AND (status = 'active' OR wrapped_vault_key IS NOT NULL);

  UPDATE public.recovery_requests
     SET status = 'revoked',
         responded_at = COALESCE(responded_at, now())
   WHERE owner_user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id
     AND status IN ('pending', 'approved', 'grace_period_expired', 'acknowledged');

  UPDATE public.legacy_locker
     SET recovery_status = NULL,
         recovery_requested_at = NULL,
         updated_at = now()
   WHERE user_id = _owner_user_id
     AND delegate_user_id = _admin_user_id;
END;
$function$;

-- 5. One-time cleanup of historical revoked grants that still hold key material.
UPDATE public.vault_delegate_grants
   SET wrapped_vault_key = NULL,
       updated_at = now()
 WHERE status <> 'active'
   AND wrapped_vault_key IS NOT NULL;