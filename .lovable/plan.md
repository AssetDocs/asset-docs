
## Two targeted fixes

### Fix 1 — `invite-contributor` edge function: replace `getUserByEmail` with direct REST API

**Root cause:** The logs show exactly: `supabaseAdmin.auth.admin.getUserByEmail is not a function`. This method doesn't exist in `@supabase/supabase-js@2.51.0`. The project's architecture memory (edge-function-robustness-patterns) explicitly documents using direct REST API fetches to Supabase Admin Auth endpoints to bypass SDK version limitations.

**Fix:** Replace the `getUserByEmail` SDK call with a direct `fetch` to the Supabase Admin REST endpoint `/auth/v1/admin/users?email=...&page=1&per_page=1`, using the service role key for authorization. This is the same pattern used in `finalize-checkout`.

```ts
// Replace this:
const { data: existingUserData } = await supabaseAdmin.auth.admin.getUserByEmail(email);

// With this:
const res = await fetch(
  `${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
  { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! } }
);
const adminData = await res.json();
const existingUser = adminData?.users?.[0] ?? null;
```

**File:** `supabase/functions/invite-contributor/index.ts` — one targeted change around line 95.

---

### Fix 2 — "Open Legacy Locker" link in Digital Access (PasswordCatalog)

**Root cause:** `PasswordCatalog.tsx` dispatches `window.dispatchEvent(new CustomEvent('navigate-to-legacy-locker'))` but no component in the app has a `window.addEventListener('navigate-to-legacy-locker', ...)` handler. The event fires and immediately disappears.

**Fix:** Replace the `window.dispatchEvent` approach with `useNavigate` from React Router to navigate to `/account?tab=legacy-locker` directly. This is the same pattern used everywhere else in the app for tab navigation.

```tsx
// Add at top of component
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// Replace the onClick:
onClick={() => navigate('/account?tab=legacy-locker')}
```

**File:** `src/components/PasswordCatalog.tsx` — one targeted change around lines 549–556.

---

### Files to edit
1. `supabase/functions/invite-contributor/index.ts` — fix the user lookup
2. `src/components/PasswordCatalog.tsx` — fix the navigation link
