
## Root Cause: Confirmed

The live `invite-contributor` logs reveal the exact failure:

```
14:20:18 → invite sent → "Existing user, sending sign-in link"
14:23:09 → invite sent again → "Existing user, sending sign-in link"
14:23:33 → send-auth-email fires "signup" event for photography4mls@gmail.com
```

The user record shows `invited_as_contributor: null` in metadata — meaning `createUser({ email_confirm: true })` was **never called**. Instead the user was created through the normal Supabase signup path (triggered by the magic link click), which fired the `signup` hook and sent a verification email.

### Why "Existing User" path keeps firing

The `invite-contributor` function does a user lookup first. If the email already exists in `auth.users` (even as an unconfirmed ghost record from a prior Supabase internal signup trigger), the function takes the `existingUser` branch — which just sends a plain sign-in link, never stamping `email_confirmed_at: true` or setting `invited_as_contributor` metadata.

The problem: Supabase created an unconfirmed user the very first time the magic link was generated (before our fix was deployed), so every subsequent invite attempt saw them as "existing" and bypassed the new `createUser` path entirely.

### The Real Fix: 3 Targeted Changes

**Do not start over.** The architecture is sound. The issue is purely that the `existingUser` branch in `invite-contributor` is incomplete — it needs to handle the case where an existing user is unconfirmed or lacks the contributor metadata.

---

### Change 1 — `supabase/functions/invite-contributor/index.ts`

The `existingUser` branch currently just sends a sign-in link and does nothing to the user record. Fix it to:

1. If the existing user has **no** `email_confirmed_at`, call `admin.updateUser({ id, email_confirm: true, user_metadata: { invited_as_contributor: true } })` to stamp confirmation immediately.
2. If the existing user already has `email_confirmed_at` but **no** `invited_as_contributor` metadata, still update the metadata so `send-auth-email` can suppress any future magiclink emails.
3. In both cases, generate a proper magic link (same as the new-user path) instead of a bare sign-in URL, so the contributor lands on `/welcome/create-password` if they haven't set a password yet.

```typescript
if (existingUser) {
  // Ensure the user is confirmed and has contributor metadata
  const needsConfirmation = !existingUser.email_confirmed_at;
  
  await supabaseAdmin.auth.admin.updateUser(existingUser.id, {
    email_confirm: true,  // idempotent — safe to call even if already confirmed
    user_metadata: {
      ...existingUser.user_metadata,
      invited_as_contributor: true,
    },
  });

  // If password not yet set, generate a magic link to create-password
  const profileRes = await supabaseAdmin
    .from('profiles')
    .select('password_set')
    .eq('user_id', existingUser.id)
    .maybeSingle();

  if (!profileRes.data?.password_set) {
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: validated.contributor_email,
      options: {
        redirectTo: `https://www.getassetsafe.com/auth/callback?type=magiclink&redirect_to=${encodeURIComponent('/welcome/create-password')}`
      }
    });
    inviteLink = linkData?.properties?.action_link ?? fallbackLink;
  } else {
    inviteLink = `https://www.getassetsafe.com/auth?mode=contributor&email=${encodeURIComponent(validated.contributor_email)}`;
  }
}
```

---

### Change 2 — `supabase/functions/send-auth-email/index.ts`

The `signup` case currently checks `email_confirmed_at` via an admin lookup to suppress the email. But there's a **race condition**: the admin lookup runs while Supabase is mid-transaction confirming the user, so `email_confirmed_at` may appear null even though it's about to be set.

Add a second suppression condition: also check `user_metadata.invited_as_contributor`. If that flag is set, suppress unconditionally — no admin lookup needed.

```typescript
case "signup":
case "email_change_confirm_new": {
  // Fast path: if invited_as_contributor flag is set in metadata, suppress immediately
  if (parsedPayload.user.user_metadata?.invited_as_contributor) {
    console.log("[send-auth-email] Suppressing signup email — invited contributor");
    return new Response(JSON.stringify({}), { status: 200, ... });
  }
  
  // Existing slow path: admin lookup for email_confirmed_at
  const supabaseAdmin = createClient(...);
  const { data: adminUserData } = await supabaseAdmin.auth.admin.getUserById(user.id);
  if (adminUserData?.user?.email_confirmed_at) {
    console.log("[send-auth-email] User already confirmed, suppressing verification email");
    return new Response(JSON.stringify({}), { status: 200, ... });
  }
  // ... send verification email
}
```

---

### Change 3 — `src/pages/CreatePassword.tsx`

The contributor lookup for name-syncing uses `.eq('status', 'accepted')` — but at the moment `handleFinish` runs, `accept-contributor-invitation` may not have been called yet (it runs in `AuthCallback`, but there's a timing window). Change the query to also check `status = 'pending'` as a fallback so the name is always populated.

```tsx
const { data: contribRecord } = await supabase
  .from('contributors')
  .select('first_name, last_name')
  .eq('contributor_email', user!.email as string)
  .in('status', ['accepted', 'pending'])  // ← also check pending
  .maybeSingle();
```

---

## Summary

| # | File | Change | Effect |
|---|------|--------|--------|
| 1 | `invite-contributor/index.ts` | Update existing user: stamp `email_confirm: true` + `invited_as_contributor: true` metadata; generate magic link if password not yet set | Existing unconfirmed users get pre-confirmed; magic link leads to `/welcome/create-password` |
| 2 | `send-auth-email/index.ts` | Add `invited_as_contributor` metadata check as fast-path suppression before admin DB lookup | Eliminates race condition; verification email never sent for invited contributors |
| 3 | `CreatePassword.tsx` | Query `status IN ('accepted','pending')` when looking up contributor name | Name always populated even if `accept-contributor-invitation` hasn't run yet |

### Why not start over?

The architecture is correct. The `createUser({ email_confirm: true })` code path works — it just never executes because the user is always seen as "existing". Fixing the `existingUser` branch to apply the same pre-confirmation logic resolves the problem at its actual source. Starting over would re-introduce the same race condition unless this specific case is handled.
