

## Fix: Broken User Lookup Returns Wrong User

### Root Cause

The "direct REST API lookup" introduced in the last hardening step does **not work as intended**. The endpoint:

```
GET /auth/v1/admin/users?email=photography4mls@gmail.com
```

**does not filter by email** — it returns ALL users in the system. The code then takes `users[0]`, which is the **first user in the database** (michaeljlewis2@gmail.com / d437abab), not the invited user.

This causes a chain of failures:

1. **`invite-contributor`**: Thinks the invited user already exists (because `users[0]` is truthy), skips creating a new auth user for the invitee, and instead updates the wrong user's metadata.
2. **`complete-contributor-signup`**: Finds the wrong user again, sets the password on michaeljlewis2@gmail.com's account instead of creating/updating the actual invitee's account.
3. **Sign-in fails**: No auth user was ever created for photography4mls@gmail.com, so `signInWithPassword` returns "Invalid login credentials."

The auth logs confirm this: the `user_modified` event at 15:56:09 updated user d437abab (michaeljlewis2@gmail.com), immediately followed by failed login attempts.

### Fix — 2 edge functions

Replace the broken REST lookup in both functions with a **create-first approach**: attempt `createUser`, and if the user already exists (error code `user_already_exists` / status 422), retrieve the existing user from the error response or fall back to `listUsers` with proper client-side email filtering.

**`supabase/functions/invite-contributor/index.ts`** (lines 123-139):
```typescript
// Try to create user first — if they already exist, catch and find them
let existingUserId: string | null = null;

const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
  email: validated.contributor_email,
  email_confirm: true,
  user_metadata: {
    first_name: validated.first_name,
    last_name: validated.last_name,
    invited_as_contributor: true,
  },
});

if (createError) {
  if (createError.message?.includes('already been registered') || createError.status === 422) {
    // User exists — find them via listUsers with email filter
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const found = userList?.users?.find(u => u.email === validated.contributor_email);
    existingUserId = found?.id || null;
  } else {
    console.error('[INVITE-CONTRIBUTOR] Error creating user:', createError);
  }
} else if (newUser?.user) {
  existingUserId = newUser.user.id;
  console.log('[INVITE-CONTRIBUTOR] Created new auth user for:', validated.contributor_email);
}
```

**`supabase/functions/complete-contributor-signup/index.ts`** (lines 72-112):
Same create-first pattern. Since this function always sets a password, try `createUser` with the password. If user already exists, find them via `listUsers` + email filter, then update their password.

### Deployment

Redeploy both `invite-contributor` and `complete-contributor-signup` edge functions.

### Files

| File | Change |
|------|--------|
| `supabase/functions/invite-contributor/index.ts` | Replace broken REST lookup with create-first + listUsers email filter fallback |
| `supabase/functions/complete-contributor-signup/index.ts` | Same pattern — create-first + listUsers email filter fallback |

