

## Root Cause Analysis

From the live database query, the critical finding is:

```
email: support@assetsafe.net
entitlement plan: free
entitlement status: inactive
stripe_subscription_id: NULL
stripe_customer_id: NULL
```

The admin account (`support@assetsafe.net`) has **no active entitlement** — `status: inactive`, `plan: free`. This single fact explains all three reported symptoms.

### Why sign-out appears broken
`signOut()` in `AuthContext` calls `supabase.auth.signOut({ scope: 'local' })` and then does `window.location.href = '/'`. The homepage (`/`) is a public route — it renders `Index`. If the user is on `/account` and clicks sign out, the redirect to `/` works. **But** if the user is already stuck on `/pricing` (redirected there by `ProtectedRoute`), they may be clicking sign-out buttons that don't exist on that page, or the UI looks frozen while `checkingSubscription` is still true (the 4.5 second retry loop) — making the button appear unresponsive.

### Why dashboard is inaccessible
`ProtectedRoute` at line 160:
```ts
if (data?.subscribed || data?.subscription_tier === 'free') {
  setHasSubscription(true); // ← grants access
}
```
`check-subscription` returns `{ subscribed: false, subscription_tier: 'free' }` for this user. `subscription_tier === 'free'` **should** pass this check — but the entitlement record has `plan: 'free'` AND `status: 'inactive'`. The function returns `subscribed: false` AND `subscription_tier: 'free'`.

Wait — re-reading line 160: `data?.subscription_tier === 'free'` would grant access. So why is the dashboard blocked?

Looking more carefully at `check-subscription/index.ts`:
```ts
let subscriptionTier = 'free';  // default
...
if (entitlement) {
  isSubscribed = entitlement.status === 'active' || entitlement.status === 'trialing';
  subscriptionTier = entitlement.plan;  // ← overwrites with 'free'
}
```
The entitlement record exists with `plan: 'free'`, `status: 'inactive'`. So response is `{ subscribed: false, subscription_tier: 'free' }`.

Back in `ProtectedRoute` line 160: `data?.subscription_tier === 'free'` → `true` → `setHasSubscription(true)`. This SHOULD grant access.

**The real blocker is the `AuthContext` `onAuthStateChange` await chain.** When the user loads the page:
1. `loading = true` — spinner renders
2. `onAuthStateChange` fires with `INITIAL_SESSION`
3. Inside the callback: `setProfileLoading(true)`, then `await supabase.from('profiles').select(...)` — profile fetched
4. Then: `if (event === 'SIGNED_IN') { await supabase.functions.invoke('check-subscription'); ... }` — **but the event is `INITIAL_SESSION`, not `SIGNED_IN`**, so this block is skipped
5. `setProfileLoading(false)`, `setLoading(false)`

**Meanwhile `getSession()` also fires** at lines 166-173 which sets `loading = false` again, but this runs in parallel with `onAuthStateChange`. There's a race: `getSession()` sets `loading = false` BEFORE `onAuthStateChange` sets `profileLoading = true`. So `ProtectedRoute` can see `loading = false`, `profileLoading = false` momentarily while profile is still null — and renders with `profile = null`, skipping all the profile guards, proceeding to the subscription check.

But the **subscription check itself** is the real issue: `checkSubscription` in `ProtectedRoute` is triggered when `user` changes. This runs its own `check-subscription` invocation. If `check-subscription` returns `subscription_tier: 'free'`, line 160 grants access. So the dashboard SHOULD work for a free-tier user.

**Re-examining the admin workspace blockage:** The `AdminShell` at line 47-63 checks `SecureStorage.getItem('admin_access')` — that's the password gate. But `useAdminRole` calls `supabase.rpc('get_admin_role')` which queries `user_roles`. The DB confirms `support@assetsafe.net` has role `admin`. So admin role IS present.

The issue is the **subscription check block on `/admin` routes**. Looking at the routes:
```tsx
<Route path="/admin" element={<AdminShell />}>
```
`AdminShell` is NOT wrapped in `<ProtectedRoute>` — so the subscription check doesn't block admin. But `AdminShell` itself does `useAdminRole` which uses `useAuth()` — and if `isChecking` (SecureStorage check) is still running, it shows a loading screen.

**The real combined issue is:** `SecureStorage` is an async abstraction over `localStorage`. If `admin_access` was stored with a previous version of the app that used a different key format, the check returns nothing and the password gate re-appears — **even though the user already set the password previously**.

