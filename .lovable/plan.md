# Temporary Asset Safe Landing Page + Private Owner Access (amended)

## Amendments folded in

- The hostname gate **fails closed**: rebuild/landing mode is the default, and only
  an explicit, narrow allow-list of private preview hostnames renders the full
  application. No pattern rules (`*.lovable.app`, "contains preview", "not
  getassetsafe.com").
- No claim that existing private routes are already appropriately protected.
- No admin link, no public navigation to sign-in, dashboard, account, admin,
  preview, or staging.
- Legal pages stay public; former marketing URLs render the landing experience
  with `noindex`; root stays `index, follow` and self-canonical.
- Underlying pages, routes, and components are preserved, not deleted.

## What the public-mode gate is and is not

It is a **temporary reduction of public attack surface**. It is not a fix for
route authorization. Our ongoing audit has already identified internal/admin
routes needing authentication/authorization remediation; this task neither
changes those guards nor certifies them. Those routes remain open findings and
will be remediated separately. Nothing here should be read as marking any route
security-complete.

## Preview is private frontend code — it is NOT an isolated environment

The editor preview only withholds **unpublished frontend code** from the public.
It runs against the real production Supabase project. Anything that touches the
backend takes effect in production immediately, published or not:

migrations, schema changes, RLS policies, database functions, triggers, storage
policies, Edge Function deployments, secrets, authentication configuration,
destructive data operations, Stripe calls, Resend calls.

Going forward: frontend/UI work uses Editor Preview → owner QA → Publish. Backend,
security, authorization, storage, and Edge Function work does **not** get that
isolation and must be evaluated case by case — apply to the shared project,
stage as an unexecuted migration for review, or stand up a genuinely separate
development Supabase project.

## lead-capture security review — result: DO NOT reuse as-is

What passes:

- Service-role credentials stay server-side inside the Edge Function only.
- `contacts` has RLS enabled with a `SELECT USING (false)` deny policy and no
  client insert policy — the browser cannot read or write CRM contact records
  directly. All writes go through the service role.
- No Auth user, profile, membership, password, or subscription is created.
- No protected customer data is returned — only `{ ok, contact_id }`.
- Duplicates are idempotent via `onConflict: "email"` (no duplicate rows).

What fails, and why it blocks public exposure:

1. **No validation or normalization.** The email is never checked, trimmed, or
   lowercased. Malformed values and oversized strings get stored, and
   `Me@X.com` / `me@x.com` become two separate contacts.
2. **Existing CRM records can be degraded.** The upsert writes `first_name`,
   `last_name`, `phone`, and `company_id` unconditionally. A landing-page
   submission sends only an email, so those fields are `undefined` and can blank
   out real data on an existing contact — including an existing customer.
   This is the most serious finding.
3. **Raw database errors are returned to the client** (`e.message`), leaking
   internal Postgres/schema detail.
4. **No abuse mitigation.** Publicly callable, `verify_jwt = false`, CORS `*`,
   no rate limiting — trivially scriptable to flood the CRM.
5. **`source` is hardcoded `"website"`**, so rebuild signups cannot be tagged.
6. **Excess write surface** — it accepts and upserts company and personal-name
   fields the landing page has no need for.

The function is currently not called from anywhere in the frontend, so none of
this is live today. Fixing it in place would widen its behaviour under an
existing name.

### Recommendation, and the decision it needs from you

Add one new, dedicated, minimal Edge Function — `rebuild-update-signup` — that
does only what this page needs:

- validate and normalize the email server-side (trim, lowercase, length cap,
  format check); reject anything else with a generic 400
- insert the contact with `source: 'rebuild_update_signup'`, and on an existing
  email touch **nothing but** the source/timestamp — never overwrite name,
  phone, or company
- return a generic error message; log detail server-side only
- per-IP rate limiting, matching the existing 5-per-15-minutes pattern used on
  other sensitive endpoints
- CORS restricted to the Asset Safe public origins rather than `*`

`lead-capture` is left completely untouched and remains an open audit item.

**This is the one item that crosses the boundary described above:** deploying an
Edge Function affects production immediately. It writes only to the CRM
`contacts` and `events` tables, requires no migration, no schema change, no RLS
change, no storage change, no auth change, and no new secret. I need your
explicit go-ahead on this piece. If you would rather not deploy anything
backend right now, the alternative is to ship the landing page with the signup
form disabled ("updates list opening shortly") and add it in a later pass.

## What gets built

### 1. Public-mode gate (fail closed)
`src/config/publicMode.ts` holds a `REBUILD_MODE` flag and an explicit
`PRIVATE_PREVIEW_HOSTS` allow-list containing only the editor-preview hostname
for this project (`id-preview--6cc71ded-5ae5-4631-b400-4bb41f9ebfd3.lovable.app`)
and `localhost` / `127.0.0.1` for local development. Everything else — the four
custom domains, `assetsafenet.lovable.app`, and any hostname not on that list,
known or unknown — renders rebuild mode. Exact-match comparison only.

In rebuild mode the router serves the landing page for every path, plus the
legal pages. Existing route definitions stay in the file, unmodified, behind the
gate. Reverting later means setting `REBUILD_MODE` to false.

### 2. The landing page
`src/pages/RebuildLanding.tsx`, using the existing brand system (brand blue and
brand orange, existing logo, generous whitespace; no locks, shields, or matrix
imagery). Header is the logo alone. Sections:

- **Hero** — "Be prepared for what comes next." followed by adapted About-page
  framing: Asset Safe helps homeowners, renters, landlords, families, and
  businesses document and organize property, possessions, improvements, and
  important records. Good documentation isn't only about keeping records — it's
  about being prepared when life doesn't go according to plan.
- **We're strengthening Asset Safe** — understated: an extensive rebuild with
  greater emphasis on security, privacy, reliability, and long-term protection;
  taking the time to build the foundation right. None of the forbidden phrasing.
- **Three values** — Document What Matters / Keep It Organized / Be Prepared,
  each carrying the About page's own wording.
- **Stay informed.** — email field only, "Keep Me Updated", then "Occasional
  updates only. No spam. Unsubscribe anytime."
- **Closing** — "Your property. Your information. Your story." then
  "Document it. Organize it. Protect it."
- **Footer** — © 2026 Asset Safe · Privacy · Terms · Cookie Policy. Nothing else.

Reused from About: the mission paragraphs, the "Document What Matters / Keep
Life Organized / Protect What's Private" trio, and "Everything you love.
Protected in one place."

### 3. SEO
Root: `index, follow`, self-canonical `https://getassetsafe.com/`, title
`Asset Safe | Document. Organize. Protect.`, and a description presenting Asset
Safe as active. Former marketing URLs serving the landing content: `noindex` and
removed from the sitemap. Legal pages keep their own canonicals and stay in the
sitemap. No redirects, no chains.

### 4. QA
1280px, tablet, and 390px — horizontal overflow, text sizes, section spacing,
email field and CTA usability, line breaks, overlap, footer. Plus a check that
`/account`, `/admin`, vault, Legacy Locker, Digital Access, settings, and
billing paths render only the landing page on a public hostname.

## Explicitly not doing

- No database migration, schema change, RLS change, storage-policy change, auth
  configuration change, or new secret.
- No change to authentication, authorization, admin roles, or route guards.
- No deletion of existing pages, components, routes, or Edge Functions.
- No `staging.getassetsafe.com`, no DNS change, no new Supabase project.
- No admin link or any public path into the application.

## Files

- New: `src/config/publicMode.ts`, `src/pages/RebuildLanding.tsx`,
  `src/components/rebuild/UpdateSignupForm.tsx`, and — pending your go-ahead —
  `supabase/functions/rebuild-update-signup/index.ts`.
- Edited: `src/App.tsx` (gated branch added ahead of the existing routes),
  `public/sitemap.xml`, `public/robots.txt`, `index.html` head text.
