# Asset Safe SEO Phase 1 — Pre-Implementation Gate Audit

Audit only. No files were changed. Every claim below is backed by a tool call made in this turn against current source, the running build, or the live production site.

---

## A. Executive Gate Result

**PHASE 1 READY FOR CODEX — B1 ONLY.**

B1 and all nine non-B2 workstreams are verified, unambiguous, and safe to hand off. B2 is **blocked at Step 0** — not failed, but unproven, and it cannot be proven without a build-output change that is out of scope for an audit. The exact minimal experiment Codex must run first is specified in section E.

Three findings materially change the previous specification and must be carried into implementation:

1. **`public/_redirects` is inert on Lovable hosting — proven live.** `https://getassetsafe.com/subscription-agreement` returns **HTTP 200 serving the SPA shell (3068 bytes)**, not the 301 to `/terms` that the file declares. The previous audit's claim that this redirect works was wrong. Lovable does not process Netlify-style `_redirects`. This removes the assumed obstacle to B2 *and* reveals a live broken redirect.
2. **Helmet never replaces the static tags — it appends alongside them, and the mechanism is now identified precisely.** `react-helmet-async@2.0.5` marks every tag it owns with `data-rh="true"` (`node_modules/react-helmet-async/lib/index.js:104`). Live DOM inspection confirms all 31 static `index.html` tags carry `helmet=false` and all 19 Helmet tags carry `helmet=true`. This gives B1 and B2 a deterministic, non-fragile fix rather than a guess.
3. **A broken internal link exists:** `src/components/EducationalResources.tsx:81` navigates to `/ai-valuation-guide`, which is **not defined in the router**. It resolves to the SPA 404.

The previously stated "30 indexable marketing routes" was wrong. The correct figure is **28 indexable route definitions producing 37 indexable URLs**.

---

## B. Authoritative Route Inventory

Derived from `<Route path="...">` in `src/App.tsx` (104 definitions, zero duplicates — verified with `uniq -d`).

| Category | Route definitions |
|---|---|
| **A. Public + indexable** | **28** |
| **B. Public + noindex** | **8** |
| **C. Private / authenticated / non-indexable** | **62** |
| **D. Redirect / retired** | **1 in-router + 1 inert file rule** |
| **E. Development / test-only** | **2** |
| Wildcard `*` (NotFound) | 1 |
| Nested `owner` / `dev` admin children | 2 |
| **Total** | **104** |

### A. Public + indexable (28 definitions → 37 URLs)

`/` · `/features` · `/pricing` · `/about` · `/contact` · `/scenarios` · `/claims` · `/legacy-locker-info` · `/gift` · `/resources` · `/qa` · `/glossary` · `/testimonials` · `/blog` · `/blog/:slug` · `/asset-documentation` · `/photography-guide` · `/awareness-guide` · `/industry-requirements` · `/state-requirements` · `/press-news` · `/press-news/digital-documentation-guide` · `/social-impact` · `/sample-dashboard` · `/partnership` · `/terms` · `/legal` · `/cookie-policy`

`/blog/:slug` is the only dynamic route. It resolves to **10** slugs, all defined in `src/pages/BlogPost.tsx` and all linked from `/blog` (`Blog.tsx` lines 15-105): `best-closing-gift-real-estate-agents`, `what-documents-to-upload`, `welcome-to-asset-safe`, `legacy-locker-modern-protection`, `digital-home-inventory-guide`, `estate-planning-digital-vault`, `insurance-claims-documentation`, `organizing-receipts-warranties`, `protecting-high-value-items`, `disaster-preparedness-checklist`.

27 static + 10 blog posts = **37 indexable URLs**.

### B. Public + noindex (8)

| Route | Current noindex source |
|---|---|
| `/install` | `Install.tsx:27` — already `noIndex` |
| `/redeem` | `GiftRedeem.tsx:169` — already `noIndex` |
| `/gift-checkout` | `GiftCheckout.tsx:218` — already `noIndex` |
| `/gift-claim` | RouteMeta default (`App.tsx:393`) |
| `/gift-success` | RouteMeta default (`App.tsx:392`) |
| `/account-assistance` | **Currently indexable** — Phase 1 target |
| `/video-help` | **Currently indexable** — Phase 1 target |
| `/features-list` | **Explicitly `noIndex={false}`** (`App.tsx:378`) — Phase 1 target |

