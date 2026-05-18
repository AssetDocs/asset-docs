## Goal

Rebuild the Legacy Admin continuity experience inside the existing Authorized Users area so a designated Legacy Admin can submit a serious, manually-reviewed continuity request. No automatic access, transfer, export, or closure is ever performed — this is strictly a review case.

## Placement

- Inside `src/components/AuthorizedUsersTab.tsx`, the existing `<LegacyAdminContinuityRequests />` slot (already rendered at the top of the tab) is replaced by a new section component `<LegacyContinuitySection />`.
- Section is visually separated from normal authorized-user management:
  - Section heading: **Legacy Continuity** (small uppercase eyebrow + serif/medium title, muted divider above and below).
  - Only renders when the current user is an active Legacy Admin for the current account.
  - Sits above the standard Authorized Users management UI.

## Section UI

A single bordered card titled **Continuity Request** with:
- Subtle shield icon (`ShieldCheck` from lucide) in muted foreground.
- Muted "Legacy Admin" badge.
- Body copy (verbatim):
  > You have been designated as the Legacy Admin for this account.
  >
  > If the account holder becomes deceased, incapacitated, or unable to manage their Asset Safe account, you may submit a continuity request for review by Asset Safe.
  >
  > Requests are manually reviewed and may require supporting documentation before any action is taken.
- Primary button: **Start Continuity Request** (default variant, restrained — not success-green).
- Tone: neutral border, soft `bg-muted/30`, no celebratory color.

Below the card, a **Request History** panel renders only when ≥1 request exists for this admin/account:
- Columns/rows: Request type · Submitted date · Current status (badge) · Last updated · `View details` button.
- Statuses supported: Draft, Submitted, Under Review, Additional Information Requested, Approved, Denied, Completed (color-muted badges, no bright green/red).

## Guided Flow

Clicking **Start Continuity Request** opens a full-screen `Dialog` with a stepper (Step N of 6) and Back / Continue controls. The dialog feels deliberate (wider max-w-2xl, generous spacing, no auto-advance).

**Step 1 — Request Type** (radio cards)
- Temporary Assistance Access
- Data Export Request
- Ownership Transfer Request
- Account Closure Request

(Each with the description copy specified by the user.)

**Step 2 — Relationship Verification**
- Relationship to account holder (Select: Spouse, Parent, Child, Sibling, Executor, Attorney, Power of Attorney, Guardian, Caregiver, Business Partner, Other)
- Legally authorized to act on behalf of the account holder? (Yes / No / Unsure)
- Has the account holder passed away? (Yes / No / Unsure)
- If either authorization=Yes or passed_away=Yes → show an inline notice prompting the user that supporting documentation will be required in Step 4.

**Step 3 — Situation Explanation**
- Textarea (min ~80 chars), helper text per spec.

**Step 4 — Supporting Documentation**
- Multi-file uploader with category dropdown per file (Death certificate, Power of attorney, Trust documentation, Letters testamentary, Guardianship paperwork, Physician statement, Government ID, Other legal documentation).
- Files uploaded to a new private storage bucket `continuity-documents` under path `{account_id}/{request_id}/{filename}`.
- Files are queued client-side and uploaded after the request row is created in Step 6 submission.

**Step 5 — Requested Outcome**
- Checkbox list: Temporary access assistance, Export account contents, Transfer ownership, Preserve account as-is, Close account, Other.
- Other → text field.

**Step 6 — Review & Acknowledgement**
- Read-only summary of all prior steps.
- Five required checkboxes (verbatim from spec).
- Final button: **Submit Continuity Request** (disabled until all five checked).

## Post-Submission

Replace dialog body with a confirmation view:
- Title: **Request Submitted for Review**
- Body copy per spec.
- Status badge: **Under Review**
- Helper: *Estimated review time: 2–5 business days*
- "Close" button → returns to section; new row appears in Request History.

## Backend / Data

Reuse `account_continuity_requests` table. It already has: `request_type`, `reason`, `notes`, `contact_email`, `contact_phone`, `status`, `legacy_admin_id`, `account_id`, `requested_by_user_id`, `admin_notes`. New structured fields are stored as JSON inside `notes` (with a stable key prefix), so no schema change is required initially.

A migration adds:
- New private storage bucket `continuity-documents` + RLS (insert by Legacy Admin for their account; select by Legacy Admin who owns the path or workspace admin).
- New column `account_continuity_requests.metadata jsonb` (nullable) to cleanly hold: relationship, legal_authorization, passed_away, requested_outcomes[], outcome_other, documents[] (name, category, storage path).
- Status enum widened via CHECK update to include: draft, submitted, under_review, additional_info_requested, approved, denied, completed.
- RLS confirms: Legacy Admin can insert/select their own requests; account owner can select; workspace admins can select all.

After insert, the existing `notify-continuity-request` edge function is invoked (already wired) — no changes needed there for this iteration. (Optional small edit: pass the new `metadata` payload through to the staff notification email.)

## Files

- New: `src/components/legacy-continuity/LegacyContinuitySection.tsx` (section + card + history).
- New: `src/components/legacy-continuity/ContinuityRequestWizard.tsx` (stepper dialog + 6 step components).
- New: `src/components/legacy-continuity/ContinuityRequestDetails.tsx` (View details modal).
- New: `src/components/legacy-continuity/types.ts` (status enum, labels, badge classes, request-type labels, relationship options).
- Edit: `src/components/AuthorizedUsersTab.tsx` — swap `<LegacyAdminContinuityRequests />` for `<LegacyContinuitySection />`.
- Delete (or keep until cutover): `src/components/LegacyAdminContinuityRequests.tsx`.
- Migration: add `metadata jsonb`, status CHECK, bucket + RLS.
- Optional minor edit: `supabase/functions/notify-continuity-request/index.ts` to include metadata summary.

## Out of scope

- No automatic ownership transfer, export, closure, or access grant.
- No admin review UI in this iteration (staff review happens outside the app).
- No edits to AuthorizedUsersTab role logic or other Legacy Admin assignment flow.
- No changes to the existing email sender or branding.

## Language guardrails

Only the approved vocabulary is used in copy and button labels: Continuity Request, Manual Review, Supporting Documentation, Stewardship, Account Holder, Legacy Admin. Forbidden phrases ("take over", "claim", "gain ownership", "get access now", "transfer now") are not used anywhere in the UI.
