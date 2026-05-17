## Goal
When the Owner designates an Authorized User as **Legacy Admin** (or replaces the current one), email the newly designated person so they understand the role.

## How it will work

### 1. New edge function: `send-legacy-admin-notification`
Standard pattern matching existing functions (e.g. `send-invite`):
- Auth: validates the caller's JWT
- Input: `{ legacy_admin_user_id: string, account_id: string }`
- Verifies the caller is the **owner** of that account via `is_account_owner` RPC (prevents abuse)
- Looks up the designated user's email via service-role `auth.admin.getUserById`
- Looks up owner name from `profiles` for the body copy
- Sends via Resend from `Asset Safe <noreply@assetsafe.net>` (per project convention)
- Returns `{ ok: true }`; failures are logged but never block the assignment

### 2. Email content
**Subject:** `You've been designated as a Legacy Admin on Asset Safe`

**Body (HTML + plain-text fallback):**
- Friendly opener: "{Owner name} has designated you as the Legacy Admin for their Asset Safe account."
- **What this means** (designation, not a role change):
  - You are their chosen successor for future account continuity (closure, data export, ownership transfer) — to be invoked only if they become unable to manage the account.
  - In the meantime, **nothing about your day-to-day access changes**.
- **What stays the same:**
  - Your existing access level (Read Only or Full Access) is unchanged.
  - You do **not** gain billing, deletion, or owner-profile access today.
  - You still cannot see anything you couldn't see before.
- **What's new:**
  - You're now listed as the Legacy Admin in their account settings.
  - If the Owner ever becomes unable to manage the account, you can submit a **continuity request** (closure, export, or ownership transfer) which Asset Safe will review before any action.
- Closing line: the Owner can change or remove this designation at any time; you'll be notified if they do (future).
- Footer: support contact `support@assetsafe.net`.

### 3. Wire it into `LegacyAdminAssignment.tsx`
In `handleAssign`, after the insert succeeds (and after demoting the previous one, if any), fire-and-forget:
```ts
supabase.functions.invoke('send-legacy-admin-notification', {
  body: { legacy_admin_user_id: selectedUserId, account_id: accountId },
}).catch((e) => console.warn('legacy admin email failed', e));
```
No UI change. The toast still says "Legacy Admin assigned." Failure is non-blocking.

## Out of scope
- No notification when the Legacy Admin is **removed** (can add later if you'd like — say the word).
- No in-app notification record (email only). If you want a row in the notifications table too, I'll add it.
- No changes to RLS, permissions, or the `legacy_admins` table schema.

## Files to add / change
- **New:** `supabase/functions/send-legacy-admin-notification/index.ts`
- **Edit:** `src/components/LegacyAdminAssignment.tsx` (one invoke call inside `handleAssign`)
