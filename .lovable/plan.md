## Apply Stripe Event Replay Migration

The migration file exists locally at `supabase/migrations/20260702100000_add_stripe_event_replay_requests.sql` (from commit `8e5dda62`). It:

- Adds replay tracking columns to `public.stripe_events` (`replay_status`, `replay_requested_at`, `replay_requested_by`, `last_replayed_at`, `replay_request_count`, `last_error_at`) with a status CHECK constraint and index.
- Creates `public.stripe_event_replay_requests` with RLS (service_role manages; admins read).
- Creates SECURITY DEFINER RPC `public.request_stripe_event_replay(text, uuid, text)` granted to `service_role`.

### Gap to fix before applying
The new `public.stripe_event_replay_requests` table has RLS + policies but **no explicit `GRANT` statements**. PostgREST will return permission errors without them. I'll add these grants to the applied migration:

```sql
GRANT SELECT ON public.stripe_event_replay_requests TO authenticated;
GRANT ALL  ON public.stripe_event_replay_requests TO service_role;
```

(No `anon` grant — admin-only reads via the SELECT policy that checks `has_app_role`.)

### Steps
1. Apply the migration to production via the migration tool, including the added GRANTs.
2. Rerun the verification query you used previously (please paste it, or confirm you want the standard "columns + table + policies + function exist" check I should run against production).

### Verification query I'll run if you don't specify
```sql
-- New columns on stripe_events
SELECT column_name FROM information_schema.columns
 WHERE table_schema='public' AND table_name='stripe_events'
   AND column_name IN ('last_error_at','replay_status','replay_requested_at',
                       'replay_requested_by','last_replayed_at','replay_request_count');

-- New table + policies
SELECT policyname FROM pg_policies
 WHERE schemaname='public' AND tablename='stripe_event_replay_requests';

-- RPC present
SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND proname='request_stripe_event_replay';

-- Grants
SELECT grantee, privilege_type FROM information_schema.role_table_grants
 WHERE table_schema='public' AND table_name='stripe_event_replay_requests';
```

Approve to apply.