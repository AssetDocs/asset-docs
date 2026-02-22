

## Add Magic Link (Passwordless) Login Option

Add a "Sign in with Magic Link" option to the login page, allowing users to choose between password-based login and receiving a one-time email link.

### How It Works

1. User enters their email on the login page
2. Instead of entering a password, they can click "Send Magic Link"
3. They receive an email with a secure link
4. Clicking the link signs them in automatically via the existing `/auth/callback` route

### Changes

**`src/pages/Login.tsx`** -- Add magic link UI and handler:
- Add a `magicLinkSent` state to toggle between the form and a "check your email" confirmation
- Add a "Send me a Magic Link" button below the password sign-in button (always visible, replacing the passkey placeholder which is non-functional)
- Remove the passkey placeholder code (it just shows a "coming soon" toast)
- The handler calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })` with the redirect URL pointing to `/auth/callback?type=magiclink&redirect_to=/account`
- After sending, show a confirmation message with a "Resend" option
- The email field is shared between password login and magic link -- user enters email once, then chooses their method

**`src/pages/AuthCallback.tsx`** -- Already handles `magiclink` type (line 103-107). No changes needed. It shows a toast and redirects to `/account`.

**`src/contexts/AuthContext.tsx`** -- No changes needed. The `onAuthStateChange` listener will pick up the magic link session automatically.

No database changes, no edge function changes, no new dependencies.

### Technical Details

The magic link flow uses Supabase's built-in `signInWithOtp` method:

```text
supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink&redirect_to=/account`
  }
})
```

This sends a tokenized link to the user's email. Supabase handles token generation and verification. The existing `AuthCallback` page processes the token and establishes the session.

**Important**: Magic link only works for existing accounts (users who have already signed up). For new users, the signup flow remains unchanged.

**UI layout on Login page:**
- Email field (shared)
- Password field + "Sign In" button
- Separator with "or"
- "Send me a Magic Link" button (always visible, no feature detection needed)
- After clicking, the form switches to a "Check your email" confirmation with resend option

