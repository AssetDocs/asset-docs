# Asset Safe SEO — Phase 1 Foundation Implementation Spec

Audit only. Nothing was changed. Every current-state claim below was verified against the live site, the running build, or source in this turn.

---

## A. Confirmed Current Raw-Metadata Problem

### Verified: raw HTML is identical on every route

`curl` against production for `/`, `/features`, `/pricing`, `/about`, `/legacy-locker-info`, `/claims` returns byte-identical head metadata on all six:

| Tag | Raw HTML value (all six routes) |
|---|---|
| `<title>` | `Asset Safe` |
| description | "Your assets, important information, records, and memories — organized, protected, and ready when you need them." |
| canonical | `https://getassetsafe.com/` |
| robots | `index, follow` |
| og:title | `Get Asset Safe` |
| og:url | `https://getassetsafe.com/` |
| og:image | shared social card |
| twitter:title | `Get Asset Safe` |

**Cause (confirmed, not inferred):** `vite.config.ts` contains only `@vitejs/plugin-react-swc` and `lovable-tagger`. `package.json` build script is a bare `vite build`. There is no prerender plugin, no SSR, no post-build HTML step. `public/_redirects` line 5 is `/*  /index.html  200`, so every URL is served the same static `index.html`. All per-page metadata comes from `react-helmet-async` inside `SEOHead.tsx`, which runs only after hydration.

### Newly discovered and more serious: duplicate, conflicting head tags

Playwright inspection of the running app shows Helmet does **not** replace the static tags in `index.html` — it **appends alongside them**. Post-JavaScript, every non-homepage route ends up with two of each:

`/claims` after hydration:
```
canonical:   ["https://getassetsafe.com/",  "https://getassetsafe.com/claims"]
description: ["Your assets, important information…",  "Learn how organized photos…"]
robots:      ["index, follow", "index, follow"]
og:title:    ["Get Asset Safe", "Claims Documentation | Asset Safe"]
og:url:      ["https://getassetsafe.com/", "https://getassetsafe.com/claims"]
```

Confirmed identically on `/features`, `/pricing`, `/about`, `/legacy-locker-info`, `/account-assistance`, `/video-help`, `/features-list`.

This matters more than the raw-HTML delay:

- **Two `<link rel="canonical">` elements per page, one pointing at the homepage.** Google's documented behavior when a page declares conflicting canonicals is to ignore both and pick its own. Every per-page canonical on the site is therefore currently unreliable — even for a JS-rendering crawler.
- **Two `<meta name="description">`** — the homepage one appears first in the DOM.
- **Two `<meta name="robots">`.** Today both say `index, follow`, so it is harmless. **The moment Phase 1 sets `noIndex` on `/account-assistance`, `/video-help`, or `/features-list`, those pages will emit `index, follow` *and* `noindex, nofollow` simultaneously.** Google resolves conflicts to the most restrictive directive, so noindex should still win — but shipping deliberately contradictory directives is not an acceptable foundation.

**Conclusion:** the static `index.html` head is not a harmless fallback. It is actively corrupting per-page canonicals right now, and it will corrupt the Phase 1 noindex work. Removing the conflicting static tags is a prerequisite for items 6, 7, and 8 of this phase, not an optional extra.

### Correction to the previous audit

The earlier report stated `/pricing` has no H1. **That was wrong.** `/pricing` renders `<h1>One Simple Plan. Everything Included.</h1>` from `src/components/PricingHero.tsx:8`; the previous grep only searched `Pricing.tsx`. Verified live in the DOM. Section H below is revised accordingly. `/partnership` genuinely has no H1 (first heading is an H3) — that finding stands.

---

## B. Recommended Technical Solution

**Two changes, in this order.**

### B1 (required, near-zero risk): de-conflict the static head

In `index.html`, remove the four tags that Helmet duplicates and that are only ever correct for the homepage:

