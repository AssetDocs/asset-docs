# Asset Safe — SEO Keyword & Search Visibility Audit

Audit only. No source files, metadata, sitemap, robots, schema, routes, or copy were modified.

---

## A. Executive Summary

Asset Safe's technical SEO hygiene is above average for a Lovable SPA: every public page has a unique title, description, canonical, breadcrumb schema, and no private route is indexable. The problem is not hygiene — it is **positioning drift**.

The product has moved to **Asset Documentation / Knowledge Hub / Secure Vault**, but the site's keyword surface is still overwhelmingly **insurance-claims-centric**. Roughly 11 of ~26 indexable public pages target insurance claims, state/industry claim requirements, insurance glossary terms, or insurance news. Those pages target audiences (claimants, adjusters, policy researchers) that do not map cleanly to the current buyer (homeowners, renters, landlords, small businesses, families).

Second structural issue: the homepage carries **no ranking-capable keyword anywhere in its title, H1, or hero**. Title is "Asset Safe | Protect What Matters", browser title is literally "Asset Safe", H1 is "Everything you love. Protected in one place." A brand-led hero is a valid choice, but nothing else on the homepage compensates, so the strongest page on the domain competes for essentially nothing.

Third: **raw HTML for every route serves the homepage's title, description, and canonical.** This is confirmed live, not inferred.

Verified third-party data (Semrush) shows the domain currently ranks for **2 keywords, 0 estimated organic traffic**. This is a pre-visibility site, which is good news: there is no ranking equity to protect, so repositioning carries near-zero downside risk.

---

## B. Current SEO Health

Verified strengths:
- Unique title + description + canonical on all public pages (`SEOHead.tsx`).
- `assetsafe.net` 301s to `getassetsafe.com` (verified via live curl). No cross-domain duplication.
- `robots.txt` is well-scoped: all account, auth, checkout, damage, and admin paths disallowed.
- `RouteMeta` in `App.tsx:141` defaults `noIndex = true`, so every wrapped private route is noindexed by default. Only `/features-list` opts back in. This is a genuinely good default.
- `sitemap.xml` returns 200 and contains only public routes.
- Breadcrumb schema on nearly every marketing page; Product/Offer on `/pricing` and `/gift`; FAQPage on `/`, `/qa`, `/pricing`, `/legacy-locker-info`; Article on blog posts; HowTo on `/claims`; VideoObject on `/`.

Verified weaknesses:
- No prerender/SSR (`package.json`, `vite.config.ts` — none found). Metadata is Helmet-only, client-side.
- Live check: `https://getassetsafe.com/features` raw HTML returns `<title>Asset Safe</title>`, homepage description, and `canonical href="https://getassetsafe.com/"`. Same for every route.
- `keywords` meta tag is set on every page. Ignored by Google; harmless but dead weight.
- No `og:image` per page — every page shares one social card.
- `/pricing` has **no H1** (first heading is H2 "Choose Your Plan", `Pricing.tsx:227`).
- `/partnership` has **no H1** (first heading is H3, `Partnership.tsx:116`) and is an **orphan** — in sitemap, zero inbound internal links.
- `lastmod` dates in `sitemap.xml` are mostly a uniform `2026-07-12`, which signals stale/automated dates to crawlers.

---

## C. Actual Search Performance

**Actual keyword performance could not be audited because verified Google Search Console/search-performance data was not available.**

Google Search Console is **not connected to this project** (confirmed: `no_project_connection` for `getassetsafe.com`). No impressions, clicks, CTR, position, or landing-page data exists to report. No conversion data was accessible either.

The only verified third-party signal available is Semrush (a modeled estimate, not measured traffic):

| Metric | Value |
|---|---|
| Organic keywords (US) | 2 |
| Est. organic traffic | 0/mo |
| Paid keywords | 0 |

| Keyword | Position | Volume | Landing page |
|---|---|---|---|
| asset documentation | 38 | 50/mo | `/asset-documentation` |
| content manipulation charge | 62 | 70/mo | `/press-news` |