### C. Private / authenticated / non-indexable (62)

All `/account/*` (25), all `/admin/*` (13), all `/auth/*` and auth flow (`/auth`, `/auth/continue`, `/auth/callback`, `/auth/callback/*`, `/signup`, `/verify-email`, `/email-verification`, `/confirm-email-change`, `/forgot-password`), `/welcome`, `/welcome/create-password`, `/onboarding`, `/invite`, `/inventory`, `/checklists`, `/feedback`, `/schedule-professional`, `/continuity/dispute`, `/acknowledge-access`, `/delegate-vault`, `/damage/photos/upload`, `/damage/videos/upload`, `/subscription-checkout`, `/subscription-success`, `/complete-pricing`.

All inherit `noIndex = true` from the `RouteMeta` default at `App.tsx:141`. Verified.

### D. Redirect / retired

- `/login` → `<Navigate to="/auth" replace />` (`App.tsx:402`). Client-side only, no HTTP 301. Correctly disallowed in `robots.txt:10`.
- `/subscription-agreement` → declared as a 301 to `/terms` in `public/_redirects:2`. **Inert.** Live request returns 200 + SPA shell. Not a router path either, so it renders the NotFound component with an HTTP 200 — a soft 404. Not in the sitemap, so low exposure, but the file is misleading and should not be relied on for any Phase 1 behavior.

### E. Development / test-only (2)

`/test-email` (`App.tsx:397`, RouteMeta default noindex, disallowed in robots) · `/admin/dev-invite`.

---

## C. Router vs Sitemap Reconciliation

Current `public/sitemap.xml`: **34 `<loc>` entries**. All 34 return HTTP 200 (verified).

**Router pages missing from the sitemap (6):**

| URL | Evidence |
|---|---|
| `/blog/estate-planning-digital-vault` | `Blog.tsx:65`, live 200 |
| `/blog/insurance-claims-documentation` | `Blog.tsx:74` |
| `/blog/organizing-receipts-warranties` | `Blog.tsx:83` |
| `/blog/protecting-high-value-items` | `Blog.tsx:92` |
| `/blog/disaster-preparedness-checklist` | `Blog.tsx:101` |
| `/press-news/digital-documentation-guide` | `App.tsx:466`, live 200 |

Half the blog is currently absent from the sitemap.

**Noindex pages incorrectly included in the sitemap (3):** `/features-list` (line 6), `/video-help` (line 27), `/account-assistance` (line 50). These become noindex in Phase 1.

**Sitemap URLs not present in routing:** none. All 34 map to a real route.

**Indexable pages incorrectly excluded:** the 6 above.

**Duplicate route definitions:** none.

**Aliases:** none in-router. Host aliases `assetsafe.net`, `www.assetsafe.net`, `www.getassetsafe.com` redirect to `getassetsafe.com` at the platform level; every sitemap URL already uses the canonical host.

**vs. the B2 allow-list:** the B2 allow-list must be exactly the 28 Category-A definitions expanded to 37 URLs — identical to the post-Phase-1 sitemap. Category B routes must be excluded from B2 (no benefit, and prerendering a noindex page invites confusion). Categories C, D, E must never be enumerated by the generator.

---

## D. B1 Verification

### Raw HTML — all 9 routes

`curl` against production for `/`, `/features`, `/pricing`, `/about`, `/legacy-locker-info`, `/claims`, `/features-list`, `/video-help`, `/account-assistance` returns byte-identical head content:

| Tag | Count in raw HTML | Value |
|---|---|---|
| `<title>` | 1 | `Asset Safe` |
| meta description | 1 | homepage description |
| canonical | 1 | `https://getassetsafe.com/` |
| robots | 1 | `index, follow` |
| og:title | 1 | `Get Asset Safe` |
| og:description | 1 | homepage description |
| og:url | 1 | `https://getassetsafe.com/` |
| og:image | 1 | shared social card |
| twitter:title / description / image | 1 each | homepage values |

