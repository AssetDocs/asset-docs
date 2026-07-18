## Verification of commit 38865b0a

Confirmed the four pieces of the interstitial auth-continue flow are present on main:

| Piece | Location | Status |
|---|---|---|
| `/auth/continue` route | `src/App.tsx:385` → `AuthContinue` | Present |
| Interstitial page | `src/pages/AuthContinue.tsx` (calls `mint-magic-link`) | Present |
| Mint edge function | `supabase/functions/mint-magic-link/index.ts` | Present (rate-limited, 24h TTL, Stripe email match) |
| Continue URL emitted on checkout | `supabase/functions/_shared/fulfillment.ts:269` builds `${origin}/auth/continue?session_id=...` | Present — used by `stripe-webhook` + `finalize-checkout` |
| Resend path | `supabase/functions/resend-magic-link/index.ts:107` builds same continue URL | Present |
| Friendly error / resend UI | `src/pages/AuthCallback.tsx` | Present |

## Plan

1. Redeploy the four edge functions from main as source-of-truth: `mint-magic-link`, `stripe-webhook`, `finalize-checkout`, `resend-magic-link` (via `supabase--deploy_edge_functions`).
2. Confirm no config change is needed (`supabase/config.toml` already has `verify_jwt = false` for these public endpoints — will spot-check).
3. Prompt you to publish the frontend so commit 38865b0a's `/auth/continue` route is live on production.
4. After publish, smoke-test:
   - Visit `https://getassetsafe.com/auth/continue` with no `session_id` → should render "Sign-in link unavailable" card (not 404, not blank).
   - Visit `https://getassetsafe.com/auth/continue?session_id=bogus` and click Continue → `mint-magic-link` should return `invalid_link`, UI should show the destructive error message.
   - Optionally tail `mint-magic-link` logs during the test.
5. Only after the two probes above pass, run a real paid checkout end-to-end (email → `/auth/continue` → Continue → `/auth/callback` → `/welcome/create-password`).

No code changes are required — everything is already on main. Approve to switch to build mode so I can redeploy the edge functions and run the two unauthenticated smoke checks.
