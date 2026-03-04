
## Root Cause

The guard `useEffect` fires when `profile` changes in React state. But `profile` is only updated by `AuthContext` inside a `setTimeout` deferred callback that also awaits two edge function calls (`check-subscription` and `accept-contributor-invitation`). This means the profile state update can be delayed by several seconds — or in some network conditions, never triggers the `useEffect` re-run because `loading` never toggles.

The current code in `handleSubmit` relies 100% on this async chain to drive the redirect:

```
handleSubmit → updateUser → profileUpdate → (waits for USER_UPDATED event)
→ AuthContext setTimeout → fetches profile → setProfile → guard useEffect fires → navigate
```

Every step is async and involves network calls. One slow step breaks the entire chain silently — the user just sits on the "Setting up your profile..." toast forever.

## The Fix — Single change to `CreatePassword.tsx`

**Restore the direct `navigate` call in `handleSubmit`**, right after the profile update succeeds. This is the correct pattern: once both Supabase auth update and the profile row update have succeeded without error, we know exactly where the user should go — `/onboarding`.

The guard `useEffect` stays exactly as it is — it still serves its purpose of catching users who land on this page after already setting their password (e.g., page refresh, back-navigation).

```typescript
// In handleSubmit — after profile update succeeds:
toast({ title: 'Password set!', description: 'Your account is secured. Setting up your profile...' });
navigate('/onboarding', { replace: true }); // ← add this back
```

There is no conflict because:
- The `USER_UPDATED` event fires AFTER `navigate` has already moved the user to `/onboarding`
- When the guard `useEffect` runs (if it runs at all on the now-unmounted component), React will ignore it
- If a user navigates back to `/welcome/create-password`, the guard correctly redirects them away

## File to Change

| File | Change |
|---|---|
| `src/pages/CreatePassword.tsx` | Add `navigate('/onboarding', { replace: true })` back into `handleSubmit` after the toast, line ~96 |

One line change. Everything else stays the same.
