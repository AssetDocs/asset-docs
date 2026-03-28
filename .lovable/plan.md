

## Fix: `complete-contributor-signup` crashes on `getUserByEmail`

### Problem

Line 62 calls `supabaseAdmin.auth.admin.getUserByEmail(validated.email)` which does not exist in Supabase JS SDK v2.51.0. The edge function logs confirm this is the crash point — the token validates successfully, then immediately fails.

### Fix — 1 file, 1 change

**`supabase/functions/complete-contributor-signup/index.ts`** — Replace line 62's `getUserByEmail` with `listUsers()` + filter (same fix already applied to `invite-contributor`):

```typescript
// Replace line 62:
const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(validated.email);

// With:
const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
const existingUser = userList?.users?.find(u => u.email === validated.email) || null;
```

Then update line 66-67 references from `existingUser?.user` / `existingUser.user.id` to `existingUser` / `existingUser.id`.

### Redeploy

Deploy the updated `complete-contributor-signup` edge function.

### Files

| File | Change |
|------|--------|
| `supabase/functions/complete-contributor-signup/index.ts` | Replace `getUserByEmail` with `listUsers` + filter; update property references |