Every route is wrong except `/`. Confirmed cause: `vite.config.ts` has no prerender plugin, `package.json` build is a bare `vite build`, and Lovable's built-in SPA fallback serves the same `index.html` for every unmatched path (`/nonexistent-page` → 200 + 3068-byte SPA shell).

### Hydrated DOM — all 9 routes

| Tag | Count after hydration | Notes |
|---|---|---|
| `<title>` | **1** | Helmet mutates the existing title element rather than adding one — no duplicate |
| meta description | **2** | static homepage value first, route value second |
| canonical | **2** | `https://getassetsafe.com/` **and** the route's own URL |
| robots | **2** | both `index, follow` today |
| og:title / og:description / og:url / og:image | **2 each** | |
| twitter:title / description / image | **2 each** | |
| meta keywords | **2** | |
| meta author / language | **2 each** | |

**Two canonicals per page, one pointing at the homepage.** When a page declares conflicting canonicals Google discards both and picks its own, so every per-page canonical on the site is currently unreliable even for a JS-rendering crawler. This is the single most damaging on-page defect found.

### Mechanism (root cause, now precisely identified)

`react-helmet-async@2.0.5` tags everything it manages with `data-rh="true"` (`HELMET_ATTRIBUTE`, lib/index.js:104). On mount it removes existing `data-rh` tags and inserts its own. It **never touches tags that lack the attribute**. Live DOM audit of `/claims`: all 31 static `index.html` head tags → `helmet=false`; all 19 Helmet tags → `helmet=true`. Nothing is deduplicated because Helmet does not recognise the static tags as its own.

### Will B1 produce exactly one authoritative tag?

**Yes for canonical, description, robots, keywords.** Removing those four from `index.html` leaves only the Helmet copy — one each, correct per route.

**No for og:* / twitter:*, if they are simply left in place.** They remain duplicated 2×. That is tolerable in B1 (the static set is the non-JS social fallback and the pairs are not *contradictory* for crawlers that read only the first), but it does not meet the section-4 end state.

**Recommended B1 refinement, evidence-backed:** add `data-rh="true"` to the static `og:*` and `twitter:*` tags in `index.html`. Helmet will then claim and replace them on hydration, giving exactly one coherent set post-hydration while preserving the static fallback for non-JS social crawlers. Safe here because every static og/twitter tag has a Helmet counterpart in `SEOHead.tsx` (verified line by line: og:type/url/title/description/image/site_name/locale and twitter:card/url/title/description/image all appear in both). Codex must verify this empirically — if any static tag lacked a counterpart, Helmet would remove it and not re-add it.

**B1 verdict: PASS.** Four deletions from `index.html` plus removal of the `keywords` prop from `SEOHead.tsx:11/25/46`, optionally plus the `data-rh` refinement. No routing, build, auth, or hosting change.

---

## E. B2 Hosting Test Result — **UNPROVEN (Step 0 not satisfiable by audit)**

### What was proven

| Test | Result | Conclusion |
|---|---|---|
| `/robots.txt` | 200, `text/plain`, 1990 B | Real static file served |
| `/sitemap.xml` | 200, `text/xml`, 5395 B | Real static file served |
| `/admin-docs/ein.pdf` | 200, `application/pdf`, 10074 B | Nested static file served |
| `/favicon.png` | 200, `image/png` | Real static file served |
| `/nonexistent-file.txt` | **404** | Missing file with extension → 404, not SPA |
| `/nonexistent-page` | 200, `text/html`, 3068 B | Missing extensionless path → SPA fallback |
| `/subscription-agreement` | **200 + SPA shell**, no redirect | **`public/_redirects` is not processed** |

Two things follow. First, **static-file precedence over the SPA fallback demonstrably exists** on this deployment. Second, the `/*  /index.html  200` rule that the previous audit treated as the risk to B2 **is not the mechanism in play at all** — it is an ignored Netlify file. Lovable's own hosting performs the fallback, and its documented behavior is to check for a real file first.

### What was NOT proven

Whether a request for the extensionless path `/features` resolves to a **directory index** at `dist/features/index.html`. That is a different resolution step from serving `/robots.txt`, and no directory-index file exists anywhere in this project to test against. `/admin-docs` (a real directory with no `index.html`) returned the SPA shell — consistent with either behavior and therefore not evidence.

