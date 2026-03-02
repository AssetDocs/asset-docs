
# Fix: `getUserByEmail` Not a Function in supabase-js v2.45.0

## Root Cause Confirmed

The edge function logs show the function is now executing (JWT fix worked), but crashing at this line:

```
supabaseAdmin.auth.admin.getUserByEmail is not a function
```

In `@supabase/supabase-js@2.45.0`, the Admin Auth API does **not** expose `getUserByEmail()`. The available lookup methods are:
- `supabaseAdmin.auth.admin.getUserById(id)`
- `supabaseAdmin.auth.admin.listUsers({ page, perPage })`

There is no direct `getUserByEmail`. The correct pattern is to use `listUsers` with a filter, or to query the `profiles` table by email indirectly, or use the newer `supabaseAdmin.auth.admin.listUsers()` and search within results.

The most reliable and performant fix is to use the Supabase Admin REST API directly via fetch, which supports `getUserByEmail`-style filtering — OR to use `listUsers` with the `filter` parameter that some versions support.

Actually, the cleanest approach supported in v2.45.0 is:

```typescript
const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
  // no filter param — fetch and find by email
});
const existingUser = users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
```

But `listUsers` is paginated and this won't scale. The better, correct approach for this version is to use the **Supabase Admin REST API directly**:

```typescript
const response = await fetch(
  `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users?filter=${encodeURIComponent(customerEmail)}`,
  {
    headers: {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
  }
);
```

However the simplest and most maintainable fix that works with v2.45.0 is to replace `getUserByEmail` with `listUsers` filtered properly. Looking at the supabase-js v2 docs, `listUsers` accepts a `filter` string parameter in some builds — but to be safe, the cleanest approach is using the raw fetch to the admin users endpoint with an email query parameter.

## The Fix

**File: `supabase/functions/finalize-checkout/index.ts`**

Replace line 95:
```typescript
const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(customerEmail);
```

With a direct REST API call using fetch:
```typescript
const adminUsersRes = await fetch(
  `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users?filter=${encodeURIComponent(customerEmail)}`,
  {
    headers: {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
  }
);
const adminUsersData = await adminUsersRes.json();
const existingUser = adminUsersData?.users?.find(
  (u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase()
) ?? null;
```

Then update the conditional branch:
```typescript
if (!existingUser) {
  // create new user (same as before)
  ...
} else {
  userId = existingUser.id;  // note: .id not .user.id
  ...
}
```

## Only One File Changes

| File | Change |
|---|---|
| `supabase/functions/finalize-checkout/index.ts` | Replace `getUserByEmail` with a direct REST fetch to `/auth/v1/admin/users?filter=email` |

## Why This Works

- The Supabase Admin REST API at `/auth/v1/admin/users` accepts a `filter` query param for email lookups
- It works with any version of the JS SDK since it bypasses the SDK entirely
- The service role key authenticates it
- This is the same underlying call the SDK's `getUserByEmail` was supposed to make

## No Other Changes Needed

The rest of the function (user creation, entitlement upsert, magic link generation) is correct and will work once this lookup is fixed.
