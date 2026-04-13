

## Phase 2: AccountContext + Invite Landing Page + AuthorizedUsersTab

### Overview
Create the new `AccountContext` provider (replacing `ContributorContext`), build the `/invite` landing page, and replace `ContributorsTab` with `AuthorizedUsersTab` — all using the new `accounts`, `account_memberships`, and `invites` tables from Phase 1.

### 1. New file: `src/contexts/AccountContext.tsx`

Queries `account_memberships` to determine the current user's role and active account. Exposes:

```typescript
interface AccountContextType {
  accountId: string | null;
  accountRole: 'owner' | 'full_access' | 'read_only' | null;
  isOwner: boolean;
  isFullAccess: boolean;
  isReadOnly: boolean;
  canEdit: boolean;           // owner or full_access
  canManageBilling: boolean;  // owner only
  ownerName: string;
  loading: boolean;
  showReadOnlyRestriction: () => void;
  refreshAccount: () => Promise<void>;
}
```

Fetches membership from `account_memberships` joined with `accounts` and owner's `profiles`. Replaces `ContributorContext` entirely.

### 2. New file: `src/pages/InviteLanding.tsx` (route: `/invite`)

- Reads `?token=` from URL
- Calls `accept-invite` edge function with the raw token
- Shows invite details (inviter name, role) on success
- If user is not logged in: shows Sign In / Create Account buttons
- If user is logged in: auto-accepts and redirects to `/account`
- Error states: expired, already accepted, invalid token

### 3. New file: `src/components/AuthorizedUsersTab.tsx`

Replaces `ContributorsTab`. Uses `account_memberships` and `invites` tables instead of `contributors`.

- Invite form: email + role selector (Full Access / Read Only only)
- No first/last name fields (user creates their own profile)
- Calls `send-invite` edge function
- Lists current members from `account_memberships` with role badges
- Lists pending invites from `invites` table
- Owner can change roles and revoke access
- Cannot remove or demote owner

### 4. Update `src/components/AccessActivitySection.tsx`

- Replace `ContributorsTab` import with `AuthorizedUsersTab`
- Update role explanations section: remove 3-role grid, replace with 2-role grid (Full Access + Read Only)
- Update terminology throughout

### 5. Update `src/components/ViewerRestriction.tsx`

- Rename exports: `ViewerRestriction` stays but uses `useAccount` instead of `useContributor`
- Update text: "Viewer" → "Read Only", "contributor" references removed
- `useViewerCheck` → uses new `isReadOnly` / `canEdit` from `AccountContext`

### 6. Wire into `src/App.tsx`

- Replace `ContributorProvider` with `AccountProvider` in the provider tree
- Replace `useContributor` calls in `ProtectedRoute` with `useAccount`
- Update membership bypass logic (replaces `isContributor` check)
- Remove `accept-contributor-invitation` call from subscription check
- Add `/invite` route (public, not protected)
- Remove `/contributor-welcome` route

### 7. Update consumer files (minimal — bridge only)

For files that import `useContributor` (`Account.tsx`, `AccountSettings.tsx`, `SecureVault.tsx`, `VIPContacts.tsx`, `AdminContributorPlanInfo.tsx`, `CreatePassword.tsx`):
- Replace `useContributor()` with `useAccount()`
- Map old properties to new: `isViewer` → `isReadOnly`, `canEdit` stays, `isContributorRole` → removed, `isAdministrator` → `isFullAccess`, `accountOwnerId` → `accountId`

### Files changed

| File | Action |
|------|--------|
| `src/contexts/AccountContext.tsx` | **New** — replaces ContributorContext |
| `src/pages/InviteLanding.tsx` | **New** — invite landing page |
| `src/components/AuthorizedUsersTab.tsx` | **New** — replaces ContributorsTab |
| `src/components/AccessActivitySection.tsx` | Update imports + role explanations |
| `src/components/ViewerRestriction.tsx` | Update to use AccountContext |
| `src/App.tsx` | Swap providers, add /invite route |
| `src/pages/Account.tsx` | useContributor → useAccount |
| `src/pages/AccountSettings.tsx` | useContributor → useAccount |
| `src/pages/CreatePassword.tsx` | useContributor → useAccount |
| `src/pages/VIPContacts.tsx` | useContributor → useAccount |
| `src/components/SecureVault.tsx` | useContributor → useAccount |
| `src/components/AdminContributorPlanInfo.tsx` | useContributor → useAccount |

Legacy files (`ContributorContext.tsx`, `ContributorsTab.tsx`, `ContributorWelcome.tsx`) will be removed after all references are updated.