Competitive/gap analysis returned **no data** — the domain has too little visibility for Semrush to model competitors.

Interpretation, stated conservatively: nothing on this site is currently "performing." The second keyword is an accidental match from curated news content and is not commercially relevant. **Connecting Search Console is the single highest-value next step**, because everything in sections H–Q below is a hypothesis until impression data exists.

---

## D. Current Keyword Map

| Theme | Targeting strength | Owner page | Competing pages | Terminology | Commercially relevant today? |
|---|---|---|---|---|---|
| Insurance claim documentation | **Very strong** | `/claims` | `/scenarios`, `/industry-requirements`, `/state-requirements`, `/glossary`, `/press-news` | Current but over-weighted | Partially — supporting use case, not the product |
| Insurance claim process / requirements | Strong | `/industry-requirements` | `/state-requirements`, `/claims` | Current | Weak — informational, low purchase intent |
| Insurance terminology | Strong | `/glossary` | — | Current | Weak — attracts researchers, not buyers |
| Home inventory | Moderate | none (scattered) | `/pricing`, `/qa`, `/testimonials`, `/photography-guide`, blog | **Fossilized** in metadata only | **Yes — highest-volume relevant theme** |
| Asset documentation | Moderate | `/asset-documentation` | `/features`, `/` | Current | Yes |
| Property documentation | Moderate but diffuse | none | `/about`, `/contact`, `/resources`, `/features` | Current | Yes |
| Digital legacy / estate | Moderate | `/legacy-locker-info` | `/gift`, `/social-impact`, `/pricing` keywords | Mixed — "password storage", "estate planning vault" are risky | Yes, with careful wording |
| Secure Vault / Digital Access | Weak (nav terms only) | `/features` | `/legacy-locker-info` | Current | Product-navigation, not search terms |
| Knowledge Hub | **Almost absent** | none | — | Current | Yes — undertargeted |
| Preparedness / emergency household info | **Absent as SEO theme** | none | `/awareness-guide` (risk-prevention, not preparedness) | — | Yes — real gap |
| Renters documentation | **Absent** | none | — | — | Yes — stated audience, zero coverage |
| Landlord property records | **Absent** | none | — | — | Yes — stated audience, zero coverage |
| Small-business asset documentation | **Absent** | none | `/social-impact` mentions only | — | Yes — stated audience, zero coverage |
| High-value item documentation | **Absent as a page** | none | in-app feature only | — | Yes — high commercial intent |
| Home records / maintenance records | **Absent** | none | `/awareness-guide` adjacent | — | Yes |

**Headline finding:** three of five stated primary audiences (renters, landlords, small businesses) have **no dedicated indexable page at all**.

---

## E. Page-by-Page SEO / Search Intent Table

