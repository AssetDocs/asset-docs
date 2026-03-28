

## Fix: `getUserByEmail` Not Available in Supabase JS Client

### Problem

The `invite-contributor` edge function crashes at line 113:
```
supabaseAdmin.auth.admin.getUserByEmail is not a function
```

The Supabase JS client v2.51.0 does not expose `getUserByEmail` as a method. The DB insert succeeds before this line, so the contributor record is created — but the email never sends, triggering the catch block in `ContributorsTab.tsx`.

### Fix — 1 file, 1 line change

**`supabase/functions/invite-contributor/index.ts`** — Replace `getUserByEmail` with `listUsers` filtered by email (the standard approach for this SDK version):

```typescript
// Line 113 — replace:
const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(validated.contributor_email);

// With:
const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
const existingUser = userList?.users?.find(u => u.email === validated.contributor_email) || null;
```

Then update the references on lines 115, 132, 134, 137 from `existingUser?.user` to just `existingUser`:

- Line 115: `if (!existingUser)` 
- Line 134: `existingUser.id`
- Line 137: `existingUser.user_metadata`

### Redeploy

After the code change, deploy the updated function to production.

### Expected Result

The function will successfully look up existing users, create new ones if needed, and send the branded invitation email — no more "email could not be sent" errors.

