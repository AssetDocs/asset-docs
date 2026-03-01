
## Payment-First + Password-Required Onboarding Flow

### What Changes and Why

The current flow creates a Supabase user immediately at checkout and sends a magic link that drops the user directly into `/account`. The new flow **defers full account setup until after email verification**, adds a mandatory **password creation step**, and enforces routing guards so no user can reach the dashboard without completing both steps.

---

### Complete New Flow

```text
/pricing → Stripe Checkout
    ↓
/subscription-success?session_id=xxx
    ↓  (calls finalize-checkout)
finalize-checkout creates user + entitlement + sends magic link to /welcome/create-password
    ↓  (user clicks email link)
/auth/callback (type=magiclink)
    ↓  checks: entitlement active? → redirect to /welcome/create-password
/welcome/create-password  (cannot skip, no nav, no logout)
    ↓  sets password, sets profiles.password_set = true
/onboarding  (collect name, phone, first property)
    ↓  sets profiles.onboarding_complete = true
/account  (dashboard)
```

Returning users: email + password login → routing guard checks → `/account` directly (password_set = true, onboarding_complete = true).

---

### Database Changes

**Migration: add two columns to `profiles`**

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;
```

- Existing users: both columns default to `false`, but the routing guard must **not** redirect existing active users backwards. The guard checks `password_set` only for newly created accounts. To handle this, existing authenticated users with no `password_set` record will have it back-filled to `true` via the migration (since they already have passwords set).

```sql
-- Back-fill existing users: they already have passwords, so mark them done
UPDATE public.profiles SET password_set = true, onboarding_complete = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE created_at < now() - interval '1 hour'
);
```

This prevents all existing users from being forced through the new flow.

---

### Files to Create

#### 1. `src/pages/CreatePassword.tsx` (NEW)
- Route: `/welcome/create-password`
- Public route (no ProtectedRoute wrapper — user is authenticated via magic link but has no password yet)
- UI:
  - Headline: "Secure your account"
  - Subtext: "For security, Asset Safe requires a password in addition to email verification."
  - Fields: Password + Confirm Password (min 8 chars, must match)
  - No navbar, no footer, no navigation links
  - Submit button: "Set My Password"
- On submit:
  - Call `supabase.auth.updateUser({ password })`
  - On success: update `profiles.password_set = true` for the current user
  - Redirect to `/onboarding`
- Guard: if `profiles.password_set = true` already, redirect to `/account`

#### 2. `src/pages/Onboarding.tsx` (NEW)
- Route: `/onboarding`
- Requires authentication (ProtectedRoute variant that skips subscription check but requires `password_set = true`)
- Steps:
  1. Full name (pre-filled from Stripe customer name if available via profile `first_name`/`last_name`)
  2. Optional phone number
  3. First property or workspace: address field using existing `GoogleMapsAutocomplete` component
- Progress indicator (3 steps)
- On complete: update `profiles.onboarding_complete = true`, redirect to `/account`
- Guard: if `onboarding_complete = true` already, redirect to `/account`

---

### Files to Edit

#### 3. `supabase/functions/finalize-checkout/index.ts`
**Key change**: the magic link `redirectTo` must point to `/welcome/create-password`, not `/account`.

```typescript
// BEFORE
redirectTo: `${origin}/account`

// AFTER  
redirectTo: `${origin}/welcome/create-password`
```

Also: when creating the Supabase user, pass the Stripe customer name into `user_metadata` so it pre-fills the onboarding form:
```typescript
const customerName = session.customer_details?.name ?? null;
// pass in createUser call:
user_metadata: { first_name: firstName, last_name: lastName }
```

#### 4. `src/pages/AuthCallback.tsx`
For `type=magiclink`:
- After verifying OTP and getting session, check `profiles.password_set`
- If `password_set = false` → navigate to `/welcome/create-password`
- If `password_set = true` and `onboarding_complete = false` → navigate to `/onboarding`
- If `password_set = true` and `onboarding_complete = true` → navigate to `/account`
- Remove the old `check-subscription` call in the magiclink branch (entitlement is already set by `finalize-checkout`)

For `type=signup` (legacy path — existing users who signed up the old way):
- Keep routing to `/account` (back-filled users will have `password_set = true`)

#### 5. `src/App.tsx` — ProtectedRoute + new routes

**Update `ProtectedRoute` component** to enforce the new routing guard:

```typescript
// After authentication confirmed:
if (profile?.password_set === false) {
  return <Navigate to="/welcome/create-password" replace />;
}
if (profile?.password_set === true && profile?.onboarding_complete === false) {
  return <Navigate to="/onboarding" replace />;
}
// Then check subscription...
```

Note: `ProtectedRoute` already fetches the profile via `AuthContext`. The `password_set`/`onboarding_complete` fields will be available from the profile query once the migration adds the columns.

**Add new routes:**
```tsx
<Route path="/welcome/create-password" element={<CreatePassword />} />
<Route path="/onboarding" element={<Onboarding />} />
```

Both are public-accessible (user is authenticated but has no password set yet, so they can't be behind standard `ProtectedRoute`).

#### 6. `src/contexts/AuthContext.tsx`
Add `password_set` and `onboarding_complete` to the `Profile` interface so `ProtectedRoute` can read them:

```typescript
interface Profile {
  // ... existing fields
  password_set: boolean;
  onboarding_complete: boolean;
}
```

---

### Routing Guard Summary (inside ProtectedRoute)

```
authenticated = false       → show <Auth /> (existing behavior)
password_set = false        → <Navigate to="/welcome/create-password" />
onboarding_complete = false → <Navigate to="/onboarding" />
entitlement inactive        → <Navigate to="/pricing" />
all checks pass             → render children (dashboard)
```

The `/welcome/create-password` and `/onboarding` pages themselves also guard against already-complete users, preventing backward navigation.

---

### Back-Filling Existing Users

The SQL migration will:
1. Add `password_set` and `onboarding_complete` columns (default `false`)
2. Immediately back-fill all users created more than 1 hour ago to `password_set = true, onboarding_complete = true`

This prevents every existing user from being forced through the new setup flow.

---

### Summary Table

| File | Action | Key Change |
|---|---|---|
| DB migration | CREATE | Add `password_set`, `onboarding_complete` to `profiles`; back-fill existing users |
| `src/pages/CreatePassword.tsx` | NEW | Mandatory password setup page, no navigation escape |
| `src/pages/Onboarding.tsx` | NEW | Name/phone/first property collection, 3-step |
| `supabase/functions/finalize-checkout/index.ts` | EDIT | Magic link redirects to `/welcome/create-password`; pass Stripe name into user_metadata |
| `src/pages/AuthCallback.tsx` | EDIT | Magic link → check `password_set` → route correctly |
| `src/contexts/AuthContext.tsx` | EDIT | Add `password_set`, `onboarding_complete` to Profile interface |
| `src/App.tsx` | EDIT | Add new routes; update ProtectedRoute to enforce password + onboarding guards |
