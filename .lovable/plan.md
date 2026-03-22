
## Full Audit: Why the Second Email Fires

### The Core Problem — Supabase `signInWithOtp()` in the Resend Flow

When `invite-contributor` calls `POST /auth/v1/admin/generate_link` with `type: 'magiclink'`, Supabase internally creates an OTP record for the email. When the user clicks the link, the hash fragment session is established. So far so good.

**But then `updateUser({ password })` is called in `CreatePassword.tsx` line 76.** This is what triggers the second email.

When a user was created via `admin/users` with `email_confirm: true`, Supabase marks them confirmed. However, calling `updateUser({ password })` on a user who has **never gone through the normal password-signup confirmation loop** causes Supabase's auth hooks to fire a `signup` action — because Supabase internally treats the first password-set on a pre-created user as completing the "signup" lifecycle. This fires `send-auth-email` with `email_action_type = "signup"`.

The suppression in `send-auth-email` (fast-path: `invited_as_contributor` in metadata) **should** catch this. But there's a second failure path: the magic link is generated and clicked, which fires `send-auth-email` with `email_action_type = "magiclink"`. The suppression for magiclink only fires if `user_metadata.invited_as_contributor` is in the JWT payload — but the payload passed to `send-auth-email` uses the user record at hook-invocation time, which is **before** our admin `PUT /auth/v1/admin/users/:id` update is committed if there's a timing race.

**Additionally**, the user reported they land on the login screen after CreatePassword — meaning `updateUser({ password })` is causing a sign-out/re-sign-in cycle. This happens because `updateUser({ password })` triggers `USER_UPDATED` → Supabase issues a new session → the frontend briefly shows the auth page while the new session resolves.

### Root Cause Summary

The entire approach of `createUser → generateLink(magiclink) → accept invite → CreatePassword.tsx (updateUser)` is fragile because:
1. It strings together multiple Supabase auth operations that each fire hook events
2. `updateUser({ password })` on a pre-created user triggers signup hooks
3. Session state during the callback/password-set transition is racy
4. The invite-as-magiclink approach fights Supabase's native invite flow, which already does exactly what we need

### The Right Supabase Primitive: `admin.inviteUserByEmail()`

Supabase's native **invite flow** (`POST /auth/v1/admin/invite`) is purpose-built for this exact scenario:
- Creates a user with `email_confirmed_at` already set
- Sends **one** Supabase auth email (which we intercept and replace with our branded email via the `send-auth-email` hook)
- The invite link lands the user in an authenticated session
- The user then calls `updateUser({ password })` which **does NOT re-trigger a signup hook** — because the `invite` flow marks them as already going through the invite lifecycle
- After password is set, they are fully logged in — no second email, no re-login

The reason we moved away from this was because `send-auth-email` was receiving the `invite` event and we weren't handling it. But we already suppress `invite` in `send-auth-email` (line 125-133). The fix is to use the native invite flow, send our own branded email using the `action_link` from the invite response, and suppress Supabase's generic invite email.

**However**, `admin.inviteUserByEmail()` via SDK is broken in the current function's SDK version. We continue using the direct REST API, but now calling `POST /auth/v1/admin/invite` instead of `POST /auth/v1/admin/users`.

### Changes Required

---

## Plan

### Change 1 — `supabase/functions/invite-contributor/index.ts`

**Replace the user-creation strategy** from `POST /auth/v1/admin/users` + `generate_link(magiclink)` to `POST /auth/v1/admin/invite`.

The invite endpoint:
- Creates a new user (or re-sends invite to existing user) with `email_confirmed_at` already set
- Returns `action_link` in the response — the actual one-time invite URL
- When the user clicks it, they land in an authenticated session with `type=invite` in the URL
- The `send-auth-email` hook fires with `email_action_type = "invite"` — which we already suppress (line 125-133 of `send-auth-email/index.ts`) and we send our own branded email with the `action_link`

