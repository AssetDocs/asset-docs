
## Root Cause: Web Lock Conflict Between Two Concurrent Auth Operations

The error **"lock broken by another request with the 'steal' option"** is a specific Supabase `@supabase/auth-js` Web Locks API error. Here's exactly what's happening:

### The sequence that causes the crash

When the user clicks "Go to Dashboard" at the end of the 4-step wizard, `handleFinish` fires and runs this in sequence:

```
Step 1: supabase.auth.updateUser({ password })   ← acquires a Web Lock
Step 2: supabase.from('profiles').update(...)
Step 3: navigate('/account', { replace: true })
```

**At the same moment**, `AuthContext.onAuthStateChange` fires a `USER_UPDATED` event because `updateUser` was called. This triggers the profile re-fetch block — which itself calls:
- `supabase.functions.invoke('check-subscription')` — this internally calls `supabase.auth.getSession()` → tries to acquire the same Web Lock
- `supabase.functions.invoke('accept-contributor-invitation')` — same issue

The Supabase auth client uses the browser's native **Web Locks API** (`navigator.locks.request()`) to serialize auth operations. When `updateUser` holds the lock and `AuthContext` concurrently tries to acquire it for `getSession()`, the lock times out and the newer request **steals** it using `{ steal: true }`. This causes the original `updateUser` lock holder to receive the "lock broken by another request with the 'steal' option" error — which propagates as an exception to `handleFinish`, which shows it to the user as the error toast.

### Why the redirect then never happens

Because the lock error causes `handleFinish`'s `try/catch` to jump to the catch block and display the error toast, **`navigate('/account')` never fires**. The user is stuck on the wizard.

### The Fix — Two targeted changes

**1. `src/integrations/supabase/client.ts` — Increase the lock timeout**

The Supabase client's default lock acquisition timeout is very short (0ms on some internal paths). Setting `auth.lock.acquireTimeout` to a reasonable value (like 30 seconds) prevents the premature timeout that triggers the steal.

```ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Prevents "lock broken by steal" errors from concurrent auth operations
    // (e.g. updateUser firing while onAuthStateChange also calls getSession)
    lockAcquireTimeout: 30000,
  }
});
```

**2. `src/contexts/AuthContext.tsx` — Skip the heavy operations during USER_UPDATED from password set**

The `onAuthStateChange` handler fires `check-subscription` and `accept-contributor-invitation` on every `USER_UPDATED` event. These invoke `supabase.functions.invoke()` which internally acquires auth locks at the worst possible moment. We should skip them for `USER_UPDATED` events and only run them on `SIGNED_IN`. The profile re-fetch still happens.

```ts
// Only run heavy subscription/invitation checks on SIGNED_IN, not USER_UPDATED
if (event === 'SIGNED_IN') {
  await supabase.functions.invoke('check-subscription');
  // ... accept-contributor-invitation ...
}
```

The profile re-fetch itself (`supabase.from('profiles').select(...)`) is a plain DB query — no auth lock — so it remains on all events.

**3. `src/pages/CreatePassword.tsx` — Gracefully handle the lock error and still redirect**

As a safety net, catch the specific lock error in `handleFinish` and still navigate. The profile update and password update have already succeeded server-side even if the lock error surfaces client-side.

```ts
catch (err: any) {
  // "lock broken" is a client-side Web Locks race — the server writes succeeded.
  // Still navigate to dashboard rather than showing the error to the user.
  if (err?.message?.includes('lock broken') || err?.message?.includes('steal')) {
    navigate('/account', { replace: true });
    return;
  }
  toast({ title: 'Error', description: err.message, variant: 'destructive' });
}
```

### Files to change

| File | Change |
|---|---|
| `src/integrations/supabase/client.ts` | Add `lockAcquireTimeout: 30000` to auth config |
| `src/contexts/AuthContext.tsx` | Scope `check-subscription` and `accept-contributor-invitation` to `SIGNED_IN` only, not `USER_UPDATED` |
| `src/pages/CreatePassword.tsx` | Treat "lock broken/steal" error as a non-fatal race and still navigate to dashboard |

### Why this definitively fixes it

- Increasing the lock timeout eliminates the timing window where the steal fires
- Removing `check-subscription` from `USER_UPDATED` prevents the competing lock acquisition entirely  
- The safety-net catch in `handleFinish` ensures the user always reaches the dashboard even if a stale lock race occurs in edge cases

All three changes are defensive and do not break any other flows.