**Producing that evidence requires creating a file in the build output, which is a source change. Audit-only scope forbids it.**

### Verdict: **FAIL (blocked, not disproven)** — B2 cannot be certified in this audit.

### Minimal non-production experiment Codex must run before implementing B2

1. On a **branch, deployed to preview only**, add a single file: `public/seo-probe/index.html` containing a unique marker string (e.g. `<!-- SEO-PROBE-OK -->`). Nothing else. No router change, no `index.html` change, no metadata change.
2. Build and deploy to the preview URL only. Do not publish.
3. `curl` the preview at `/seo-probe`.
   - Response body contains `SEO-PROBE-OK` → **PASS.** Directory-index files take precedence; B2 is viable exactly as designed.
   - Response is the 3068-byte SPA shell → **FAIL.** B2 as designed is inert; stop and report.
4. Also `curl` `/seo-probe/` (trailing slash) and confirm the result matches — if only the trailing-slash form works, B2 needs a different output shape and should be re-scoped.
5. Delete the probe file regardless of outcome.

This experiment is fully reversible, touches no route, no metadata, and no production deployment. It is a hard gate: **B2 must not be implemented until step 3 returns PASS.**

---

## F. B2 Helmet / Hydration Test Result

Helmet's behavior against a route-specific generated head is now determined rather than assumed:

- **Does Helmet replace matching generated tags?** Only if the generated tag carries `data-rh="true"`.
- **Does it deduplicate?** No — not against unmarked tags.
- **Does it append duplicates?** Yes, for every unmarked tag. Proven: 31 unmarked static tags coexist with 19 Helmet tags on `/claims`.
- **Does it leave conflicting tags?** Yes. Two canonicals today.

Consequence for B2: if the generator emits plain tags, every B2 route ends up with **two** of each after hydration — and where the manifest and the component disagree, they will be *contradictory*, which is worse than today's single wrong-but-consistent set.

**The generator must emit every route-specific head tag with `data-rh="true"`.** Helmet then removes them on mount and re-inserts its own, yielding exactly one coherent set. Raw HTML stays correct for non-JS crawlers; hydrated DOM stays clean for Googlebot.

Codex must verify during implementation, on the preview deploy, for at least `/`, `/features`, `/pricing`, and one blog post:

1. Raw HTML contains exactly one of each of the eleven tags, with route-specific values.
2. Post-hydration DOM contains exactly one of each — no orphaned `data-rh` tag that Helmet removed but did not re-add.
3. Title text matches between raw and hydrated (the `browserTitle` removal on the homepage affects this).
4. Canonical and og:url self-reference the route, not `/`.
5. No `data-rh` tag disappears without a replacement — this is the specific failure mode of the technique.

---

## G. Final Metadata Acceptance Criteria

**Raw HTML, every Category-A route in the B2 allow-list — exactly one of each, route-specific:**
`<title>` · description · canonical · og:title · og:description · og:url · og:image · twitter:title · twitter:description · twitter:image · (`og:type`, `twitter:card`, `og:site_name`, `og:locale` may remain sitewide constants).

**Post-hydration DOM, every public route:**
- exactly one canonical, self-referencing
- exactly one description
- exactly one robots directive (present and `noindex, nofollow` on the three Category-B Phase 1 routes; absent or singular `index, follow` elsewhere)
- exactly one coherent og/twitter set, matching the raw HTML values
- exactly one `<title>`
- zero `keywords` tags (removed sitewide)

**Interim state after B1 alone (if B2 never ships):** raw HTML carries the homepage og/twitter set on every route — a known, accepted limitation. Canonical, description, and robots are still correct and singular after hydration, which is what governs indexing.

---

## H. Noindex Verification