| Route | Title | H1 | Intent | Primary topic | Secondary | Content matches intent? | Overlaps |
|---|---|---|---|---|---|---|---|
| `/` | Asset Safe \| Protect What Matters (browser: "Asset Safe") | Everything you love. Protected in one place. | Navigational (brand) | none identifiable | none | Yes for brand, no for search | — |
| `/features` | Features \| Asset Safe | Everything Asset Safe Does | Commercial investigation | product features | asset documentation | Yes | `/features-list` |
| `/features-list` | Features List (via RouteMeta) | — | Commercial investigation | feature enumeration | — | Thin duplicate | **`/features`** |
| `/pricing` | Asset Safe Plan | **none** | Transactional | pricing | plan comparison | Yes | `/gift` |
| `/about` | About Asset Safe | About Asset Safe | Navigational | brand story | mission | Yes | — |
| `/scenarios` | Insurance Claim Scenarios \| Asset Safe | Insurance Claim Scenarios | Informational | loss scenarios | claim prep | Yes | **`/claims`** |
| `/claims` | Claims Documentation \| Asset Safe | Insurance Claims Documentation | Informational | claim documentation | proof of loss | Yes | **`/scenarios`, `/industry-requirements`** |
| `/industry-requirements` | Industry Claims Requirements \| Asset Safe | Industry Requirements | Informational | claims process | filing steps | Yes | **`/claims`, `/state-requirements`** |
| `/state-requirements` | State Insurance Requirements \| Asset Safe | (H1 present) | Informational | state claim rules | compliance | Partially — thin per-state depth | **`/industry-requirements`** |
| `/glossary` | Insurance & Valuation Glossary \| Asset Safe | Insurance & Valuation Glossary | Informational | insurance terms | valuation terms | Yes | — |
| `/legacy-locker-info` | Legacy Locker \| Asset Safe | Legacy Locker | Commercial investigation | proprietary feature | digital legacy | **Title has no searchable concept** | — |
| `/resources` | Resources \| Asset Safe | Resources & Security | Navigational hub | guide index | security | Yes | — |
| `/qa` | FAQ - Common Questions Answered \| Asset Safe | Frequently Asked Questions | Informational | FAQ | product questions | Yes | `/` FAQ block |
| `/testimonials` | Testimonials \| Asset Safe | What Our Customers Say | Commercial investigation | social proof | reviews | Yes | — |
| `/gift` | Gift Asset Safe | Give the Gift of Protection and Peace of Mind | Transactional | gift subscription | homeowner gift | Yes | `/pricing` |
| `/blog` | Asset Safe Blog | Asset Safe Blog | Informational hub | blog index | — | Yes — but only 5 posts | — |
| `/blog/*` (5) | dynamic | dynamic | Informational | varies | varies | Yes | — |
| `/asset-documentation` | Asset Documentation Types \| Asset Safe | Asset Documentation Guide | Informational | asset categories | accounting-style taxonomy | **Weak — targets accounting terms, not household documentation** | `/features` |
| `/photography-guide` | Photography Guide for Documentation \| Asset Safe | How to Capture High-Quality Photos for Asset Documentation | Informational | documentation photos | technique | Yes — **strongest topical fit on the site** | — |
| `/awareness-guide` | Home Risk Awareness Guide \| Asset Safe | 🏠🔒 Asset Safe Awareness Guide | Informational | home risks | prevention | Content is good; **H1 emoji + brand-first is weak** | — |
| `/video-help` | Video Tutorials & Help \| Asset Safe | Video Tutorials & Help | Informational | tutorials | onboarding | **No — page is "Coming Soon"; thin/empty for crawlers** | — |
| `/sample-dashboard` | Sample Dashboard \| Asset Safe | Your Asset Safe Dashboard | Commercial investigation | product demo | preview | Yes | `/features` |
| `/press-news` | Press & Insurance News \| Asset Safe | Press & News | Informational | insurance news | curated articles | **Off-strategy — curated third-party news dilutes topical focus** | — |
| `/social-impact` | Social Impact \| Asset Safe | Our Social Impact | Informational | brand values | community | Yes | — |
| `/partnership` | Partnership Opportunities \| Asset Safe | **none** | Commercial | B2B partnerships | referrals | Yes | — |
| `/contact` | Contact Asset Safe | Contact Us | Navigational | support | contact | Yes | `/account-assistance` |
| `/account-assistance` | Continuity & Account Assistance \| Asset Safe | Continuity & Account Assistance | Transactional/support | account help | continuity | Yes — **should likely be noindex** | `/contact` |
| `/terms`, `/legal`, `/cookie-policy` | standard | present | Navigational | legal | — | Yes | — |

Correctly noindexed (verified): `/install`, `/gift-checkout`, `/redeem`, `/admin/enterprise`, 404, blog "Post Not Found", account-assistance success state, and all `RouteMeta` private routes (default `noIndex = true`).

**Indexable but arguably should not be:** `/account-assistance` (support form, duplicates `/contact`), `/features-list` (thin duplicate of `/features`), `/video-help` (Coming Soon, no content).

---

## F. Homepage Strategy

The brand-led hero should stay. Do **not** add keywords to "Everything you love. Protected in one place."

But three homepage assets are currently wasted:

