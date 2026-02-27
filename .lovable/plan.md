
# Asset Safe — Supabase Security Audit Report
**Audit Date:** February 27, 2026
**Tables Reviewed:** 80 | **RLS Policies Reviewed:** 265 | **Edge Functions Reviewed:** All deployed

---

## Overall Assessment

The project has a mature, well-structured security foundation. RLS is enabled on all 80 tables, all-or-nothing access is correctly blocked on internal/CRM tables, and the roles system is properly separated from the profiles table. However, there are several specific issues — some serious — that require remediation before production launch.

---

## SECTION 1 — Confirmed Risks

### RISK-01 · `has_contributor_access` function is logically broken — **CRITICAL**

**Location:** `public.has_contributor_access()` database function

The function has a flaw in its final `OR` clause:

```sql
-- Current (BROKEN) final OR clause:
OR _user_id IN (
  SELECT user_id FROM public.profiles WHERE user_id = _user_id
)
```

This means **every authenticated user who has a profile row will pass the `has_contributor_access` check**, regardless of whether they are actually an authorized contributor. The `OR` clause resolves to `TRUE` for any user who has a profile (i.e., every registered user).

**Impact:** Any user can read and write to **properties**, **property_files**, **items**, **receipts** — i.e., every property document, photo, video, and inventory item belonging to any other account. This is the most severe finding.

**Tables affected:**
- `properties` (SELECT, INSERT, UPDATE, DELETE)
- `property_files` (SELECT, INSERT, UPDATE, DELETE)
- `items` (SELECT, INSERT, UPDATE, DELETE)
- `receipts` (SELECT, INSERT, UPDATE, DELETE)

**Fix — replace the broken OR clause:**
```sql
CREATE OR REPLACE FUNCTION public.has_contributor_access(_user_id uuid, _required_role contributor_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.contributors c
    WHERE c.contributor_user_id = _user_id
      AND c.status = 'accepted'
      AND CASE _required_role
            WHEN 'viewer'       THEN c.role IN ('viewer', 'contributor', 'administrator')
            WHEN 'contributor'  THEN c.role IN ('contributor', 'administrator')
            WHEN 'administrator' THEN c.role = 'administrator'
          END
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id AND user_id = _user_id
    -- replaced with: account owner check should be done in the POLICY itself using auth.uid() = user_id
    -- The function should ONLY check contributor relationship, not ownership
  );
$$;
```

The correct fix is to remove the last `OR` block entirely. The ownership check (`auth.uid() = user_id`) is already the first operand in every policy that uses this function (e.g., `USING condition: ((auth.uid() = user_id) OR has_contributor_access(...))`). The function itself should only check the contributor relationship.

---

### RISK-02 · `storage_usage` SELECT policy checks the WRONG uid — **High**

**Location:** `storage_usage` table, policy `"Users and contributors can view storage usage"`

```sql
USING condition: has_contributor_access(user_id, 'viewer'::contributor_role)
```

This passes `user_id` (the **row owner's** ID) instead of `auth.uid()` (the **requesting user's** ID) to `has_contributor_access`. This means:
- The check is being evaluated from the perspective of the account owner, not the person making the request.
- If RISK-01 is fixed, this policy will break entirely and block all users from reading storage.

**Fix:**
```sql
USING (auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer'::contributor_role))
```

---

### RISK-03 · `subscribers` UPDATE policy allows users to self-upgrade subscriptions — **High**

**Location:** `subscribers` table, policy `"Users update own subscription"`

```sql
USING condition: (auth.uid() = user_id)
WITH CHECK condition: (auth.uid() = user_id)
```

A user can call `supabase.from('subscribers').update({ subscribed: true, subscription_tier: 'premium' })` and grant themselves an active subscription for free. The policy places **no column-level restriction** on what can be updated.

**Fix:** Remove the client-side UPDATE policy entirely. All subscription state changes should only happen via service role (via the Stripe webhook edge function). The edge function already uses `service_role`. The client-facing policy should be dropped, not narrowed.

---

### RISK-04 · `user_consents` INSERT is completely open to anonymous users — **Medium**

**Location:** `user_consents`, policy `"Anyone can log consent"`

```sql
WITH CHECK condition: true
```

Anyone (including unauthenticated/anonymous requests) can insert consent records with any `user_email`, including other users' email addresses. An attacker could forge consent records for any email, claiming they agreed to ToS.

