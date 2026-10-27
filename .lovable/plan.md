# Early Access Signup in the Preview: Diagnosis and Fix

Target: the original/public Asset Safe app's private preview only. Nothing is published, and the development app is not touched.

## What was checked (read-only)
- **A. Why signup is disabled:** this is the intended switch-off, not a bug. `assessmentApi.ts` sets `ASSESSMENT_BACKEND_ENABLED = false`. With the switch off, `finish()` skips the server submit, so `assessmentId` stays empty. The Early Access form then hits `!ASSESSMENT_BACKEND_ENABLED || !assessmentId` and shows the message.
- **B. Migration:** not applied. The `public.preparedness_assessments` table does not exist. The SQL is only a draft in `docs/drafts/`.
- **C. Edge Function:** not deployed. There is no `supabase/functions/preparedness-assessment/`; the code is only a draft in `docs/drafts/`.
- **D/E. Your test:** nothing was saved on the server and no `assessment_id` came back. Your score was calculated only in the browser.
- **F. Join request:** the browser never made one; the form stops before calling the server.
- **G. CORS:** the draft already lists the exact preview origin `id-preview--6cc71ded-...lovable.app` and the public domains. There are no wildcards, so no correction is needed.

## Fix (this is Step 3 of the earlier plan)
1. Apply the reviewed migration exactly as drafted:
   - creates the `preparedness_assessments` table
   - only the service role can access it
   - RLS is on with no public or signed-in access rules
   - grants go to the service role only
2. Move the draft function to `supabase/functions/preparedness-assessment/index.ts` and deploy it. It handles three actions: submit, join and research.
3. Frontend:
   - Turn on `ASSESSMENT_BACKEND_ENABLED`.
   - Show the score, band and gaps the server returns; the browser's own calculation is used only if the save fails.
   - Keep the `assessment_id` from submit and pass that same ID to join. Join never creates a new assessment.
   - Remove the "not enabled in this preview" message.
   - Replace the join error with "We couldn't add you to Early Access. Please try again."
   - If the save failed so there's no ID, show the same generic message.
   - Change the success heading to the exact copy: "You're on the list. We'll keep you informed as Asset Safe moves forward." The two optional questions follow it.

## QA (Step 4)
Each check is run through the preview UI and the function, using rows marked `is_qa=true`:
- **Submit:**
  - a row is created
  - stored answers match the selections
  - server score, band and gaps match what's displayed
  - willingness to pay is stored in its own column
  - an ID is returned
- **H. New email** (a QA address):
  - creates a minimal contact: email, source `preparedness_assessment`, lifecycle `lead`
  - links the contact to the assessment
  - writes one event
- **I/J. Existing email:**
  - snapshot a QA contact before and after the join
  - every field must be unchanged; only the link and the event are added
- **K. Optional questions:** only `audience_segment` and `primary_interest` are updated.
- **L. Cleanup:**
  - delete QA assessment rows, QA contacts and their events, and test rate-limit rows
  - confirm zero rows remain
- **M.** Report any remaining issues. No publishing.

## Technical notes
- `rebuild-update-signup` and `lead-capture` stay unchanged.
- No changes to Auth, Stripe, secrets or DNS.
- The scoring tests are rerun after the edits.