| Route | RouteMeta | SEOHead | Sitemap | robots.txt |
|---|---|---|---|---|
| `/account-assistance` | Not wrapped (`App.tsx:386`) | Own `SEOHead`; `noIndex` only on the post-submit success state (`AccountAssistance.tsx:156`). Main form view (182-185) has **no** `noIndex` → indexable | Present, line 50 → **remove** | Not disallowed. `Allow: /` applies |
| `/video-help` | Not wrapped (`App.tsx:396`) | Own `SEOHead`, **no** `noIndex` → indexable | Present, line 27 → **remove** | `Allow: /video-help`, line 86 |
| `/features-list` | Wrapped, **`noIndex={false}`** (`App.tsx:378`) | via RouteMeta | Present, line 6 → **remove** | `Allow: /features-list`, line 67 |

**After B1, can these emit a clean `noindex, nofollow`?** **Yes.** `SEOHead.tsx:48` already emits `noindex, nofollow` when `noIndex` is true. Once the static `<meta name="robots" content="index, follow">` is deleted from `index.html:11`, the Helmet tag is the only robots directive on the page.

**Ordering is mandatory:** these three must ship **after** B1. Shipping them first produces pages that emit `index, follow` *and* `noindex, nofollow` simultaneously. Google resolves conflicts to the most restrictive, so noindex would likely still win — but shipping self-contradictory directives is not an acceptable foundation and would poison any diagnostic signal.

**Confirmed: do NOT add these to `robots.txt` Disallow.** A `Disallow` would prevent Googlebot from crawling the page and therefore from ever seeing the noindex directive; any already-indexed URL would linger indefinitely. The current `Allow:` lines for `/features-list` (67) and `/video-help` (86) can stay — `Allow` does not force indexing, it only permits crawling, which is exactly what is needed for the noindex to be honored.

Cross-check: `/checklists`, `/feedback`, `/schedule-professional`, `/continuity/dispute` are both disallowed *and* RouteMeta-noindexed. That combination is consistent because they were never indexable. No change.

---

## I. Final Sitemap State and Exact Expected Count

- **Current count: 34**
- **Remove 3:** `/features-list`, `/video-help`, `/account-assistance`
- **Add 6:** the five missing blog posts + `/press-news/digital-documentation-guide`
- **Final expected count: 37**

This matches the Category-A URL total from section B (27 static + 10 blog posts = 37) exactly. The two derivations are independent and agree.

Per-URL verification of the 37: every route exists in `App.tsx`; all 34 current entries return HTTP 200; both spot-checked additions (`/press-news/digital-documentation-guide`, `/blog/estate-planning-digital-vault`) return 200; all use `https://getassetsafe.com`, the canonical host; none is redirected; none is noindex after Phase 1. Codex should re-verify all 37 return 200 before submitting to Search Console.

### `lastmod` handling

29 of the 34 current entries share `2026-07-12`. A uniform date across nearly every URL is not derived from any page-specific signal and is not authoritative.

- **Blog posts (10):** use the genuine `date` field already in `Blog.tsx` — `2024-12-15` through `2026-02-01`. The five currently-listed posts already carry correct dates; the five new ones take theirs from source.
- **All other 27 entries:** **omit `<lastmod>`.** The `2026-07-12` value has no identifiable source. An absent `lastmod` is read as unknown; a fabricated one erodes crawler trust.
- **Do not** use build date, deploy date, or current date. **Do not** carry `2026-07-12` forward.

`changefreq` and `priority` are near-universally ignored by Google; leaving them is harmless and out of scope.

---

## J. Structured Data Verification

### Price occurrences

`18.99` appears in **13 locations**; only two are structured data:

| File | Line | Schema | Value |
|---|---|---|---|
| `src/utils/structuredData.ts` | 91 | `webApplicationSchema.offers.price` | `"18.99"` |
| `src/utils/structuredData.ts` | 114 | `softwareApplicationSchema.offers.price` | `"18.99"` |
| `src/pages/Pricing.tsx` | 55 | `productSchema(...)` argument | `"18.99"` |

The other ten are UI copy (`SubscriptionCheckout.tsx:80`, `CompletePricing.tsx:112`, `Pricing.tsx:281`, `ManageTab.tsx:31/587/588`, `PricingPlans.tsx:74`, `AdminUsers.tsx:539`, `SystemArchitectureFlowcharts.tsx:216/647`) — out of scope.

### `priceValidUntil`