For the `redirectTo`, use `https://www.getassetsafe.com/auth/callback` — `AuthCallback` already handles `type=invite` (lines 145-163) and routes to `/welcome/create-password` if `password_set = false`.

```typescript
// NEW approach: use POST /auth/v1/admin/invite
const inviteRes = await fetch(`${supabaseUrl}/auth/v1/admin/invite`, {
  method: 'POST',
  headers: adminHeaders,
  body: JSON.stringify({
    email: validated.contributor_email,
    data: {
      first_name: validated.first_name,
      last_name: validated.last_name,
      invited_as_contributor: true,
    },
    redirect_to: 'https://www.getassetsafe.com/auth/callback',
  }),
});
const inviteData = await inviteRes.json();
inviteLink = inviteData?.action_link ?? fallbackLink;
```

**The `existingUser` branch** must also be updated. For existing users who already have `password_set = true`, just send them a magic link to sign in. For existing users without a password set yet, use the invite endpoint again (it will re-issue a new invite link for an existing invited user).

**Remove the separate user-lookup + createUser logic entirely**. The invite endpoint handles both new and existing users — if the user exists as an unconfirmed invite, it refreshes the invite link. If they exist as a confirmed user, it still generates an invite-style link.

### Change 2 — `supabase/functions/send-auth-email/index.ts`

The `invite` case (lines 125-133) currently suppresses and logs. This is correct. **No change needed here** — the suppression is already in place.

But we need to add one more suppression: when `send-auth-email` receives `email_action_type = "signup"` and the user has `invited_as_contributor: true` in metadata, we suppress it. This is already implemented (lines 94-104). **Verify this is working** by checking the metadata field name matches exactly what we send in the invite `data` field.

**One critical check**: In `POST /auth/v1/admin/invite`, user metadata is passed via the `data` field. Supabase stores this as `raw_user_meta_data`. In the `send-auth-email` hook payload, it arrives as `user.user_metadata`. Confirm field mapping: `data.invited_as_contributor` → `user_metadata.invited_as_contributor` ✓ (this is how Supabase maps it).

### Change 3 — `src/pages/CreatePassword.tsx`

The current page works for the password-set step. The issue is that after `updateUser({ password })`, the user may briefly see the auth page because the session refreshes. We need to add a post-update acceptance of contributor invitation to ensure the `contributors` row is `status=accepted` before redirecting.

**Add `accept-contributor-invitation` call before redirecting**:
```typescript
const handleFinish = async () => {
  // ... existing password validation ...
  
  const { error: pwError } = await supabase.auth.updateUser({ password });
  if (pwError) throw pwError;
  
  // Accept pending contributor invitation now that password is set
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.functions.invoke('accept-contributor-invitation', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    }
  } catch (e) { /* non-fatal */ }
  
  // ... existing profile update and navigate('/account') ...
};
```

Also **add a name capture step** to the page: the current page only asks for password. Per the product requirements, the invited user should enter their full name. Currently, `ContributorsTab` pre-fills `first_name`/`last_name` from the invite form (owner enters these). This is fine — the page should show the pre-filled name and let the user confirm/edit it.

Add two name fields to the form:
```tsx
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');

// Pre-fill from contributors record
useEffect(() => {
  if (!user) return;
  supabase.from('contributors')
    .select('first_name, last_name')
    .eq('contributor_email', user.email)
    .in('status', ['pending', 'accepted'])
    .maybeSingle()
    .then(({ data }) => {
      if (data?.first_name) setFirstName(data.first_name);
      if (data?.last_name) setLastName(data.last_name);
    });
}, [user]);
```

And update `profileUpdate` to always include the names.

**Add Terms acceptance checkbox** (per product requirements).

### Change 4 — `src/pages/AuthCallback.tsx`

The `invite` type handler (lines 145-163) is correct. It routes to `/welcome/create-password` if `password_set = false`. No structural changes needed.

