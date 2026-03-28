

## Fix: Authorized User Invite Links Expire (OTP Expired Error)

### Problem

The `invite-contributor` edge function generates a Supabase **magic link** for the invite email. Magic links use one-time OTPs that expire (default: 1 hour). When the invited user clicks the link after expiry, Supabase redirects to the homepage with `#error=access_denied&error_code=otp_expired`. The user never reaches the account creation form.

This has been the recurring root cause across all previous fix attempts: every approach that depends on Supabase auth links (invite, magiclink, recovery) has the same expiry problem.

### Solution: Eliminate Supabase Auth Links Entirely

Stop using `generate_link` / magic links in the invite email. Instead:

1. Add an `invite_token` column to the `contributors` table
2. Generate a secure random token when inviting, store it in the DB
3. Email links directly to `/auth?mode=contributor&email=...&token=...` (no Supabase OTP link)
4. New edge function `complete-contributor-signup` validates the token and sets the user's password via admin API
5. Frontend signs in with the new password immediately after

This approach has **zero expiry issues** because the token lives in the database with no time limit (or a generous one we control).

### Detailed Flow After Fix

```text
Account holder invites AU
  → contributors record created with invite_token + status=pending
  → User created via admin API (email_confirm=true, no password)
  → Email sent with link: /auth?mode=contributor&email=...&token=...
  → NO Supabase magic link, NO OTP

AU clicks link (hours, days, or weeks later — no expiry)
  → Lands on AuthLegacy in contributor mode
  → Sees "Create Your Account" form (name, password, terms checkbox)
  → Submits form

Form submission:
  → Calls complete-contributor-signup edge function
     - Validates token against contributors table
     - Sets password via admin.updateUserById
     - Updates profile (name, password_set, onboarding_complete)
     - Accepts invitation (status → accepted)
     - Clears invite_token
  → Frontend calls signInWithPassword(email, password)
  → Navigates to /account
  → ProtectedRoute: isContributor=true, email_confirmed_at set → access granted
```

### Files to Change

| File | Change |
|------|--------|
| **New migration** | Add `invite_token TEXT` column to `contributors` table |
| **`supabase/functions/invite-contributor/index.ts`** | Remove all `generate_link` / magic link logic. Generate random token, store in `contributors.invite_token`, use direct URL in email |
| **New: `supabase/functions/complete-contributor-signup/index.ts`** | Validates token, sets password via admin API, updates profile, accepts invitation, clears token |
| **`src/pages/AuthLegacy.tsx`** | Update `handleContributorSignup` to read `token` from URL params, call `complete-contributor-signup` edge function instead of `signUp`, then `signInWithPassword`. Add terms/policies checkbox. |

### Edge Function: `complete-contributor-signup`

Input (no auth required — user has no session yet):
- `email`, `password`, `first_name`, `last_name`, `invite_token`

Logic:
1. Validate inputs with Zod
2. Look up `contributors` record matching `email + invite_token + status=pending`
3. If not found → 400 error (invalid or expired token)
4. Get user by email via `admin.getUserByEmail`
5. Set password + update metadata via `admin.updateUserById`
6. Update `profiles` (first_name, last_name, password_set=true, onboarding_complete=true)
7. Update `contributors` (status=accepted, contributor_user_id, accepted_at, clear invite_token)
8. Return success

### AuthLegacy Changes

- Read `token` from search params alongside `mode` and `email`
- Add terms/policies checkbox (required before submit)
- In `handleContributorSignup`: call `complete-contributor-signup` with email, password, names, token → then `signInWithPassword` → navigate to `/account`
- Remove the `hasActiveSession` branch (no longer needed since users won't arrive with a session)

### Security

- Token is a random UUID, stored server-side, validated server-side
- Token is single-use (cleared after successful signup)
- Only pending invitations with matching email + token are accepted
- No sensitive data in the URL beyond email (already visible) and a random token