| File | Line | Schema | Value |
|---|---|---|---|
| `src/utils/structuredData.ts` | 51 | `productSchema` (used by `/pricing` and `/gift`) | `"2026-12-31"` |
| `src/utils/structuredData.ts` | 116 | `softwareApplicationSchema` (unused) | `"2026-12-31"` |

**Is removal valid?** Yes. `priceValidUntil` is an **optional** property of `schema.org/Offer`. Google recommends it for Merchant listings but does not require it for a Product/Offer, and removal invalidates nothing. Given no announced expiration exists, removing it is more accurate than any date that could be chosen. Remove both — line 116 is inside the schema that stays disabled anyway, so removing it is cosmetic but keeps the file honest.

### Price centralization

**Recommend deferring.** There is **no canonical price constant** — `src/config/subscriptionFeatures.ts` contains no price field (verified). Creating one and rewiring 13 call sites would touch `SubscriptionCheckout.tsx`, `ManageTab.tsx`, and `PricingPlans.tsx` — subscription-adjacent surfaces the locked decisions explicitly protect. Phase 1 action: **remove `priceValidUntil` only**; leave `18.99` where it is and log centralization as follow-up.

### `softwareApplicationSchema`

Confirmed **imported nowhere** (only its own definition matches). Leave disabled. Its `operatingSystem: "Web, iOS, Android"` (line 110) is unverified — Capacitor being in `package.json` is not evidence of a published store listing. `webApplicationSchema` already and correctly declares `"operatingSystem": "Web Browser"` (line 88), which is the Web-only representation the locked decision requires. No change needed there.

Also noted, no action required: the two schemas disagree on `applicationCategory` (`BusinessApplication` line 87 vs `LifestyleApplication` line 111) — moot while line 106 stays unused.

---

## K. Internal Link / Partnership Verification

| Claim | Status | Exact source |
|---|---|---|
| `/partnership` has no H1 | **CONFIRMED.** First heading is an `<h3>` | `src/pages/Partnership.tsx:116` (`h3` "1. Premium Closing Gift"); no `<h1>` anywhere in the file |
| `/partnership` is an orphan | **CONFIRMED — a true public orphan.** Only inbound references are three admin-only `navigate('/partnership')` calls | `src/pages/Admin.tsx:238`, `Admin.tsx:368`, `src/components/admin/AdminOwnerWorkspace.tsx:172`. Zero references in `Navbar`, `Footer`, or any public page |
| Pricing does not link to Features | **CONFIRMED.** Only outbound links are `/terms` and `/legal` | `src/pages/Pricing.tsx:323`, `:327` |
| Claims does not link to Photography Guide | **CONFIRMED.** `Claims.tsx` contains **zero** internal links — no `Link` import, no `href`, no `navigate` | `src/pages/Claims.tsx` |
| Resources has limited contextual links | **CONFIRMED, and worse than reported.** `src/pages/Resources.tsx` has zero internal navigation. The only two links live in `EducationalResources.tsx` | `src/components/EducationalResources.tsx:79` → `/photography-guide`; `:81` → `/ai-valuation-guide` |
| Legacy Locker has no Features/Secure Vault link | **CONFIRMED.** Single outbound link, to `/pricing` | `src/pages/LegacyLockerInfo.tsx:116` |

### New finding — broken internal link

`src/components/EducationalResources.tsx:81` calls `navigate('/ai-valuation-guide')`. **That path is not defined in `App.tsx`** (absent from all 104 route definitions). It falls through to the `*` wildcard and renders NotFound with an HTTP 200 — a soft 404 reachable from a public page. Codex should either point it at a real route or remove the control. Not in the original Phase 1 scope; flagged because it is a genuine crawl defect in a file Phase 1 already opens.

---

## L. Search Console Prerequisites

Observed state:

| Item | Status | Evidence |
|---|---|---|
| `google-site-verification` meta tag | **Absent** | No match in `index.html` or anywhere under `src/` |
| Search Console property configuration | **None observable** | No connector, no config file, no verification artifact in the repo |
| Sitemap submission integration | **None** | `public/sitemap.xml` is a hand-maintained static file. `robots.txt:95` declares `Sitemap: https://getassetsafe.com/sitemap.xml`, which aids discovery but is not submission |
| Search Console connection in this workspace | **Not connected** | Connector lookup returned no `google_search_console` connection available |

