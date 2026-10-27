# Preparedness Assessment and Early Access: Revised Plan

Target: the Asset Safe original/public app only (ID 6cc71ded-..., getassetsafe.com), on Supabase `leotcbfpqiekgkgumecn`. The development app is not touched. The hostname gate, sign-in, RLS, admin access and preview setup stay unchanged.

## Step 1: Frontend in the private preview (now, not published)
The page tells its story in this order:
1. Hero: "How prepared are you?" with the five-questions explanation.
2. Call to action: "Check My Preparedness" and "5 questions · About 60 seconds · No account required".
3. The assessment.
4. The result.
5. The Early Access signup.
6. A short rebuild/security note.
7. The closing taglines.
8. The legal footer.

How the assessment works:
- The five scored questions use the exact wording and A-D options you specified: property_inventory (20%), property_value_awareness (15%), information_organization (20%), digital_access (15%), legacy_preparedness (30%). Each answer is worth 0-3 points.
- After them comes the unscored pricing question, with the "Imagine one private place..." list and seven options, stored as `willingness_to_pay`.
- The result is the "Asset Safe Fit Score":
  - 0-24 `strong_foundation`
  - 25-49 `some_gaps`
  - 50-74 `significant_opportunity`
  - 75-100 `strong_asset_safe_fit`
  - Each band uses your exact heading, body and closing copy.
- It also shows the two largest weighted gaps, using your calm copy for each category.
- The Early Access form needs an email and explicit consent, and the button can't be pressed twice.
- After a successful signup, two optional questions follow: `audience_segment` (single choice, 5 options) and `primary_interest` (single choice, 7 options). Neither blocks the signup.
- On mobile: large tap targets, a visible progress bar and Back button, nothing wider than the screen, stacked forms. I'll check at 390px, tablet and 1280px.
- Until Step 3, the network calls are disabled, and the preview shows a "backend not yet enabled" notice when you try to submit.

Files:
- `src/data/preparednessAssessment.ts` (questions, options, bands, gap copy, v1)
- `src/lib/preparednessScoring.ts` and its tests
- `src/components/rebuild/assessment/*`
- `src/pages/RebuildLanding.tsx`
- one short paragraph added to the Privacy Policy

## Step 2: Backend prepared for your review (not applied)
**The table:** a migration for `public.preparedness_assessments` with these columns:
- id, created_at, updated_at, assessment_version
- session_id
- contact_id (nullable, references contacts, cleared on delete)
- answers jsonb (option ids only)
- fit_score, band, top_gaps text[]
- willingness_to_pay, audience_segment, primary_interest
- early_access_opt_in, consent_at
- is_qa boolean, utm jsonb, referrer

Rules for the table:
- No IP or IP hash is stored, and no new secret is needed.
- Only the service role has access. RLS is on with no anon or signed-in policies.
- Every attempt is its own row; nothing is overwritten.

**The function:** `preparedness-assessment`, with `rebuild-update-signup` left unchanged.
- `submit`: validates option ids against strict allow-lists, rejects unknown keys, then calculates the score, band and top gaps on the server.
- `join`: links an existing contact without changing any of its fields, or creates a minimal contact (email, source `preparedness_assessment`, lifecycle `lead`). It sets the opt-in and writes one deduplicated event. It never creates a sign-in account, profile, membership, Stripe customer or subscription.
- `research`: an optional update of only `audience_segment` and `primary_interest`, for a row that has already joined.
- Rate limits use `rate_limits` keyed by IP, which is used only transiently: submit 10 per 15 min, join 5 per 15 min.
- CORS uses the same exact-origin list as `rebuild-update-signup`, with no wildcards.
- Users only ever see generic error messages.

I'll show you the final SQL and function summary before anything runs.

## Steps 3-5 (each after your approval)
- **Step 3:** apply the migration and deploy the function.
- **Step 4:** end-to-end test in the private preview using rows marked `is_qa=true`, then remove them.
- **Step 5:** present the finished experience for review. It is not published until you give final approval.

## Scoring (technical)
```text
fit = round( sum( points/3 * weight ) * 100 )
weights: legacy .30, inventory .20, organization .20, value .15, digital .15
top_gaps = top 2 by points/3*weight; ties broken in this order:
  legacy, inventory, organization, value, digital
```
Tests check that all A answers score 0, all D answers score 100, the band boundaries at 24/25, 49/50 and 74/75, and the tie-break order. The server ignores any score or points sent by the browser.
