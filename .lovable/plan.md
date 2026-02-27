
# Asset Safe — Deep RLS Ownership & Authorization Audit
**Based on:** 263 live policies, 80 tables, full schema analysis

---

## Audit Approach

For every table accessible by the frontend, the analysis below covers:
- How `auth.uid()` is used and whether it is always the identity of the requesting client
- Whether joins/subqueries in policies can be bypassed or produce unintended results
- Whether contributor/delegate access is correctly scoped
- Specific edge cases that could allow cross-account data access

---

## CATEGORY 1 — Core Asset Records

### `properties` table
**How access is determined:**
- SELECT/UPDATE: `auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer'/'contributor')`
- INSERT: owner OR contributor role
- DELETE: owner OR administrator contributor

**Analysis:**
- `auth.uid()` usage is correct — always the requesting client's identity
- `has_contributor_access` is now fixed (C-1 remediation) and only queries the `contributors` table

**Edge case — INSERT without ownership binding:**
The INSERT policy allows `has_contributor_access(auth.uid(), 'contributor')` to insert a new property, but there is **no enforcement that the new row's `user_id` equals the account_owner_id of the contributor's account**. A contributor with the `contributor` role could insert a property with `user_id = auth.uid()` (their own ID), effectively creating a property under their own account while authenticated as a contributor. The INSERT policy should require `user_id = <account_owner_id>` not just contributor role.

**Recommended fix:**
```sql
-- Current (allows contributor to insert property under their OWN user_id):
WITH CHECK ((auth.uid() = user_id) OR has_contributor_access(auth.uid(), 'contributor'))

-- Correct (contributors must insert under the account owner's user_id):
WITH CHECK (
  auth.uid() = user_id
  OR (
    has_contributor_access(auth.uid(), 'contributor'::contributor_role)
    AND EXISTS (
      SELECT 1 FROM contributors c
      WHERE c.contributor_user_id = auth.uid()
        AND c.account_owner_id = properties.user_id
        AND c.status = 'accepted'
    )
  )
)
```

**Risk: HIGH** — same pattern applies to `property_files`, `items`, `receipts`.

---

### `property_files` table
**How access is determined:**
- SELECT: `auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer')`
- INSERT: owner OR contributor role
- UPDATE: owner OR contributor role
- DELETE: owner OR administrator role

**Same edge case as `properties`:** The INSERT and UPDATE WITH CHECK policies allow a contributor to write rows with `user_id = auth.uid()` (their own ID). A contributor could upload files attributed to themselves rather than the account owner.

**Additional issue — no `property_id` scope check in contributor INSERT:**
A contributor can INSERT a property_file and set `property_id` to any UUID — including a property belonging to a completely different account — because the INSERT policy only checks the contributor role, not whether the `property_id` belongs to the account owner:
```sql
-- Current:
WITH CHECK ((auth.uid() = user_id) OR has_contributor_access(auth.uid(), 'contributor'))
-- Gap: property_id is not validated against the account owner's properties
```

**Risk: HIGH** — A contributor could associate files with arbitrary properties.

---

### `items` table
**How access is determined:**
- SELECT: `auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer')`
- INSERT: owner OR contributor role
- UPDATE: owner OR contributor role
- DELETE: owner OR administrator role

**Same ownership-binding gap as `properties`:** A contributor with `contributor` role can insert an item with `user_id = auth.uid()`, creating items attributed to themselves.

**Risk: HIGH**

---

### `receipts` table
**How access is determined:**
- SELECT: `auth.uid() = user_id OR has_contributor_access(auth.uid(), 'viewer')`
- INSERT: owner OR contributor role
- UPDATE: owner OR contributor role
- DELETE: owner OR administrator role

**Same ownership-binding gap.** Additionally, `item_id` is not validated — a contributor could associate a receipt with an item they don't own.

**Risk: HIGH**

---

## CATEGORY 2 — Legacy Locker / Estate Data

### `legacy_locker` table
**How access is determined:**
- SELECT: Two policies — owner only, AND "Administrator contributors can view"
- INSERT: owner only (`auth.uid() = user_id`)
- UPDATE: owner only (`auth.uid() = user_id`)
- DELETE: owner only (`auth.uid() = user_id`)