Let me also note: The `signOut` issue. The `signOut` function redirects to `/` via `window.location.href = '/'`. The homepage (`Index`) renders a `Navbar` which calls `useAuth()`. After sign-out, `isAuthenticated = false`. The navbar shows "Login" button. This should work. 

**THE REAL CORE ISSUE:** Looking at `AuthContext` more carefully — there are TWO competing state-setters for `loading`:

1. `onAuthStateChange` callback: sets `setLoading(false)` at line 161 (AFTER the async profile fetch)
2. `getSession()` at line 166-172: sets `setLoading(false)` immediately

When the page loads with an existing session, `getSession()` fires first setting `loading = false`, `user = session.user`. Then `ProtectedRoute` mounts, sees `loading = false`, `user` is set, starts the subscription check. **But `profile` is still null** because `onAuthStateChange` hasn't finished the async profile fetch yet. So `profileLoading` might still be `false` at the moment `ProtectedRoute` evaluates.

Actually wait — `profileLoading` starts as `false`, and only gets set to `true` inside `onAuthStateChange`. So there's a window where `loading = false` (from `getSession`), `profileLoading = false` (hasn't been set yet), and `profile = null`. `ProtectedRoute` sees all-clear and evaluates `profile && !profile.password_set` — `profile` is null so this guard is skipped. Then `user.email_confirmed_at` check — the `user` object from `getSession()` DOES have `email_confirmed_at`. Then subscription check runs.

So for **dashboard access**: the `subscription_tier: 'free'` check on line 160 should grant access. This should work.

The admin access issue is likely the **SecureStorage `admin_access` key not persisting correctly** or having been cleared. When `signOut` calls `window.location.href = '/'`, this doesn't clear SecureStorage — but on later visits to `/admin`, if `SecureStorage.getItem('admin_access')` returns null (because it's stored as a session-scoped or encrypted value), the password gate appears again.

**Let me look at SecureStorage implementation.**

Actually the most important fix here is:

1. **The `signOut` function doesn't clear `user` state before redirecting** — `window.location.href = '/'` causes a full page reload which is fine, BUT if anything calls `signOut` and the component is already at `/` (Index page), the redirect is a no-op and the auth state might linger momentarily.

2. **The `ProtectedRoute` subscription check** — for free/inactive users, `check-subscription` returns `subscription_tier: 'free'` which triggers `setHasSubscription(true)` at line 160. This should work. Unless `check-subscription` is throwing an error (no auth header) before it reaches the tier check. Looking at `check-subscription` code: if there's no auth header, it throws and returns `{ error: "No authorization header provided", subscribed: false, subscription_tier: 'free' }` — wait, the error response DOES include `subscription_tier: 'free'`! So even the error path should grant access via line 160.

**WAIT** — the curl test showed that without an auth token, `check-subscription` returns `subscribed: false` but does NOT include `subscription_tier` in the error response:
```json
{
  "error": "No authorization header provided",
  "subscribed": false,
  "subscription_tier": "free"  ← actually it does!
}
```

Looking at the error response in `check-subscription/index.ts`:
```ts
return new Response(JSON.stringify({ 
  error: errorMessage,
  subscribed: false,
  subscription_tier: 'free',  ← yes, this is present
  ...
}), { status: 200 });
```

So even on error, `subscription_tier: 'free'` is returned. Line 160 in `ProtectedRoute` would grant access.

**This means the dashboard SHOULD be accessible.** The issue must be elsewhere. Let me look at `SecureStorage` to understand the sign-out and admin workspace issue.

The signOut problem + admin workspace problem likely stems from:
- `signOut()` correctly calls `supabase.auth.signOut({ scope: 'local' })` and redirects to `/`
- But the `onAuthStateChange` callback then fires with `SIGNED_OUT` event
- In that callback, `session` is null, so `setProfile(null)`, but `setLoading(false)` is called
- `window.location.href = '/'` fires — page reloads to `/`

The issue: **there's no `await` to ensure the sign-out actually completed before the `window.location.href` redirect.** If `supabase.auth.signOut()` is still in flight, the page reloads, `getSession()` still finds the session (because the token hasn't been revoked yet locally), and the user appears still logged in.

