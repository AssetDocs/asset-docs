

## Remove User: photography4mls@gmail.com

### User Details
- **User ID**: `b81398f2-ad02-4701-8b13-9c4936f30eb9`
- **Email**: photography4mls@gmail.com
- **Created**: 2026-02-21
- **Data found**: profiles (1), contacts (1), entitlements (1), notification_preferences (1)
- **No data in**: subscribers, properties, items, contributors

### Approach

Run a SQL migration that deletes all related records and then removes the auth user. The deletion order respects foreign key constraints:

1. Delete from `notification_preferences`
2. Delete from `entitlements`
3. Delete from `contacts`
4. Delete from `profiles`
5. Delete the auth user via `auth.users`

### SQL to Execute

```sql
DO $$
DECLARE
  target_id uuid := 'b81398f2-ad02-4701-8b13-9c4936f30eb9';
BEGIN
  DELETE FROM public.notification_preferences WHERE user_id = target_id;
  DELETE FROM public.entitlements WHERE user_id = target_id;
  DELETE FROM public.contacts WHERE user_id = target_id;
  DELETE FROM public.profiles WHERE user_id = target_id;
  DELETE FROM auth.users WHERE id = target_id;
END $$;
```

### Important Notes
- This is a permanent, irreversible deletion.
- The user has minimal data (no properties, items, documents, or files), so no storage cleanup is needed.
- No Stripe subscription exists, so no billing cancellation is required.

