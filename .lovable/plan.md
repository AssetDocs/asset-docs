
## Full Audit: Authorized User Invite Flow

### What Currently Works ✅
- Invitation email is sent (one branded email + one Supabase magic link email)
- Magic link click → `/auth/callback` → `/welcome/create-password` (no redundant email verify step)
- `send-auth-email` hook skips re-sending verification if `email_confirmed_at` is already set
- `WelcomeBanner` already shows contributor name, role, owner name, and owner account number

### Problems Found 🔴

**Problem 1 — Subscription wall blocks contributors**
`ProtectedRoute` checks `hasSubscription`. Contributors have no subscription of their own, so after setting their password they get bounced to `/pricing`. This is the primary reason they can't access the dashboard.

Fix: In `ProtectedRoute`, check if the user is a contributor (via the `contributors` table) before running the subscription check. If they are, skip it — they inherit access via the account owner's subscription.

**Problem 2 — Profile name not populated after account creation**
`CreatePassword` only calls `updateUser({ password })` and sets `password_set: true`. The contributor's name (captured by the owner during invite) sits in the `contributors` table but never gets written to `profiles`. So `profiles.first_name` / `profiles.last_name` remain null, making the welcome greeting fall back to the email address.

Fix: In `CreatePassword.handleFinish()`, after setting the password, also fetch the contributor record and copy `first_name` / `last_name` into the user's `profiles` row if they aren't already set.

**Problem 3 — `ContributorWelcome` still has dead yellow verification banner**
The page redirects instantly (via `useEffect`) but the yellow "Please Verify Your Email" banner JSX still renders for a brief flash before the redirect fires. Since this page is now only a redirect shim, replace it with a clean loading spinner — no verification messaging.

**Problem 4 — `invite-contributor` sends 2 emails to new users**
For new users, both the Supabase auth hook (`type=invite`) AND the branded Resend email are sent. The Supabase invite email is a generic "You've Been Invited to Asset Safe" (the `createInviteTemplate` in `send-auth-email`). The branded Resend email says "You've been invited to collaborate." This means new users get 2 nearly identical emails. 

Fix: In `send-auth-email`, suppress the `invite` type email (return 200 silently) since `invite-contributor` already sends a superior branded email via Resend.

---

## Plan

### File 1 — `src/App.tsx` (ProtectedRoute ~line 255–315)
Add a contributor bypass: before the subscription check, query the `contributors` table to see if the current user is an accepted contributor. If yes, skip `hasSubscription` check and allow through.

Since this check needs to be async but `ProtectedRoute` is currently synchronous, the cleanest approach is to use the existing `ContributorContext` (already loaded in the app tree). The `ContributorContext` is provided at the app root, so `ProtectedRoute` can simply call `useContributor()` and if `isContributor === true`, bypass the subscription gate.

```tsx
// In ProtectedRoute, after the admin bypass, before subscription check:
const { isContributor, loading: contributorLoading } = useContributor();

// Wait for contributor status to resolve
if (contributorLoading) return <LoadingSpinner />;

// Contributors inherit access — skip subscription check
if (isContributor) return <>{children}</>;
```

### File 2 — `src/pages/CreatePassword.tsx`
After `updateUser({ password })` succeeds, copy the contributor's `first_name`/`last_name` from the `contributors` table into `profiles` if the profile fields are blank.

```tsx
// After updateUser succeeds, inside handleFinish:
const { data: contribRecord } = await supabase
  .from('contributors')
  .select('first_name, last_name')
  .eq('contributor_email', user.email)
  .eq('status', 'accepted')
  .maybeSingle();

if (contribRecord?.first_name || contribRecord?.last_name) {
  await supabase
    .from('profiles')
    .update({
      first_name: contribRecord.first_name || undefined,
      last_name: contribRecord.last_name || undefined,
      password_set: true,
      onboarding_complete: true
    })
    .eq('user_id', user.id);
} else {
  // normal path — already updating password_set + onboarding_complete
}
```

### File 3 — `src/pages/ContributorWelcome.tsx`
Strip the yellow verification banner and all resend logic. Replace the rendered JSX with a clean loading spinner while the redirect fires. The page is now purely a redirect shim.

### File 4 — `supabase/functions/send-auth-email/index.ts`
In the `invite` case of the switch statement, return 200 silently instead of sending the generic invite email. The branded invite email is already sent by `invite-contributor` via Resend.

```typescript
case "invite":
  // invite-contributor already sends a superior branded email via Resend.
  // Suppress the generic Supabase invite email to avoid duplicates.
  console.log('[send-auth-email] Suppressing generic invite email — branded invite already sent');
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
```

---

## Summary Table

| # | File | Change | Fixes |
|---|------|--------|-------|
| 1 | `src/App.tsx` | Add `useContributor()` bypass in `ProtectedRoute` | Contributors no longer bounced to `/pricing` |
| 2 | `src/pages/CreatePassword.tsx` | Copy contributor name into `profiles` after password set | Welcome greeting shows real name, not email |
| 3 | `src/pages/ContributorWelcome.tsx` | Replace verification UI with clean loading spinner | No more flash of yellow verification banner |
| 4 | `supabase/functions/send-auth-email/index.ts` | Suppress `invite` type email | New users receive only 1 invitation email, not 2 |

---

## The Clean Flow After Changes

```text
1. Owner invites → 1 branded email sent to authorized user ✅
2. User clicks link → /auth/callback → /welcome/create-password ✅
3. User sets password → name auto-populated from contributor record ✅
4. Submit → /account → ProtectedRoute sees isContributor=true → bypasses subscription check ✅
5. Dashboard loads with: "Welcome, [Their Name]!" + role + owner name + owner account # ✅
6. No second verification email ✅
```

### Dashboard Identity (No Changes Needed)
`WelcomeBanner` already handles this correctly:
- Shows contributor's own name (from `profiles`, now populated)
- Shows "Contributor – Administrator/Contributor/Viewer"
- Shows "Account Owner: [Owner Name]"
- Shows owner's account number (e.g. AS123456)

This is the cleanest approach — no account number suffix needed. The authorized user sees whose account they're managing, their name, and their role.
