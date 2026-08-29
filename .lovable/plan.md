# Asset Safe SEO Phase 3 — Home Inventory Acquisition Page Planning Audit

Audit only. No files changed. No route created. No landing-page copy written.

---

## A. Executive Recommendation

Build `/home-inventory` as a new commercial-intent acquisition page. The term is currently **unowned**: no public page has "home inventory" in a title, H1, or meta description. The only substantive home-inventory content is a 2025 blog article (`/blog/digital-home-inventory-guide`), which is informational and a poor commercial ranking asset.

Demand is real and winnable (Semrush US): `home inventory` 1,300/mo, `home inventory app` 1,000/mo at KD 21 (easy), `household inventory` 480/mo, `house inventory app` 260/mo, plus a long tail of list/checklist/template terms.

Position the page as *"the home inventory is where you start; Asset Safe is what it grows into"* — a genuine home-inventory solution page that hands off to Asset Documentation, Knowledge Hub, and Secure Vault rather than redefining the product.

---

## B. Existing Home Inventory Footprint

31 case-insensitive matches across 14 files. Verified inventory of public occurrences:

| Location | Usage | Type |
|---|---|---|
| `src/pages/BlogPost.tsx` (9) | `digital-home-inventory-guide` article body + 2 other posts | Body copy |
| `src/pages/Blog.tsx` (3) | Card title/excerpt + Blog schema description | Listing |
| `src/components/HomeFAQ.tsx` (3) | "What is a digital home inventory?", "What makes Asset Safe different from other home inventory apps?" | FAQ (+ FAQPage schema via Index) |
| `src/pages/Index.tsx` (2) | FAQ data + video schema name "Digital Home Inventory Platform" | Schema/body |
| `src/pages/QA.tsx` | Meta description mentions "digital home inventory" | Meta |
| `src/pages/Glossary.tsx` | "Home Inventory" glossary term | Definition |
| `src/components/ComparisonSection.tsx` | "...unlike traditional home inventory apps" | Comparison copy |
| `src/components/FAQAccordion.tsx` | "Organizing your home inventory" list item | Body |
| `src/components/Navbar.tsx` | logo `alt` text | Image alt |
| `Partnership.tsx`, `HabitatPartnership.tsx`, `HabitatPilot.tsx`, `DevPartnerStrategy.tsx`, `VideoHelp.tsx` | Incidental partner/internal copy | Low relevance |

Notable gaps confirmed by search:

- `/asset-documentation`, `/features`, `/claims`, `/photography-guide`, `/resources`, `/digital-documentation-guide`, `/scenarios` contain **zero** "home inventory" occurrences after the Phase 2 rewrite.
- No page has "home inventory" in `<title>`, H1, or canonical meta description.
- `/blog/what-documents-to-upload` does not use the phrase; it is document-upload intent.

**Most likely current ranker for "home inventory":** `/blog/digital-home-inventory-guide` — it is the only page with the phrase in its title ("The Complete Guide to Creating a Digital Home Inventory") and repeated in H2s. Secondary: the homepage, only via FAQ/schema text. Both are weak for commercial queries.

---

## C. Search-Intent Ownership Map

| Page | Owns | Primary intent |
|---|---|---|
| `/home-inventory` (new) | home inventory, home inventory app, digital home inventory, household inventory, home inventory software | Commercial / category |
| `/asset-documentation` | what to document about belongings, property, records, values, serial numbers | Informational — *what* to record |
| `/blog/digital-home-inventory-guide` | how to create a home inventory, room-by-room process | Informational how-to |
| `/photography-guide` | how to photograph belongings and property | Task-level how-to |
| `/claims` | insurance claim documentation, proof of loss records | Insurance-adjacent |
| `/scenarios` | fire, theft, storm, water, move events | Event-driven |
| `/features` | product capability comparison | Product |
| `/pricing` | plan + purchase | Transactional |

The proposed separation is **sound**. The commercial layer is genuinely missing today, and adding it does not require inserting the phrase into unrelated pages.

---

## D. Cannibalization Risks