1. **Browser title is literally `Asset Safe`** (`Index.tsx:49`, `browserTitle="Asset Safe"`). This is the single most valuable ranking field on the domain and it carries zero topical signal. This is invisible to visitors reading the hero — it only affects the SERP.
2. **Meta description** ("Your assets, important information, records, and memories...") is brand-voice, not search-voice. No searchable noun phrase.
3. **Below-hero sections** (`DocumentProtectSection`, `LegacyLockerSection`, `ComparisonSection`) carry marketing copy but their headings are not carrying topical keywords into the H2 layer.

Recommended keyword direction (not final copy):
- Homepage should compete for **brand + broad category**: "asset safe", "home and property documentation app", "document belongings and important records".
- It should **not** try to own "home inventory app", "digital legacy planning", "insurance claim documentation", or any audience-specific term. Each of those belongs to a dedicated page.
- Relevance can be built without touching the hero, via: browser title, meta description, below-hero H2 headings, internal links to the four audience pages, and adding `SoftwareApplication` schema (already written in `structuredData.ts:106` and **currently unused anywhere**).

---

## G. Keyword Cannibalization

| Cluster | Competing pages | Recommended canonical owner | Recommended role for the others |
|---|---|---|---|
| Insurance claim documentation | `/claims`, `/scenarios`, `/industry-requirements`, `/state-requirements` | **`/claims`** | `/scenarios` → scenario-specific long-tail (fire, flood, theft); `/industry-requirements` + `/state-requirements` → merge or subordinate, they overlap heavily |
| Product feature overview | `/features`, `/features-list`, `/sample-dashboard` | **`/features`** | `/features-list` → consider noindex or canonical to `/features`; `/sample-dashboard` → visual demo, differentiate title away from features |
| Pricing / purchase | `/pricing`, `/gift` | **`/pricing`** | `/gift` differentiate fully on gifting intent (it mostly does) |
| Support contact | `/contact`, `/account-assistance` | **`/contact`** | `/account-assistance` → noindex |
| FAQ | `/qa`, homepage FAQ block, `/legacy-locker-info` FAQ | **`/qa`** | Homepage FAQ schema duplicates Q&A that also lives on `/qa` — Google may dedupe rich results |
| Digital legacy | `/legacy-locker-info`, `/gift` keywords ("estate planning gift"), `/pricing` keywords ("estate planning tools pricing") | **`/legacy-locker-info`** | Remove estate-planning keyword targeting from `/pricing` and `/gift` |

Titles that are too similar in the claims cluster: "Claims Documentation", "Insurance Claim Scenarios", "Industry Claims Requirements", "State Insurance Requirements". Four titles, one intent.

---

## H. Strongest Existing Search Opportunities

Ranked by (product fit × existing page quality × verified difficulty). Volumes are Semrush US estimates.

1. **`/photography-guide`** — best topical fit already on the site. "how to photograph belongings", "home inventory photos". Needs only title/intent tuning.
2. **Home inventory cluster** — "home inventory" 1,300/mo (KD 3 competition, low), "home inventory app" 1,000/mo (**KD 21, easy**), "household inventory" 480/mo, "home inventory checklist" 260/mo. **No page owns this today.** Highest-value uncontested opportunity on the map.
3. **`/legacy-locker-info` → digital legacy** — "digital estate planning" 590/mo, "digital legacy" 390/mo, "digital legacy planning" 90/mo (KD 20, easy), "digital assets estate planning" 320/mo. The page exists; the title says only "Legacy Locker" and therefore matches nothing anyone searches.
4. **`/claims`** — genuinely strong content with HowTo schema. Should be narrowed to own the claim-documentation intent exclusively rather than sharing it with three sibling pages.
5. **`/glossary`** — glossary pages earn long-tail definition traffic cheaply. Already comprehensive.
6. **`/asset-documentation`** — currently ranks #38 for "asset documentation" (50/mo). Low volume, but it is the only page with any real position; worth keeping and clarifying.

---

## I. Missing Keyword / Content Opportunities

Validated against the current architecture. None of these require legal, financial, HIPAA, insurance-outcome, or estate-planning-professional claims.

