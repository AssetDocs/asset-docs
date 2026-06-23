ALTER TABLE public.legacy_admins
  ADD COLUMN IF NOT EXISTS designation_role TEXT NOT NULL DEFAULT 'primary'
    CHECK (designation_role IN ('primary', 'secondary')),
  ADD COLUMN IF NOT EXISTS designation_priority INTEGER NOT NULL DEFAULT 1
    CHECK (designation_priority BETWEEN 1 AND 10);

UPDATE public.legacy_admins
SET designation_role = 'primary',
    designation_priority = 1
WHERE designation_role IS NULL
   OR designation_priority IS NULL;

DROP INDEX IF EXISTS public.legacy_admins_one_active_per_account;

CREATE UNIQUE INDEX IF NOT EXISTS legacy_admins_one_active_primary_per_account
  ON public.legacy_admins(account_id)
  WHERE status = 'active' AND designation_role = 'primary';

CREATE UNIQUE INDEX IF NOT EXISTS legacy_admins_one_active_designation_per_user
  ON public.legacy_admins(account_id, legacy_admin_user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS legacy_admins_active_order_idx
  ON public.legacy_admins(account_id, designation_priority, assigned_at)
  WHERE status = 'active';
