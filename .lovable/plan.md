# Authorized User Personal Workspace — Soft Onboarding Preview

## Goal
When an Authorized User (AU) without their own paid subscription views their **"Owned by you"** workspace, show a polished invitation-style preview rather than an empty/broken dashboard. Their **shared** workspace access stays fully functional and is the default landing context.

## Scope (strictly limited)
Only these areas change:
1. AU account switcher default selection
2. Unpaid "Owned by you" workspace preview state
3. Soft onboarding modal triggered by personal-workspace actions while in unpaid Owned-by-you context
4. Routing the unpaid AU into the existing `/pricing` → checkout flow as their **current** authenticated user (no re-signup, no new email)

Untouched: main dashboard layout, owner UX, shared workspace UX, pricing page, checkout UI, navigation, owner onboarding, unrelated cards/components.

## Behavior

### Default account on load
In `AccountContext`, when picking the initial active account for a user who has BOTH a shared (non-owner) membership AND an owner membership where the owner workspace has **no active subscription** AND `last_used_account_id` is unset — default to the first **shared** account, not the owner one. Existing `last_used_account_id` always wins.

### Derived flags
Add to `AccountContext`:
- `isViewingOwnWorkspace` = current account role === 'owner'
- `isViewingSharedWorkspace` = role is `full_access` | `read_only`
- `hasPersonalWorkspace` = user has any owner membership
- `ownedWorkspaceId`, `sharedWorkspaceIds`

Combine with existing `useSubscription().isPremium` (or `subscribed`) at consumer sites:
- `canUsePersonalWorkspace` = `isViewingOwnWorkspace && isPremium`
- Preview state triggers when `isViewingOwnWorkspace && !isPremium`.

### "Owned by you" preview (unpaid)
New component `PersonalWorkspacePreview` rendered from `Account.tsx` (or wherever DashboardGrid is rendered) when `isViewingOwnWorkspace && !isPremium`. It reuses existing `DashboardGridCard` styling at slightly reduced opacity (no blur, no lock icons, no "upgrade" language). Cards shown: Asset Documentation, Family Archive, Property Profiles, Emergency Instructions, Secure Vault, Access & Activity — all with placeholder/empty-state copy, NOT shared account data.

Top banner:
- **Header**: "Create Your Own Workspace"
- **Body**: "You can continue using the accounts shared with you anytime. When you're ready, create your own protected workspace to organize your records, properties, photos, emergency instructions, and family information."
- **Primary**: "Start Your Workspace" → navigates to `/pricing`
- **Secondary**: "Return to Shared Account" → calls `switchAccount(firstSharedAccountId)`
- Reassurance line: "Your shared access will not change."

### Card click interception
Each preview card's onClick opens a soft modal `StartWorkspaceDialog` instead of navigating:
- Title: "Start Your Own Workspace"
- Body: "This section helps you organize and protect your own important records, photos, properties, and emergency information. Your shared account access remains available anytime."
- Primary "Start Your Workspace" → `navigate('/pricing')`
- Secondary "Not Now" → close

No interception in shared workspace context. Subscription/billing UI never appears in shared view.

### After subscription activation
No new code needed — the existing handle_new_user already provisioned an owner account/membership at signup. Once Stripe webhook flips entitlement to active, `useSubscription().isPremium` becomes true and the preview is replaced by the normal owner dashboard automatically. **No duplicate workspace is created.**

## Files

**Edit**
- `src/contexts/AccountContext.tsx` — add derived flags (`isViewingOwnWorkspace`, `isViewingSharedWorkspace`, `hasPersonalWorkspace`, `ownedWorkspaceId`, `sharedWorkspaceIds`); update default-account selection to prefer shared when owner workspace is unpaid and no `last_used_account_id`.
- `src/pages/Account.tsx` — when `isViewingOwnWorkspace && !isPremium`, render `<PersonalWorkspacePreview />` in place of `<DashboardGrid />`.

**Create**
- `src/components/personal-workspace/PersonalWorkspacePreview.tsx` — banner + 6 preview cards, uses `StartWorkspaceDialog`.
- `src/components/personal-workspace/StartWorkspaceDialog.tsx` — shadcn Dialog with the soft CTA copy.

## Technical notes
- Subscription check uses existing `useSubscription()` — no new endpoints.
- Default-account logic only changes the *initial* selection when `last_used_account_id` is null AND user has both an unpaid owner workspace and a shared workspace. To know "unpaid" at selection time without an extra query, we approximate by: if user has any non-owner membership, prefer non-owner first; subscription state then flips them back to owner naturally on next visit via `last_used_account_id` once they switch. (Simpler & avoids extra fetch.)
- No DB migration. No edge function changes. No RLS changes.
- No changes to pricing/checkout — Start Your Workspace just calls `navigate('/pricing')` with the existing authenticated user.

## Out of scope
Pricing page, checkout, owner onboarding, owner dashboard, shared workspace UI, navigation, billing exposure rules (already enforced).
