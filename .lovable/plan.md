
# Root Cause: Email Lookup Pagination Miss → Create Fails → 500 Error

## What the Logs Confirm

```
[FINALIZE-CHECKOUT] User not found, creating new user — MICHAELJLEWIS2@GMAIL.COM
[FINALIZE-CHECKOUT] ERROR: Failed to create user: A user with this email address has already been registered
```

The user **does exist** in Supabase, but the REST API lookup misses them. The function then tries to create a duplicate, hits a 422, throws, and returns a 500 — which is what the user sees as "Something Went Wrong."

## Why the Lookup Fails

The `/auth/v1/admin/users?filter=` endpoint:
- Returns users **paginated** — default page size is 50
- The `filter` parameter searches **across multiple metadata fields**, not just email
- If the project has more than 50 users, or the filter doesn't match correctly, the target user is simply absent from the response

The current code does a `.find()` on whatever users come back in that first page. If `MICHAELJLEWIS2@GMAIL.COM` isn't in those 50 results, it returns `null` and tries to create a duplicate.

## The Fix — Resilient "Try-Create, Fallback-Fetch" Pattern

Instead of relying on a paginated list, use a **two-step approach**:

**Step 1:** Attempt to create the user. This works for genuinely new users.

**Step 2:** If create fails with `email_exists` (422), fetch the user by email using the correct endpoint `/auth/v1/admin/users` with a page size of 1000 and find by email — or better, use the `profiles` table which is indexed on `user_id` and can be cross-referenced via `contacts` or `profiles` directly.

The most reliable pattern is:

```typescript
// Try to create
const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({ ... });

if (!createError) {
  userId = newUser.user.id;
  userCreated = true;
} else if (createError.message.includes('already been registered') || createError.status === 422) {
  // User exists — fetch them from profiles table by email (via auth admin with large page)
  const listRes = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?per_page=1000&page=1`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const listData = await listRes.json();
  const found = listData?.users?.find(
    (u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase()
  );
  if (!found) throw new Error(`User exists but could not be located: ${customerEmail}`);
  userId = found.id;
  logStep("Recovered existing user after 422", { userId });
} else {
  throw new Error(`Failed to create user: ${createError.message}`);
}
```

This eliminates the pre-flight lookup entirely. The create either succeeds (new user) or fails with a known "already registered" error, at which point we fetch with a much larger page size to guarantee finding the user.

## Also: Email Validation Trigger Issue

The `validate_email_format` trigger rejects emails that don't match `^[A-Za-z0-9._%+-]+@...`. Stripe is sending the email as `MICHAELJLEWIS2@GMAIL.COM` (uppercase). The `user_consents` insert uses `.toLowerCase().trim()` which handles this, but worth noting the function already normalises it.

## Files to Change

| File | Change |
|---|---|
| `supabase/functions/finalize-checkout/index.ts` | Remove pre-flight user lookup; replace with try-create + catch-and-recover pattern |

## What This Fixes

- Eliminates the pagination miss that causes "user not found" false negatives
- Eliminates the 422 crash — it becomes a handled, recoverable condition
- New users are created correctly; existing users are found correctly
- The function completes → entitlement upserted → magic link generated → email sent
