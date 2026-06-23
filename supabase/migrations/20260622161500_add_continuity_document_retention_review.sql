ALTER TABLE public.continuity_documents
  ADD COLUMN IF NOT EXISTS retention_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retention_review_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (retention_review_status IN ('not_started', 'needs_review', 'reviewed', 'legal_hold', 'purge_eligible')),
  ADD COLUMN IF NOT EXISTS retention_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS retention_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS retention_reviewed_at TIMESTAMPTZ;

UPDATE public.continuity_documents
SET retention_review_status = CASE
      WHEN retention_hold = true THEN 'legal_hold'
      WHEN retention_expires_at IS NOT NULL AND retention_expires_at <= now() THEN 'purge_eligible'
      WHEN retention_category IS NOT NULL OR retention_expires_at IS NOT NULL THEN 'reviewed'
      ELSE 'not_started'
    END
WHERE retention_review_status = 'not_started';

CREATE INDEX IF NOT EXISTS idx_continuity_documents_retention_review
  ON public.continuity_documents(retention_review_status, retention_expires_at);

CREATE INDEX IF NOT EXISTS idx_continuity_documents_retention_hold
  ON public.continuity_documents(retention_hold)
  WHERE retention_hold = true;