| Opportunity | Why credible | Evidence |
|---|---|---|
| **Home inventory hub page** | Product literally does this; no page owns it | "home inventory app" 1,000/mo, KD 21 |
| **How to create a home inventory for insurance** | Direct match to Asset Documentation | 210/mo, plus a large question cluster ("how to make a home inventory list for insurance purposes" 70/mo) |
| **Renter move-in / move-out documentation** | Stated audience, zero coverage | "how to document belongings for renters insurance" 10/mo — low volume but very high intent and near-zero competition |
| **Landlord property documentation** | Stated audience, zero coverage | Semrush returned no data — treat volume as **unvalidated**; justify on audience fit, not volume |
| **Small-business equipment/asset documentation** | Stated audience, zero coverage | Unvalidated volume; strong product fit |
| **High-value item documentation** | Real in-app feature, no public page | Adjacent to appraisal/valuation terms already on `/glossary` |
| **Documenting home improvements / what records to keep** | Real in-app source type (upgrade_repair) | Adjacent to `/awareness-guide` |
| **Emergency household information / what family needs to know** | Maps to Knowledge Hub + Emergency Instructions | Preparedness theme has zero coverage today |
| **Knowledge Hub topic page** | Entire product pillar with no indexable page | Structural gap |

Deliberately excluded as out-of-bounds: anything implying legal advice, insurance outcome guarantees, HIPAA, credential/password vaulting as a security product, or professional estate planning.

---

## J. Outdated or Misaligned Keywords

- **Insurance-first framing across 6+ pages.** The site reads as an insurance-claims resource that happens to have an app. Current positioning is documentation-and-preparedness-first with insurance as one supporting use case.
- **`/legacy-locker-info` keywords include "password storage" and "estate planning vault"** (`LegacyLockerInfo.tsx:62`). Both conflict with current product positioning and with the Secure Vault "What It's Not" wording already agreed elsewhere. `password storage` in particular implies a credential manager.
- **`/pricing` and `/gift` keywords include "estate planning tools pricing" / "estate planning gift"** — competes with `/legacy-locker-info` and drifts toward regulated-advice framing.
- **`/asset-documentation` targets accounting taxonomy** ("liquid assets", "fixed assets", "intangible assets"). That audience is accountants, not homeowners.
- **`/press-news` curates third-party insurance news.** It generated the site's only other Semrush keyword ("content manipulation charge") — an accidental, irrelevant match. This page dilutes topical authority.
- **Homepage keywords list "insurance records"** as a core term while the hero says nothing about insurance.
- **`keywords` meta tag on all pages** — obsolete since 2009. Harmless, but it is where stale positioning is currently preserved.
- **"digital home inventory"** appears in `/qa` description — a legacy phrasing not used in current product copy.

---

## K. Titles & Meta Issues

| Page | Issue | Recommended keyword direction (no copy yet) |
|---|---|---|
| `/` | `browserTitle="Asset Safe"` — 10 chars, zero topical signal. Description is brand-voice. | Brand + broad category: property/belongings documentation |
| `/pricing` | Title "Asset Safe Plan" is brand-only, no intent. No H1 on the page. | Pricing + category term |
| `/legacy-locker-info` | Title "Legacy Locker \| Asset Safe" — proprietary name only, matches no query | Pair the product name with "digital legacy" / "important instructions" |
| `/features` | Reasonable, but "Features \| Asset Safe" is generic | Add the category noun |
| `/features-list` | Near-duplicate of `/features`; generic RouteMeta metadata | Noindex or canonical to `/features` |
| `/claims`, `/scenarios`, `/industry-requirements`, `/state-requirements` | Four near-identical claim titles | Differentiate or consolidate; only one should own the head term |
| `/asset-documentation` | Title targets accounting categories | Reframe toward household/property documentation |
| `/awareness-guide` | H1 leads with emoji + brand name before the topic | Lead with the risk/prevention topic |
| `/video-help` | Metadata promises tutorials; page is "Coming Soon" | Overpromise risk — consider noindex until content ships |
| `/account-assistance` | Duplicates `/contact` intent | Noindex |
| `/partnership` | No H1; orphaned | Add H1; link from Footer or About |
| All pages | `keywords` meta present but ignored by search engines | Safe to drop entirely |
| All pages | Single shared `og:image`; no per-page social card | Per-page OG images for key pages |

