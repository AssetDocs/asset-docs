# Important Locations — Audit Findings

## What I checked (and what I could not)

Verified by reading code, the published bundle, and the database:

- Routing is wired correctly. `important-locations` is a real tab in `src/pages/Account.tsx`, has a header/subtitle entry, and has a parent ("Back to Knowledge Hub") entry in `src/lib/knowledgeHubNavigation.ts`. The Knowledge Hub card points at the same key.
- The component `src/components/ImportantLocations.tsx` is complete: it renders its own title card, a search/filter card, an empty state, and a card grid. Every constant and icon it uses is defined/imported. No obvious render-time crash in the JSX.
- The published production bundle **does** contain this page's code (strings like "Find Important Locations" and "No important locations added yet" are present), so it is not a stale-deploy problem.
- The table `public.family_important_locations` exists with all columns the component selects, has `GRANT`s for `authenticated`, and has owner + `has_account_access` RLS policies for select/insert/update/delete plus a restrictive policy hiding `pending_delete` rows. It currently holds **0 rows**, so the expected screen is the empty state, not a blank page.

Could not reproduce directly: this project uses an external (BYO) Supabase project, so no authenticated browser session can be minted in the sandbox. Loading `/account?tab=important-locations` headless lands on the sign-in screen. So the crash itself is **not yet observed**.

## Most likely cause (unconfirmed)

The app has **no React error boundary anywhere** (`ErrorBoundary` / `componentDidCatch` appear nowhere in `src/`). That means any runtime error thrown while rendering this tab unmounts the whole tree and produces exactly the symptom reported: a fully blank screen with no message and no toast. Every other candidate I checked (missing table, missing grants, RLS denial, failed fetch, empty data) degrades gracefully to a toast plus empty state — none of them can produce a blank screen.

So the blank screen is almost certainly a thrown error somewhere in this tab's subtree, made invisible by the missing error boundary. It is not a routing, schema, permission, or deploy problem.

## Plan

1. Capture the actual error. Add a scoped error boundary around the account tab content so a crash renders a visible "Something went wrong" panel with the error message and a retry, instead of a white page. This alone turns the blank screen into a diagnosable one and protects every other tab.
2. Ask you to reload `/account?tab=important-locations` once the boundary is in place and report the message shown (or the console error). That message names the real defect.
3. Fix the named defect in `ImportantLocations.tsx` (or in whichever child throws), then re-verify the page renders the empty state and that Add / Edit / Delete still work.
4. Hardening applied while we are in the file, all low risk and independent of the crash:
   - Guard the sort comparators against null `item_name` / missing timestamps so bad data can never throw.
   - Filter `pending_delete` rows client-side too, matching the other Knowledge Hub modules.

## Technical notes

- Files in scope: `src/pages/Account.tsx` (boundary placement), a new small `src/components/AccountTabErrorBoundary.tsx`, and `src/components/ImportantLocations.tsx` (defensive sorting + `pending_delete` filter).
- No migrations. No schema, RLS, or grant changes — those were verified correct.
- No change to Knowledge Hub navigation keys, so existing links, Quick Add (`?add=1`), and dashboard resume routes keep working.
