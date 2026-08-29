# Asset Safe SEO Phase 4A — Indexation & Search Performance Baseline (AUDIT ONLY)

No files were changed. No metadata, links, sitemap, robots, or schema touched.

## A. Executive Summary

- Technical baseline is healthy: every audited public page renders a unique title, unique description, self-canonical on `https://getassetsafe.com`, `index, follow`, and exactly one H1.
- Sitemap confirmed at **38 unique URLs, zero duplicates**.
- **Direct Search Console data is unavailable in this project environment.** No Search Console connection is linked to this Lovable project and no workspace connection exists, so Sections 5–8, 9–14, and 24 cannot be answered from verified Google data in this environment. The owner's external Search Console setup is unaffected.
- Because of that, this is a **technical baseline**, not a performance baseline. Verdict in AA: **NOT ENOUGH DATA — CONTINUE COLLECTION** (in this environment).
- Only real defect-class findings: `/partnership` H1 names a third-party brand while indexable; the site-wide footer links to `/admin`; several indexable, homepage-linked pages are missing from the sitemap.

## B. Current Indexable URL Count

38 sitemap URLs. Additionally indexable and internally linked but **absent from the sitemap**: `/features-list`, `/industry-requirements`, `/state-requirements`, `/video-help`, `/install`, `/account-assistance`.

## C. Sitemap Health

38 `<loc>` entries, no duplicates, all `https://getassetsafe.com`, all non-www, all match real routes. `robots.txt` references `https://getassetsafe.com/sitemap.xml`. Submission status, last-read date, and discovered-URL count require Search Console and are unavailable here.

## D. Indexability Findings

All 38 sitemap URLs: HEALTHY (indexable, self-canonical, `index, follow`, internally reachable). `/press-news` and `/press-news/digital-documentation-guide` resolve as client-side REDIRECT to `/resources` and `/digital-documentation-guide` and are correctly out of the sitemap. Intentional noindex/`Disallow` areas (auth, account, admin, checkout, gift flows, damage uploads) remain excluded and none of them appear in the sitemap. No noindex conflicts, no wrong-host or cross-page canonicals, no query-string canonicals.

## E. Priority Audience Page Status

| URL | Route | Robots | Canonical | H1 | Words | Schema |
|---|---|---|---|---|---|---|
| /home-inventory | public | index, follow | self | 1 | 1037 | BreadcrumbList, FAQPage |
| /renters | public | index, follow | self | 1 | 1039 | BreadcrumbList, FAQPage |
| /landlords | public | index, follow | self | 1 | 939 | BreadcrumbList, FAQPage |
| /small-business | public | index, follow | self | 1 | 945 | BreadcrumbList, FAQPage |

All four titles/descriptions unique, substantial visible content, no soft-404 behavior, FAQ schema backed by visible FAQ content. Navbar ("Who It's For") + Footer + Resources discovery + contextual inbound links all confirmed in the hydrated DOM. **Click depth from homepage: 1** for all four.

## F. Search Console Availability

Direct Search Console data is unavailable in this project environment. Fallback third-party estimate (Semrush, US, estimated ranking visibility — not indexing evidence): 2 organic keywords, ~0 est. monthly organic traffic; `asset documentation` at ~position 38 → `/asset-documentation`; one legacy keyword still mapped to the retired `/press-news` URL.

## G–N, X(partial), Section 24 — Google-Data-Dependent Sections

Indexing status, sitemap processing status, URL inspection, 28/90-day performance, page-level and query-level performance, brand vs non-brand split, query ownership, cannibalization, CTR and position opportunities, and Google title-rewrite evidence all require verified Search Console access. Status for all: **INSUFFICIENT DATA — NOT MEASURABLE IN THIS ENVIRONMENT.** No conclusions are inferred from immature or absent data.

## O–P. CTR / Ranking Opportunities

Cannot be produced without verified impression data. No recommendations made.

## Q. Internal-Link Architecture Health

Navbar "Who It's For" dropdown and Footer group both expose Homeowners → `/home-inventory`, Renters → `/renters`, Landlords → `/landlords`, Small Business → `/small-business`. Links are present in the hydrated DOM with no hover/click dependency (Radix `forceMount`). Blog relocation did **not** create an orphan — `/blog` is linked from the Footer and from `/resources`. All four audience pages retain contextual inbound links from `/resources` and related guides.

## R. Orphan / Low-Link Findings

- HEALTHY: all four audience pages, `/asset-documentation`, `/claims`, `/scenarios`, `/glossary`, `/awareness-guide`, `/features`, `/pricing`, `/resources`, `/blog`.
- LOW-LINK BUT INTENTIONAL: `/testimonials`, `/social-impact`, `/partnership`, `/terms`, `/legal`, `/cookie-policy`, `/sample-dashboard` (footer-level discovery is appropriate).
- Blog post URLs are reachable only via `/blog` listing — normal and healthy.
- No TRUE ORPHANS found among sitemap URLs.

## S. Metadata Uniqueness

