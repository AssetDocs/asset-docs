## What Codex is asking for

Codex has staged three new pieces already committed to the repo:

1. Migration file: `supabase/migrations/20260702110000_add_stripe_dispute_reviews.sql` — creates `public.stripe_dispute_reviews`, adds `billing_review` to the `dev_support_type` enum, enables RLS, and adds two policies (service_role full access, admins read).
2. Updated `stripe-webhook` edge function — already contains `handleDisputeEvent()` wired to `charge.dispute.created / updated / closed`, writing into `public.stripe_dispute_reviews` and opening a `dev_support_issues` row of type `billing_review`.
3. A verification SQL query.

You just need to (a) run the migration, (b) redeploy the webhook, (c) fire Stripe test dispute events, (d) run the SELECT to confirm rows landed.

## Gap I need to fix before applying

The staged migration is missing the required `GRANT` statements for the new public-schema table. Without them PostgREST returns permission errors even though RLS policies exist. I'll add them as part of the apply step:

- `GRANT SELECT ON public.stripe_dispute_reviews TO authenticated;` (admin read policy needs it)
- `GRANT ALL ON public.stripe_dispute_reviews TO service_role;` (webhook writes)
- No `anon` grant — table is admin/service-role only.

The rest of the migration is applied verbatim.

## Steps

1. **Apply migration** via `supabase--migration` — runs the staged SQL exactly as written **plus** the three `GRANT` lines above. This also extends the `dev_support_type` enum with `billing_review`.
2. **Deploy `stripe-webhook`** via `supabase--deploy_edge_functions` (["stripe-webhook"]). The dispute handler code is already in place in `supabase/functions/stripe-webhook/index.ts` (lines 241–245, 969+).
3. **Send test events from Stripe** — you (or Codex) trigger from Stripe Dashboard → Developers → Webhooks → your endpoint → "Send test webhook":
   - `charge.dispute.created`
   - `charge.dispute.updated`
   - `charge.dispute.closed`
   Or use Stripe CLI: `stripe trigger charge.dispute.created`.
4. **Verify** — run in Supabase SQL Editor:
   ```sql
   select * from public.stripe_dispute_reviews
   order by created_at desc
   limit 10;
   ```
   Expect one row per test dispute with `status`, `reason`, `access_action_status='review_required'`, and a linked `support_issue_id`. Also check:
   ```sql
   select id, type, priority, title from public.dev_support_issues
   where type = 'billing_review' order by created_at desc limit 10;
   ```
   And in Edge Function logs, look for `Handling Stripe dispute event`.

## Technical notes

- No frontend changes; this is backend + webhook only.
- Enum change (`ALTER TYPE ... ADD VALUE`) must be committed before it can be used by the webhook insert into `dev_support_issues.type`. The migration handles this in the same transaction boundary Supabase's runner supports (Postgres 15+ allows it).
- Dropping/recreating policies is not needed — the file uses `CREATE POLICY` with fresh names.
- After deploy, Edge Function logs: https://supabase.com/dashboard/project/leotcbfpqiekgkgumecn/functions/stripe-webhook/logs

## Approve to proceed
Say "go" (or approve) and I'll: (1) call `supabase--migration` with the SQL + GRANTs, then (2) deploy `stripe-webhook`.