However, we need to ensure the `accept-contributor-invitation` call also runs in the `invite` type path in `handleAuthCallback` (currently it only runs generically at the top of the function for all types). This is already handled (lines 114-142 run before the `type === 'invite'` branch). ✓

### Change 5 — `src/App.tsx` ProtectedRoute: Tighten the `password_set` gate

Currently line 306-307: if `profile && !profile.password_set` → redirect to create-password. After the user completes `CreatePassword`, this flag becomes true. But there is a window where the user has a session but `profile` hasn't loaded yet (`profileLoading = true`) — during this window the ProtectedRoute shows a spinner. This is fine.

**No change needed here** — the existing gate logic is correct for the invite flow once password_set and onboarding_complete are properly set.

### Change 6 — Resend Invite functionality

The `resendInvitation` function in `ContributorsTab.tsx` (lines 192+) currently calls `invite-contributor` again. With the new invite-endpoint approach, this will correctly re-issue a new invite link. The only issue is that `invite-contributor` also inserts a new `contributors` row (lines 74-92) and will hit the `23505` duplicate constraint. The resend path needs to skip the DB insert.

**Add a `resend: true` flag** to the request body:
```typescript
// In invite-contributor: skip DB insert if resend=true
if (!body.resend) {
  // insert contributors row
}
// always generate invite link and send email
```

Update `ContributorsTab.resendInvitation` to pass `resend: true` and include the existing `contributor_email`, `first_name`, `last_name`, and `role` from the existing record.

---

## Files to Change

| # | File | Change |
|---|------|--------|
| 1 | `supabase/functions/invite-contributor/index.ts` | Replace `createUser + generateLink(magiclink)` with `POST /auth/v1/admin/invite`; add `resend` flag to skip DB insert |
| 2 | `src/pages/CreatePassword.tsx` | Add first/last name fields (pre-filled from contributors record); add terms checkbox; call `accept-contributor-invitation` before redirect |
| 3 | `src/components/ContributorsTab.tsx` | Pass `resend: true` in `resendInvitation` call |

`send-auth-email` and `AuthCallback` and `App.tsx` already handle the invite flow correctly — no changes needed.

---

## Clean End-to-End Flow After Fix

```text
1. Owner fills invite form (email, name, role) → inviteContributor()
2. invite-contributor edge function:
   - inserts contributors row (status=pending)
   - calls POST /auth/v1/admin/invite with redirectTo=/auth/callback
   - Supabase fires send-auth-email with type=invite → SUPPRESSED (line 125)
   - invite-contributor sends branded Resend email with action_link
3. Invited user clicks link in email
4. Browser hits /auth/callback?token_hash=...&type=invite (query params)
   OR hash fragment with access_token
5. AuthCallback: verifyOtp({token_hash, type:'invite'}) → session established
6. accept-contributor-invitation called → contributors row → status=accepted
7. profile.password_set = false → navigate('/welcome/create-password')
8. CreatePassword page: pre-fills name, shows password + terms form
9. User submits → updateUser({ password }) [NO signup hook fires — invite lifecycle]
10. accept-contributor-invitation called again (idempotent)
11. profile updated: password_set=true, onboarding_complete=true, names set
12. navigate('/account')
13. ProtectedRoute: isContributor=true → bypass subscription + email gates ✓
14. Dashboard loads in owner's workspace context with correct role permissions ✓
15. ZERO second emails sent ✓
```

## Testing Checklist (to verify after implementation)

- [ ] Fresh invite to a brand-new email → exactly 1 email received
- [ ] Click invite link → lands on /auth/callback → redirected to /welcome/create-password
- [ ] Name fields pre-populated from invite record
- [ ] Set password + accept terms → redirected to /account
- [ ] No second email arrives in inbox
- [ ] `/account` loads owner's workspace data (not empty shell)
- [ ] Role badge shows correct role (viewer/contributor/admin)
- [ ] Resend invite → new email, old link invalidated
- [ ] Revoke access → user cannot access /account
- [ ] Production URL (getassetsafe.com) and Lovable preview URL both work
