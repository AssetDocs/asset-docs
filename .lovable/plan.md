## Goal
When an Owner toggles an Authorized User between **Full Access** and **Read Only**, ensure the change is enforced (a) immediately in the AU's live session and (b) at the database level via RLS — not just hidden in the UI.

## What works today
`AuthorizedUsersTab.handleChangeRole` updates `account_memberships.role` in the DB. The frontend reads that role through `AccountContext` and exposes `isReadOnly` / `canEdit` / `canDelete`, which UI components honor (write buttons hidden, ViewerRestriction banner shown).

## Gaps found

### 1. RLS does not enforce role differences (critical)
RLS policies on data tables (`properties`, `items`, `property_files`, `legacy_locker`, etc.) use the legacy `has_contributor_access(...)` function against the **`contributors` table**, which is empty (0 rows). The new model lives in `account_memberships`. Net effect: an AU technically can't write through normal RLS today either (their writes only succeed because `user_id = auth.uid()` — which is false for AUs on the owner's records — so most writes silently fail at the DB).

Read Only vs. Full Access is therefore a **frontend-only distinction**. A determined Read Only AU could bypass the UI and call Supabase directly with the same effect a Full Access AU has.

### 2. Live session does not refresh after a toggle
When the Owner flips a toggle, the AU's active browser session keeps the old role until they reload, because `AccountContext` only re-fetches memberships on mount / on user change. There is no realtime subscription on `account_memberships`.

### 3. No audit entry for role changes
`handleChangeRole` does not call `logActivity`, unlike invite / revoke flows.

## Plan

### A. Add membership-based RLS that respects the role (backend enforcement)
Add a helper and update SELECT/INSERT/UPDATE/DELETE policies on shared-data tables so they read from `account_memberships`:

```sql
-- New helper: does _user have at least the required role on the account that owns _record_user_id?
create or replace function public.has_account_access(
  _user_id uuid,
  _owner_user_id uuid,
  _min_role text   -- 'read_only' | 'full_access' | 'owner'
) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.account_memberships am
    join public.accounts a on a.id = am.account_id
    where am.user_id = _user_id
      and am.status = 'active'
      and a.owner_user_id = _owner_user_id
      and case _min_role
        when 'read_only'   then am.role in ('owner','full_access','read_only')
        when 'full_access' then am.role in ('owner','full_access')
        when 'owner'       then am.role = 'owner'
      end
  );
$$;
```

Then on each shared table (`properties`, `items`, `property_files`, `user_documents`, `receipts`, `insurance_policies`, `legacy_locker`, `password_catalog`):
- SELECT: allow `auth.uid() = user_id OR has_account_access(auth.uid(), user_id, 'read_only')`
- INSERT / UPDATE: allow `auth.uid() = user_id OR has_account_access(auth.uid(), user_id, 'full_access')`
- DELETE: keep restricted to `auth.uid() = user_id OR has_account_access(auth.uid(), user_id, 'full_access')` (matches current "canDelete only for Owner+Full" assumption — confirm whether Full Access should delete; today `canDelete = isOwner` only in `AccountContext`. If the rule is **Owner-only delete**, use `'owner'` instead.)

Result: flipping a membership from `full_access` to `read_only` immediately blocks all writes at the DB layer, even from a crafted request.

**Confirm before migration:** should Full Access users be allowed to **delete**, or only Read+Write? (Current `AccountContext.canDelete` is Owner-only — I'll match that unless you say otherwise.)

### B. Make the AU's live session pick up the new role
In `AccountContext`:
1. Subscribe to `account_memberships` via Supabase realtime, filtered by `user_id = auth.uid()`.
2. On any insert/update/delete event, call `refreshAccount()` and, if the active account's role changed, show a toast: *"Your access level was updated by the account owner."*
3. If the active account membership was deleted, switch to another available account (or sign out of that workspace if none).

### C. Audit the toggle
In `AuthorizedUsersTab.handleChangeRole`, after a successful update call `logActivity({ action_type: 'contributor_role_change', resource_type: 'authorized_user', resource_name: memberName, metadata: { from, to } })`.

## Out of scope
- No changes to invite flow, owner-only billing/settings gates, or the legacy `contributors` table (now unused for shared data; can be removed in a later cleanup).
- No edge-function changes.