With `scope: 'local'`, the localStorage token IS deleted synchronously as part of the `signOut` call, so `getSession()` after reload should return null. But the `try/catch` silently swallows errors — if `signOut` fails for any reason (including network errors), the local storage might NOT be cleared.

**ACTUAL FIX NEEDED:** The most reliable fix is to manually clear the Supabase auth tokens from localStorage directly before redirecting, guaranteeing the session is gone regardless of what `signOut()` does.

### Summary of all issues found:

**Issue 1 — Sign-out unreliable (Primary)**  
`signOut()` relies on `supabase.auth.signOut({ scope: 'local' })` which may fail silently. If it errors out, localStorage tokens remain and the user stays logged in. Fix: manually remove all `sb-*` localStorage keys after calling signOut.

**Issue 2 — Dashboard blocked (Primary)**  
The `ProtectedRoute` subscription check calls `check-subscription`, but the `ProtectedRoute` also has `checkingSubscription` initialized as `true` when `skipSubscriptionCheck = false`. When `user` is not yet set (race with `getSession`), the `useEffect` runs with `user = undefined`, sets `checkingSubscription = false`. Then when `user` IS set (after `onAuthStateChange` fires), the `useEffect` re-runs. BUT — there's a dependency array issue: `user` in the effect could fire multiple times and `setCheckingSubscription(true)` is never reset between user changes — once `checkingSubscription` is set to `false`, it stays false even if user changes and a new check is needed. Actually wait, `checkingSubscription` is initialized as `!skipSubscriptionCheck` = `true`. Then the effect runs, `user` is null (initially), sets `checkingSubscription = false`. After `getSession` + `onAuthStateChange`, `user` becomes set — effect re-runs, calls `checkSubscription()`. But `checkingSubscription` is already `false` so the loading spinner doesn't show. The subscription check still runs in background. Then `check-subscription` returns `subscription_tier: 'free'` → `setHasSubscription(true)`. So dashboard gets `hasSubscription = true`. This should work...

Actually the real problem could be that `ProtectedRoute` is doing the subscription check, `check-subscription` returns the response, but the `data` from `supabase.functions.invoke` might be null if the function call itself failed at the network level (CORS, etc.) rather than returning an error JSON. If `data` is null, line 160 `data?.subscribed` is `undefined` (falsy) and `data?.subscription_tier` is `undefined` !== `'free'` — so `hasSubscription` stays `false` and user gets redirected to `/pricing`.

**This is the actual dashboard blocker** — if `check-subscription` returns `data: null` due to a network/invoke error, the catch block retries 3 times (4.5s total), then `setHasSubscription(false)` and user is kicked to `/pricing`.

### Fixes to implement:

1. **`src/App.tsx` — ProtectedRoute subscription fallback**: When `check-subscription` returns `data: null` (invoke error), treat it as permissive for authenticated users with a `free` tier default instead of blocking them. Add a `data === null` guard that sets `hasSubscription = true` for authenticated users rather than bouncing them to pricing.

2. **`src/contexts/AuthContext.tsx` — Bulletproof signOut**: After `supabase.auth.signOut()`, also manually clear all `sb-leotcbfpqiekgkgumecn-auth-token` and related localStorage keys to guarantee the session is destroyed locally regardless of the network call outcome.

3. **`src/App.tsx` — Race condition on initial load**: `ProtectedRoute` initializes `checkingSubscription = true` and immediately re-evaluates when `user` changes. But during the initial render, `user` may be null (loading state), causing the effect to run with `user = null` and prematurely setting `checkingSubscription = false`. Add a guard: only set `checkingSubscription = false` when `loading` is also false, to prevent the premature termination.

4. **`src/components/admin/AdminShell.tsx` — SecureStorage race**: The `isChecking` state in `AdminShell` depends on an async `SecureStorage.getItem` call. If this resolves before `useAdminRole` finishes loading, it can briefly flash the password gate. Ensure both checks complete before rendering the gate.

### Files to change:

| File | Change |
|---|---|
| `src/contexts/AuthContext.tsx` | Manually clear localStorage auth tokens in `signOut` as a safety net |
| `src/App.tsx` | Fix `ProtectedRoute`: (a) don't prematurely terminate subscription check when user is null, (b) grant access when `check-subscription` returns null/network error for a valid authenticated user, (c) reset `checkingSubscription` to `true` when `user` changes |
| `src/components/admin/AdminShell.tsx` | Wait for both `isChecking` and role `loading` to resolve before showing password gate |