**Analysis:**
- The administrator contributor SELECT policy correctly queries the `contributors` table with `c.status = 'accepted'` and `c.role = 'administrator'` — the join is correct and tight.
- The `delegate_user_id` column is writeable by the owner via UPDATE. A user cannot assign themselves as their own delegate at the RLS layer, but there is no constraint preventing `delegate_user_id = user_id`. If a user sets themselves as their own delegate, they could initiate a recovery request on their own locker.

**Edge case — `allow_admin_access` flag:**
The `allow_admin_access` boolean column exists but is **not referenced in any RLS policy**. It appears to be an application-layer flag only. This means the admin SELECT policy (`has_app_role(auth.uid(), 'admin')`) always grants admin access to all legacy locker rows regardless of this flag's value. If the flag was intended to give users control over whether admins can see their estate data, the policy must be updated to check it.

**Recommended fix for delegate self-assignment:**
```sql
ALTER TABLE public.legacy_locker 
ADD CONSTRAINT chk_delegate_not_self 
CHECK (delegate_user_id IS NULL OR delegate_user_id != user_id);
```

**Risk: MEDIUM** — `allow_admin_access` flag is ignored; potential for delegate self-assignment.

---

### `legacy_locker_files`, `legacy_locker_folders`, `legacy_locker_voice_notes`
**How access is determined:**
- Each has: owner-only INSERT/UPDATE/DELETE
- SELECT: owner AND administrator contributor (inline subquery on `contributors` table)

**Analysis:**
- All inline subqueries correctly check `c.account_owner_id = [table].user_id` AND `c.contributor_user_id = auth.uid()` AND `c.status = 'accepted'` AND `c.role = 'administrator'`
- No cross-account gaps detected in these tables
- INSERT/UPDATE/DELETE are correctly owner-only — contributors cannot modify estate files

**Risk: LOW** — Policies are tight and correct.

---

## CATEGORY 3 — Documents