No claim is made about account-level Search Console state — it cannot be observed from here. The property may or may not exist outside this project.

**Requires code change (Codex can do):** add the `google-site-verification` meta tag to `index.html` once a token is supplied; keep `public/sitemap.xml` accurate.

**Requires manual product-owner action (Codex cannot do):** sign in to the Google account that will own the property; obtain the META verification token; **approve a publish** so the tag is live at `https://getassetsafe.com/` before Google will verify; click Verify; add the URL-prefix property `https://getassetsafe.com/`; submit the sitemap.

Property choice confirmed sound: a URL-prefix property on `https://getassetsafe.com/` covers every page on the canonical host and supports both performance data and sitemap submission. No DNS record needed. `assetsafe.net`, `www.assetsafe.net`, and `www.getassetsafe.com` all redirect to the canonical host, so signals consolidate there. Ownership should sit with a long-lived business-controlled Google account, not a personal one.

---

## M. Remaining Risks

| Risk | Severity | Notes |
|---|---|---|
| B2 directory-index resolution unproven | **Blocking for B2 only** | Gated behind the section-E probe. Fails safe: worst case the generated files are inert |
| `data-rh` technique removes a static tag with no Helmet counterpart | Medium | Every current og/twitter tag has a counterpart (verified). Must be re-checked if `SEOHead.tsx` changes |
| Manifest ↔ component metadata drift under B2 | Medium | Mitigate with a single shared source imported by both the generator and the pages |
| Noindex shipped before B1 | Medium | Purely an ordering discipline issue; sequence is explicit |
| Removing `keywords` from `SEOHead` touches ~30 call sites | Low | Compile-time failure, not runtime. Make the prop optional or sweep all call sites in one commit with a typecheck |
| Homepage title change | Low | Site currently has ~0 organic traffic; no equity at risk |
| Inert `_redirects` file | Low | `/subscription-agreement` is a live soft 404. Out of Phase 1 scope but should be logged |
| Broken `/ai-valuation-guide` link | Low | Live soft 404 from a public page |
| `sameAs` correction blocked on owner confirmation | Low | Leave `sameAs` untouched until URLs are confirmed |

**No architectural, auth, billing, or vault dependency was discovered.** Every Phase 1 file is presentational or static: `index.html`, `SEOHead.tsx`, `App.tsx` (one boolean prop), four page components' metadata blocks, `structuredData.ts`, `sitemap.xml`, and six link-insertion sites. Nothing touches `AuthContext`, `ProtectedRoute`, Supabase, RLS, Stripe, `SubscriptionPlan.tsx` logic, or any vault path.

---

## N. Exact Issues Codex Must Watch For

1. **Order matters.** B1 must land and be verified before any `noIndex` flip. Otherwise pages emit contradictory robots directives.
2. **Do not delete the static `og:*` / `twitter:*` tags from `index.html`.** They are the only social preview non-JS crawlers ever see. Mark them `data-rh="true"` instead if adopting the section-D refinement.
3. **Verify no `data-rh` tag vanishes without a replacement.** This is the one failure mode of the marking technique.
4. **Do not add the three noindex routes to `robots.txt` Disallow.** Blocking the crawl prevents the noindex from being seen.
5. **Do not implement B2 until the `/seo-probe` experiment returns PASS.** Delete the probe file afterward either way.
6. **`/pricing` already has an H1** — `PricingHero.tsx:8`, "One Simple Plan. Everything Included." Locked decision keeps it. Do not add a second H1.
7. **Removing `browserTitle="Asset Safe"`** (`Index.tsx:49`) changes the browser tab text to the full SEO title. Intended.
8. **`SEOHead.tsx:34`** contains a title-composition expression that appends `| Asset Safe` conditionally. Check the approved homepage, pricing, and Legacy Locker titles against it — several already contain "Asset Safe" or exceed 60 characters, so the branch taken may not be the obvious one. Verify the rendered title string, not the prop.
9. **`keywords` removal spans ~30 call sites** including `Index.tsx:53` and `Resources.tsx:33`. Sweep in one commit.
10. **`sitemap.xml` is hand-maintained.** No generator script exists and none should be introduced in Phase 1 without explicit approval.
11. **Do not fabricate `lastmod`.** Omit it on the 27 non-blog entries.
12. **Do not guess `sameAs` URLs.** Current schema values (`facebook.com/assetsafe`, `twitter.com/assetsafe`, `linkedin.com/company/assetsafe`) do not match the footer values (`facebook.com/getassetsafe`, `x.com/AssetSafe`, `instagram.com/getassetsafe`) — see section below.
13. **`/account-assistance` has two `SEOHead` blocks** — the success state at line 156 already has `noIndex`; the main form view at 182-185 is the one to change.
14. **`AccountAssistance`, `VideoHelp`, and `SampleDashboard` are not RouteMeta-wrapped.** Their noindex must be set on their own `SEOHead`, not in `App.tsx`. Only `/features-list` is changed in `App.tsx`.