No duplicate or near-duplicate titles or descriptions across indexable pages. Generic-title watch list (no action now): `/features`, `/resources`, `/blog` ("Asset Safe Blog"). `/digital-documentation-guide` description opens with marketing copy ("Protect what matters most — with precision, professionalism, and proof") rather than search-intent language — MONITOR.

## T. H1 / Intent Findings

Exactly one H1 on every audited page; no missing H1s. One real mismatch: `/partnership` title is "Partnership Opportunities | Asset Safe" while the H1 reads "Partnership Proposal: Asset Safe x RE/MAX" — an indexable public page whose visible content is a named-third-party pitch deck. Flagged as an E-E-A-T/brand risk for product-owner decision. Homepage and `/pricing` H1s live in child components (HeroSection/PricingHero) and render correctly.

## U. Canonical Findings

All indexable pages emit exactly one canonical, self-referential, `https`, non-www, no query strings. No conflicts found.

## V. Robots / Noindex Findings

No high-value public page is noindex, nofollow, or robots-blocked. Intentional noindex areas remain intact and stay out of the sitemap. Note: the four audience routes are not individually listed in the `Allow:` block of `robots.txt`, which is harmless (covered by `Allow: /` with no matching `Disallow`).

## W. Structured-Data Findings

All emitted JSON-LD parsed successfully — no malformed blocks, no duplicate schema on a page. Types in use: Organization/LocalBusiness, WebApplication, VideoObject (`/`), BreadcrumbList (most pages), FAQPage (`/home-inventory`, `/renters`, `/landlords`, `/small-business`, `/pricing`, `/qa`), HowTo (`/claims`), Service (`/scenarios`), Product (`/pricing`, `/gift`), CollectionPage (`/blog`), WebPage (`/testimonials`). Every FAQPage is backed by visible FAQ content. No reviews/ratings markup. `/testimonials` carries no Review/AggregateRating schema — correct. Pages with no schema (`/terms`, `/legal`, `/cookie-policy`, `/partnership`, `/sample-dashboard`) are acceptable.

## X. Broken-Link Findings

- No broken routes, 404 targets, or malformed hrefs found across crawled public pages.
- MEDIUM: the site-wide Footer links to `/admin`, an authenticated internal workspace, from every public page. It is `Disallow`ed in robots.txt, so it is a UX/exposure issue rather than an indexing one.
- LOW: `/press-news*` inbound equity now lands via client-side redirect only; there is no server 301 for it in `public/_redirects`.

## Y. Content-Gap Signals

With no verified query data, only architecture-derived signals are reportable.
- A. Improve existing: `/asset-documentation` (only page with any measured ranking signal, ~position 38 for its head term).
- B. Possible future informational pages: none justified without query evidence.
- C. Out of scope, do not target: stock/inventory-management software, landlord law, tax/depreciation, property-management software, insurance advice.

## Z. Phase 4B Candidate List

| Priority | URL | Opportunity | Evidence | Type | Confidence |
|---|---|---|---|---|---|
| HIGH | `/partnership` | Indexable page whose H1 names a third-party brand; title/H1 intent mismatch | Rendered DOM | Owner decision: noindex, de-brand, or move behind `/admin` | High |
| HIGH | Footer | Public link to `/admin` on every page | Rendered DOM | Remove from public footer | High |
| MEDIUM | Sitemap | 6 indexable, internally linked pages absent from sitemap | Sitemap vs. crawl | Decide include vs. intentional exclusion | High |
| MEDIUM | `/press-news*` | Client-side redirect only | `App.tsx`, `_redirects` | Add server 301 | Medium |
| MONITOR | `/digital-documentation-guide` | Marketing-first description | Rendered DOM | Description rewrite (needs GSC data) | Low |
| MONITOR | `/features`, `/resources`, `/blog` | Generic titles | Rendered DOM | Title work only if CTR data supports it | Low |
| NO ACTION | 4 audience pages | Technically clean, newly published | Crawl | None — collect data | High |

## AA. Data-Maturity Verdict

**NOT ENOUGH DATA — CONTINUE COLLECTION.** No verified Search Console data is reachable from this environment, and the Phase 3 pages were only recently submitted for indexing. Structural Phase 4B items (partnership page, footer `/admin`, sitemap coverage, server redirect) can proceed on their own evidence; anything metadata- or query-driven must wait for real impression data.

## AB. Recommended Observation Window

- **Now:** established pages (`/`, `/features`, `/pricing`, `/asset-documentation`, `/claims`, `/scenarios`, `/resources`, `/blog`) can be reviewed as soon as Search Console data is readable.
- **Later:** the four Phase 3 audience pages need ~21–28 days of post-indexation data before any optimization; re-audit them then.

## AC. Product-Owner Decisions Required

1. Should Lovable's Search Console connector be linked to this project so future audits use real Google data? (Alternative: you paste Performance/Page-Indexing exports.)
2. `/partnership`: keep indexable, noindex, or de-brand the RE/MAX content?
3. Remove `/admin` from the public footer?
4. Should `/features-list`, `/industry-requirements`, `/state-requirements`, `/video-help`, `/install`, `/account-assistance` be added to the sitemap or intentionally excluded?