No page is missing a title or description. No description merely repeats its title.

---

## L. Internal Linking Issues

- **`/partnership` is a true orphan** — present in `sitemap.xml`, routed at `App.tsx:474`, zero inbound links from Navbar, Footer, or any marketing page. Reachable only by direct URL.
- **Navbar carries only 5 marketing links** (`/about`, `/features`, `/pricing`, `/gift`, `/blog`). Everything else depends on the Footer.
- **Footer is doing all the work** — 27 links. Footer-only links pass weak signal; the claims cluster, guides, and resources are all footer-dependent.
- **Homepage links out to only `/legacy-locker-info`, `/sample-dashboard`, `/pricing`.** No homepage link to `/features` in body content, no link to `/scenarios`, no link to any guide.
- **`/pricing` does not link to `/features`** — a standard and valuable pairing.
- **`/claims` does not link to `/photography-guide`** despite photo documentation being central to claim prep. Strongest missing contextual link on the site.
- **`/resources` links only to `/photography-guide`** (`EducationalResources.tsx:79`) — it is titled as a hub but hubs very little.
- **`/legacy-locker-info` does not link to `/features`** Secure Vault section.
- **Only 5 blog posts**, and blog posts link back only to `/features` and `/pricing`, never to topical guides.

---

## M. Technical SEO / Indexing Findings

1. **No server-rendered metadata (highest technical priority).** Verified live: `curl https://getassetsafe.com/features` returns `<title>Asset Safe</title>`, the homepage description, and `<link rel="canonical" href="https://getassetsafe.com/">`. Google renders JS and will usually pick up the Helmet values, but: (a) the raw canonical pointing every URL at the homepage is a real consolidation risk, (b) social/link-preview scrapers (Slack, LinkedIn, iMessage, X) do **not** execute JS, so every shared Asset Safe link shows the homepage card. No prerender or SSR plugin exists in `package.json` or `vite.config.ts`.
2. **`sitemap.xml` `lastmod` is a uniform `2026-07-12`** across ~25 URLs — a low-trust signal.
3. **`/account-assistance` is in neither the sitemap nor `robots.txt` disallow list**, and its default view is indexable.
4. **`/checklists`, `/feedback`, `/schedule-professional`, `/inventory`, `/continuity/dispute`** are disallowed in `robots.txt` and also `noIndex` via RouteMeta — correct, though note that `Disallow` prevents Google from ever *seeing* the noindex. Consistent here, no action needed.
5. **`/press-news/digital-documentation-guide` is a routed public page absent from the sitemap.**
6. **`/features-list` is deliberately indexable** (`noIndex={false}`, `App.tsx:378`) while being a thin duplicate of `/features`.
7. Cross-domain handling is **correct** — `assetsafe.net` 301s to `getassetsafe.com`, canonical resolves consistently.
8. `public/_redirects` correctly 301s the retired `/subscription-agreement` to `/terms`.
9. Google Search Console is **not connected**. No indexing, coverage, or sitemap-processing state can be verified.

---

## N. Structured Data Findings

Present and correct: Organization, WebApplication, FAQPage, VideoObject (homepage); Product+Offer (`/pricing`, `/gift`); BreadcrumbList (~22 pages); Article (blog posts); HowTo (`/claims`); Service (`/scenarios`).