1. **`/home-inventory` vs `/blog/digital-home-inventory-guide`** — highest risk. Both would target "digital home inventory." Mitigation: the blog keeps the step-by-step process and room walkthrough; the landing page keeps *solution, capability, and comparison* framing, summarizes process in 4–6 lines max, and links down to the guide. Do not repeat the room-by-room list at equal depth in both.
2. **`/home-inventory` vs `/asset-documentation`** — moderate. Mitigation: no "what fields to record" table on the landing page; link out instead.
3. **`/home-inventory` vs `/` (homepage)** — low but real, since the homepage carries the "digital home inventory" FAQ and video schema name. Mitigation (recommend, do not implement now): leave the homepage untouched per instruction, but once `/home-inventory` exists, consider linking the homepage FAQ answer to it so the internal signal points at the specialist page.
4. **`/home-inventory` vs `/features`** — low. Landing page must not become a full feature matrix; keep a compact three-pillar block that links to `/features`.
5. **Future audiences (Renters, Landlords, Small Business, High-Value Items, Emergency Information)** — out of Phase 3 scope. Reserve those terms: `/home-inventory` should mention renters/landlords at most once in passing and must not build sections for them.

---

## E. Search Console Findings

**No verified data available.** `google_search_console--diagnose` returned `no_project_connection` for `https://getassetsafe.com` — no Search Console property is linked to this project, so impressions, clicks, CTR, positions, and landing-page attribution for "home inventory" and related queries cannot be reported. No performance figures are asserted anywhere in this audit.

Third-party demand data (Semrush US, keyword volume only — not site performance): `home inventory` 1,300/mo; `home inventory app` 1,000/mo, KD 21, CPC $1.20, low competition; `inventory home` 720/mo; `personal inventory` 720/mo; `household inventory` 480/mo; `home inventory list` 320/mo; `home inventory checklist` 260/mo; `home inventory template` 260/mo (high competition); `house inventory app` 260/mo; `household inventory list` 260/mo. Question tail is thin (`what is the best home inventory app` 20/mo).

Recommendation: connect Search Console before Phase 3 measurement so post-launch impact is verifiable.

---

## F. `/home-inventory` Primary Search Intent

**Primary:** commercial investigation — "I want a home inventory and I'm evaluating how/where to keep one."
Head terms: home inventory, home inventory app, digital home inventory, home inventory software, household inventory.

**Secondary (supporting, on-page only):** what belongs in a home inventory, how to keep it current, why it matters for insurance.

**Not this page:** step-by-step creation tutorial (blog), field-level documentation reference (`/asset-documentation`), photo technique (`/photography-guide`), claim filing and record lists (`/claims`), spreadsheet/template downloads (no asset exists — do not imply one).

---

## G. Relationship to `/asset-documentation`

Boundary line: **`/asset-documentation` answers "what information should I record?"; `/home-inventory` answers "how do I create and maintain a complete inventory of my home, and what should I use to do it?"**

- Phase 2 rewrite stays intact. No edits to its H1, title, description, or body framing.
- `/home-inventory` may reference documentation fields only as a short summary sentence plus a link.
- Only permitted change to `/asset-documentation`: adding one contextual inbound link to `/home-inventory`.

---

## H. Relationship to the Digital Home Inventory Blog Post

Keep the article. It is useful informational content and should not be consolidated or deleted.

**Retain:** why it matters, room-by-room walkthrough (living areas, kitchen, bedrooms), information-to-include list, maintenance cadence.

**Should not duplicate from the future landing page:** product capability framing, three-pillar positioning, comparison/differentiation angle, pricing or plan discussion, FAQ block.

**Recommended trims/edits at implementation time:** the "Using Asset Safe for Your Inventory" block should shrink to a short paragraph linking to `/home-inventory` instead of listing product features; the photography tips should link to `/photography-guide` rather than restate technique; the closing CTA currently points at `/pricing` and should point at `/home-inventory` (with `/pricing` retained as secondary). Also review the "Tax Purposes: Track depreciation and support deductions" bullet — that is tax advice and should be softened per section P.

**Linking:** guide → `/home-inventory` (intro or CTA, contextual, in-body). Landing page → guide (from a "How to build yours, step by step" pointer). Reciprocal linking is appropriate here because the intents differ.

---

## I. Recommended Page Structure

Section-by-section outline with the intent each serves. No copy written.

