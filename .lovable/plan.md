
## Root Cause

**Timing race between DB write and in-memory profile state.**

When `handleFinish` in `CreatePassword.tsx` completes:
1. It writes `onboarding_complete: true` to the `profiles` table in Supabase ✓
2. It immediately calls `navigate('/account', { replace: true })` ✓
3. `ProtectedRoute` renders for `/account` — but `profile` in `AuthContext` memory still has the **old** values (`onboarding_complete: false`) because `AuthContext` only re-fetches the profile when `user.id` changes (the `useEffect` dependency is `[user?.id]`)
4. `ProtectedRoute` line 284 in `App.tsx` sees `password_set === true && onboarding_complete === false` → bounces to `/onboarding`
5. `/onboarding` sees `onboarding_complete` is still `false` (stale) → bounces to `/welcome/create-password`

**Loop confirmed**: User → `/account` → `/onboarding` → `/welcome/create-password`

## The Fix (2 changes, 1 file each)

### Fix 1 — `src/contexts/AuthContext.tsx`
Expose a `refreshProfile` function that forces a re-fetch of the profile from the DB and updates the in-memory `profile` state.

```typescript
const refreshProfile = async () => {
  if (!user) return;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (data) setProfile(data);
};
```

Add `refreshProfile` to the `AuthContextType` interface and the context value.

### Fix 2 — `src/pages/CreatePassword.tsx`
In `handleFinish`, after the DB update succeeds, call `refreshProfile()` **before** navigating. This ensures the in-memory profile has `onboarding_complete: true` before `ProtectedRoute` evaluates it.

```typescript
// After profile update succeeds:
await refreshProfile();
navigate('/account', { replace: true });
```

## Why This Is The Right Fix

- No changes to `ProtectedRoute` logic — it is correct in principle
- No `setTimeout` hacks or polling
- Single source of truth: the DB write is the authority, and we sync memory immediately after
- The `refreshProfile` call is only ~1 extra DB read and only happens once at the end of onboarding

## Files Changed

| File | Change |
|---|---|
| `src/contexts/AuthContext.tsx` | Add `refreshProfile()` function to context |
| `src/pages/CreatePassword.tsx` | Call `await refreshProfile()` before `navigate('/account')` in `handleFinish` |
