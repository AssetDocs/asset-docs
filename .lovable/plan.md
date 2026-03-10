
## Four fixes, two files

### Issue 1 — Invite shows "Failed" error but record still appears in list

**Root cause:** The edge function (`invite-contributor`) does three things in order:
1. INSERT contributor DB record ✅
2. `admin.inviteUserByEmail()` — may partially fail
3. `resend.emails.send()` — if this throws, the function returns HTTP 500

The DB record is already committed by the time the error is returned. In `ContributorsTab.tsx`, the `catch` block at line 143 shows the error toast but **never calls `fetchContributors()`**. So the list only updates on page reload (or some other re-render), making the user think the invite "failed" even though the record exists.

**Fix (ContributorsTab.tsx):**
- Move `fetchContributors()` into the `finally` block so it always runs, regardless of success or failure.
- Change the catch toast message to: *"Invitation recorded but the email could not be sent. The user has been added to your Authorized Users list. You can resend the invitation using the Resend button."*
- This truthfully represents what happened: the record saved, but the email may have failed.

### Issue 2 — Rename section headings (ContributorsTab.tsx)

| Line | Current | New |
|---|---|---|
| 417 | `Current Contributors` | `Authorized Users` |
| 419 | `Manage access levels and remove contributors` | `Manage access levels and remove authorized users` |

### Issue 3 — "Access" CTA → "Users" in WelcomeBanner (WelcomeBanner.tsx)

The `<span>` at line ~185 inside the Access button reads `"Access"` — change to `"Users"`.

### Issue 4 — Dashboard tab resets to `overview` when switching browser tabs (Account.tsx)

**Root cause:** `activeTab` is tracked in React state only, not in the URL. When `setActiveTab` is called (line 158), the URL stays at `/account` with no `?tab=` param. If the component remounts (Supabase auth state change on tab focus triggers a re-render), `searchParams.get('tab')` returns null → initializer defaults back to `overview`.

**Fix (Account.tsx):**
- Add `navigate` import (already imported).
- Add a `useEffect` that syncs `activeTab` → URL: when `activeTab !== 'overview'`, push `?tab=activeTab` to the URL with `replace: true`. When it's `overview`, clear the param.
- This is the same URL-sync pattern already applied to `AccountSettings.tsx`.

```typescript
// Add after existing useEffects in Account.tsx
useEffect(() => {
  if (activeTab === 'overview') {
    navigate('/account', { replace: true });
  } else {
    navigate(`/account?tab=${activeTab}`, { replace: true });
  }
}, [activeTab]);
```

### Files to change

| File | Change |
|---|---|
| `src/components/ContributorsTab.tsx` | Move `fetchContributors()` to `finally`; update catch toast message; rename "Current Contributors" → "Authorized Users"; rename description |
| `src/components/WelcomeBanner.tsx` | Change "Access" → "Users" on the dashboard shortcut button |
| `src/pages/Account.tsx` | Add `useEffect` to sync `activeTab` → URL with `replace: true` |
