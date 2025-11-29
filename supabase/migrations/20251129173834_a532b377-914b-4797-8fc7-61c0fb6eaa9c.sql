-- Update RLS policies for Legacy Locker tables to restrict access to administrators only

-- Drop existing contributor policy on legacy_locker
DROP POLICY IF EXISTS "Contributors can view non-encrypted legacy lockers" ON public.legacy_locker;

-- Create new policy: Only administrator contributors can view legacy locker
CREATE POLICY "Administrator contributors can view legacy locker"
ON public.legacy_locker
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR 
  (EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = legacy_locker.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  ))
);

-- Add administrator-only policies for legacy_locker_files
CREATE POLICY "Administrator contributors can view legacy locker files"
ON public.legacy_locker_files
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = legacy_locker_files.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  ))
);

-- Add administrator-only policies for legacy_locker_folders
CREATE POLICY "Administrator contributors can view legacy locker folders"
ON public.legacy_locker_folders
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = legacy_locker_folders.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  ))
);

-- Add administrator-only policies for legacy_locker_voice_notes
CREATE POLICY "Administrator contributors can view voice notes"
ON public.legacy_locker_voice_notes
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = legacy_locker_voice_notes.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  ))
);

-- Add administrator-only policies for voice_note_attachments
CREATE POLICY "Administrator contributors can view voice note attachments"
ON public.voice_note_attachments
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = voice_note_attachments.user_id
    AND c.status = 'accepted'
    AND c.role = 'administrator'
  ))
);