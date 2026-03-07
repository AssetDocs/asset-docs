
## Root Cause: Race Condition After Password Update

### What happens when the user clicks "Set My Password"

1. `handleSubmit` in `CreatePassword.tsx` calls `supabase.auth.updateUser({ password })` (line 86)
2. This triggers a `USER_UPDATED` event in `AuthContext.onAuthStateChange`
3. The auth context immediately runs the profile re-fetch inside a `setTimeout(..., 0)` — but critically, it sets `profileLoading = true` asynchronously
4. Meanwhile, `navigate('/onboarding')` fires **synchronously** at line 97 of `CreatePassword.tsx` — before `profileLoading` has been set to true in the context
5. `Onboarding.tsx` mounts and immediately reads the **stale profile** from context — where `password_set` is still `false` (the DB update hasn't propagated back yet and the profile hasn't been re-fetched)
6. The guard at lines 69–73 of `Onboarding.tsx` sees `password_set = false` and fires `navigate('/welcome/create-password', { replace: true })` — bouncing the user back

The `profileLoading` guard in `Onboarding.tsx` is meant to prevent this, but it only works if `profileLoading` is already `true` when the component mounts. Since the `setTimeout` in AuthContext means `profileLoading` starts as `false`, the onboarding guard fires first.

### The Fix

In `CreatePassword.tsx`, after successfully updating the password and the profile:

**Instead of immediately navigating**, wait for the `AuthContext` profile state to reflect `password_set: true` before calling `navigate`. We do this by:

1. Setting a local `passwordJustSet` flag after a successful submit
2. Adding a `useEffect` that watches `profile?.password_set` — when it becomes `true`, **then** navigate to `/onboarding`
3. While waiting, keep showing the "Setting password..." spinner so the user has no jarring flash

This eliminates the race: we don't navigate until the context's profile has actually been updated to `password_set: true`, so the Onboarding guard will not bounce back.

---

### Changes — `src/pages/CreatePassword.tsx`

**1.** Add `passwordJustSet` state (boolean, starts false)  
**2.** In `handleSubmit`: after the successful DB update, set `passwordJustSet = true` — **remove the `navigate` call** from here  
**3.** Add a `useEffect` watching `[passwordJustSet, profile, loading, profileLoading]`:
```ts
useEffect(() => {
  if (passwordJustSet && !loading && !profileLoading && profile?.password_set) {
    navigate('/onboarding', { replace: true });
  }
}, [passwordJustSet, loading, profileLoading, profile, navigate]);
```
**4.** Keep the existing guard `useEffect` (lines 39–47) unchanged — it stays for when a user lands here with a pre-set password

Single file, ~5 line changes.
