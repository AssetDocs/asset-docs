## Audit of the current Authorized User (AU) invite flow

I traced every step end-to-end. Below is what happens today, what's correct, and the three concrete bugs that were almost certainly producing the broken behavior you saw (the PWA cache likely masked these too — but they're real).

### Step-by-step trace

1. **Owner invites AU** — `AuthorizedUsersTab` → `send-invite` edge function. It validates the owner, creates a row in `invites` (token hashed), and emails a link to `https://www.getassetsafe.com/invite?token=…&email=…`. ✅ Correct.

2. **AU receives email** — Branded Resend email with "Accept Invitation" button pointing at `/invite?token=…&email=…`. ✅ Correct.

3. **AU clicks link → `/invite` (`InviteLanding`)** — If not logged in, shows "Create Account" / "Sign In". "Create Account" routes to `/signup?mode=invite&email=…&redirect=/invite?token=…`. The email field is pre-filled and locked. ✅ Correct.

4. **AU completes signup (`SignupLegacy`)** — On success, because `mode=invite`:
   - Calls `confirm-invite-email` (auto-confirms the auth user's email since the invite token proves mailbox ownership). ✅
   - Calls `signIn(email, password)` to establish a session. ✅
   - Navigates back to `/invite?token=…`. ✅

5. **Back at `/invite` authenticated → `accept-invite`** — Validates token + email, creates `account_memberships` row (role = `full_access` or `read_only`), marks invite `accepted`, refreshes memberships, switches to that account, redirects to `/account` after 2s. ✅

6. **`/account` is wrapped in `ProtectedRoute`** — This is where the flow currently breaks. See bugs below.

7. **`AccountContext`** — Once on `/account`, derives the active account from `account_memberships`. `canEdit = isOwner || isFullAccess`, `isReadOnly` blocks mutations. ✅ Permissions are wired correctly downstream.

---

### 🔴 Bug 1 — New AU is bounced to `/welcome/create-password`

`profiles.password_set` defaults to `false` (migration `20260301162927`). `ProtectedRoute` (App.tsx:307) redirects any user with `password_set !== true` to `/welcome/create-password`. The AU just set a real password during signup, but nothing flips that flag, so they're forced to set it again.

### 🔴 Bug 2 — New AU is then bounced to `/onboarding`

`profiles.onboarding_complete` also defaults to `false`. App.tsx:312 redirects to `/onboarding`. Onboarding is the property/asset wizard meant for owners — an AU who just accepted an invite shouldn't see it at all.

(`complete-contributor-signup` does set both flags, but that's the legacy path. The current `accept-invite` function does not.)

### 🟡 Bug 3 — Stripe `check-subscription` runs unnecessarily for AUs

`AuthContext` fires `check-subscription` on every SIGNED_IN event for every user, including invited AUs who will never have their own Stripe customer. It's not fatal (ProtectedRoute has a membership-based bypass), but it produces a confusing 4xx in the logs and a brief flicker. Skip the call when the user has a non-owner active membership.

---

## What to change (3 fixes)

### Fix 1 — `accept-invite` marks the AU profile as fully provisioned

In `supabase/functions/accept-invite/index.ts`, after the membership insert/reactivate succeeds, update the AU's profile row:

```ts
await supabaseAdmin
  .from('profiles')
  .update({
    password_set: true,        // they set a real password during signup
    onboarding_complete: true, // AUs do not run the owner onboarding wizard
    last_used_account_id: invite.account_id, // land on the inviter's account
  })
  .eq('user_id', user.id);
```

Result: when the AU lands on `/account`, both gates pass and they see the owner's dashboard immediately.

### Fix 2 — `ProtectedRoute` short-circuits the password/onboarding gates for non-owner members

Belt-and-suspenders for the JWT-refresh race window (membership fetched, profile flags not yet refreshed). In `src/App.tsx` `ProtectedRoute`, move the existing `isMemberUser` check above the `password_set` and `onboarding_complete` redirects:

```tsx
// Non-owner members: skip owner-only gates entirely
if (!memberLoading && isMemberUser) {
  return <>{children}</>;
}

if (profile && !profile.password_set) { … }
if (profile && profile.onboarding_complete === false) { … }
```

This guarantees an AU never gets bounced into the owner setup flow even on the first render after the invite is accepted.

### Fix 3 — Skip `check-subscription` for AUs in `AuthContext`

In `src/contexts/AuthContext.tsx` (the SIGNED_IN side-effect block in the profile useEffect), check membership first and only invoke `check-subscription` when the user has no active non-owner membership. Cheap query, no behavior change for owners.

---

## Permissions confirmation (Step 7)

The role mapping is already correct and does not need changes:

| Invite role     | `account_memberships.role` | `canEdit` | `canDelete` | Sees dashboard |
|-----------------|----------------------------|-----------|-------------|----------------|
| Full Access     | `full_access`              | ✅        | ❌          | ✅ owner's     |
| Read Only       | `read_only`                | ❌        | ❌          | ✅ owner's (read) |

`AccountContext` derives `accountId` from the active membership, so `useProperties`, `useFileUpload`, etc. all scope to the owner's `account_id`. Read Only users hit `showReadOnlyRestriction()` on any mutation. Full Access can add/edit/delete content but cannot manage billing or settings (`canManageBilling`, `canAccessSettings` are owner-only). This matches your spec.

---

## Files to change

1. `supabase/functions/accept-invite/index.ts` — add the profile update after successful membership insert.
2. `src/App.tsx` — reorder the `ProtectedRoute` gates so member bypass runs before password/onboarding checks.
3. `src/contexts/AuthContext.tsx` — gate the `check-subscription` invoke on "not a non-owner member".

No DB migration required. No changes to the Stripe webhook, `/account`, or any owner-facing route.

---

## What this should produce after approval

- AU clicks email link → signs up → no second email confirmation → no password re-prompt → no onboarding wizard → lands directly on the owner's `/account` dashboard with the correct role applied.
- Repeat invites to the same email continue to work (existing-membership reactivation path is untouched).
- Owner-side flows (billing, settings, invites, property edits) are unaffected.
