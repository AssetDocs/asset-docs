
## Root Cause Diagnosis

When a user returns to the browser tab, the browser fires a `visibilitychange` (or the token refresh timer fires) which causes Supabase to emit a `TOKEN_REFRESHED` event via `onAuthStateChange`. The current code treats **every** `SIGNED_IN` or refresh event as a fresh login. Here's the specific chain:

1. User leaves the tab → browser may freeze JS, the Supabase token refresh timer queues up
2. User returns → browser resumes JS → Supabase refreshes the access token → fires `SIGNED_IN` event (Supabase uses `SIGNED_IN` for token refreshes too, not a dedicated event in older versions, though newer SDK fires `TOKEN_REFRESHED`)
3. `onAuthStateChange` receives `SIGNED_IN` → sets `lastSignedInTokenRef.current = session.access_token` (new token)
4. Profile `useEffect` runs because the ref changed → `fetchProfile()` runs → invokes `check-subscription` and `accept-contributor-invitation`
5. **Most critically**: `ProtectedRoute` receives the new `user` object reference (React re-renders) → its `useEffect([user, ...])` re-runs → `checkingSubscription` goes back to `true` → the full-page spinner re-appears while subscription is re-verified → user sees a "loading" screen and loses scroll position

The "refresh knocking them out of where they were" is the `ProtectedRoute` spinning for 1–4.5 seconds (with retries) on every token refresh.

**Secondary issue**: The `SubscriptionContext.useEffect([user])` also re-runs on token refresh because `user` object reference changes even though the user ID is identical, triggering another `check-subscription` call.

---

## The Fix — Three Changes

### Fix 1 — `ProtectedRoute` in `App.tsx`
**The key change**: Track whether the subscription has *ever* been confirmed for the current user ID. If `hasSubscription` is already `true` and the user ID hasn't changed, don't re-run the subscription check and don't show the spinner. Use a `hasCheckedRef` per user ID.

```tsx
// Before: useEffect deps = [user, skipSubscriptionCheck, loading, isAdminUser]
// Every time 'user' object reference changes (token refresh) → spinner reappears

// After: only re-run the subscription check when the user *ID* changes, not the user object reference
useEffect(() => { ... }, [user?.id, skipSubscriptionCheck, loading, isAdminUser]);
//                ↑ user?.id instead of user
```

Also initialize `hasSubscription` from a ref so it survives token refreshes within the same user session:

```tsx
const checkedUserIdRef = useRef<string | null>(null);

// At the start of the useEffect:
if (user?.id && checkedUserIdRef.current === user.id && hasSubscription) {
  // Already verified for this user — don't spin again
  setCheckingSubscription(false);
  return;
}
```

### Fix 2 — `AuthContext.tsx` — distinguish `TOKEN_REFRESHED` from fresh `SIGNED_IN`
The Supabase JS SDK v2 does fire `TOKEN_REFRESHED` as a distinct event. Currently the code sets `lastSignedInTokenRef.current` on any `SIGNED_IN` event, which causes the profile effect to re-fire side-effects (check-subscription, contributor invitation check, security alert). Change the condition to only set the ref on true `SIGNED_IN` and ignore `TOKEN_REFRESHED`:

```tsx
// Only set for genuine new logins, not token refreshes
if (event === 'SIGNED_IN' && session?.access_token) {
  lastSignedInTokenRef.current = session.access_token;
}
// TOKEN_REFRESHED: update session/user state only, no side-effects
```

This is already mostly correct, but the `user` state is being set to a *new object reference* on token refresh (same ID, new JWT), which causes `useEffect([user?.id])` to NOT re-fire — but `useEffect([user])` (without `.id`) DOES re-fire. Fix 1 addresses that at the ProtectedRoute level.

### Fix 3 — `SubscriptionContext.tsx`
Change the `useEffect` dependency from `[user]` to `[user?.id]` so a token refresh (new `user` object, same `user.id`) doesn't trigger another `check-subscription` call:

```tsx
// Before
useEffect(() => { checkSubscription(); }, [user]);

// After  
useEffect(() => { checkSubscription(); }, [user?.id]);
```

---

## Files to Edit

| File | Line(s) | Change |
|------|---------|--------|
| `src/App.tsx` | ~135–258 | Change `useEffect` dep from `user` → `user?.id`; add `checkedUserIdRef` guard to skip re-checking if subscription already confirmed |
| `src/contexts/SubscriptionContext.tsx` | ~120–122 | Change `useEffect` dep from `[user]` → `[user?.id]` |

No changes needed to `AuthContext.tsx` — its `useEffect` already uses `[user?.id]` correctly. The two fixes above are sufficient to stop the tab-switch reload behavior.

```text
Before fix:
  Tab switch → token refresh → new user object → useEffect([user]) fires
  → checkingSubscription = true → full spinner shown → user loses place

After fix:
  Tab switch → token refresh → new user object → useEffect([user?.id]) fires
  → user.id unchanged → checkedUserIdRef guard short-circuits
  → checkingSubscription stays false → no spinner → user stays put
```