### `user_documents` table
**How access is determined:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id` only — no contributor access

**Analysis:**
- Documents are owner-only. Contributors cannot see user documents.
- The `property_id` column (nullable) links documents to properties but is not validated by RLS — a user could set `property_id` to a property they don't own. This is a data integrity concern but not a cross-account access risk since RLS only affects their own rows.

**Risk: LOW** — tight ownership, but `property_id` FK not RLS-validated.

---

### `document_folders` table
- All operations: `auth.uid() = user_id` — correct, no gaps.

---

## CATEGORY 4 — Family Archive / Memory Safe

### `memory_safe_items` and `memory_safe_folders`
**How access is determined:**
- All operations: `auth.uid() = user_id` only

**Analysis:**
- No contributor access to memory safe. Correct and tight.
- `folder_id` on items references `memory_safe_folders` but is not validated by RLS — a user could set `folder_id` to a folder belonging to another user. Data integrity issue, not a security breach since SELECT filters by `user_id`.

**Risk: LOW** — correct owner-only isolation.

---

### `family_recipes`, `notes_traditions`
- All operations: `auth.uid() = user_id` — correct, no gaps.

---

## CATEGORY 5 — Authorized User (Contributor) Mappings

### `contributors` table — The Access Control Fabric
**How access is determined:**
- ALL (full CRUD): `auth.uid() = account_owner_id` — owner manages their contributors
- SELECT: `auth.uid() = contributor_user_id OR auth.email() = contributor_email` — contributors see their own invitations
- UPDATE: `auth.uid() = contributor_user_id OR auth.email() = contributor_email` — contributors update their own acceptance

**Critical edge case — `auth.email()` in UPDATE policy:**
The UPDATE policy uses:
```sql
USING ((auth.uid() = contributor_user_id) OR (auth.email() = contributor_email))
WITH CHECK ((auth.uid() = contributor_user_id) OR (auth.email() = contributor_email))
```

`auth.email()` matches unverified email addresses in the JWT. If an attacker registers with an email address that matches a pending contributor invitation before the invited person accepts, they could UPDATE the invitation row (setting `contributor_user_id` to their own ID, changing `status` to `'accepted'`), hijacking the contributor access.

**Recommended fix:** Restrict the UPDATE policy to require both `auth.uid() = contributor_user_id` (the UID must already be bound) and `auth.email() = contributor_email`. For the pre-acceptance case (where `contributor_user_id IS NULL`), the acceptance should be handled via a `SECURITY DEFINER` edge function that validates the token, not direct client UPDATE.

**Risk: HIGH** — email-based contributor hijack on pending invitations.

---

### `user_activity_logs` table
**How access is determined:**
- SELECT: owner OR admin contributor (administrator role) OR app admin
- INSERT: `auth.uid() = user_id`

**Edge case — INSERT policy allows actor spoofing:**
The INSERT policy only checks `auth.uid() = user_id`. The `actor_user_id` column (who performed the action) is a separate column with no RLS validation. A user could insert an activity log entry claiming `actor_user_id` is someone else's UUID, attributing actions to other users in the audit trail.

**Risk: MEDIUM** — Activity logs can be falsified by any authenticated user.

---

## CATEGORY 6 — Recovery Requests

### `recovery_requests` table (post-fixes)
**How access is determined:**
- INSERT: `auth.uid() = delegate_user_id AND EXISTS (legacy_locker WHERE delegate_user_id = auth.uid())` — tight, correct
- SELECT: multiple overlapping policies — owner OR delegate
- UPDATE: `auth.uid() = owner_user_id` (two duplicate UPDATE policies)

**Duplicate UPDATE policies:**
There are two UPDATE policies with identical `USING (auth.uid() = owner_user_id)` — `"Owners can respond to recovery requests"` and `"Owners update recovery requests"`. Duplicate policies are harmless (both evaluate to the same result) but should be cleaned up to reduce policy confusion.

**Risk: LOW** — Secure post-fix, but duplicate UPDATE policies should be removed.

---

## CATEGORY 7 — Sensitive Vault Tables

### `password_catalog`
- All operations: `auth.uid() = user_id` — tight, no gaps.
- **Remaining concern:** No `is_encrypted` flag. Vault encryption is opt-in at the application layer. The RLS is correct; this is an application-layer risk.

### `financial_accounts`
- All operations: `auth.uid() = user_id` — tight, no gaps.
- **Remaining concern:** `account_number` and `routing_number` stored as plaintext text columns. RLS is correct; this is an application-layer encryption risk.

### `trust_information`
- SELECT: owner AND administrator contributor (inline subquery, tight)
- INSERT/UPDATE/DELETE: owner only
- **Has `is_encrypted` boolean** — good. But no enforcement that data is encrypted before insert at the RLS layer (same as legacy_locker).

---

## CATEGORY 8 — Profiles

### `profiles` table
**How access is determined:**
- SELECT: `auth.uid() = user_id` (own), AND `has_app_role('admin')` (admin), AND contributor SELECT (any accepted contributor sees account owner profile)

**The contributor SELECT policy exposes ALL profile columns:**
```sql
USING ((auth.uid() = user_id) OR (EXISTS (
  SELECT 1 FROM contributors c
  WHERE c.contributor_user_id = auth.uid()
    AND c.account_owner_id = profiles.user_id
    AND c.status = 'accepted'
)))
```
Any contributor of any role (viewer, contributor, administrator) can read the full profiles row including `stripe_customer_id`, `household_income`, `phone`, and `storage_quota_gb`. The `stripe_customer_id` is unnecessary for contributors. `household_income` is sensitive financial data that contributors/viewers don't need.

**Risk: MEDIUM** — Sensitive profile columns exposed to all contributor roles.

---

## CATEGORY 9 — Calendar Events

### `calendar_events` table
**How access is determined:**
- Owner: full CRUD
- Contributors: SELECT/INSERT/UPDATE for `visibility = 'shared'` only (role-checked)
- Delegates: SELECT for `visibility = 'emergency_only'` via `legacy_locker.delegate_user_id = auth.uid()`

**Edge case — contributor INSERT with visibility manipulation:**
The contributor INSERT policy allows creating events with `visibility = 'shared'`. There is no `WITH CHECK` restriction on what `user_id` is set to in the new row. A contributor could insert an event with `user_id = auth.uid()` (their own ID) rather than the account owner's ID, though this would only affect their own isolated view.

**Edge case — delegate emergency access:**
The delegate SELECT policy uses:
```sql
EXISTS (SELECT 1 FROM legacy_locker ll
  WHERE ll.user_id = calendar_events.user_id AND ll.delegate_user_id = auth.uid())