1. **Hero** — one-line value statement + primary CTA. Intent: commercial head term. Contains "home inventory" naturally once in the H1 and once in the subhead.
2. **What a home inventory is** — 2–3 sentences plus a compact definition. Intent: `what is a home inventory`, featured-snippet eligibility.
3. **Why it matters** — insurance readiness, loss events, moving, estate/continuity, knowing what you own. Intent: motivation-stage queries. Keep balanced — not insurance-only.
4. **What to document (summary)** — short grouped list (belongings, property/structure, receipts and proof, photos/video, values and identifiers, condition). Intent: `what should be included in a home inventory`. Links to `/asset-documentation`.
5. **Room-by-room organization (condensed)** — how to structure by property → room → item; 5–8 lines, not a tutorial. Intent: `household inventory list`, `home inventory checklist`. Links to the blog guide for the full walkthrough.
6. **Photos, video, and receipts** — why visual evidence plus paperwork matters; links to `/photography-guide`.
7. **Values and identifying information** — estimated values, serial/model numbers, warranties, appraisals. Intent: high-value/identifier tail. No appraisal or valuation guarantees.
8. **Keeping it current** — update triggers and a light cadence. Intent: `maintaining home inventory`.
9. **Insurance preparedness** — one focused section, links to `/claims` and `/scenarios`. Must not expand into coverage advice.
10. **Moving and transitions** — move-in/move-out condition, relocation records. Intent: moving tail. Keep short.
11. **Beyond a basic inventory: the Asset Safe system** — three compact blocks: Asset Documentation, Knowledge Hub, Secure Vault. Intent: differentiation, brand alignment ("Everything you love. Protected in one place."). Links to `/features`.
12. **How Asset Safe compares to spreadsheets, photo rolls, and single-purpose inventory apps** — factual, no named competitors, no unverifiable claims. Intent: `home inventory app` comparison stage. Links to `/digital-documentation-guide`.
13. **FAQ** — 5–7 genuine visible questions drawn from real query patterns (what is it, what should it include, how long does it take, do I need photos and receipts, how do I keep it updated, do insurers require one — answered carefully, is my data secure). Intent: question tail + FAQPage eligibility.
14. **Closing CTA** — primary + secondary per section O.

Exactly one H1. Sections 2–13 as H2s, sub-points as H3s.

---

## J. SEO Title Candidates

1. `Home Inventory App | Document Everything You Own — Asset Safe` (58)
2. `Home Inventory Software for Your Belongings & Property | Asset Safe` (66 — trim if strict 60 cap applies)
3. `Digital Home Inventory | Photos, Receipts & Values | Asset Safe` (62)

Preference: **#1** — matches the highest-value commercial term at readable length. Note `SEOHead` auto-appends `| Asset Safe` only when absent and under 60 chars, so pass the full string explicitly.

---

## K. Meta Description Candidates

1. `Create a digital home inventory of your belongings and property — photos, receipts, values, serial numbers, and condition records, organized and ready when you need them.` (168 — trim to <160)
2. `Build a complete home inventory in one secure place. Document belongings room by room with photos, receipts, and values, then keep it current with Asset Safe.` (155)
3. `A home inventory app for everything you own: belongings, property details, receipts, photos, and values — organized, protected, and ready when it counts.` (150)

Preference: **#2**.

---

## L. H1 Candidates

1. `Create a Home Inventory of Everything You Own`
2. `Your Home Inventory, Organized in One Secure Place`
3. `A Digital Home Inventory That Goes Beyond a List`

Preference: **#1** for clarity and head-term match; **#3** if differentiation is the stronger priority.

---

## M. Internal-Link Plan

**Inbound (contextual, in-body — not nav or footer only):**

| Source | Placement |
|---|---|
| `/asset-documentation` | one contextual link ("start with a home inventory") |
| `/features` | one link from the Asset Documentation pillar block |
| `/resources` | new card in the existing hub grid |
| `/blog/digital-home-inventory-guide` | intro + closing CTA |
| `/blog/protecting-high-value-items` | one contextual link |
| `/blog/organizing-receipts-warranties` | one contextual link |
| `/photography-guide` | one link ("photos belong in your home inventory") |
| `/claims` | one link where record lists are introduced |
| `/glossary` | link the existing "Home Inventory" term definition |
| `/qa` or `HomeFAQ` | link from the existing "What is a digital home inventory?" answer (homepage copy itself unchanged apart from the link, pending owner approval) |

**Outbound from `/home-inventory`:** `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`, `/features`, `/pricing`, `/digital-documentation-guide`, `/blog/digital-home-inventory-guide`.

Also required: add `https://getassetsafe.com/home-inventory` to `public/sitemap.xml` (static file, no generator script exists — currently 34 URLs, becomes 35).

---

## N. Structured-Data Recommendation

