
## Root Cause — Full Trace

The problem is in **`supabase/functions/send-auth-email/index.ts`**, which is registered as Supabase's **Auth Hook**. Here is what happens step by step:

1. Invited contributor clicks the magic link in the invitation email → lands at `/auth/callback?token_hash=...&type=invite`
2. `AuthCallback.tsx` calls `supabase.auth.verifyOtp({ token_hash, type: 'invite' })` — this SIGNS IN the user and marks them `email_confirmed_at`
3. `AuthCallback` correctly routes them to `/welcome/create-password`
4. On that page, the contributor fills in their password and clicks "Go to Dashboard"
5. `CreatePassword.tsx` calls `supabase.auth.updateUser({ password })` — **THIS is the trigger**
6. `updateUser()` fires a Supabase Auth hook event with `email_action_type: "signup"` (Supabase treats the first `updateUser` call on an invited/unconfirmed user as a "signup" confirmation event)
7. `send-auth-email` hook receives the `signup` event → sends a "Verify Your Email - Asset Safe" email to the contributor
8. The contributor lands on the dashboard but then receives a verification email they never asked for

**However — there's also a second path** via `AuthLegacy.tsx` (`/auth?mode=contributor`). Lines 269–312 show `handleContributorSignup` with `hasActiveSession=true` also calls `supabase.auth.updateUser({ password })`, which equally triggers the same hook.

### The Fix

The fix is in **`supabase/functions/send-auth-email/index.ts`**. The `send-auth-email` Auth Hook must **skip sending the "Verify Email" email when the user is already email-confirmed**. We need to check `email_confirmed_at` on the user object before sending for `signup` type events.

The Auth Hook payload includes the user object. When an already-verified invited user triggers `updateUser()`, the auth hook fires with `email_action_type: "signup"` BUT the `user` object in the payload will have `email_confirmed_at` set. We should check this and bail out early.

**Additionally**, the `send-auth-email` hook already has access to the Supabase admin client (via the service role key in env vars) so we can do a quick lookup to confirm `email_confirmed_at` status before sending.

### Plan

**One file to change: `supabase/functions/send-auth-email/index.ts`**

In the `signup` / `email_change_confirm_new` case block, before sending the email:
1. Use the Supabase admin client to check if `user.email_confirmed_at` is already set on the user
2. If confirmed → log it and return `200` without sending any email (the user is already verified — invitation magic link was the verification)
3. If NOT confirmed → send the verification email as usual (this is the regular signup flow, not the contributor invite flow)

```typescript
// In the switch case for "signup":
case "signup":
case "email_change_confirm_new": {
  // Check if user is already email-confirmed (invited contributors are pre-verified)
  // When updateUser() is called after an invite, Supabase fires a "signup" hook event
  // even though the user's email is already confirmed. Skip sending in this case.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id);
  if (userData?.user?.email_confirmed_at) {
    console.log('[send-auth-email] User already email-confirmed, skipping verification email for invited contributor');
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  subject = "Verify Your Email - Asset Safe";
  html = createEmailVerificationTemplate(displayName, confirmationUrl, user.email);
  break;
}
```

This is the minimal, surgical fix. No UI changes needed — the email delivery is the root cause, not the prompt (the `ContributorWelcome` page already redirects away immediately since `email_confirmed_at` is set from the previous session).

### Summary

| What | Where | Change |
|------|-------|--------|
| Skip verification email for pre-verified users | `supabase/functions/send-auth-email/index.ts` | Check `email_confirmed_at` before sending `signup` type email — if already confirmed, return 200 silently |

No frontend changes needed. This is a pure backend fix that cuts off the second email at the source.