### Social profile URLs — classification (no changes made)

| URL | Location | Classification |
|---|---|---|
| `https://www.facebook.com/getassetsafe` | `Footer.tsx:13` | Likely genuine — product-owner-configured, HTTP 200. Not independently verified as Asset Safe-owned |
| `https://x.com/AssetSafe` | `Footer.tsx:19` | Likely genuine — product-owner-configured, HTTP 200. Not independently verified |
| `https://www.instagram.com/getassetsafe` | `Footer.tsx:31` | Likely genuine — product-owner-configured, HTTP 200. Not independently verified |
| `https://www.facebook.com/assetsafe` | `structuredData.ts:29` | **Stale / mismatched** — contradicts the footer handle; returns a 302 |
| `https://twitter.com/assetsafe` | `structuredData.ts:30` | **Stale / mismatched** — wrong handle case and legacy domain; returns a 301 |
| `https://www.linkedin.com/company/assetsafe` | `structuredData.ts:31` | **Unverified** — no corresponding footer link exists anywhere; ownership unknown |

HTTP status is not proof of ownership; social platforms return 200 for pages that are not the intended profile. Codex must only write URLs the product owner explicitly confirms. If LinkedIn cannot be confirmed, drop the entry rather than keep it. Instagram is currently absent from `sameAs` despite being in the footer.

---

## O. Final Verdict

### **READY FOR CODEX — B1 ONLY**

| # | Gate | Result |
|---|---|---|
| 1 | Authoritative route inventory reconciled | **PASS** — 104 definitions classified; 28 indexable → 37 URLs; prior "30" corrected |
| 2 | B1 duplicate metadata issue verified | **PASS** — raw and hydrated counts captured on all 9 routes |
| 3 | B1 solution technically sound | **PASS** — mechanism identified (`data-rh`), outcome deterministic |
| 4 | B2 hosting behavior verified | **FAIL (blocked)** — static-file precedence proven; directory-index resolution untestable without a build-output change |
| 5 | B2 hydration/duplication risk understood | **PASS** — Helmet appends unmarked tags; `data-rh` emission required |
| 6 | Noindex implementation path verified | **PASS** — sources located, ordering constraint identified, robots.txt handling confirmed |
| 7 | Sitemap final state reconciled | **PASS** — 34 → remove 3, add 6 → **37**, cross-checked against the route inventory |
| 8 | Structured-data cleanup path verified | **PASS** — 2 `priceValidUntil` sites, removal valid, centralization deferred |
| 9 | Internal-link file locations verified | **PASS** — all six confirmed, plus a broken `/ai-valuation-guide` link found |
| 10 | No architectural/auth/billing/vault dependencies | **PASS** — none found |

**Nine of ten gates PASS.** The single FAIL is isolated to B2 and does not block the rest of Phase 1.

**Hand off now:** B1 (index.html de-conflict + keywords removal), the three noindex flips, the sitemap rebuild to 37 URLs, the approved homepage / pricing / Legacy Locker metadata, `priceValidUntil` removal, the `/partnership` H1, the internal-link pass, and the Search Console tag once a token exists.

**Hold:** B2, pending the `/seo-probe` experiment in section E. If it returns PASS, B2 can be added as a follow-up commit without revisiting anything above; the status becomes **READY FOR CODEX — B1 + B2**.

Nothing was implemented.