Gaps:
- **`softwareApplicationSchema` (`structuredData.ts:106-118`) is defined but never used on any page.** The homepage uses `webApplicationSchema` instead. SoftwareApplication with aggregate offer data is the stronger type for a SaaS product page.
- **No structured data at all** on `/features-list`, `/sample-dashboard`, `/partnership`, `/account-assistance`.
- **~13 guide/utility pages ship breadcrumb-only** (`/glossary`, `/resources`, `/testimonials`, `/social-impact`, `/industry-requirements`, `/state-requirements`, `/photography-guide`, `/awareness-guide`, `/asset-documentation`, `/video-help`, `/press-news`, `/contact`, `/features`). Missing candidates: `DefinedTermSet` on `/glossary`, `HowTo` on `/photography-guide`, `ItemList` on `/resources`, `Review`/`AggregateRating` on `/testimonials` (**only if the testimonials are genuine and attributable** — do not add otherwise).
- **`/blog` builds its schema inline** (`Blog.tsx:128-143`) rather than reusing the shared helpers — inconsistent, not incorrect.
- **FAQ schema duplication** — the homepage and `/qa` publish overlapping FAQPage entities.
- **All schema `image` fields point to the single shared social card.**

---

## O. Pages That Should Own Each Major Search Intent

| Intent | Recommended owner | Status |
|---|---|---|
| Brand / navigational ("asset safe") | `/` | Owns it, but title carries no category term |
| Broad category (property & belongings documentation) | `/` | Not currently targeted |
| "home inventory app" / "home inventory" | **New dedicated page** | **Does not exist** |
| "how to create a home inventory" | New guide, or repurpose `/asset-documentation` | Does not exist |
| Insurance claim documentation | `/claims` | Owns it, diluted by 3 siblings |
| Loss-scenario long-tail | `/scenarios` | Should narrow to scenario-specific |
| Claims process by state | Merge `/state-requirements` + `/industry-requirements` | Currently split and overlapping |
| Insurance terminology | `/glossary` | Owns it |
| Documentation photography | `/photography-guide` | Owns it; underleveraged |
| Digital legacy organization | `/legacy-locker-info` | Owns product name, not the search concept |
| Knowledge Hub / household records | **New page** | Does not exist |
| Renter documentation | **New page** | Does not exist |
| Landlord property records | **New page** | Does not exist |
| Small-business asset documentation | **New page** | Does not exist |
| High-value item documentation | **New page** | Does not exist |
| Emergency household information | **New page** | Does not exist |
| Pricing / purchase | `/pricing` | Owns it; needs H1 and intent-bearing title |
| Gifting | `/gift` | Owns it |
| Product overview | `/features` | Owns it; `/features-list` dilutes |

---

## P. Top 10 Highest-Priority SEO Improvements

1. **Connect Google Search Console.** Without it, every priority below is a hypothesis. This is the only item that converts the audit from inference to evidence.
2. **Fix server-rendered metadata** (prerender the public marketing routes, or at minimum stop serving a homepage canonical on every URL). Also fixes broken social previews sitewide.
3. **Rewrite the homepage browser title and meta description** to carry the category term. Do not touch the hero.
4. **Create a home inventory pillar page.** Largest validated, low-difficulty, on-product opportunity with no current owner.
5. **Retitle `/legacy-locker-info`** to pair "Legacy Locker" with a searchable concept, and drop "password storage" / "estate planning vault" from its keyword targeting.
6. **Resolve the four-page claims cannibalization.** Designate `/claims` as owner; merge or subordinate `/industry-requirements` and `/state-requirements`.
7. **Add an H1 to `/pricing`** and give it an intent-bearing title.
8. **Create audience landing pages for renters, landlords, and small businesses** — three stated primary audiences with zero indexable coverage.
9. **Noindex or canonicalize `/features-list`, `/account-assistance`, and `/video-help`** (the last until content ships).
10. **Fix internal linking:** de-orphan `/partnership`, link `/pricing` → `/features`, `/claims` → `/photography-guide`, and give `/resources` real hub links.

---

## Q. Quick Wins vs. Longer-Term

**Quick wins (metadata/config only, low risk, no new content):**
- Homepage title + description rewrite
- `/pricing` H1 and title
- `/legacy-locker-info` title and keyword cleanup
- Drop the obsolete `keywords` meta sitewide
- Noindex `/account-assistance`, `/features-list`, `/video-help`
- Add `/press-news/digital-documentation-guide` to the sitemap; refresh `lastmod` dates
- De-orphan `/partnership` + add its H1
- Add the three missing contextual internal links
- Wire up the unused `softwareApplicationSchema`
- Connect Search Console

