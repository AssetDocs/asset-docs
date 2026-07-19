## Status of Codex change

**Partially completed — needs one more step from us.**

### What's already in place
- Migration file `supabase/migrations/20260718183000_allow_admin_read_account_memberships.sql` is committed to the repo (grants `SELECT` on `accounts` + `account_memberships` to authenticated, adds admin-only read policies via `has_app_role`, reloads PostgREST).
- Frontend label change is already in `src/components/admin/AdminUsers.tsx` (renders `FULL AU` / `VIEW AU` / `AU` — verified at lines ~425).
- Production build reported passing by Codex.

### What is NOT yet done
- The migration has **not** been applied to the production Supabase database. I checked `pg_policies` on `public.accounts` and `public.account_memberships` — no policies named "Admins can view all accounts" or "Admins can view all account memberships" exist yet. Until this runs, the admin UI will still show `0 Authorized Users across 0 Accounts` because RLS hides the membership rows.
- The frontend `FULL AU` / `VIEW AU` labels won't reach users until the site is published.

### Plan to finish

1. **Apply migration `20260718183000_allow_admin_read_account_memberships.sql`** to production via the migration tool (exact SQL Codex authored, no edits).
2. **Verify** post-migration:
   - `pg_policies` returns the two new admin read policies.
   - As an admin user, the All Users tab shows `getassetsafe2@gmail.com` with role `FULL AU` and Linked Owner `AS010197`, and the Authorized Users summary is no longer `0 / 0`.
3. **Publish** the frontend so the new AU label strings are live.

No frontend edits are needed — everything else is already on main.
