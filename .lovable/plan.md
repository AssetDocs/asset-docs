
## Root Cause Deep Dive

### The Core Problem: `updateUser({ password })` Triggers a New Signup Hook

Here's what happens step by step when the invited contributor sets their password on `/welcome/create-password`:

1. User arrives at `CreatePassword` (via magic link → `/auth/callback` → redirected here)
2. User enters password and clicks "Go to Dashboard"
3. `handleFinish()` calls `supabase.auth.updateUser({ password })`
4. **THIS IS THE BUG**: Supabase's `updateUser({ password })` internally fires an auth hook event with `email_action_type = "signup"` (a "confirmation requested" event) because the user was invited via `admin.inviteUserByEmail()` — Supabase treats password-setting on an invite as a "confirm your email" step
5. The `send-auth-email` hook receives this. It checks `adminUserData?.user?.email_confirmed_at` — BUT at this exact moment, **the user's `email_confirmed_at` may not yet be set** because `inviteUserByEmail` creates the user with `email_confirmed_at` null until the magic link is clicked AND confirmed
6. The `send-auth-email` hook sends a verification email
7. After the password is set, `navigate('/account')` is called
8. `ProtectedRoute` checks `user.email_confirmed_at` — if the Supabase client's cached user object doesn't reflect the confirmed state yet (race condition from the auth state change), it redirects to `/welcome`
9. The `/welcome` page shows the "check your email" banner

### The Auth Logs Confirm This:
```
email_not_confirmed → password sign-in fails (400)
email link has expired → old OTP token used (403)
```

The user was created via `inviteUserByEmail`. The magic link they clicked confirmed their session but `email_confirmed_at` in Supabase may not have been stamped until the OTP was verified server-side. When `updateUser({ password })` fires, the hook sees the user and sends a verification email (because `email_confirmed_at` is null OR the `send-auth-email` hook's admin lookup races against the session).

### The Second Problem: `/welcome` Route Has No Contributor Bypass

In `ProtectedRoute` (App.tsx line 316):
```tsx
if (!skipSubscriptionCheck && user && !user.email_confirmed_at) {
  return <Navigate to="/welcome" replace />;
}
```
Contributors hit this gate too. Even if `isContributor` is true and the subscription check is bypassed, **the email verification check still runs** and can redirect them to `/welcome`.

### The Third Problem: `inviteUserByEmail` Creates an Unconfirmed User in Some Edge Cases

Looking at the auth logs:
```
user_confirmation_requested → for photography4mls@gmail.com
```
This is a `signup` hook event AFTER the user clicked the magic link — meaning `email_confirmed_at` was NOT set by the magic link click. The Supabase invite flow using `inviteUserByEmail` requires the user to click the invite link to get `email_confirmed_at` stamped, but our `send-auth-email` hook suppresses the invite email — so the magic link IS the invite. However, if the callback happens via `handleHashSessionFlow` (hash fragment), the `email_confirmed_at` may not be immediately updated on the client-side user object.

### The Fix: 4 Changes

---

## Plan

### Fix 1 — `invite-contributor/index.ts`: Force `email_confirmed_at` on user creation

Instead of `admin.inviteUserByEmail()` (which creates an unconfirmed user), use `admin.createUser()` with `email_confirm: true`. This stamps `email_confirmed_at` immediately at creation time — no OTP needed.

Then generate a password-reset-style magic link using `admin.generateLink({ type: 'magiclink' })` to produce the sign-in URL to put in the branded email.

```typescript
// NEW: Create user with email pre-confirmed
const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
  email: validated.contributor_email,
  email_confirm: true,         // ← stamps email_confirmed_at immediately
  user_metadata: {
    first_name: validated.first_name,
    last_name: validated.last_name,
    invited_as_contributor: true,
  },
});

// Then generate a magic link so they can sign in without a password
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: validated.contributor_email,
  options: { redirectTo: `https://www.getassetsafe.com/auth/callback?type=magiclink&redirect_to=/welcome/create-password` }
});
inviteLink = linkData?.properties?.action_link ?? fallbackLink;
```

This eliminates the root cause: `email_confirmed_at` is set at creation, so `updateUser({ password })` never triggers a verification email.

### Fix 2 — `send-auth-email/index.ts`: Also suppress `magiclink` type for contributor-invited users

When the contributor clicks the magic link we generate, it fires a `magiclink` hook event. We already suppress `invite`. We should also skip the magiclink email if the user has `invited_as_contributor: true` in their metadata to avoid a redundant email.

```typescript
case "magiclink":
  // Suppress magic link email if this is a contributor invite flow
  // (the branded invite email already contains their sign-in link)
  if (user.user_metadata?.invited_as_contributor) {
    console.log('[send-auth-email] Suppressing magiclink for invited contributor:', user.email);
    return new Response(JSON.stringify({}), { status: 200, ... });
  }
  subject = "Your Magic Link - Asset Safe";
  html = createMagicLinkTemplate(...);
  break;
```

### Fix 3 — `App.tsx` `ProtectedRoute`: Add contributor bypass to email verification gate

The existing contributor bypass only skips the subscription check. The email verification gate (line 316) still runs. Add the contributor check there too:

```tsx
// Check if email is verified — skip for contributors (verified via invite link)
if (!skipSubscriptionCheck && user && !user.email_confirmed_at && !isContributor) {
  return <Navigate to="/welcome" replace />;
}
```

### Fix 4 — `AuthCallback.tsx`: When `type=magiclink`, explicitly accept contributor invitation then route to `/welcome/create-password`

Currently `handleHashSessionFlow` (the path taken when the magic link has a hash fragment) routes to `create-password` only if `password_set` is false — which is correct. But it doesn't call `accept-contributor-invitation`. The OTP path (`handleAuthCallback`) does call it for `type=invite` but not `type=magiclink`.

For the magiclink path, after the SIGNED_IN event fires and we detect `!password_set`, we should call `accept-contributor-invitation` so the contributor record is marked `accepted` before they set their password. This ensures `ContributorContext.isContributor` is `true` by the time they land on `/account`.

---

## Summary Table

| # | File | Change | Fixes |
|---|------|--------|-------|
| 1 | `supabase/functions/invite-contributor/index.ts` | Use `createUser({ email_confirm: true })` + `generateLink({ type: 'magiclink' })` instead of `inviteUserByEmail()` | Eliminates unconfirmed email state; no verification email can be triggered |
| 2 | `supabase/functions/send-auth-email/index.ts` | Suppress `magiclink` type for `invited_as_contributor` users | No duplicate magic link email sent |
| 3 | `src/App.tsx` ProtectedRoute | Add `&& !isContributor` to email verification gate | Contributors not redirected to `/welcome` even if client-side user object lags |
| 4 | `src/pages/AuthCallback.tsx` | Call `accept-contributor-invitation` in the hash session flow when `!password_set` | Contributor record is accepted before dashboard load |

### Clean Flow After Fix:
```text
1. Owner invites → createUser(email_confirm: true) → generateLink(magiclink) → 1 branded email
2. Contributor clicks link → hash fragment → SIGNED_IN → accept-contributor-invitation called
3. profile.password_set = false → /welcome/create-password
4. Contributor enters password → updateUser({ password }) → NO verification email (email_confirmed_at already set)
5. Profile updated (name synced, onboarding_complete: true) → /account
6. ProtectedRoute: isContributor=true → bypass subscription + email gates → dashboard loads ✅
```
