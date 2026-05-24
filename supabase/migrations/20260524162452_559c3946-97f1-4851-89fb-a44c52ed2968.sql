UPDATE public.account_memberships am
SET email = i.email
FROM public.invites i
WHERE am.email IS NULL
  AND am.account_id = i.account_id
  AND am.role = i.role
  AND i.status = 'accepted';