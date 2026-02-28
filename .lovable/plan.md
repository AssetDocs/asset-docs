
# Adversarial Threat Model — Asset Safe

**Attacker profile:** A real, authenticated user. Valid JWT. Valid anon key. Can intercept their own network traffic, craft arbitrary Supabase API requests, and modify query parameters. Cannot forge another user's JWT.

---

## ATTACK 1 — Read Another User's Assets (CRITICAL — EXPLOITABLE TODAY)

**Target:** `items`, `property_files`, `properties`, `receipts` tables

**The policy (items SELECT):**
```sql
USING (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer'))
```

**The `has_contributor_access` function:**
```sql
SELECT EXISTS (
  SELECT 1 FROM public.contributors c
  WHERE c.contributor_user_id = _user_id   -- the attacker's uid
    AND c.status = 'accepted'
    AND CASE _required_role
          WHEN 'viewer' THEN c.role IN ('viewer', 'contributor', 'administrator')
        END
)
```

**The bug:** The function checks whether the attacker is a contributor of *any* account owner — it does **not check that the row being accessed belongs to that specific account owner**. It only verifies the attacker has *some* accepted contributor relationship somewhere.

**The exploit:**
1. Attacker (uid: `A`) creates their own account.
2. Attacker creates a second "dummy" account (uid: `D`), then invites `A` as a contributor of `D` and accepts the invitation (they control both accounts).
3. Now `has_contributor_access(A, 'viewer')` returns `true` for all time.
4. Attacker queries: `SELECT * FROM items` — the USING clause is evaluated per-row. For every row where `auth.uid() = user_id` → false. For the `OR has_contributor_access(...)` branch → **TRUE** because `A` is an accepted contributor (of `D`). The function returns true regardless of *whose* items the row belongs to.
5. **Result:** The attacker reads every item, property, property_file, and receipt for every user on the platform in a single query.

**Which policy fails first:**

The `items` SELECT policy fails first because it is the broadest contributor-accessible table with the most records. Every asset table that uses the same pattern is equally vulnerable:
- `items` — estimated value, brand, description of all inventory
- `properties` — every user's property addresses
- `property_files` — metadata (descriptions, tags, item values) for all uploaded files
- `receipts` — purchase amounts, dates, merchants for all receipts
- `storage_usage` — storage metrics for all users

**The fix required:**
The `has_contributor_access` function must accept and check the `account_owner_id` from the row, not just confirm the caller is *any* contributor somewhere. The SELECT policies on `items`, `properties`, `property_files`, and `receipts` must be changed to:

```sql
-- items SELECT fix:
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = items.user_id  -- MUST scope to this row's owner
      AND c.status = 'accepted'
      AND c.role IN ('viewer', 'contributor', 'administrator')
  )
)
```

This means the `has_contributor_access` function signature must change to accept a `target_owner_id` parameter, OR the policies must inline the EXISTS check with explicit `account_owner_id = <table>.user_id` binding. The function as written is structurally unsafe for multi-row SELECT contexts.

---

## ATTACK 2 — Upload Files into Unauthorized Paths (BLOCKED — But Verify)

**Target:** Supabase Storage

**What the attacker tries:**
```
POST /storage/v1/object/photos/{victim_user_id}/malicious.jpg
Authorization: Bearer <attacker_JWT>
```

**What happens:** Storage RLS INSERT policy:
```sql
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = storage.foldername(name)[1])
```
`foldername(name)[1]` = first path segment = `victim_user_id`. `auth.uid()` = attacker's uid. They differ → **DENIED**.

**Status: Correctly blocked.** The storage layer enforces path-based namespace isolation. An attacker cannot write to any path where the first path segment is not their own user ID.

