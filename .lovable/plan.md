

## Rebuild Authorized Users System — From Scratch

This is a full replacement of the contributor system with a simplified accounts + memberships + invites architecture. Given the scope (~58 files reference "contributor", 4 edge functions, 30+ RLS policies), this will be implemented in phases.

### Phase 1: Database Foundation

Create 3 new tables and a new role enum. Keep the old `contributors` table temporarily for backward compatibility during migration.

**New enum**: `membership_role` = `owner | full_access | read_only`

**New tables**:

```text
accounts
├── id (uuid, PK)
├── owner_user_id (uuid, NOT NULL, references auth.users)
└── created_at (timestamptz)

account_memberships
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── user_id (uuid, NOT NULL)
├── role (membership_role)
├── status (text: active | revoked)
├── invited_by (uuid)
├── created_at (timestamptz)
└── accepted_at (timestamptz)

invites
├── id (uuid, PK)
├── account_id (uuid, FK → accounts)
├── email (text, NOT NULL)
├── role (membership_role, NOT full owner)
├── token_hash (text, NOT NULL)
├── expires_at (timestamptz, default now()+7 days)
├── status (text: pending | accepted | expired)
├── invited_by (uuid)
└── created_at (timestamptz)
```

**Trigger**: Auto-create an `accounts` row + `account_memberships(role=owner)` row when a new user signs up (via `handle_new_user` trigger extension).

**RLS on new tables**: Membership-based access. Users see only accounts they belong to.

**New DB function**: `get_user_account_id(_user_id uuid)` — returns the account_id for a user via account_memberships. Used in all RLS policies.

**Add `account_id` column** to all account-scoped tables (properties, items, property_files, legacy_locker, password_catalog, user_documents, etc.) — nullable initially, backfilled from existing user_id → accounts mapping.

### Phase 2: New Edge Functions

**Replace `invite-contributor`** → **`send-invite`**
- Owner enters email + role (full_access or read_only)
- Generate crypto-random token, store SHA-256 hash in `invites`
- Send branded email via Resend with link: `/invite?token=RAW_TOKEN`
- Token expires in 7 days
- One-time use

**Replace `complete-contributor-signup`** → **`accept-invite`**
- Receives raw token, hashes it, matches against `invites`
- Validates: not expired, not already accepted
- Creates `account_memberships` record
- Marks invite as accepted
- Returns account_id for redirect

**Replace `accept-contributor-invitation`** → removed (merged into accept-invite)

### Phase 3: New Context Provider

**Replace `ContributorContext`** → **`AccountContext`**

```typescript
interface AccountContextType {
  accountId: string | null;        // The active account
  accountRole: 'owner' | 'full_access' | 'read_only' | null;
  isOwner: boolean;
  isFullAccess: boolean;
  isReadOnly: boolean;
  canEdit: boolean;                // owner or full_access
  canManageBilling: boolean;       // owner only
  ownerName: string;
  loading: boolean;
  showReadOnlyRestriction: () => void;
}
```

All data queries use `account_id` instead of `user_id` — this eliminates the "effective user ID" problem entirely.

### Phase 4: Invite Landing Page

**New page**: `/invite` (replaces contributor mode in AuthLegacy)
- Validates token via hash
- Shows: "You've been invited to access [Owner]'s Asset Safe account" + role
- If not logged in: shows Sign In / Create Account options
- If invite email matches auth email: treat as pre-verified (no double verification email)
- After auth + acceptance: redirect to `/account` (owner's dashboard)

### Phase 5: UI Updates

**Replace `ContributorsTab`** → **`AuthorizedUsersTab`**
- List members with role badges: "Full Access" / "Read Only"
- Invite form: email + role selector (2 options only)
- Change role, revoke access
- Cannot remove owner

**Update all role labels globally**:
- "Contributor" → removed
- "Viewer" → "Read Only"
- "Admin"/"Administrator" (in shared user context) → "Full Access"
- "Contributors" section → "Authorized Users"

**Update `ViewerRestriction`** → **`ReadOnlyRestriction`**

**Update `AdminContributorPlanInfo`** → **`MemberPlanInfo`**

### Phase 6: RLS Migration

Replace all `has_contributor_access()` calls in RLS policies with new account_id-based checks:

```sql
-- Pattern: user belongs to same account as the row
account_id IN (
  SELECT account_id FROM account_memberships 
  WHERE user_id = auth.uid() AND status = 'active'
)
```

Write-level policies check role:
- `full_access` or `owner` for INSERT/UPDATE
- `owner` only for DELETE on sensitive tables

### Phase 7: Global Text Cleanup

Search-and-replace across all files:
- 58 files referencing "contributor"
- Email templates in edge functions
- FAQ sections, tooltips, helper text
- Onboarding copy
- Error messages

### Phase 8: Legacy Cleanup

- Drop `contributors` table (after data migration)
- Drop `contributor_role` enum
- Drop old `has_contributor_access()` functions
- Remove old edge functions: `invite-contributor`, `complete-contributor-signup`, `accept-contributor-invitation`, `send-contributor-invitation`
- Remove `ContributorContext.tsx`
- Remove contributor mode from `AuthLegacy.tsx`

### What Does NOT Change
- Owner/admin system roles (`user_roles` table for platform admin) — untouched
- Supabase Auth — untouched
- Billing/subscription system — untouched
- Secure Vault — vault access remains restricted (not auto-granted)
- Navigation structure — untouched

### Files Affected (~60+)

| Category | Files |
|----------|-------|
| New migration(s) | 1-2 SQL files |
| New/replaced edge functions | 2 (send-invite, accept-invite) |
| Removed edge functions | 4 |
| New context | AccountContext.tsx (replaces ContributorContext) |
| New page | /invite landing page |
| Replaced component | AuthorizedUsersTab (replaces ContributorsTab) |
| Updated components | ~30 files using useContributor |
| Updated pages | ~10 pages with role checks |
| Text/copy updates | ~20 files with hardcoded strings |
| RLS policy updates | ~15 tables |

### Proposed Implementation Order

Given the size, I recommend implementing in 3-4 sessions:
1. **Session 1**: Database migration (tables, enum, trigger, backfill) + new edge functions
2. **Session 2**: AccountContext + invite landing page + AuthorizedUsersTab
3. **Session 3**: Wire all components to new context + RLS migration
4. **Session 4**: Global text cleanup + legacy removal