- **BreadcrumbList** — yes. Home → Resources → Home Inventory, via the existing `breadcrumbSchema` helper.
- **FAQPage** — yes, but only mirroring the genuinely visible FAQ block, using `faqSchema`. Do not add questions that are not rendered.
- **Organization / WebApplication** — already emitted on `/`. Do not duplicate on this page; a page-level graph of Breadcrumb + FAQPage is sufficient.
- **SoftwareApplication** — leave dormant. The helper exists in `src/utils/structuredData.ts` but must not be activated merely because the page says "home inventory app."
- **Review / AggregateRating / Product** — prohibited; no verified review data exists.
- Emit as a single `@graph` through `SEOHead`'s `structuredData` prop, with a self-referencing canonical `https://getassetsafe.com/home-inventory`.

---

## O. Conversion / CTA Recommendation

Search stage is evaluation, not purchase.

- **Primary CTA:** Get Started (existing signup entry) — repeated in hero and closing.
- **Secondary CTA:** View Sample Dashboard (`/sample-dashboard`) — lets evaluators see the product without committing; strongest match for "app/software" queries.
- **Tertiary, in-body links only:** `/features` and `/pricing`.

No change to pricing or the signup flow.

---

## P. Content Claims / Compliance Boundaries

- No claim that an insurer requires, accepts, or will accept a specific record format; no settlement-speed or payout-amount promises.
- No tax advice (the existing blog "track depreciation and support deductions" bullet should be softened).
- No legal or estate-planning advice; Secure Vault language stays continuity-oriented.
- No appraisal, valuation accuracy, or replacement-cost guarantees — "estimated values" only.
- Security wording must be "SOC 2–aligned practices," never "SOC 2 Compliant."
- No AI identification, auto-recognition, or auto-valuation claims.
- No fabricated statistics, case studies, testimonials, named-competitor comparisons, or invented dates.
- No downloadable template or checklist promised unless one actually ships.
- US-only availability constraints continue to apply to any billing reference.

---

## Q. Exact Existing Files That Would Need Changes

Implementation-time change set (not touched in this audit):

| File | Change |
|---|---|
| `src/pages/HomeInventory.tsx` | **New** page |
| `src/App.tsx` | Add `/home-inventory` route |
| `public/sitemap.xml` | Add the URL (34 → 35) |
| `src/pages/AssetDocumentation.tsx` | One contextual inbound link |
| `src/pages/Features.tsx` or `src/data/featuresContent.ts` | One inbound link |
| `src/pages/Resources.tsx` | Hub-grid card |
| `src/components/EducationalResources.tsx` | Optional resource card |
| `src/pages/BlogPost.tsx` | Links from 3 posts; trim product block and soften tax bullet in the home-inventory guide |
| `src/pages/PhotographyGuide.tsx` | One inbound link |
| `src/pages/Claims.tsx` | One inbound link |
| `src/pages/Glossary.tsx` | Link the "Home Inventory" definition |
| `src/services/SearchService.ts` | Add the page to public search results |
| `src/components/Footer.tsx` | Optional — only if resource nav lists guides |
| `src/components/HomeFAQ.tsx` | Optional, owner decision — link the existing FAQ answer |

Not to be modified: homepage hero/meta, `SEOHead.tsx`, pricing, checkout, auth, or any dashboard code.

---

## R. Product-Owner Decisions Required Before Implementation

1. **URL:** confirm `/home-inventory` (recommended) over `/home-inventory-app`.
2. **Title/H1/description:** pick from sections J, K, L.
3. **Homepage FAQ link:** approve or decline adding a link from the existing homepage FAQ answer to `/home-inventory`.
4. **Blog edits:** approve trimming the product block, retargeting the CTA, and softening the tax bullet in `/blog/digital-home-inventory-guide`.
5. **Secondary CTA:** confirm Sample Dashboard over View Features.
6. **Comparison section:** approve a spreadsheets/photo-roll/single-purpose-app comparison with no named competitors.
7. **Downloadable checklist:** in or out for Phase 3 (affects the `home inventory checklist` / `template` tail).
8. **Search Console:** connect the property so Phase 3 impact is measurable.
9. **Nav placement:** whether `/home-inventory` appears in primary navigation or lives inside the Resources hierarchy.
10. **Phase 3 sequencing:** confirm Renters, Landlords, Small Business, High-Value Items, and Emergency Information remain deferred to later audits.
