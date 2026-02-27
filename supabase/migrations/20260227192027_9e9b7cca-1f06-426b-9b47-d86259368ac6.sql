
-- ============================================================
-- RLS OWNERSHIP & AUTHORIZATION HARDENING
-- Asset Safe — Audit Remediation Round 2
-- Date: 2026-02-27
-- ============================================================

-- FIX 1 (HIGH) — properties: Bind contributor INSERT to account_owner_id
DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
DROP POLICY IF EXISTS "Contributors can create properties" ON public.properties;

CREATE POLICY "Users can create their own properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = properties.user_id
          AND c.status = 'accepted'
      )
    )
  );

-- FIX 1b (HIGH) — property_files: Bind contributor INSERT to account_owner_id + validate property_id scope
DROP POLICY IF EXISTS "Users can create their own property files" ON public.property_files;
DROP POLICY IF EXISTS "Contributors can create property files" ON public.property_files;

CREATE POLICY "Users can create their own property files"
  ON public.property_files
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = property_files.user_id
          AND c.status = 'accepted'
      )
      AND (
        property_files.property_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.properties p
          JOIN public.contributors c2 ON c2.account_owner_id = p.user_id
          WHERE p.id = property_files.property_id
            AND c2.contributor_user_id = auth.uid()
            AND c2.status = 'accepted'
        )
      )
    )
  );

-- FIX 1c (HIGH) — items: Bind contributor INSERT to account_owner_id
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Contributors can create items" ON public.items;

CREATE POLICY "Users can create their own items"
  ON public.items
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = items.user_id
          AND c.status = 'accepted'
      )
    )
  );

-- FIX 1d (HIGH) — receipts: Bind contributor INSERT to account_owner_id + validate item_id scope
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Contributors can create receipts" ON public.receipts;

CREATE POLICY "Users can create their own receipts"
  ON public.receipts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = receipts.user_id
          AND c.status = 'accepted'
      )
      AND (
        receipts.item_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.items i
          JOIN public.contributors c2 ON c2.account_owner_id = i.user_id
          WHERE i.id = receipts.item_id
            AND c2.contributor_user_id = auth.uid()
            AND c2.status = 'accepted'
        )
      )
    )
  );

-- FIX 2 (HIGH) — contributors: Remove email-based UPDATE hijack vector
-- New policy requires auth.uid() = contributor_user_id (already bound UID only)
-- Pre-acceptance UID binding handled by accept-contributor-invitation edge function (service_role)
DROP POLICY IF EXISTS "Contributors update own acceptance" ON public.contributors;
DROP POLICY IF EXISTS "Contributors can update their own record" ON public.contributors;

CREATE POLICY "Contributors update own acceptance"
  ON public.contributors
  FOR UPDATE
  USING (auth.uid() = contributor_user_id)
  WITH CHECK (auth.uid() = contributor_user_id);

-- FIX 3 (MEDIUM) — legacy_locker: Honor allow_admin_access flag in admin SELECT policy
DROP POLICY IF EXISTS "Admins can view all legacy lockers" ON public.legacy_locker;
DROP POLICY IF EXISTS "Admin access to legacy locker" ON public.legacy_locker;
DROP POLICY IF EXISTS "App admins can view legacy lockers" ON public.legacy_locker;

CREATE POLICY "Admins can view legacy lockers when permitted"
  ON public.legacy_locker
  FOR SELECT
  USING (
    has_app_role(auth.uid(), 'admin'::app_role)
    AND allow_admin_access = true
  );

-- FIX 4 (MEDIUM) — user_activity_logs: Prevent actor_user_id spoofing
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs" ON public.user_activity_logs;

CREATE POLICY "Authenticated users can insert activity logs"
  ON public.user_activity_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
  );

-- FIX 5 (MEDIUM) — legacy_locker: Prevent delegate self-assignment via trigger
CREATE OR REPLACE FUNCTION public.validate_legacy_locker_delegate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.delegate_user_id IS NOT NULL AND NEW.delegate_user_id = NEW.user_id THEN
    RAISE EXCEPTION 'delegate_user_id cannot equal user_id — a user cannot be their own recovery delegate';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_legacy_locker_delegate ON public.legacy_locker;

CREATE TRIGGER trg_validate_legacy_locker_delegate
  BEFORE INSERT OR UPDATE ON public.legacy_locker
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_legacy_locker_delegate();

-- CLEANUP — recovery_requests: Remove duplicate UPDATE policy
DROP POLICY IF EXISTS "Owners update recovery requests" ON public.recovery_requests;

-- FIX 6 (MEDIUM) — calendar_events: Bind contributor INSERT to account_owner_id
DROP POLICY IF EXISTS "Contributors can insert shared events" ON public.calendar_events;
DROP POLICY IF EXISTS "Contributors can create shared events" ON public.calendar_events;

CREATE POLICY "Contributors can insert shared events"
  ON public.calendar_events
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = calendar_events.user_id
          AND c.status = 'accepted'
      )
      AND visibility = 'shared'
    )
  );
