# Temporary Asset Safe Landing Page + Private Owner Access

## Environment findings (your A–J questions, answered before implementing)

**A. Test / Live environments:** Lovable does not provide separate Test and Live
environments with their own databases. There are two views of the same code:
the **editor preview** (`id-preview--6cc71ded-…​.lovable.app`), which requires a
Lovable account with access to this project, and the **published site** (the
custom domains + `assetsafenet.lovable.app`), which serves the last published
snapshot. Publishing is a manual snapshot, so unpublished work stays private in
the preview automatically.

**B. Supabase separation:** None. One external Supabase project
(`leotcbfpqiekgkgumecn`) backs both preview and published. Same database, same
auth users, same storage.

**C. Safest staging architecture:** Use the existing **editor preview URL** as
the private full-application environment. It is protected by Lovable account
authorization (not obscurity), then by the app's own authentication, then by
RLS. A new `staging.getassetsafe.com` would serve the *same* published build off
the *same* database and would add a second public hostname to defend — it buys
nothing and increases exposure. Recommend not creating it.

**D. Owner/admin-only restriction:** Yes, in layers — Lovable project access,
then existing app sign-in, then the existing admin role check
(`get_admin_role` / `useAdminRole`), which is independent of merely being an
authenticated customer. MFA/step-up behaviour is untouched.

**E. Production data in staging:** Yes — unavoidably, because the database is
shared. This is the one requirement that cannot be met as written. Truly
isolated test data would require remixing into a separate project with its own
Supabase, which means re-provisioning Stripe, Resend, domains, and secrets, and
would not be the environment your real customers live in. Recommendation: keep
testing against production with care, and treat "no live customer records"
as out of reach until you decide whether a remix is worth it.

**F. Stripe in staging:** Shared live mode. One `STRIPE_SECRET_KEY` secret
serves all environments; there is no test-mode key. Checkout run from the
preview would create real charges. Avoid live checkout during the rebuild.

**G. Email in staging:** Shared. One `RESEND_API_KEY`, real
`@assetsafe.net` sender — emails triggered from the preview are real emails to
real addresses.

**H. Admin footer link:** Advisable to **omit it**. It cannot point anywhere
useful: the private environment lives on a different hostname, so a link on the
public page would either point at the public `/auth` (re-advertising the sign-in
surface we are trying to quiet) or hardcode the preview URL into public HTML.
Recommendation: bookmark the preview URL instead. No admin link on the landing
page.

**I. DNS / custom domain changes:** None required. The four existing custom
domains keep pointing where they do.

**J. Promotion path:** Build and QA in the editor preview, then click Publish
when approved. Nothing reaches the public domains until you publish.

## Scope decisions I'm proposing (these need your nod via this plan)

1. **Other public marketing pages** (`/about`, `/features`, `/pricing`, `/gift`,
   `/blog`, `/resources`, audience pages, `/sample-dashboard`, …): they render
   the landing page instead, with no redirect. Old links stay HTTP 200, the
   public surface shrinks to one experience, and reverting is one flag.
   `/terms`, `/privacy-policy`, `/cookie-policy`, `/legal` stay live because the
   footer links them and they are legal obligations.
2. **Sign-in on the public site:** unavailable during the rebuild. You reach the
   application through the private preview. Nothing on the landing page links to
   sign-in.
3. **New purchases:** off. Pricing, checkout, and gift purchase are not reachable
   publicly, which also removes the live-Stripe risk noted in (F).

## What gets built

### 1. Public-mode gate (new, small, reversible)
A single module decides whether the visitor is on a public production hostname
or the private preview hostname. On public hostnames the router serves only the
landing page plus the legal pages. On the preview hostname the application
behaves exactly as it does today — no route, guard, RLS policy, or role check is
modified anywhere. Turning the rebuild off later means flipping one constant.

This gate is a presentation decision, not a security control. It is safe because
it only *removes* public surface; every private route keeps the authentication,
admin-role, and RLS protection it has now.

### 2. The landing page
One new page, built from the strongest existing About-page language, using the
existing brand system (brand blue / brand orange, existing logo, generous
whitespace, no locks or shields). Sections:

- **Hero** — "Be prepared for what comes next." plus adapted About-page framing:
  Asset Safe helps homeowners, renters, landlords, families, and businesses
  document and organize property, possessions, improvements, and important
  records. Good documentation isn't only about keeping records — it's about
  being prepared when life doesn't go according to plan.
- **We're strengthening Asset Safe** — understated: an extensive rebuild with
  greater emphasis on security, privacy, reliability, and long-term protection;
  taking the time to build the foundation right. None of the forbidden phrasing.
- **Three values** — Document What Matters / Keep It Organized / Be Prepared,
  reusing the About page's own wording for each.
- **Stay informed.** — email field only, "Keep Me Updated", with "Occasional
  updates only. No spam. Unsubscribe anytime."
- **Closing** — "Your property. Your information. Your story." then
  "Document it. Organize it. Protect it."
- **Footer** — © 2026 Asset Safe · Privacy · Terms. Nothing else.

Reused/adapted from About: the mission paragraphs, the "Document What Matters /
Keep Life Organized / Protect What's Private" trio, and the "Everything you
love. Protected in one place." positioning.

### 3. Email signup
Reuses the existing isolated `lead-capture` function. It records only email,
source, and lifecycle in the CRM `contacts` table plus a signup event — it
creates no auth user, no profile, no membership, no password, no subscription,
and touches no protected account data. A `source` value marks these as
rebuild-list signups so they're separable later. No new tables, no migration, no
change to Resend configuration.

### 4. SEO
Root stays indexable with a self-referencing canonical
`https://getassetsafe.com/`, title `Asset Safe | Document. Organize. Protect.`,
and a description that presents Asset Safe as active. Marketing URLs now serving
the landing page get `noindex` so they don't compete with the root for the same
content. The sitemap is trimmed to the URLs that still have their own content.
No redirects, no chains.

### 5. QA
Verified at 1280px, tablet, and 390px for overflow, spacing, text size, form
usability, and footer. Verified that `/account`, `/admin`, vault, Legacy Locker,
Digital Access, settings, and billing routes are unreachable from the public
hostname and still fully guarded on the preview hostname.

## Explicitly not doing

- No deletion of existing pages, components, routes, or edge functions.
- No change to authentication, authorization, admin roles, or RLS.
- No `staging.getassetsafe.com`, no DNS change, no new Supabase project.
- No admin link on the public page.
- No migration, and no new database infrastructure for the mailing list.

## Technical notes

- New: `src/config/publicMode.ts` (hostname allow-list + `REBUILD_MODE` flag),
  `src/pages/RebuildLanding.tsx`, `src/components/rebuild/UpdateSignupForm.tsx`.
- Edited: `src/App.tsx` (a guarded public-mode `<Routes>` branch placed before
  the existing routes; existing route definitions left intact),
  `public/sitemap.xml`, `public/robots.txt` if needed, `index.html` head text.
- Email validation with zod client-side; the edge function keeps its own
  validation and service-role isolation.
- Reverting: set `REBUILD_MODE` to false and the full site returns unchanged.