**Longer-term (new content, needs product-owner input):**
- Home inventory pillar page + supporting guides
- Renter / landlord / small-business audience pages
- Knowledge Hub topic page
- High-value item documentation page
- Emergency household information page
- Claims-cluster consolidation (involves merging or redirecting live pages)
- Blog expansion beyond 5 posts
- Per-page OG images

---

## R. Items Requiring Product-Owner Decision

1. **Should insurance remain a primary SEO theme, or become a supporting use case?** This determines whether the claims cluster is consolidated or expanded. It is the single decision that shapes everything else.
2. **Keep, retire, or noindex `/press-news`?** Curated third-party insurance news dilutes topical focus and produced the site's only irrelevant ranking.
3. **Are renters, landlords, and small businesses genuinely primary audiences?** If yes, they need pages. If they are aspirational, do not build them yet.
4. **`/state-requirements` and `/industry-requirements` — merge, keep both, or retire?** Both are thin and overlapping.
5. **`/video-help` — ship content or noindex?** It currently promises tutorials that do not exist.
6. **Are the `/testimonials` entries genuine and attributable?** Determines whether Review/AggregateRating schema is permissible.
7. **Is prerendering/SSR acceptable given the current build setup?** This is the largest technical lift in the audit.
8. **Should `/asset-documentation` keep the accounting-taxonomy angle** or be reframed toward household documentation?
9. **How aggressively should "digital legacy" be pursued** given the deliberate boundary against implying professional estate planning?

---

## S. Exact Files / Routes That Would Eventually Need Adjustment

**Metadata / copy:**
`src/pages/Index.tsx` (47-56) · `Pricing.tsx` (213-218, 227) · `LegacyLockerInfo.tsx` (59-64) · `Features.tsx` (33-38) · `AssetDocumentation.tsx` (51-56) · `Claims.tsx` (33-38) · `Scenarios.tsx` (26-31) · `IndustryRequirements.tsx` (13-18) · `StateRequirements.tsx` (15-20) · `AwarenessGuide.tsx` (66-71, 86) · `VideoHelp.tsx` (131-136) · `AccountAssistance.tsx` (182-185) · `Partnership.tsx` (13-17, 116) · `Gift.tsx` (58-63) · `QA.tsx` (31-36)

**Shared components:**
`src/components/SEOHead.tsx` (keywords meta, per-page og:image) · `src/utils/structuredData.ts` (106-118 unused SoftwareApplication) · `src/components/Navbar.tsx` · `src/components/Footer.tsx` · `src/data/featuresContent.ts`

**Routing / indexing:**
`src/App.tsx` (141 RouteMeta, 378 `/features-list` noIndex, 474 `/partnership`) · `public/sitemap.xml` · `public/robots.txt` · `public/_redirects` · `index.html` (static head fallback) · `vite.config.ts` (prerender, if pursued)

**New files if content opportunities are approved:**
`src/pages/HomeInventory.tsx` · `src/pages/ForRenters.tsx` · `src/pages/ForLandlords.tsx` · `src/pages/ForSmallBusiness.tsx` · `src/pages/KnowledgeHub.tsx` · `src/pages/HighValueItems.tsx` · `src/pages/EmergencyInformation.tsx`

---

## Final Distinction

| | |
|---|---|
| **What Asset Safe currently targets** | Insurance claims, claim requirements, insurance terminology, and product feature names. Brand-led homepage with no category keyword. |
| **What appears strategically valuable** | Home inventory (validated 1,000–1,300/mo, KD 21), digital legacy (590/mo, KD 20), documentation photography, and audience pages for renters/landlords/small businesses (product fit strong; volume unvalidated). |
| **What real search data proves is performing** | **Nothing.** Search Console is not connected. Semrush shows 2 keywords and 0 estimated traffic. No page on this site can be described as performing. |

No changes were made. Awaiting direction on section R before any implementation.
