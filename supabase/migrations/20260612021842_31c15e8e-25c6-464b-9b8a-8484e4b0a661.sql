-- =====================================================================
-- Step A2 (P1): additive only. Coordinated compatible release.
--   - All new columns nullable.
--   - No constraint changes.
--   - No grant changes.
--   - Existing recordStepUp / hasActiveStepUp / hasFreshStepUp unaffected.
-- =====================================================================

ALTER TABLE public.mfa_step_up_sessions
  ADD COLUMN IF NOT EXISTS action      text,
  ADD COLUMN IF NOT EXISTS consumed_at timestamptz,
  ADD COLUMN IF NOT EXISTS consumed_by text,
  ADD COLUMN IF NOT EXISTS nonce       uuid;

-- Partial index for the upcoming consume-by-(user, action) lookup.
-- Excludes legacy NULL-action rows so the existing generic flow is untouched.
CREATE INDEX IF NOT EXISTS idx_mfa_step_up_unconsumed_action
  ON public.mfa_step_up_sessions (user_id, action)
  WHERE consumed_at IS NULL AND action IS NOT NULL;

-- Nonce lookup index (used by Step B to resolve a UI-presented nonce to its row).
CREATE UNIQUE INDEX IF NOT EXISTS idx_mfa_step_up_nonce
  ON public.mfa_step_up_sessions (nonce)
  WHERE nonce IS NOT NULL;

COMMENT ON COLUMN public.mfa_step_up_sessions.action IS
  'When non-NULL, this row is an at-most-once authorization for a single specific action (e.g. change_password). NULL = legacy generic step-up row.';
COMMENT ON COLUMN public.mfa_step_up_sessions.consumed_at IS
  'Set atomically BEFORE the protected action runs. Once non-NULL the row can never authorize again.';
COMMENT ON COLUMN public.mfa_step_up_sessions.consumed_by IS
  'Identifier of the consumer that claimed this authorization (edge function name).';
COMMENT ON COLUMN public.mfa_step_up_sessions.nonce IS
  'Opaque handle returned to the UI after step-up; UI passes it to the consumer endpoint instead of any session id.';