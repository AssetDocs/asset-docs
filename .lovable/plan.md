
## Root Cause: Two Conflicting Redirects Fighting Each Other

### Issue 1 — `handleSubmit` vs. the Profile Guard
After `supabase.auth.updateUser({ password })` succeeds and `profiles.password_set` is set to `true`, two things happen simultaneously:

1. `handleSubmit` calls `navigate('/onboarding', { replace: true })`
2. The `AuthContext` `onAuthStateChange` listener fires `USER_UPDATED`, re-fetches the profile, sets `profile.password_set = true`
3. The guard in `CreatePassword` (lines 39-43) sees `password_set === true` and calls `navigate('/account', { replace: true })` — overriding the form's redirect to `/onboarding`

The user ends up on `/account`, not `/onboarding`. But the timing is also inconsistent — sometimes `USER_UPDATED` fires and re-triggers the `loading` spinner, leaving the navigate from `handleSubmit` effectively cancelled.

### Issue 2 — Guard Redirects to Wrong Page
```typescript
// Lines 39-43 in CreatePassword.tsx
useEffect(() => {
  if (!loading && profile?.password_set) {
    navigate('/account', { replace: true }); // ← sends to dashboard, skipping onboarding
  }
}, [loading, profile, navigate]);
```
This guard exists to prevent already-setup users from re-visiting this page — correct intent, wrong destination. A user who just set their password still needs to complete onboarding. It should redirect to `/onboarding` when `password_set` is true AND `onboarding_complete` is false.

## Fixes

### Fix 1: `src/pages/CreatePassword.tsx` — Correct the guard destination
Change the guard from routing to `/account` to checking `onboarding_complete`:
```typescript
useEffect(() => {
  if (!loading && profile?.password_set) {
    if (!profile?.onboarding_complete) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/account', { replace: true });
    }
  }
}, [loading, profile, navigate]);
```
This means both the explicit form redirect AND the guard both point to `/onboarding` for new users — no more conflict.

### Fix 2: `src/pages/CreatePassword.tsx` — Remove redundant explicit navigate
Since the guard now handles routing after `password_set` flips to `true`, we can let the profile update (triggered by `USER_UPDATED`) drive the navigation naturally. The `handleSubmit` should update Supabase and the profile record, then let the guard's `useEffect` handle the redirect — this eliminates the race condition entirely.

Remove `navigate('/onboarding', { replace: true })` from `handleSubmit` and let the `useEffect` guard detect the profile change and redirect.

### Fix 3: Address form — Google Places autocomplete (second issue)
For the property address field in the onboarding/property form, add Google Places autocomplete. The project already has `@googlemaps/js-api-loader` and `@types/google.maps` installed. We need to find the address input in the onboarding flow and wire up the Places Autocomplete API.

## Files to Change

| File | Change |
|---|---|
| `src/pages/CreatePassword.tsx` | Fix guard to route to `/onboarding` when `onboarding_complete` is false; remove the explicit `navigate` from `handleSubmit` to eliminate race condition |
| `src/pages/Onboarding.tsx` | Add Google Places autocomplete to the property address input field |

## Summary of the Redirect Flow After Fix

```text
User sets password → handleSubmit updates Supabase + profile
→ USER_UPDATED fires → AuthContext re-fetches profile
→ profile.password_set = true, onboarding_complete = false
→ CreatePassword guard useEffect fires
→ navigate('/onboarding') ✓
```

Clean, single redirect path, no race condition.
