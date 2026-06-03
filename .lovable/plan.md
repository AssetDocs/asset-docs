## Show the scheduled deletion date to users

Right now `DeleteAccountDialog` step 5 says "Until that date…" without ever showing the date. We'll surface the actual `deletion_scheduled_date` returned by the `request-account-closure` edge function, plus display it in Account Settings while the account is in `scheduled_for_deletion` state.

### Changes

**1. `DeleteAccountDialog.tsx` (step 5 — "Deletion Scheduled")**
- Capture `request.deletion_scheduled_date` from the edge function response (already returned today).
- Render the formatted date prominently in step 5, e.g.:
  > "Your account is scheduled for permanent deletion on **June 30, 2026**."
- Add a short helper line clarifying *why* that date was chosen:
  - If tied to billing period end: "This matches the end of your current billing period."
  - If 30-day default: "This is 30 days from today."
  - We can infer which case by checking whether `subscription_status` / `current_period_end` came back from the function.

**2. `AccountSettings.tsx` (or a small banner component)**
- When `useAccountStatus().isDeletionRequested` is true, fetch the latest row from `account_closure_requests` for this user (status = 'scheduled') and show a persistent banner at the top of Account Settings:
  > "Account scheduled for deletion on **June 30, 2026**. You have read-only access until then. [Cancel deletion request]"
- The Cancel button calls the existing `reverse-account-closure` edge function (already deployed) and refreshes status.

### Out of scope
- No changes to `request-account-closure` business logic, the 30-day vs billing-period rule, RLS, or any other deletion code path.
- No new tables, columns, or migrations — `account_closure_requests.deletion_scheduled_date` already exists.

### Files touched
- `src/components/DeleteAccountDialog.tsx` — display date in step 5
- `src/pages/AccountSettings.tsx` — add scheduled-deletion banner with cancel action
- (Possibly) one small new component `ScheduledDeletionBanner.tsx` to keep AccountSettings tidy

### Verification
- Submit a deletion request in preview → confirm step 5 shows the correct date.
- Reload `/account` → confirm banner shows the same date and Cancel button reverses the request.
