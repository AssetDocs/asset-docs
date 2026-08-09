# Inactivity Logout: Findings and Proposal

## Findings — status: NOT IMPLEMENTED

What I checked and found:

- `src/contexts/AuthContext.tsx` has no idle timer, no activity listeners, and no scheduled sign-out. The only `signOut` call is user-initiated (`scope: 'local'`).
- `src/integrations/supabase/client.ts` uses `autoRefreshToken: true` with a persisted session, so the session refreshes indefinitely as long as the tab exists. In practice a logged-in user stays logged in until they explicitly sign out.
- No global activity tracking exists anywhere: no `mousemove`/`keydown`/`visibilitychange`/`lastActivity` handling outside unrelated UI (sidebar hover, CRM table).
- The only "inactivity" timers in the codebase are unrelated features: chatbot follow-up prompt (`src/components/AskAssetSafe.tsx`) and autosave debounce (`src/components/LegacyLocker.tsx`).
- MFA step-up (`src/hooks/useMfaStepUp.ts`, `mfa_step_up_sessions`) expires only the elevated-action window, not the login session.
- The admin launch checklist (`src/components/admin/SecurityChecklist.tsx`) lists "Check session timeout + logout behavior" as an open P1 item — consistent with the feature being absent.

Verdict: needs implementation. Sensitive data (vault, financial, legacy locker) is reachable from a session that never idles out.

## Proposal

Add a single app-wide idle session manager:

- New `src/hooks/useIdleLogout.ts`: tracks activity (pointer, key, scroll, touch, visibility) with a throttled timestamp stored in `localStorage` so multiple tabs share one idle clock.
- Timeouts: 30 minutes idle → sign out; warning dialog at 28 minutes with "Stay signed in" and "Log out now".
- New `src/components/IdleWarningDialog.tsx`: shadcn dialog with countdown, using existing semantic tokens.
- Wire into `AuthContext` (or a small provider inside it) so it only runs when a session exists, and clears on sign-out.
- On timeout: `supabase.auth.signOut({ scope: 'local' })`, then redirect to `/auth?reason=timeout` with a toast "Signed out due to inactivity."
- Optional: log a `user_activity_logs` entry (`session_timeout`) reusing `useActivityLog`.

## Technical notes

- Idle clock in `localStorage` (`as_last_activity`) + `storage` event listener keeps tabs in sync and avoids one background tab logging out an active one.
- Timer must survive laptop sleep: compare `Date.now()` against the stored timestamp on `visibilitychange` and on interval tick rather than relying on a single long `setTimeout`.
- Do not disable `autoRefreshToken`; idle logout is a client-side policy layered on top of it.
- No database or edge-function changes required.
