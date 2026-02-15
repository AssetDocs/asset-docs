

## Streamline Contributor Invitation Flow

### Problem
Currently, when a user is invited as a trusted contact (viewer, contributor, administrator), they go through a 4-step process:
1. Click "Accept Invitation" in email -> goes to `/auth?mode=contributor`
2. Fill out name + password to create an account
3. Receive a separate verification email, wait for it, click it
4. Finally log in and access the dashboard

Steps 3 and 4 are redundant since the contributor already proved they own the email by clicking the invitation link.

### Solution
Use Supabase's `admin.inviteUserByEmail()` API from a new edge function. This sends a single magic link email that, when clicked, creates a **pre-verified** user with an active session. The contributor then only needs to set a password -- no separate email verification step.

### New Flow

```text
+----------------------------+
| Owner invites contributor  |
+----------------------------+
            |
            v
+----------------------------+
| Edge function calls        |
| admin.inviteUserByEmail()  |
| with redirect to           |
| /auth?mode=contributor     |
+----------------------------+
            |
            v
+----------------------------+
| Contributor receives ONE   |
| email with magic link      |
+----------------------------+
            |
            v
+----------------------------+
| Click link -> arrives at   |
| /auth?mode=contributor     |
| with active session        |
| (email already verified)   |
+----------------------------+
            |
            v
+----------------------------+
| Set password + name        |
| (profile update, not       |
| full signup)               |
+----------------------------+
            |
            v
+----------------------------+
| Auto-accept invitation     |
| Redirect to /account       |
+----------------------------+
```

### Technical Details

#### 1. New Edge Function: `invite-contributor`
Creates a new edge function that:
- Receives contributor email, name, role, and inviter info
- Uses `supabase.auth.admin.inviteUserByEmail()` with the SERVICE_ROLE_KEY to send the invite
- Sets `redirectTo` to `{origin}/auth/callback?type=invite&redirect_to=/auth?mode=contributor&email={email}`
- Also inserts the contributor record into the `contributors` table (moving DB insert logic from the frontend)
- Sends a branded invitation email via `inviteUserByEmail`'s built-in email OR keeps the current Resend email with a modified link

**Decision point**: Supabase's invite email template may not match the branded AssetSafe design. The preferred approach is:
- Use `admin.inviteUserByEmail()` to create the user invite token
- Continue using the existing Resend-based `send-contributor-invitation` edge function for the branded email, but change the link URL to use Supabase's invite confirmation endpoint with the generated token

Alternatively, the simpler approach: use `admin.inviteUserByEmail()` directly (which sends Supabase's default invite email), and customize the invite email template in the Supabase dashboard to match AssetSafe branding.

**Recommended approach**: Create a single new `invite-contributor` edge function that:
1. Calls `admin.inviteUserByEmail()` with `data: { first_name, last_name, invited_as_contributor: true }` 
2. Uses the custom Resend email (existing branded template) but with the Supabase invite magic link URL
3. Inserts the `contributors` table record

#### 2. Modify `AuthLegacy.tsx` - Contributor Mode
When a contributor arrives at `/auth?mode=contributor` after clicking the magic link:
- They already have an active session (email pre-verified by Supabase)
- Detect this: if `user` exists and `isContributorMode` is true, show a simplified "Set Your Password" form
- After setting the password via `supabase.auth.updateUser({ password })`, auto-accept the invitation and redirect to `/account`
- Remove the full signup form for contributors (no longer needed)

#### 3. Update `AuthCallback.tsx`
- Handle the `type=invite` callback type
- After token verification, redirect to `/auth?mode=contributor&email={email}` with the active session

#### 4. Update `ContributorsTab.tsx`
- Replace the direct `supabase.from('contributors').insert(...)` + `send-contributor-invitation` calls with a single call to the new `invite-contributor` edge function
- The edge function handles both the DB insert and the invite email

#### 5. Remove/Simplify `ContributorWelcome.tsx`
- The "waiting for email verification" page becomes unnecessary
- Can be simplified to a brief "Welcome!" redirect page, or removed entirely since the flow now goes directly to `/account`

#### 6. Update `supabase/config.toml`
- Add `[functions.invite-contributor]` with `verify_jwt = true` (only authenticated account owners should invoke it)

### Edge Cases
- **Existing user invited as contributor**: If the email already has an account, `inviteUserByEmail` will fail. Handle this by catching the error and instead just sending the invitation email with a link to sign in (existing flow for returning users).
- **Multiple invitations**: The `accept-contributor-invitation` edge function already handles accepting all pending invitations for a user -- no changes needed there.
- **Supabase "Confirm email" setting**: This approach works regardless of the project's email confirmation setting since `admin.inviteUserByEmail()` bypasses it.

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/functions/invite-contributor/index.ts` | **Create** - New edge function using admin invite API |
| `supabase/config.toml` | **Modify** - Add config for new function |
| `src/components/ContributorsTab.tsx` | **Modify** - Call new edge function instead of direct DB insert + email |
| `src/pages/AuthLegacy.tsx` | **Modify** - Simplify contributor mode to "Set Password" for pre-authenticated users |
| `src/pages/AuthCallback.tsx` | **Modify** - Handle `type=invite` redirect |
| `src/pages/ContributorWelcome.tsx` | **Modify** - Remove email verification waiting; simplify or remove |

