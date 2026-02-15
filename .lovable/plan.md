

# Fix: "Complete Your Profile" Milestone Bug

## Root Cause

The `compute_user_verification` SQL function has a column name bug on this line:

```sql
SELECT EXISTS(
  SELECT 1 FROM profiles
  WHERE id = target_user_id   -- BUG: should be user_id
    AND first_name IS NOT NULL AND first_name != ''
    AND last_name IS NOT NULL AND last_name != ''
) INTO v_profile_complete;
```

The `profiles` table has two UUID columns:
- `id` -- the row's own primary key (e.g., `79e8bfe3-...`)
- `user_id` -- the auth user's UUID (e.g., `5950acba-...`)

The function passes `target_user_id` (the auth UUID) but compares it against `id` instead of `user_id`. Since these never match, **every user's profile_complete is always false**.

## Fix

A single database migration that replaces `WHERE id = target_user_id` with `WHERE user_id = target_user_id` in the `compute_user_verification` function.

No frontend or edge function changes needed -- once the SQL function returns the correct value, everything downstream already works.

## Verification

After applying the fix, re-running `check-verification` for user AS010125 (Michael Lewis) should flip `profile_complete` to `true` and increase his `milestone_count` from 5 to 6.

