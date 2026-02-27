
-- ============================================================
-- SECURITY FIX MIGRATION
-- Asset Safe — Audit Remediation
-- Date: 2026-02-27
-- ============================================================

-- ============================================================
-- C-1 (CRITICAL): Fix has_contributor_access — remove broken OR clause
-- The previous function had a final OR clause:
--   OR _user_id IN (SELECT user_id FROM public.profiles WHERE user_id = _user_id)
-- This resolved to TRUE for every authenticated user who has a profile,
-- effectively bypassing all contributor-based access control.
-- The ownership check (auth.uid() = user_id) lives in each RLS policy,
-- not in this function. This function should ONLY check contributor relationships.
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_contributor_access(_user_id uuid, _required_role contributor_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contributors c
    WHERE c.contributor_user_id = _user_id
      AND c.status = 'accepted'
      AND CASE _required_role
            WHEN 'viewer'        THEN c.role IN ('viewer', 'contributor', 'administrator')
            WHEN 'contributor'   THEN c.role IN ('contributor', 'administrator')
            WHEN 'administrator' THEN c.role = 'administrator'
          END
  )
$$;

-- ============================================================
-- H-1 (HIGH): Remove client-side UPDATE policy on subscribers table
-- Users must NOT be able to self-upgrade their subscription.
-- All subscription state changes are handled exclusively by the
-- Stripe webhook edge function using service_role, which bypasses RLS.
-- Dropping this policy closes the privilege escalation vector.
-- ============================================================
DROP POLICY IF EXISTS "Users update own subscription" ON public.subscribers;

-- ============================================================
-- H-2 (HIGH): Fix storage_usage SELECT policy — wrong uid argument
-- The previous policy passed user_id (the row owner's ID) to
-- has_contributor_access instead of auth.uid() (the requesting user's ID).
-- After fixing C-1 above, this would have blocked all users from
-- reading their own storage usage.
-- ============================================================
DROP POLICY IF EXISTS "Users and contributors can view storage usage" ON public.storage_usage;

CREATE POLICY "Users and contributors can view storage usage"
  ON public.storage_usage
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_contributor_access(auth.uid(), 'viewer'::contributor_role)
  );

-- ============================================================
-- H-3 (HIGH): Remove the loose recovery_requests INSERT policy
-- Two INSERT policies existed; the looser one only checked
--   auth.uid() = delegate_user_id
-- without validating against the actual legacy_locker assignment.
-- Since policies are OR-combined, the loose policy allowed any
-- authenticated user to insert a recovery request for any locker_id.
-- We keep only "Delegates can submit recovery requests" which performs
-- the proper cross-check against legacy_locker.delegate_user_id.
-- ============================================================
DROP POLICY IF EXISTS "Delegates create recovery requests" ON public.recovery_requests;

-- ============================================================
-- M-1 (MEDIUM): Restrict user_consents INSERT to authenticated users
-- The previous policy used WITH CHECK (true), allowing anonymous requests
-- to forge consent records for any email address.
-- New policy requires auth.uid() IS NOT NULL and user_email = auth.email().
-- ============================================================
DROP POLICY IF EXISTS "Anyone can log consent" ON public.user_consents;

CREATE POLICY "Authenticated users can log their own consent"
  ON public.user_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_email = auth.email()
  );

-- ============================================================
-- L-3 (LOW): Attach audit trigger to user_roles table
-- Role escalation (granting/revoking admin) must be immutably logged.
-- The audit_trigger_function already exists and writes to audit_logs.
-- ============================================================
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;

CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
