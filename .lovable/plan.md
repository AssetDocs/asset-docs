

## Fix: Authorized User Invite Link Goes to Wrong Page

### Root Cause Found

The invite email contains the **wrong link**. Here's why:

1. `invite-contributor` creates the user via `POST /admin/users` with `email_confirm: true` — user is created as **already confirmed**
2. Then it calls `generate_link` with `type: 'invite'` — Supabase returns **HTTP 422** because you can't generate an invite link for an already-confirmed user
3. Since the 422 response has no `action_link`, the code falls back to `fallbackLink`:
   ```
   https://www.getassetsafe.com/auth?mode=contributor&email=...
   ```
4. This fallback URL goes to the **old sign-in page** (AuthLegacy.tsx), not through `/auth/callback` → CreatePassword

The log line `"generate_link fallback result: 422 link obtained"` is misleading — it prints "link obtained" because `inviteLink` is always truthy (it's either the action_link OR the fallback). It's actually using the fallback.

### The Fix — 1 file change

**`supabase/functions/invite-contributor/index.ts`** — In the fallback path (lines 211-223), change `type: 'invite'` to `type: 'magiclink'`. Magic links work for confirmed users and generate a proper `action_link` that routes through `/auth/callback`.

```
Before: type: 'invite'    → 422 for confirmed users → fallback URL → wrong page
After:  type: 'magiclink'  → 200 with action_link → /auth/callback → CreatePassword
```

Also fix the log to distinguish real link vs fallback:
```typescript
const isRealLink = !!genData?.action_link;
console.log('...', isRealLink ? 'action_link obtained' : 'using fallback URL');
```

### Why CreatePassword Already Has the Terms Checkbox

The terms checkbox exists (lines 320-337 of CreatePassword.tsx) — the reason the user isn't seeing it is because they never reach CreatePassword. They land on `/auth?mode=contributor` (AuthLegacy) instead.

### Expected Flow After Fix

```
invite-contributor creates user (email_confirm: true)
  → generate_link type: 'magiclink' → 200 with action_link ✓
  → email contains proper Supabase magic link
  → user clicks link → /auth/callback
  → AuthCallback: profile.password_set = false → /welcome/create-password
  → CreatePassword: name fields, password, terms checkbox ✓
  → handleFinish: updateUser → accept-invitation → signInWithPassword → /account ✓
```

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/invite-contributor/index.ts` | Change `type: 'invite'` to `type: 'magiclink'` on line 216; fix logging on line 223 |

