-- Phase 8: RLS lockdown on invites and account_memberships.
-- All writes now go through edge functions using service_role (which bypasses RLS).
-- Drop client-write policies; keep SELECT policies (tightened where appropriate).

-- ============ invites ============
DROP POLICY IF EXISTS "Owners can create invites" ON public.invites;
DROP POLICY IF EXISTS "Owners can update invites" ON public.invites;
DROP POLICY IF EXISTS "Owners can delete invites" ON public.invites;
DROP POLICY IF EXISTS "Members can view invites for their accounts" ON public.invites;

-- Owners only may read their account's invites. AUs never need to read the invites table directly
-- (accept-invite uses service_role to resolve tokens).
CREATE POLICY "Owners can view their account invites"
ON public.invites
FOR SELECT
TO authenticated
USING (public.is_account_owner(auth.uid(), account_id));

-- ============ account_memberships ============
DROP POLICY IF EXISTS "Owners can insert memberships" ON public.account_memberships;
DROP POLICY IF EXISTS "Owners can update memberships" ON public.account_memberships;
DROP POLICY IF EXISTS "Owners can delete memberships" ON public.account_memberships;
-- Keep existing SELECT policy "Members can view memberships for their accounts" —
-- it already lets owners see all rows and members see rows for accounts they belong to.