- `<link rel="canonical" href="https://getassetsafe.com/">` — delete. Every route already sets its own via `SEOHead`.
- `<meta name="description">` — delete. Every route sets its own.
- `<meta name="robots" content="index, follow">` — delete. `index, follow` is the crawler default anyway, so removing it changes nothing for indexable pages and unblocks clean noindex on the three utility routes.
- `<meta name="keywords">` — delete. Ignored by every major engine; it is also where stale positioning currently lives.

**Keep** in `index.html`: `<title>Asset Safe</title>`, all `og:*` and `twitter:*` tags, `og:image`, charset, viewport, theme-color, icons, preconnects. These stay as the non-JS fallback for social crawlers, which never execute JS. This follows the standard Helmet adoption pattern: `<meta>` tags dedupe by name/property for JS crawlers, `<link>` tags do not — which is exactly why the canonical must be removed and the og tags can stay.

This single change makes every per-page canonical authoritative for Googlebot, makes noindex unambiguous, and touches no routing, build, or hosting behavior. It is the highest value-to-risk change in Phase 1.

### B2 (recommended, needs one verification): build-time HTML emission for public marketing routes

A post-build Node script that, for each public marketing route, writes `dist/<route>/index.html` — a copy of the built `index.html` with `<title>`, description, canonical, `og:*`, and `twitter:*` substituted from a shared route-metadata manifest.

Design constraints that keep this safe:

- **No headless browser.** Not `react-snap` or `puppeteer`-based prerendering — those boot the full app per route, would execute `AuthContext` and Supabase clients at build time, and are slow and brittle. This script does string substitution on a template only.
- **No SSR, no runtime server.** Output is plain static files.
- **Explicit allow-list.** The script iterates a hardcoded array of public routes. Private routes are never enumerated, so authenticated content cannot leak.
- **Single source of truth.** The manifest (`src/data/seoRoutes.ts`) is imported by both the build script and, ideally, by the page components, so runtime Helmet output and build-time HTML cannot drift apart.
- **Head content only.** No page body is prerendered, so there is no hydration-mismatch risk and the SPA behaves exactly as today.

**Verification required before committing to B2:** whether Lovable's hosting serves `dist/features/index.html` for a request to `/features`, or whether the `/*  /index.html  200` rule in `public/_redirects` short-circuits first. On Netlify-style hosting, static files take precedence over redirect rules, which is the behavior this design relies on. **This must be confirmed on a preview deploy before B2 is implemented.** If it does not hold, B2 is not viable and B1 alone is the Phase 1 outcome.

### Fallback if B2 cannot be verified

Ship B1 only. Googlebot renders JavaScript and will read the (now unambiguous) Helmet metadata. The residual cost is per-page social previews: Slack, LinkedIn, iMessage, and X do not run JS and will keep showing the homepage card for every shared link. That is a real but contained cost, and it does not affect organic ranking.

---

## C. Why This Is Preferable to SSR or Alternatives

| Approach | Complexity | SPA routing impact | Auth routes affected | Social previews fixed | Canonical reliable | Verdict |
|---|---|---|---|---|---|---|
| **B1: de-conflict static head** | Trivial (delete 4 lines) | None | None | No (unchanged) | **Yes, for JS crawlers** | **Do it — required** |
| **B2: post-build head emission** | Low (~80-line script, one manifest) | None | None — allow-list only | Yes, for listed routes | Yes, in raw HTML too | **Recommended, pending hosting check** |
| `react-snap` / puppeteer prerender | Medium-high | Hydration mismatch risk | Would boot auth context at build | Yes | Yes | Rejected — heavy, brittle, boots app code at build |
| `vite-react-ssg` | High | Requires route-config refactor | Would need every route SSG-safe | Yes | Yes | Rejected — restructures routing the app already depends on |
| Migrate to SSR (TanStack Start) | Very high | Full rearchitecture | Entire authenticated app | Yes | Yes | Rejected for Phase 1 per decision #4 |
| Cloudflare/edge worker head injection | Medium | None | None | Yes | Yes | Rejected — adds hosting infrastructure Lovable does not manage here |