**One edge case — contributor INSERT to property_files:** The `property_files` INSERT policy for contributors:
```sql
WITH CHECK (
  has_contributor_access(auth.uid(), 'contributor')       -- same bug as Attack 1
  AND EXISTS (SELECT 1 FROM contributors c WHERE c.contributor_user_id = auth.uid() 
              AND c.account_owner_id = property_files.user_id AND c.status = 'accepted')
  AND (property_id IS NULL OR EXISTS (...))
)
```
The INSERT policy includes an explicit `account_owner_id = property_files.user_id` check in the EXISTS clause. However, the `user_id` column being written to the new row is set by the attacker in the request body — there is no `WITH CHECK (user_id = <owner>)` enforcing whose user_id is stored. A contributor could write a `property_file` row with `user_id` set to any arbitrary UUID. The `has_contributor_access` check passes (because of Attack 1's bug), and the `account_owner_id = property_files.user_id` check also passes because the attacker controls `property_files.user_id` in the INSERT. This means a contributor INSERT can write rows with arbitrary `user_id` values.

---

## ATTACK 3 — Modify Records They Don't Own (PARTIALLY EXPLOITABLE)

**Target:** `items`, `properties`, `property_files` UPDATE

**The policies:**
```sql
-- items UPDATE
USING (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'contributor'))

-- property_files UPDATE  
USING (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'contributor'))
WITH CHECK (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'contributor'))
```

**The exploit:** Same mechanism as Attack 1. Once the attacker has any accepted contributor relationship (with a dummy account they control), `has_contributor_access(uid, 'contributor')` returns true globally. The USING clause evaluates to true for every row in the `items` and `property_files` tables. The attacker can UPDATE any user's items and property_file records. For `properties`, the UPDATE policy has the same flaw.

**Severity:** An attacker could change item descriptions, estimated values, tags, file names, or property addresses for every user on the platform.

**The `receipts` DELETE and UPDATE** have the same flaw — `has_contributor_access(auth.uid(), 'contributor')` and `has_contributor_access(auth.uid(), 'administrator')` with no owner binding.

---

## ATTACK 4 — Access Shared Documents Without Authorization

**Target:** `user_documents` (personal documents, not property_files)

**The SELECT policy:**
```sql
USING (auth.uid() = user_id)
```

**Status: Correctly scoped.** `user_documents` only checks `auth.uid() = user_id` — no contributor access granted here. A malicious user cannot access another user's documents even with a dummy contributor relationship. This table is correctly isolated.

However, the `storage_usage` SELECT policy has the same flaw:
```sql
USING (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer'))
```
An attacker with a dummy contributor relationship can read storage metrics (bucket names, file counts, total bytes) for every user on the platform — a full enumeration of all account sizes.

---

## ATTACK 5 — Enumerate Profiles and PII

**Target:** `profiles` table

**The policy (Contributors view account owner profiles):**
```sql
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM contributors c
    WHERE c.contributor_user_id = auth.uid()
      AND c.account_owner_id = profiles.user_id  -- this one IS correctly scoped
      AND c.status = 'accepted'
  )
)
```

**Status: This specific policy is correctly scoped.** The `profiles` contributor SELECT policy does the right thing — it uses `account_owner_id = profiles.user_id` binding. This blocks the Attack 1 technique for profiles.

However, the `profiles` table contains `stripe_customer_id`, `household_income`, `phone`, `plan_id`, `plan_status`, `account_number`. A contributor with legitimate access to one owner's account reads all these fields for that owner — which is intended — but the `stripe_customer_id` being readable by a viewer-role contributor is a potential concern if a contributor account is compromised.

---

## ATTACK 6 — Modify `subscribers` or `entitlements` to Upgrade Own Plan

**Target:** `subscribers`, `entitlements`

**The `subscribers` policies:**
- INSERT: `WITH CHECK (auth.uid() = user_id)` — users can create their own row
- UPDATE: **No UPDATE policy exists for the client** — confirmed from the policy list: only `Users view own subscription`, `Users insert own subscription`, `Only service role can delete subscribers` are present. There is no client-accessible UPDATE policy.
- `entitlements` — no INSERT or UPDATE client policy; read-only for the authenticated user.

**Status: Correctly locked.** The client cannot modify subscription/billing data. Only the service role (via Stripe webhook) can write to these tables. The `validate_subscription_update` trigger adds an additional guard that blocks past-dated subscription ends.

---

## ATTACK 7 — Inject Spoofed Activity Logs

**Target:** `user_activity_logs`

**The INSERT policy:**
```sql
WITH CHECK (
  auth.uid() = user_id
  AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
)
```

**Status: Correctly hardened.** The actor_user_id cannot be spoofed — it must match `auth.uid()` or be null. An attacker cannot write log entries under another user's `user_id`.

---

## Summary — Vulnerability Priority Matrix

| Attack | Table(s) | Severity | Status |
|--------|---------|----------|--------|
| A1: Read all assets via contributor bypass | `items`, `properties`, `property_files`, `receipts`, `storage_usage` | **CRITICAL** | **Exploitable now** |
| A3: Update any user's assets via contributor bypass | `items`, `properties`, `property_files`, `receipts` | **HIGH** | **Exploitable now** |
| A2b: contributor INSERT with arbitrary `user_id` in body | `property_files` | **Medium** | **Exploitable now** |
| A5: Stripe customer ID readable by contributors | `profiles` | **Low** | Functioning but over-permissive |
| A2: Upload to another user's storage path | `storage.objects` | None | **Correctly blocked** |
| A4: Read another user's documents | `user_documents` | None | **Correctly blocked** |
| A6: Modify subscription tier | `subscribers`, `entitlements` | None | **Correctly blocked** |
| A7: Spoof activity logs | `user_activity_logs` | None | **Correctly blocked** |

---

## Root Cause

The `has_contributor_access(_user_id, _required_role)` function has no knowledge of which account owner's data is being accessed. It only answers "is this user a contributor somewhere?" When used in a multi-row SELECT/UPDATE USING clause, this becomes a global pass once the condition is true for any row in `contributors`.

The safe pattern — used correctly in `profiles`, `account_deletion_requests`, `legacy_locker` — uses an explicit inline `EXISTS` with `c.account_owner_id = <table>.user_id`. The unsafe pattern — used in `items`, `properties`, `property_files`, `receipts`, `storage_usage` — delegates to `has_contributor_access` without the owner binding.

---

## Required Fixes

### Fix 1 — Redesign `has_contributor_access` to require `account_owner_id`

Change the function signature to:
```sql
CREATE OR REPLACE FUNCTION public.has_contributor_access(
  _user_id uuid,
  _account_owner_id uuid,   -- NEW: must pass the row's owner
  _required_role contributor_role
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = _user_id
      AND c.account_owner_id = _account_owner_id    -- scoped to specific owner
      AND c.status = 'accepted'
      AND CASE _required_role
            WHEN 'viewer'        THEN c.role IN ('viewer', 'contributor', 'administrator')
            WHEN 'contributor'   THEN c.role IN ('contributor', 'administrator')
            WHEN 'administrator' THEN c.role = 'administrator'
          END
  )
$$;
```

Then update every policy that calls it to pass `<table>.user_id` as the `_account_owner_id`. Example:
```sql
-- items SELECT
USING (
  auth.uid() = user_id
  OR has_contributor_access(auth.uid(), items.user_id, 'viewer')
)

-- properties SELECT
USING (
  auth.uid() = user_id
  OR has_contributor_access(auth.uid(), properties.user_id, 'viewer')
)
```

This is a **single function change + policy updates** that closes Attack 1 and Attack 3 across all affected tables.

### Fix 2 — Harden `property_files` INSERT to enforce owner's `user_id`

Add an explicit `WITH CHECK` that the `user_id` being inserted belongs to a user the contributor is actually authorized for:
```sql
WITH CHECK (
  auth.uid() = user_id
  OR (
    has_contributor_access(auth.uid(), property_files.user_id, 'contributor')
    AND (property_id IS NULL OR EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_files.property_id
        AND p.user_id = property_files.user_id  -- also bind property to same owner
    ))
  )
)
```

### Fix 3 — Limit `profiles` contributor view to non-sensitive columns

The `profiles` table exposes `stripe_customer_id`, `household_income`, and `account_number` to contributors. If contributors genuinely need to see profile information (e.g., name for display), consider creating a view that exposes only `first_name`, `last_name`, `avatar_url` for contributor access and restricts the direct table to owner-only reads.

---

## The First Place a Leak Would Actually Occur

In a real attack, the attacker would:
1. Sign up → invite a second account as contributor → accept in second account (takes ~2 minutes)
2. Run: `supabase.from('items').select('*')` in the browser console
3. Receive every item record from every user on the platform

The first query that leaks would be `items` because it has no ordering constraints and is the broadest table. The first policy that fails is the `items` SELECT: `USING (...OR has_contributor_access(auth.uid(), 'viewer'))` — because `has_contributor_access` has no owner scoping.