**Fix:** Restrict to authenticated users and enforce that `user_email` matches `auth.email()`:
```sql
WITH CHECK (auth.uid() IS NOT NULL AND user_email = auth.email())
```

---

### RISK-05 · `recovery_requests` has duplicate INSERT policies with conflicting scopes — **Medium**

**Location:** `recovery_requests` table

Two INSERT policies exist:
1. `"Delegates can submit recovery requests"` — requires the user to be the legacy_locker's assigned delegate (correct, tight)
2. `"Delegates create recovery requests"` — only checks `auth.uid() = delegate_user_id` (loose, no cross-check against legacy_locker assignment)

Since policies are combined with `OR`, the looser policy (Policy 2) wins. **Any authenticated user can insert a recovery_request claiming to be a delegate for any legacy_locker_id they guess.** The tight check from Policy 1 is bypassed.

**Fix:** Delete the loose policy `"Delegates create recovery requests"` — keep only `"Delegates can submit recovery requests"` which validates against `legacy_locker.delegate_user_id`.

---

## SECTION 2 — Potential Risks (Needs Verification)

### POTENTIAL-01 · `backup_codes` exposes `code_hash` via SELECT

The `backup_codes` table stores `code_hash`. If this is a hash of a short numeric code (e.g., 8-digit), it may be brute-forceable offline once an attacker's own session reads their own rows. Consider using a high-entropy hash (bcrypt/argon2) or storing only a HMAC.

### POTENTIAL-02 · `password_catalog` stores passwords in plaintext when vault encryption is off

The `password` column on `password_catalog` has no `is_encrypted` flag (unlike `legacy_locker`). If a user has not enabled vault encryption, raw passwords are stored in plaintext in the database. Needs a column-level check to verify whether encryption is enforced consistently.

### POTENTIAL-03 · `financial_accounts` stores raw `account_number` and `routing_number`

These are stored as plaintext `text` columns with no encryption flag. Client-side AES-256-GCM encryption must be verified to be consistently applied before insert. RLS is correct (owner-only), but a database breach would expose all financial account numbers.

### POTENTIAL-04 · `entitlements` UPDATE policy is missing

The `entitlements` table has SELECT policies for users and admins, but no explicit UPDATE policy for the service role or users. This means all UPDATE operations (from the Stripe webhook using service_role) bypass RLS (service role ignores RLS — this is fine), but also means **there is no policy blocking an authenticated client from attempting to UPDATE their own entitlement row** if they construct the right query. This needs verification.

### POTENTIAL-05 · `stripe_events` payload column exposes full Stripe event JSON

`stripe_events.payload` is JSONB and likely contains full Stripe webhook payloads including customer PII, amounts, and email addresses. Only admins can SELECT this table (policy is correctly admin-only), but the breadth of data in a single admin SELECT is very high.

### POTENTIAL-06 · `account_verification` has no INSERT policy for the service role

The `account_verification` table has a SELECT policy (owner only) but the INSERT appears to be done server-side (via `check-verification` edge function using service_role). Needs confirmation that no client-side INSERT path exists.

### POTENTIAL-07 · `deleted_accounts` exposes email column to admins

The `deleted_accounts` table stores the deleted user's email. Admin SELECT policy grants access to this. While admin access is correct, the table may be accessible via the `admin-get-user-emails` edge function which already fetches auth.users emails, creating a redundant exposure surface.

### POTENTIAL-08 · `gifts` table policies vs. `gift_subscriptions` table — two gift flows

Both `gifts` and `gift_subscriptions` tables exist with different schemas and separate policies. The `gifts` table SELECT policy uses `auth.email()` — but `auth.email()` is only reliable when JWT `email_verified = true`. Unverified email hijacking could allow access to another user's gift row if their email address was later claimed.

### POTENTIAL-09 · `events` (analytics) table allows `user_id = NULL` inserts

Policy: `WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()))`. Anonymous/unauthenticated clients can insert arbitrary events with `user_id = NULL` and any `event`, `path`, or `props` JSONB payload. This can pollute analytics or be used for DoS against the analytics table.

---

## SECTION 3 — Tables Requiring Manual Review

The following tables need human eyes to verify their full security posture:

| Table | Why Review |
|-------|-----------|
| `backup_codes` | Verify hash algorithm strength (bcrypt vs. SHA-256 of short code) |
| `password_catalog` | Verify encryption is always applied before insert (no plaintext bypass) |
| `financial_accounts` | Verify account_number/routing_number encrypted client-side before storage |
| `legacy_locker` | Verify `allow_admin_access=true` is not exploitable; verify delegate access cannot be self-assigned |
| `entitlements` | Verify no UPDATE path exists from client-side that doesn't go through service_role |
| `profiles` | `stripe_customer_id` column is visible to contributors — verify this is intentional |
| `storage.objects` | All 6 storage buckets are private — verify signed URL expiry is short (< 1 hour) |
| `contacts` (CRM) | Has `deny_contacts_select USING(false)` — verify INSERT/UPDATE/DELETE policies also exist or table is entirely locked |
| `audit_logs` | `old_values` and `new_values` JSONB columns may store sensitive field data — admin-only SELECT is correct but confirm no edge function exposes this to non-admins |
| `gift_claim_attempts` | Service-role-only ALL policy — confirm the `check_gift_claim_rate_limit` function is only called from edge functions, not directly from client |

---

## SECTION 4 — Recommendations by Severity

### CRITICAL

**C-1. Fix `has_contributor_access` — remove the broken OR clause**
This is the most important fix. The current function allows any registered user to pass contributor checks and read/write data belonging to any other user's properties, items, and files.

```sql
-- Migration required:
CREATE OR REPLACE FUNCTION public.has_contributor_access(_user_id uuid, _required_role contributor_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contributors c
    WHERE c.contributor_user_id = _user_id
      AND c.status = 'accepted'
      AND CASE _required_role
            WHEN 'viewer'        THEN c.role IN ('viewer','contributor','administrator')
            WHEN 'contributor'   THEN c.role IN ('contributor','administrator')
            WHEN 'administrator' THEN c.role = 'administrator'
          END
  )
$$;
```

---

### HIGH

**H-1. Remove the client-side `subscribers` UPDATE policy**
Drop `"Users update own subscription"`. Subscription state should only be writable by the Stripe webhook (service_role). Add a comment in the migration explaining why.

**H-2. Fix `storage_usage` SELECT policy argument order**
Change `has_contributor_access(user_id, ...)` to `has_contributor_access(auth.uid(), ...)`.

**H-3. Remove the loose recovery_requests INSERT policy**
Delete `"Delegates create recovery requests"` (the one that only checks `auth.uid() = delegate_user_id`). Keep only `"Delegates can submit recovery requests"` which validates against the actual legacy_locker assignment.

---

### MEDIUM

**M-1. Restrict `user_consents` INSERT to authenticated users with email match**
Replace `WITH CHECK (true)` with `WITH CHECK (auth.uid() IS NOT NULL AND user_email = auth.email())`.

**M-2. Audit `password_catalog` for plaintext entries**
Query the table with service_role to determine if any rows have unencrypted passwords stored. Add a migration to add an `is_encrypted` boolean column if not present, to make encryption status auditable.

**M-3. Verify signed URL expiry across all storage buckets**
Check the `useSignedUrl` hook and `StorageService` to ensure signed URLs are not set to an excessively long expiry (e.g., 1 week). Recommended max is 1 hour for sensitive files, 24 hours for photos.

---

### LOW

**L-1. Restrict `events` analytics INSERT**
Consider restricting to authenticated users only, or at minimum add server-side rate limiting per IP to prevent pollution of analytics data.

**L-2. Restrict `photographer_interest` INSERT with a rate limit**
The public INSERT policy is intentional but no rate limiting exists at the RLS layer. Consider calling the `rate-limit-check` edge function before allowing submissions.

**L-3. Add audit trail for `user_roles` mutations**
Currently the `audit_trigger_function` may not be attached to `user_roles`. Role escalation (e.g., granting someone the `admin` role) should be immutably logged.

**L-4. Consider column-level security on `profiles.stripe_customer_id`**
Contributors can read the `profiles` table of the account owner. The `stripe_customer_id` column is included in that view. While not directly exploitable, it is unnecessary for contributors to see this Stripe identifier.

---

## Summary Count

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 1 | Fix immediately before launch |
| High | 3 | Fix before launch |
| Medium | 3 | Fix within 2 weeks |
| Low | 4 | Fix within 30 days |

The good news: RLS is enabled on all 80 tables, the roles table is correctly separated, admin functions use proper SECURITY DEFINER patterns, storage buckets are all private, and the Stripe webhook is service-role protected. The foundation is solid — the issues above are surgical fixes, not architectural rework.
