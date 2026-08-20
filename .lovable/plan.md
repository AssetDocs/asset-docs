# Audit: Inactivity Timeout & Logout Warning

## Verified current state

- The feature is implemented and **is live in production**: the published bundle at getassetsafe.com contains both the activity storage key (`assetsafe.idle.lastActivity`) and the "Need more time" dialog copy.
- `IdleWarningDialog` is mounted once inside the authenticated provider tree in `src/App.tsx` (line 524), so wiring is correct.
- Thresholds in `src/hooks/useIdleLogout.ts`: warn at 27 minutes idle, sign out at 30 minutes. Activity events tracked: `mousedown`, `keydown`, `touchstart`, `scroll`, plus `visibilitychange`.

So the reason no warning appeared is not missing code — it is how idle time is measured. Four defects explain the observed behavior.

## Findings

**1. Returning to a backgrounded tab silently resets the clock (most likely cause).**
`visibilitychange` writes a fresh activity timestamp whenever the tab becomes visible, without first checking how long the user was actually idle. Browsers also throttle or freeze timers in background tabs, so the 1-second evaluation interval may not run at all while the tab is hidden. Net effect: leave the dashboard tab in the background for hours, come back, and the timer restarts from zero with no warning and no sign-out.

**2. A page reload also silently extends the session.**
On mount the hook seeds the activity timestamp to "now" before evaluating anything, so a reload after 45 idle minutes restarts a full 30-minute window instead of signing out.

**3. Programmatic scrolling counts as user activity.**
`window.scrollTo` from the app's scroll-to-top behavior fires a `scroll` event, which the hook treats as real user activity. This inflates freshness on route changes.

**4. Timeout sign-out gives the user no explanation.**
Timeout redirects to `/auth?reason=timeout`, but the sign-in page (`src/pages/AuthLegacy.tsx`) never reads `reason`, so the user lands on a plain sign-in form with no "signed out due to inactivity" notice.

Minor: if `localStorage` is unavailable (private mode / blocked storage), `readLastActivity` returns the current time on every tick, which silently disables the whole feature. And `performLogout` is rebuilt on every `AuthContext` render, so the evaluation interval is torn down and recreated repeatedly — harmless today, but fragile.

## Proposed fixes

1. **Evaluate before reseeding.** In the `visibilitychange` handler and on mount, read the stored timestamp first: if idle already exceeds 30 minutes, sign out immediately; if it is inside the warning window, open the warning; only otherwise write a fresh timestamp.
2. **Do not rely solely on a throttled interval.** Keep the 1-second tick for the countdown, and add the visibility-based evaluation above as the authority for long hidden periods.
3. **Ignore programmatic scroll.** Only count `scroll` when it originates from a real user gesture (trusted event check), or drop `scroll` in favor of `wheel`/`pointerdown`/`keydown`/`touchstart`.
4. **Show the timeout notice.** Read `reason=timeout` on the sign-in page and display an inline message: "You were signed out due to inactivity. Please sign in again."
5. **Hardening.** In-memory fallback timestamp when `localStorage` writes fail, and stabilize `signOut` usage with a ref so the evaluation interval is created once.

Scope: app code only (`src/hooks/useIdleLogout.ts`, `src/pages/AuthLegacy.tsx`, minor touch to `src/components/IdleWarningDialog.tsx` if needed). No database, edge function, or auth config changes.

## Note on thresholds

Current window is 30 minutes idle / 3 minute warning. Say the word if you want it shortened (e.g. 15 / 2) while I am in there.
