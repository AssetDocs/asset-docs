

## Multi-Account Support — Architecture and UX Plan

### Summary
Extend the existing authorized users system so a single user can belong to multiple accounts and switch between them from within the dashboard.

### Database Changes (Migration)

1. **Add `account_name`** to `accounts` table (text, nullable, default null). Backfill existing rows with owner's `first_name || "'s Account"` from profiles.

2. **Add `last_used_account_id`** to `profiles` table (uuid, nullable, FK to accounts). Used to remember which account to open on next login.

3. **Update `get_user_account_id` function** — currently returns only the owner membership. Change to return the `last_used_account_id` if valid, otherwise first active membership.

### AccountContext Rewrite

Replace the current single-membership fetch with multi-account support:

```typescript
interface AccountContextType {
  // Current active account
  accountId: string | null;
  accountRole: AccountRole;
  accountName: string;
  ownerName: string;
  
  // All accessible accounts
  accounts: Array<{
    accountId: string;
    accountName: string;
    role: AccountRole;
    ownerName: string;
  }>;
  hasMultipleAccounts: boolean;
  
  // Switch function
  switchAccount: (accountId: string) => Promise<void>;
  
  // Existing permission flags (unchanged)
  isOwner, isFullAccess, isReadOnly, canEdit, canManageBilling, loading...
}
```

On mount: fetch ALL active memberships (not just one). Set active account from `last_used_account_id` if valid, otherwise first membership. `switchAccount()` updates state + persists `last_used_account_id` to profiles table.

### Account Switcher Component

New `AccountSwitcher.tsx` — a dropdown in the dashboard header/navbar area:

- Shows current account name with a chevron
- Dropdown lists all accounts grouped: "Owned by You" / "Shared With You"
- Each item shows account name + role badge
- Selecting triggers `switchAccount()` which re-renders all data

### Invite Acceptance Update

In `InviteLanding.tsx`, after successful acceptance:
- Call `switchAccount(acceptedAccountId)` to immediately set context to the invited account
- This persists `last_used_account_id` so the user stays in that account

### WelcomeBanner Update

Update to use `accountName` from context instead of fetching contributor info separately. Show the current account name.

### Login Flow

Current `ProtectedRoute` + `AccountProvider` handles this naturally:
- AccountContext fetches all memberships
- If `last_used_account_id` is set and valid → use it
- Otherwise → use first active membership
- No separate account selection screen needed (switcher handles it)

### RLS — No Changes Needed

RLS already uses `account_memberships` for access. The frontend passes `accountId` to queries. Multi-account works because the user simply changes which `accountId` they query with, and RLS validates membership.

### Files Changed

| File | Change |
|------|--------|
| New migration | Add `account_name` to accounts, `last_used_account_id` to profiles, backfill |
| `src/contexts/AccountContext.tsx` | Fetch all memberships, add `accounts[]`, `switchAccount()`, `accountName` |
| New: `src/components/AccountSwitcher.tsx` | Dropdown component for switching accounts |
| `src/components/WelcomeBanner.tsx` | Use account context instead of legacy contributor fetch |
| `src/pages/InviteLanding.tsx` | Call `switchAccount` after acceptance |
| `src/components/Navbar.tsx` | Add AccountSwitcher to authenticated nav |

### Edge Cases Handled

- **Revoked membership on active account**: `switchAccount` validates membership exists; if current account becomes invalid on refresh, auto-switch to next valid one
- **No valid memberships**: Show empty state "You do not currently have access to any accounts"
- **User owns no account but is shared on others**: Works — switcher shows only shared accounts
- **`last_used_account_id` points to revoked account**: Ignored, falls back to first valid membership

### What Does NOT Change
- RLS policies — already account-based
- Edge functions (send-invite, accept-invite) — already work
- AuthorizedUsersTab — already scoped to current accountId
- Subscription/billing logic — unchanged

