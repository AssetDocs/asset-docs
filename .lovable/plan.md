
## Fix: Supabase Site URL Configuration

### Root Cause

The 404 URL pattern `https://getassetsafe.com/auth/callback/https://getassetsafe.com/auth/callback` is a Supabase dashboard configuration issue, not a code bug.

The auth logs confirm the signup POST came from the referer `https://getassetsafe.com/auth/callback`. This means **Supabase's `site_url` is misconfigured** — it is currently set to `https://getassetsafe.com/auth/callback` instead of `https://getassetsafe.com`.

When Supabase generates the verification email link, it takes the `site_url` and appends the `emailRedirectTo` path (`/auth/callback`), producing:

```
[site_url][emailRedirectTo]
= https://getassetsafe.com/auth/callback + /auth/callback
= https://getassetsafe.com/auth/callback/https://getassetsafe.com/auth/callback  ← 404
```

The code in `AuthContext.tsx` is already correct (clean `redirectUrl`). No code changes are needed.

### Required Fix — Manual Step in Supabase Dashboard

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to:
   ```
   https://www.getassetsafe.com
   ```
   (or `https://getassetsafe.com` without www, matching your canonical domain)
3. Ensure **Redirect URLs** (allowed list) includes:
   ```
   https://getassetsafe.com/auth/callback
   https://www.getassetsafe.com/auth/callback
   ```
4. Save changes

### No Code Changes Required

The frontend code is already correct. This is a one-time Supabase dashboard configuration fix.

### Expected Flow After Fix

```
User signs up
  → Supabase sends email with link:
    https://getassetsafe.com/auth/callback?token_hash=xxx&type=signup
  → User clicks link
  → AuthCallback.tsx handles it
  → Redirects to /pricing
  → User selects plan → Stripe → /account dashboard
```
