
## Root Cause: Hash Cleared Before Supabase Can Process It

Line 22 is the problem:

```typescript
window.history.replaceState(null, '', window.location.pathname); // ← wipes the hash
handleHashSessionFlow(); // ← then tries to read the session (too late)
```

The Supabase JS client parses `#access_token=...` from `window.location.hash` asynchronously — it fires an `onAuthStateChange(SIGNED_IN)` event when it's done. But we're calling `replaceState` **before** Supabase has processed the hash, effectively destroying the tokens before they can be read. The subsequent `getSession()` polling finds nothing because the tokens were never stored, and the error "Session could not be established" fires.

## The Fix

Replace the polling pattern with `onAuthStateChange`. This is the correct Supabase-recommended pattern for hash fragment flows:

1. **Do NOT clear the hash immediately.** Let Supabase parse it first.
2. **Subscribe to `onAuthStateChange`** and wait for the `SIGNED_IN` event — this fires when Supabase has parsed the hash and stored the session.
3. Once the session is confirmed, clear the hash and route the user.
4. Add a 10-second timeout as a safety net for genuine failures.

```typescript
async function handleHashSessionFlow() {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      // error: session never arrived
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          clearTimeout(timeout);
          subscription.unsubscribe();
          // NOW safe to clear the hash
          window.history.replaceState(null, '', window.location.pathname);
          // route based on profile state
        }
      }
    );
  });
}
```

This is a single-file change to `src/pages/AuthCallback.tsx`.

## Files to Change

| File | Change |
|---|---|
| `src/pages/AuthCallback.tsx` | Replace hash-clear-then-poll with `onAuthStateChange` listener; move `replaceState` to after session is confirmed |

## Why Previous Approach Broke

The previous implementation assumed the Supabase client synchronously processes the hash. It does not — it processes it asynchronously on the next tick. Clearing the hash on line 22 stripped the tokens before Supabase could read them. The 10-retry poll with 200ms intervals found an empty session every time.
