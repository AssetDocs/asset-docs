## Changes

### 1. Fix labels in the AU "Account Overview" card
File: `src/components/AdminContributorPlanInfo.tsx`
- Plan name: always display **"Asset Safe Plan"** (remove "Standard (Homeowner)" / "Premium (Professional)" branching).
- Header title: change `Account Overview (Admin Access)` → **"Account Overview (Full Access)"**.
- Storage default: change fallback `25` → **`50`** GB (still prefers `subscription_info.storage_quota_gb` when present).

### 2. Move the Account Overview off the shared dashboard into Settings
- `src/pages/Account.tsx` (line 173): remove `<AdminContributorPlanInfo />` from the dashboard render.
- `src/pages/AccountSettings.tsx`: render `<AdminContributorPlanInfo />` inside the AU Settings view only — placed above the Profile tab content when `hasRestrictedAccess && isFullAccess` (so Read-Only AUs and Owners are unaffected). The component already self-gates on `isFullAccess`, so it will no-op for other roles.

### 3. Reflect name changes immediately in the WelcomeBanner
File: `src/components/ProfileTab.tsx`
- Import `refreshProfile` from `useAuth()` (already exposed by `AuthContext`).
- After a successful profile update in `handleSaveProfile`, call `await refreshProfile()` before showing the success toast.

This propagates the new `first_name`/`last_name` into `AuthContext.profile`, which `WelcomeBanner.getDisplayName()` reads, so the greeting updates without a page reload.

## Out of scope
- No backend / RLS / schema changes.
- No changes to subscription tier logic elsewhere (only the AU display card).
- Owner-side dashboard layout untouched.
