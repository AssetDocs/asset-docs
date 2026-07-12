
DROP POLICY IF EXISTS "Full access can create family medications" ON public.family_medications;
DROP POLICY IF EXISTS "Full access can update family medications" ON public.family_medications;
DROP POLICY IF EXISTS "Full access can delete family medications" ON public.family_medications;

CREATE POLICY "Full access can create family medications"
ON public.family_medications
FOR INSERT
TO authenticated
WITH CHECK (
  ((auth.uid() = user_id) OR has_account_access(auth.uid(), user_id, 'full_access'::text))
  AND is_owner_account_writable(user_id)
);

CREATE POLICY "Full access can update family medications"
ON public.family_medications
FOR UPDATE
TO authenticated
USING (
  ((auth.uid() = user_id) OR has_account_access(auth.uid(), user_id, 'full_access'::text))
  AND is_owner_account_writable(user_id)
)
WITH CHECK (
  ((auth.uid() = user_id) OR has_account_access(auth.uid(), user_id, 'full_access'::text))
  AND is_owner_account_writable(user_id)
);

CREATE POLICY "Full access can delete family medications"
ON public.family_medications
FOR DELETE
TO authenticated
USING (
  ((auth.uid() = user_id) OR has_account_access(auth.uid(), user_id, 'full_access'::text))
  AND is_owner_account_writable(user_id)
);
