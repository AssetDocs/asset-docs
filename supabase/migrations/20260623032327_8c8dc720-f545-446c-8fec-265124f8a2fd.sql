ALTER TYPE public.dev_support_type ADD VALUE IF NOT EXISTS 'account_recovery';

ALTER TABLE public.dev_support_issues
  ADD COLUMN IF NOT EXISTS recovery_scenario TEXT
    CHECK (
      recovery_scenario IS NULL
      OR recovery_scenario IN (
        'lost_mfa',
        'lost_backup_codes',
        'lost_email_access',
        'lost_mfa_and_backup_codes',
        'lost_email_and_mfa',
        'other'
      )
    ),
  ADD COLUMN IF NOT EXISTS identity_verification_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (identity_verification_status IN ('not_required', 'needs_review', 'verified', 'failed')),
  ADD COLUMN IF NOT EXISTS billing_verification_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (billing_verification_status IN ('not_required', 'needs_review', 'verified', 'failed')),
  ADD COLUMN IF NOT EXISTS recovery_action_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (recovery_action_status IN ('not_required', 'needs_review', 'approved', 'completed', 'rejected')),
  ADD COLUMN IF NOT EXISTS recovery_action_notes TEXT,
  ADD COLUMN IF NOT EXISTS recovery_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_account_recovery
  ON public.dev_support_issues(status, recovery_action_status, created_at DESC)
  WHERE recovery_scenario IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dev_support_issues_recovery_verification
  ON public.dev_support_issues(identity_verification_status, billing_verification_status)
  WHERE recovery_scenario IS NOT NULL;