B1+B2 achieves the stated preferred outcome — correct initial metadata on public marketing routes, authenticated app architecturally untouched — with the smallest possible surface area. Neither change alters a single line of routing, auth, Supabase, Stripe, or vault code.

If per-page social previews later become a hard requirement and B2's hosting assumption fails, the app could get real SSR by upgrading to Lovable's latest template — typing "/" in chat and choosing "Migrate to TanStack Start" ([what the upgrade gives you](https://lovable.dev/blog/building-apps-using-tanstack-start)). Explicitly out of scope for Phase 1.

---

## D. Exact Public Routes Affected

### D1 — Indexable marketing routes (participate in B2, stay in sitemap): 30

`/` · `/features` · `/pricing` · `/about` · `/contact` · `/scenarios` · `/claims` · `/legacy-locker-info` · `/gift` · `/resources` · `/qa` · `/glossary` · `/testimonials` · `/blog` · `/asset-documentation` · `/photography-guide` · `/awareness-guide` · `/industry-requirements` · `/state-requirements` · `/press-news` · `/social-impact` · `/sample-dashboard` · `/partnership` · `/terms` · `/legal` · `/cookie-policy`

Plus the 10 blog posts (see F).

### D2 — Public but noindex utility routes (stay reachable, removed from sitemap, **not** prerendered)

`/account-assistance` · `/video-help` · `/features-list` · `/install` · `/redeem` · `/gift-checkout` · `/gift-claim` · `/gift-success`

### D3 — Private / authenticated (never touched, never enumerated by the build script)

All `/account/*`, `/admin/*`, `/auth/*`, `/damage/*`, `/welcome/*`, plus `/onboarding`, `/inventory`, `/invite`, `/signup`, `/subscription-checkout`, `/subscription-success`, `/complete-pricing`, `/feedback`, `/checklists`, `/schedule-professional`, `/delegate-vault`, `/acknowledge-access`, `/continuity/dispute`, `/dev-invite`, `/test-email`, `/crm`.

These are already protected by two independent mechanisms, both verified: `RouteMeta` in `App.tsx:141` defaults `noIndex = true`, and `public/robots.txt` disallows the paths. No Phase 1 change touches them.

---

## E. Routes to Noindex

| Route | Current state (verified) | Action | Sitemap |
|---|---|---|---|
| `/account-assistance` | Indexable. `AccountAssistance.tsx:182-185` sets no `noIndex`; only the post-submit success state at line 156 does. In sitemap line 50. | Add `noIndex` to the main form view | **Remove** |
| `/video-help` | Indexable, `VideoHelp.tsx:131-136`. Page body is "Coming Soon". In sitemap line 27. | Add `noIndex` | **Remove** |
| `/features-list` | Deliberately indexable via `noIndex={false}` at `App.tsx:378`. In sitemap line 6. | Change to `noIndex={true}` (or drop the prop — `RouteMeta` already defaults to `true`) | **Remove** |

Implementation is straightforward because both `SEOHead` and `RouteMeta` already support it. `SEOHead.tsx:48` emits `noindex, nofollow` when `noIndex` is true.

**Critical dependency:** these three must ship **after** B1. Until the static `<meta name="robots" content="index, follow">` is removed from `index.html`, each of these pages would emit both directives at once.

**robots.txt interaction — verified safe.** None of these three paths is currently disallowed in `public/robots.txt`, so Googlebot can still crawl them and observe the noindex. **Do not add `Disallow` lines for them** — that would prevent Google from ever seeing the directive, and pages already in the index would linger. Cross-checked the existing disallow list: `/checklists`, `/feedback`, `/schedule-professional`, `/continuity/dispute` are disallowed *and* RouteMeta-noindexed, which is consistent and needs no change since they were never indexable.

---

## F. Sitemap Changes Required

Current file: 34 `<loc>` entries, all returning 200.

**Remove (3)** — becoming noindex: `/features-list`, `/video-help`, `/account-assistance`.

**Add (6)** — public, indexable, currently missing:

| Missing URL | Evidence |
|---|---|
| `/blog/estate-planning-digital-vault` | `Blog.tsx:65`, live 200 |
| `/blog/insurance-claims-documentation` | `Blog.tsx:74`, live 200 |
| `/blog/organizing-receipts-warranties` | `Blog.tsx:83`, live 200 |
| `/blog/protecting-high-value-items` | `Blog.tsx:92`, live 200 |
| `/blog/disaster-preparedness-checklist` | `Blog.tsx:101`, live 200 |
| `/press-news/digital-documentation-guide` | routed in `App.tsx`, public |

Ten blog posts exist and are all linked from `/blog`; only five are in the sitemap. Half the blog is currently undiscoverable via sitemap.

**`lastmod` — 29 of 34 entries share `2026-07-12`.** A uniform date across nearly every URL is not derived from any page-specific signal and should not be treated as authoritative.

Recommended handling:
- **Blog posts:** replace with each post's real `date` field from `Blog.tsx` (`2024-12-15` through `2026-02-01`). These are genuine, page-specific publish dates. The five already-listed posts happen to carry correct dates; the five new ones should use theirs.
- **All other pages:** the `2026-07-12` value has no identifiable source and cannot be verified as a real modification date. **Omit `<lastmod>` on those entries** rather than carrying forward or inventing a date. An absent `lastmod` is treated as unknown; a wrong one erodes crawler trust.
- **Do not** generate `lastmod` from build time or the current date — that produces a fresh timestamp on every deploy for pages that did not change.

**Route/canonical mismatch check:** none found. Every sitemap URL uses `https://getassetsafe.com`, matching the canonical host. `assetsafe.net` 301s to `getassetsafe.com` (verified live). `public/_redirects` correctly 301s the retired `/subscription-agreement` → `/terms`.

---

## G. Homepage Title / Description Candidates

**Hero unchanged.** `HeroSection.tsx:16-18` stays exactly as-is.

Current state (verified in DOM):
- Browser title: `Asset Safe` (from `browserTitle` at `Index.tsx:49`)
- SEO/OG title: `Asset Safe | Protect What Matters`, social title `Get Asset Safe`
- H1: "Everything you love. / Protected in one place."
- Canonical: correct (`/`), though currently duplicated per section A
- Schema: Organization, WebApplication, FAQPage, VideoObject

The `browserTitle="Asset Safe"` override is the specific problem: it replaces the SERP title with ten characters of brand and no category signal.

**Recommended search intent for the homepage:** broad category ownership around documenting and organizing property, belongings, records, and important information — plus brand. It should *not* chase home inventory, insurance claims, estate planning, or Secure Vault; those are deeper pages.

### Title candidates (for product-owner selection)

1. `Asset Safe | Document & Organize Your Property, Belongings and Records` (70 chars — slightly over the 60-char comfort range, may truncate)
2. `Asset Safe — Document Your Property, Belongings & Records` (57 chars) ✅ recommended
3. `Document & Protect Your Property and Records | Asset Safe` (57 chars — keyword-first, brand-last)

### Description candidates

1. "Keep your property, belongings, records, and important information documented and organized in one secure place — ready whenever you need them." (143)
2. "Document your home, belongings, and important records in one place. Photos, receipts, property details, and the information your family may need." (145)
3. "One system to document and organize what you own and what matters — property details, belongings, records, and important household information." (143)

Notes: option 2 in each set uses natural search language without conflicting with the hero. Recommend removing the `browserTitle` override so the SEO title is what appears in the SERP, and keeping `socialTitle="Get Asset Safe"` for social cards.

---

## H. Pricing H1 + Metadata Recommendation

**Revised finding:** `/pricing` **does** have an H1 — `<h1>One Simple Plan. Everything Included.</h1>` at `src/components/PricingHero.tsx:8`, verified in the live DOM. The prior audit's "no H1" claim was a false positive.

The remaining, smaller issues:

1. The H1 carries no topical keyword — it is a value statement. Heading hierarchy is otherwise correct (H1 → H2 "Choose Your Plan" at `Pricing.tsx:227` → H3s).
2. Title `Asset Safe Plan` is brand-only, has no pricing intent, and is 15 characters.
3. Description is serviceable but leads with product-internal language.

**Recommendations (direction only, no copy committed):**

- **H1:** keep the "one plan" value framing but add the category noun — something along the lines of "One Simple Plan for Documenting Everything You Own." Optional and lower priority than the title; the current H1 is not broken.
- **Title direction:** pair the term "pricing" with the category. e.g. `Asset Safe Pricing — One Plan, 25 GB Secure Storage Included` (60 chars). Must match whatever storage figure is canonical at implementation time; do not hardcode a number that could drift from `subscriptionFeatures.ts`.
- **Description direction:** state the plan shape and what is included, in searcher language, without repeating the title.

**Hard constraint:** copy and metadata only. No changes to `SubscriptionPlan.tsx` logic, `featureGroups`, Stripe, checkout, storage quotas, email capture, or subscription behavior.

---

## I. Legacy Locker Metadata Recommendation

Current (`LegacyLockerInfo.tsx:59-64`):
- Title: `Legacy Locker | Asset Safe` — proprietary name only; matches essentially no real query
- H1: `Legacy Locker`, subtitle "Your Secure Digital Vault"
- Keywords include **`password storage`**, **`estate planning vault`**, `digital estate vault`, `trusted contacts`

**Flag for removal from keyword targeting:**
- `password storage` — implies a credential manager. Directly contradicts the product boundary and the Secure Vault "What It's Not" wording.
- `estate planning vault` and `digital estate vault` — imply professional estate planning.
- The whole `keywords` attribute is removable anyway per B1's reasoning (search engines ignore it), which resolves this cleanly rather than by rewording.

**Recommended direction:** pair the proprietary name with a searchable concept in the title, keeping every current boundary (not a will, not an estate plan, not legal advice, not credential storage).

- Title direction: `Legacy Locker — Organize Important Instructions & Digital Legacy Information | Asset Safe` is too long; something in the shape of `Legacy Locker — Digital Legacy & Important Instructions | Asset Safe` (~66) or drop the brand suffix to fit.
- Description direction: describe organizing important access details, instructions, and household continuity information for people you trust — explicitly framed as a companion to, not a substitute for, formal planning.
- The existing subtitle "Your Secure Digital Vault" is fine and needs no change.

The searchable concept has verified demand: "digital estate planning" 590/mo, "digital legacy" 390/mo, "digital legacy planning" 90/mo at difficulty 20 (easy). "Legacy Locker" alone has none.

---

## J. Internal-Link Changes

All five proposed links reviewed against the verified link graph.

| Proposed link | Verdict | Where it should naturally live |
|---|---|---|
| Pricing → Features | **Useful.** `/pricing` currently has no link to `/features`; `/features` links to `/pricing` twice (lines 48, 234). One-directional. | A "See everything included" text link near the "Why one plan?" H3 (`Pricing.tsx:383`). Must be a plain link — decision #9 of the earlier pricing work forbade an expansion/dropdown in the plan card, and that still holds. |
| Claims → Photography Guide | **Most valuable of the five.** `/claims` has HowTo schema about documenting a claim; `/photography-guide` is the best topical page on the site. No link exists between them. | Inline within the "Photos & Videos" H3 block on `Claims.tsx`. |
| Resources → relevant guides | **Useful.** `/resources` is titled as a hub but links only to `/photography-guide` (`EducationalResources.tsx:79`). | Add `/asset-documentation`, `/awareness-guide`, `/glossary`, `/claims` to the existing resource grid. No new nav component. |
| Partnership inbound link | **Required — `/partnership` is a true orphan.** In the sitemap and routed at `App.tsx:474`, with zero inbound links from Navbar, Footer, or any marketing page. | Footer, in the existing company/about column. `About.tsx` is the weaker option (a partnership CTA sits oddly in a mission page). Also add the missing H1 while in the file. |
| Legacy Locker → Features/Secure Vault | **Useful.** `/legacy-locker-info` links out only to `/pricing` (line 116). | A contextual link to the `/features` Secure Vault section from the "What It Is" or "Why It Matters" `ExpandableBox`. |

Scope guard: five contextual text links plus one footer entry. No new navigation systems, no mega-menu, no related-posts component.

---

## K. Structured-Data Recommendation

`softwareApplicationSchema` (`structuredData.ts:106-118`) is defined and imported nowhere. Audit of its data:

| Field | Value | Accurate? |
|---|---|---|
| `name` | "Asset Safe" | Yes |
| `operatingSystem` | "Web, iOS, Android" | **Questionable.** Capacitor is in `package.json`, but there is no published iOS/Android app store listing to verify. Claiming native platforms without shipped apps is a misrepresentation risk. |
| `applicationCategory` | "LifestyleApplication" | **Conflicts.** `webApplicationSchema` uses "BusinessApplication" for the same product. Two different categories for one entity. |
| `offers.price` | `"18.99"` hardcoded | **Stale-prone.** Hardcoded in three separate places: `webApplicationSchema:91`, `softwareApplicationSchema:114`, and the `productSchema` call in `Pricing.tsx`. Not sourced from `subscriptionFeatures.ts`. |
| `offers.priceValidUntil` | `"2026-12-31"` | **Expires in four months.** Same hardcoded value in `productSchema:51`. |
| Storage | absent | N/A |

**Recommendation: leave `softwareApplicationSchema` unused, and do not enable it in Phase 1.**

Reasoning: it duplicates the entity `webApplicationSchema` already describes on the homepage, contradicts it on category, asserts unverified native platform support, and carries a second hardcoded copy of the price. Enabling it would create two competing SoftwareApplication-family entities for one product — worse than the current single WebApplication.

Two lower-risk structured-data items that *do* belong in Phase 1:

1. **Fix the `organizationSchema.sameAs` URLs** (`structuredData.ts:28-32`). They point to `facebook.com/assetsafe`, `twitter.com/assetsafe`, `linkedin.com/company/assetsafe`. The Footer was updated to `facebook.com/getassetsafe` and `instagram.com/getassetsafe`. The schema now advertises social profiles that may not exist, and omits Instagram. Verify each URL before changing.
2. **Centralize the price.** `18.99` and `priceValidUntil: 2026-12-31` are hardcoded in three places. Consider sourcing from one constant. Flagged as a correctness risk; implementing it is optional in Phase 1 since it touches no behavior — but the expiring `priceValidUntil` should at minimum be noted for the product owner.

Everything else in `structuredData.ts` is accurate and should be left alone.

---

## L. Search Console Connection Requirements

**Verified:** no Google Search Console connection is linked to this project, and no `google_search_console` connection exists in the workspace at all. Search Console is **not connected**.

What can be done from inside Lovable:
- Link a Google account via the connector flow (an in-chat card the product owner completes with their own Google login).
- Request a `META` verification token from Google.
- Add the verification `<meta>` tag to `index.html`'s `<head>` — a source change, publishable from here.
- Call Google's verify endpoint once the tag is live.
- Add the verified property and submit `https://getassetsafe.com/sitemap.xml`.

What cannot be done from here:
- **Signing into Google.** The product owner must complete the OAuth flow personally; no one else can do it for them.
- **Publishing.** The verification tag must be live at `https://getassetsafe.com/` before Google will verify. That requires a publish approval from the product owner.
- **DNS.** Not required for the recommended path. A URL-prefix property for `https://getassetsafe.com/` verifies via the META tag and fully supports both performance reports and sitemap submission for every page on that host. A DNS TXT record is needed only for an optional Domain-level property covering all subdomains and protocols — not needed here.

One wrinkle worth flagging: `https://getassetsafe.com/` is the canonical host, but `assetsafe.net`, `www.assetsafe.net`, and `www.getassetsafe.com` all 301 to it. Verify the **canonical** host as the property. Because the redirects are 301s, all signals consolidate there.

Sequence: connect account → request token → add tag to `index.html` → publish → verify → add property → submit sitemap. Steps 4 and 5 depend on the product owner. This can run in parallel with everything else in Phase 1.

---

## M. Exact Files Phase 1 Would Touch

**Core technical (B1 + B2):**
- `index.html` — remove canonical, description, robots, keywords; later add the GSC verification tag
- `src/components/SEOHead.tsx` — remove the `keywords` meta emission (line 46) and the `keywords` prop
- `scripts/generate-seo-html.ts` — **new**, if B2 proceeds
- `src/data/seoRoutes.ts` — **new**, route→metadata manifest, if B2 proceeds
- `package.json` — add a `postbuild` script, if B2 proceeds

**Metadata / copy:**
- `src/pages/Index.tsx` (47-56) — title, description, remove `browserTitle` override
- `src/pages/Pricing.tsx` (213-218) — title, description
- `src/components/PricingHero.tsx` (8) — optional H1 refinement
- `src/pages/LegacyLockerInfo.tsx` (59-64) — title, description, drop risky keyword targeting

**Noindex:**
- `src/pages/AccountAssistance.tsx` (182-185)
- `src/pages/VideoHelp.tsx` (131-136)
- `src/App.tsx` (378) — `/features-list` `noIndex` flip

**Sitemap:**
- `public/sitemap.xml` — remove 3, add 6, correct `lastmod` handling
- `public/robots.txt` — **no change** (deliberately; see E)

**Internal links:**
- `src/pages/Pricing.tsx` · `src/pages/Claims.tsx` · `src/components/EducationalResources.tsx` · `src/components/Footer.tsx` · `src/pages/Partnership.tsx` (add H1) · `src/pages/LegacyLockerInfo.tsx`

**Structured data:**
- `src/utils/structuredData.ts` (28-32 `sameAs` only; leave `softwareApplicationSchema` untouched and unused)

**Explicitly not touched:** every file under `src/pages/Account*`, `src/components/admin/`, `src/contexts/`, `supabase/`, any vault/encryption/RLS code, `SubscriptionPlan.tsx` logic, Stripe paths, `vite.config.ts` (unless B2 requires a plugin, which this design avoids).

---

## N. Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| Remove canonical/description/robots/keywords from `index.html` | **Very low.** Strictly removes conflicting signals. Worst case is a brief window where a non-JS crawler sees no description. | Ship first, alone, and re-verify raw HTML after deploy |
| Remove `keywords` prop from `SEOHead` | **Very low.** Ignored by search engines. Touches ~30 call sites, so a typecheck must pass. | Make the prop optional first, or delete call sites in one sweep with a build check |
| B2 post-build script | **Medium — hosting-dependent.** If Lovable serves `_redirects` before static files, the emitted files are inert (no harm, no benefit). Real risk is metadata drift between the manifest and page components. | Verify on a preview deploy before merging. Single shared manifest. Public allow-list only. |
| Noindex three routes | **Low, but irreversible on a lag.** If `/features-list` were later judged worth indexing, recovery takes weeks. | Confirm decision #8 is final before shipping |
| Sitemap edits | **Low.** | Verify all 37 resulting URLs return 200 before submitting |
| Homepage title/description | **Low.** Site currently ranks for 2 keywords with 0 traffic — there is no equity to lose. | Product-owner approval on final copy |
| Pricing metadata | **Low**, provided no component logic is touched | Metadata and heading text only; do not open `SubscriptionPlan.tsx` |
| Legacy Locker retargeting | **Low.** Reduces compliance exposure. | Re-read against the Secure Vault boundary wording before shipping |
| GSC connection | **No code risk.** Requires a publish. | Product-owner action |

Overall Phase 1 risk: **low**. Nothing touches auth, RLS, vault, billing, or data. The only medium item (B2) is gated behind a verification step that can fail safely.

---

## O. Recommended Implementation Sequence

**Step 0 — Verification (no code).** Confirm on a preview deploy whether `dist/<route>/index.html` is served ahead of the `_redirects` SPA fallback. Determines whether B2 is in or out.

**Step 1 — De-conflict the head (B1).** Edit `index.html`; remove the `keywords` emission from `SEOHead.tsx`. Deploy and re-verify with `curl` and Playwright that exactly one canonical, one description, and zero robots tags remain per page. **This must land before Step 3.**

**Step 2 — Search Console.** Connect the account, request the token, add the tag, publish, verify, submit the sitemap. Runs in parallel from here on; the sooner it starts, the sooner Steps 4-6 can be measured.

**Step 3 — Noindex the three utility routes.** Depends on Step 1.

**Step 4 — Sitemap.** Remove the three now-noindex routes, add the six missing URLs, fix `lastmod`. Depends on Step 3. Resubmit in Search Console once Step 2 is done.

**Step 5 — Metadata copy.** Homepage, `/pricing`, `/legacy-locker-info`. Requires approved copy from section P.

**Step 6 — Internal links + `/partnership` H1.** Independent; can run alongside Step 5.

**Step 7 — `organizationSchema.sameAs` correction.** After the product owner confirms which social profiles exist.

**Step 8 — B2**, only if Step 0 passed. Last because it is the only change with a hosting dependency, and because Steps 1-7 must be settled before the manifest is authored — otherwise the manifest is written twice.

**Step 9 — Verification pass.** Re-run the raw-HTML and post-JS metadata checks across all routes in D1 and D2; confirm every sitemap URL returns 200; confirm no page emits conflicting robots directives.

---

## P. Requires Product-Owner Approval Before Implementation

1. **Homepage title and description** — choose from the three candidates in section G, or supply alternatives. Also confirm that removing the `browserTitle="Asset Safe"` override is acceptable (the browser tab would then show the fuller SEO title).
2. **`/pricing` title and description**, and whether to change the H1 at all — the existing "One Simple Plan. Everything Included." is not broken. Also confirm the canonical storage figure to reference.
3. **`/legacy-locker-info` title and description** — final wording must be checked against the Secure Vault boundary language.
4. **Is decision #8 final?** Noindexing `/features-list` is slow to reverse.
5. **B2: proceed or not**, contingent on the Step 0 hosting result. If it fails, is losing per-page social previews acceptable for now?
6. **`operatingSystem: "Web, iOS, Android"`** — are there published iOS/Android store listings? Affects whether that claim is defensible anywhere in schema.
7. **Which social profiles actually exist** — Facebook, Instagram, X/Twitter, LinkedIn — to correct `organizationSchema.sameAs`.
8. **`priceValidUntil: "2026-12-31"`** expires in four months. Extend it, or centralize the price and validity date? Currently duplicated across three definitions.
9. **Google account for Search Console** — which account should own the property, and approval to publish the verification tag.

---

## Out of Scope for Phase 1 (confirmed)

No Home Inventory page, renter/landlord/small-business landing pages, Knowledge Hub SEO page, High-Value Items page, Emergency Information page, blog expansion, claims consolidation, `/press-news` retirement, or `/asset-documentation` rewrite. No Phase 2 or Phase 3 content strategy.

Nothing has been implemented.