```
This correctly cross-references `legacy_locker`. However, if the `recovery_status` has not yet been acknowledged, the delegate can still see emergency events. Consider whether delegate calendar access should require `recovery_status = 'delegate_acknowledged'`.

**Risk: MEDIUM** — Delegates see emergency calendar events before formal access acknowledgment.

---

## CATEGORY 10 — `gifts` table (legacy)

**Current SELECT policy:**
```sql
USING ((redeemed_by_user_id = auth.uid()) OR (recipient_email = auth.email()))
```

`auth.email()` is the unverified email from the JWT. If email verification is not enforced on signup, an attacker can register with any email address and use `auth.email()` to match gift rows. The `supabase/config.toml` has `enable_confirmations = true` for auth.email, which mitigates this — but the mitigation is a configuration dependency, not enforced at the RLS layer.

**Risk: MEDIUM** — Depends on email confirmation being enabled. If ever disabled, gift hijacking becomes trivial.

---

## Summary Table

| Table | Finding | Severity | Type |
|-------|---------|----------|------|
| `properties` | Contributors can INSERT with their own `user_id`, not account owner's | **HIGH** | Ownership binding |
| `property_files` | Same + `property_id` not scoped to account owner | **HIGH** | Ownership binding |
| `items` | Contributors can INSERT with their own `user_id` | **HIGH** | Ownership binding |
| `receipts` | Contributors can INSERT with their own `user_id`; `item_id` unvalidated | **HIGH** | Ownership binding |
| `contributors` | Email-based UPDATE hijacks pending invitations | **HIGH** | Identity spoofing |
| `legacy_locker` | `allow_admin_access` flag ignored by RLS; delegate self-assignment possible | **MEDIUM** | Policy intent |
| `user_activity_logs` | `actor_user_id` column not RLS-validated — any user can falsify it | **MEDIUM** | Audit integrity |
| `profiles` | `stripe_customer_id` and `household_income` visible to all contributor roles | **MEDIUM** | Data minimization |
| `calendar_events` | Delegates see emergency events before formal acknowledgment | **MEDIUM** | Access scope |
| `gifts` | `auth.email()` match depends on email confirmation being enabled | **MEDIUM** | Configuration dependency |
| `recovery_requests` | Duplicate UPDATE policies (harmless but confusing) | **LOW** | Policy hygiene |
| `user_documents` | `property_id` FK not RLS-validated (integrity only) | **LOW** | Data integrity |
| `memory_safe_items` | `folder_id` FK not RLS-validated (integrity only) | **LOW** | Data integrity |

---

## Recommended Migrations

### Fix 1 (HIGH) — Add `account_owner_id` scope to contributor INSERT policies
For `properties`, `property_files`, `items`, and `receipts` — require that when a contributor inserts, the `user_id` on the new row matches the `account_owner_id` of their contributor record.

```sql
-- Pattern for each affected table:
DROP POLICY IF EXISTS "Users can create their own [TABLE]" ON public.[TABLE];
CREATE POLICY "Users can create their own [TABLE]"
  ON public.[TABLE] FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (
      has_contributor_access(auth.uid(), 'contributor'::contributor_role)
      AND EXISTS (
        SELECT 1 FROM public.contributors c
        WHERE c.contributor_user_id = auth.uid()
          AND c.account_owner_id = [TABLE].user_id
          AND c.status = 'accepted'
      )
    )
  );
```

### Fix 2 (HIGH) — Harden contributor invitation UPDATE policy
Replace the email-based UPDATE with a token-based edge function and restrict direct client UPDATE:
```sql
DROP POLICY IF EXISTS "Contributors update own acceptance" ON public.contributors;
CREATE POLICY "Contributors update own acceptance"
  ON public.contributors FOR UPDATE
  USING (auth.uid() = contributor_user_id)
  WITH CHECK (auth.uid() = contributor_user_id);
```
The invitation acceptance flow should use the `accept-contributor-invitation` edge function (service_role) to bind the `contributor_user_id` by token, not direct client UPDATE by email match.

### Fix 3 (MEDIUM) — Enforce `allow_admin_access` in Legacy Locker admin policy
The admin SELECT policy on `legacy_locker` should honor the `allow_admin_access` flag:
```sql
-- Current (ignores flag):
USING (has_app_role(auth.uid(), 'admin'))
-- Fixed:
USING (has_app_role(auth.uid(), 'admin') AND allow_admin_access = true)
```

### Fix 4 (MEDIUM) — Restrict `actor_user_id` in activity log INSERT
Add a `WITH CHECK` that enforces `actor_user_id IS NULL OR actor_user_id = auth.uid()`:
```sql
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
  );
```

### Fix 5 (MEDIUM) — Add delegate self-assignment constraint
```sql
ALTER TABLE public.legacy_locker
ADD CONSTRAINT chk_delegate_not_self
CHECK (delegate_user_id IS NULL OR delegate_user_id != user_id);
```
