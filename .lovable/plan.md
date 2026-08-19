# Audit: Inactivity Timeout & Logout Warning

## Findings (current state)

- There is **no inactivity/idle logout feature** in the app. No idle hook exists in `src/hooks/`, and no idle/inactivity timer or warning dialog appears anywhere in `src/`.
- The only timeout-related security behavior is in `src/lib/vaultKey.ts`: in-memory vault encryption keys are cleared after the tab has been hidden for 10 minutes. This does not sign the user out and shows no warning.
- Auth sessions currently persist and auto-refresh via Supabase, so an idle tab stays signed in indefinitely.
- The admin Security Checklist lists "Auto logout or token expiration works correctly" as a criterion, but nothing implements it.

Conclusion: the timeout/logout feature was never completed — nothing to fix, it needs to be built.

## Proposed implementation

**1. Idle tracking hook** — `src/hooks/useIdleTimeout.ts`
- Listens for user activity: `mousedown`, `keydown`, `touchstart`, `scroll`, `visibilitychange`.
- Tracks last-activity timestamp in a ref; a single interval checks elapsed time (no per-event timer churn).
- Two thresholds: warn at 27 minutes idle, sign out at 30 minutes (both constants, easy to tune).
- Cross-tab sync via a `localStorage` activity key so activity in one tab keeps all tabs alive.
- Only active when a user is signed in.

**2. Warning dialog** — `src/components/IdleWarningDialog.tsx`
- Uses the existing shadcn `Dialog`, matching current dashboard styling and tokens (no hardcoded colors).
- Copy: heading "Need more time?", body "For your security, you'll be signed out in 3:00 due to inactivity." with a live countdown.
- Buttons: "Stay signed in" (resets the timer) and "Sign out now".
- Not dismissible by clicking outside, so it can't be missed.

**3. Wiring** — mounted inside the authenticated shell (alongside the existing providers in `src/App.tsx` under `AuthProvider`), so it covers all signed-in routes and never appears on public marketing pages.

**4. Sign-out path** — reuses `signOut` from `AuthContext` (which already does the hard-reload cleanup) and clears vault keys via the existing `clearAllVaultKeys` helper. No new auth logic.

## Notes

- Warning lead time and total idle window are single constants; tell me if you prefer different values (e.g. 15 min idle / 2 min warning).
- No database, edge function, or Supabase config changes are needed.
