# Preparedness Assessment and Early Access: Architecture Report

## Change control
- Project: Asset Safe original/public app (Lovable ID 6cc71ded-...), primary URL getassetsafe.com. This is not the development app.
- Backend: external Supabase project `leotcbfpqiekgkgumecn`, shared by the preview and production. Any migration or function deploy goes live immediately.
- Identity confirmed: RebuildLanding, the publicMode hostname gate, the "Be prepared for what comes next." hero, the "Stay informed" signup, `rebuild-update-signup`, and the public legal pages are all present.
- Nothing in this plan changes the hostname gate, route protection, sign-in, existing RLS, admin access or the preview setup.

Note: about 11k characters from the middle of the brief came through truncated in chat, including the exact question set, answer options and weightings. Before building, I will ask for that section, or confirm the drafts below.

## A. Current relevant schema
- `contacts`: id, user_id, email, first_name, last_name, phone, company_id, source, lifecycle, owner_id, created_at. CRM identity only, with no research fields.
- `events`: id (bigint), user_id, anon_id, event, props jsonb, path, referrer, utm jsonb, ip, ua, occurred_at. Generic analytics; `rebuild-update-signup` writes deduplicated events here.
- `rate_limits`: identifier, action, attempts, window_start, created_at, updated_at. This is the durable per-IP limiter already used by `rebuild-update-signup`.
- `leads`: name, email, city, state, how_heard, ip_address, user_agent. A legacy lead-capture table; it should not be reused.

## B. Existing assessment table
None. No public table matches survey, assessment, questionnaire or waitlist.

## C. Proposed table: `public.preparedness_assessments`
- id uuid pk, created_at, updated_at
- contact_id uuid null (references `contacts.id`, set null on delete). Filled only when an email is given.
- session_id text (an anonymous client id that groups retakes)
- assessment_version text (for example `v1`)
- answers jsonb (an allow-listed map of question key to option key, validated server-side)
- fit_score smallint (0-100), score_band text, top_gaps text[]
- audience_segment text, interest_benefits text[], willingness_to_pay text: research fields, all enum-validated in the function
- early_access_opt_in boolean, consent_at timestamptz
- utm jsonb, referrer text, ip_hash text (a salted SHA-256, never the raw IP), user_agent text truncated
- Access: grant ALL to service_role only. RLS is enabled with no anon or authenticated policies, so only the function can write and only the dashboard or service tools can read. A later admin read-only policy can use `has_app_role`.
- Indexes on (contact_id), (created_at), (audience_segment), (fit_score).

## D. Migration required
Yes, one narrowly scoped migration: the new table, grants, RLS, indexes and an updated_at trigger (reusing the existing helper). It does not alter or drop any existing table, policy or function.

## E. Function architecture
A new function, `preparedness-assessment`, kept separate from `rebuild-update-signup` (which stays unchanged and in place as a fallback). It has two actions on one endpoint:
1. `submit`: answers only, no email. It stores a row, computes the score server-side and returns the result.
2. `join`: an email plus the assessment id. It links or creates a minimal contact, sets the opt-in and writes a deduplicated `events` row with source `preparedness_early_access`.

The function uses the service role internally and does no Auth user, profile, Stripe or Resend work.

## F. Request and response
```text
POST {action:"submit", session_id, version:"v1", answers:{q1..q5: optionKey}, research?:{segment, benefits[], wtp}, utm?, referrer?}
 -> 200 {ok:true, assessment_id, fit_score, band, top_gaps:[key,...]}
POST {action:"join", assessment_id, email, consent:true}
 -> 200 {ok:true}   (identical whether the email is new or existing)
Errors -> {ok:false, error:"<generic message>"} with status 400/429/500
```
Unknown keys are rejected, enums are strict and payloads are capped at about 4KB.

## G. Scoring
- A pure, versioned module under `supabase/functions/preparedness-assessment/scoring.ts`, mirrored in `src/lib/preparednessScoring.ts`. Only the server-side value is stored.
- Each answer option carries 0-4 points per dimension: documentation, organization, accessibility, sharing and recovery. The total is normalised to 0-100.
- Bands: Getting Started, Partly Prepared, Well Prepared.
- The top gaps are the two lowest-scoring dimensions.
- Unit tests assert exact scores for fixed answer sets.

## H. Existing contacts
These follow the `rebuild-update-signup` rule: an existing contact row is never modified. The function only links `contact_id` on the assessment row and writes an event. New emails get a minimal contact (email, source `preparedness_assessment`, lifecycle `lead`).

## I. Duplicates and retakes
Every completed attempt is its own row, so research history is kept. Rows are grouped by session_id; analysis uses the latest row per session or contact. Join events are deduplicated per contact within 24h. Repeat joins return the same success message.

## J. Rate limiting
The shared `rate_limits` table, keyed per IP and action:
- `submit`: 10 per 15 min
- `join`: 5 per 15 min (matching the existing signup)

Over the limit, the function returns a generic 429.

## K. CORS
The same exact-origin allow-list as `rebuild-update-signup`:
- the four public domains
- the published lovable.app domain
- the private editor preview
- localhost:8080

No wildcards. Unknown origins get no allow-origin header.

## L. Files and components
- `src/components/rebuild/assessment/`: PreparednessHero, AssessmentFlow (questions, progress bar, Back button, one question per screen with large tap cards), AssessmentResult (score ring, band, gaps), EarlyAccessForm (button disabled while sending, consent line linked to the Privacy Policy).
- `src/data/preparednessAssessment.ts`: question and option content (versioned).
- `src/pages/RebuildLanding.tsx`: page order becomes hero, then CTA ("Check My Preparedness" / "5 questions · About 60 seconds · No account required"), then the assessment, the result, Early Access, a short rebuild/security note, the closing taglines and the legal footer. "Stay informed" is no longer the primary call to action.
- Styling uses brand blue and orange through existing tokens, keeping the page calm and premium (no quiz or game look).
- Mobile checks at 390px, tablet and 1280px+ with Playwright screenshots: no horizontal overflow, the score doesn't overflow, the email form stacks.
- Privacy Policy: add one short paragraph on assessment answers. Terms are not touched.

## M. Security notes
- Raw IPs are not stored on the new table; only the salted hash. This needs a new secret, `ASSESSMENT_IP_SALT`, which I would ask you to add.
- No assessment data can be read by anon or signed-in users.
- Existing finding outside this scope: `rate_limits` reads and inserts are not atomic, so a burst can slightly exceed the limit. This is acceptable for a public waitlist; I'm noting it, not fixing it here.
- The preview shares production, so test submissions will land in the real table; they can be tagged `utm.source=qa`.

## Sequence
1. You approve this report and confirm or supply the question content.
2. I build the screens with scoring locally in the preview. The email step stays disabled until step 3.
3. With your go-ahead, I run the migration and deploy `preparedness-assessment`.
4. End-to-end test in the private preview.
5. Publish only after you review it.
