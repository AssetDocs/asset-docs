# Phase 3D — Small Business Acquisition Page Planning Audit (AUDIT ONLY)

No files changed. No route created. No page written. No Knowledge Hub, High-Value Items, Emergency Information, additional Digital Legacy, or B2 planning included.

## A. Executive Recommendation

Build `/small-business` as a commercial/category page owning one intent: **documenting the physical property and equipment a small business owns, plus the records that go with it** — photos, serial and model numbers, receipts, warranties, condition, repairs, replacements, and improvements, organized by location. Lead with equipment and business property documentation. Deliberately avoid the "inventory management" vocabulary that dominates the high-volume demand, because that demand is stock/SKU intent Asset Safe cannot serve. Keep insurance secondary, keep multi-location modest, and include one concise boundary statement positioning Asset Safe as the documentation layer alongside operational business software. Sitemap 37 → 38. No Navbar change in this phase.

## B. Existing Small-Business Content Footprint

| Location | Visible wording | Intent | Competes with /small-business? |
|---|---|---|---|
| `src/data/featuresContent.ts:450-483` (renders on `/features` as the "Businesses" audience tab) | "For Businesses", "Document premises, equipment, and the records that go with them", "Premises and equipment", "Records in one system", "Maintenance and improvement history", "Documentation to support insurance and review", "Controlled access for your team" | Product/feature framing for business owners | **Strongest business content today.** A tab inside `/features`, not its own URL. Becomes the primary inbound link and the source of truth for capability wording. No cannibalization. |
| `src/data/featuresContent.ts:566-569` Industries — "Small Business" | "Equipment, premises, and record documentation for owners without a dedicated asset system." | Industry framing | No; reuse this exact vocabulary — it is already the safest phrasing on the site. |
| `src/data/featuresContent.ts:554-557` Industries — "Construction & Home Services" | "Tools, equipment, and job-site condition documentation across multiple locations." | Industry framing | No; supports the multi-location claim. |
| `src/components/DocumentProtectSection.tsx:51,91` (homepage) | "Perfect for everyday households, growing families, property managers, and small businesses."; "Built for: Homeowners • Renters • Families • Property owners • Small businesses" | Audience list | No. Natural future contextual anchor, but homepage changes are out of scope for 3D. |
| `src/components/DocumentationChecklist.tsx:255-273, 413-442` | "Business Property", "Assets & Equipment", "Network equipment", "Equipment Zones", "Machinery & Equipment", "Serial numbers" | In-product checklist | No — in-app tool, not a public page. Useful evidence that business/equipment documentation is a shipped capability. |
| `src/pages/SocialImpact.tsx:54-63` | "Supporting Small Business Owners"; "For contractors, rental property managers, and local businesses, equipment and inventory are lifelines." | Brand/values | Low. Note: this page already uses "inventory" loosely for business equipment — acceptable in context, not worth changing. |
| `src/pages/AssetDocumentation.tsx:13-14` | "Belongings and equipment… tools, collections, and small-business equipment you would want to identify later." | Informational | No; this is the natural inbound link and confirms the framework already anticipates business equipment. |
| `src/pages/BlogPost.tsx:148-159` | "Business & Professional Documents", "Business licenses", "Commercial leases", "Equipment inventories" | Informational blog | Low. Good inbound-link opportunity from `what-documents-to-upload`. |
| `src/pages/BlogPost.tsx:553` | "**Tax deductions:** Business expenses need documentation" | Informational blog | **Compliance risk flag** — tax-adjacent. Not caused by 3D; note it, do not fold a rewrite into this phase unless the owner asks. |
| `src/pages/B2BOpportunities.tsx:143,164` | "Residential & Commercial"; "Commercial building operators" | B2B partner recruiting | No. Different audience (partners, not end customers). |
| `src/pages/Partnership.tsx:80` | "homeowners, renters, business, and landlords" | Partnership | No. |
| `src/pages/Pricing.tsx:540` | "Business Owners — Secure important documents and assets in one place" | Pricing audience chip | No. |
| `src/pages/Testimonials.tsx:80-106` | "We've invested so much in our small business…"; "I run a small construction company… lost, stolen, or damaged equipment" | Social proof | No. Do not reuse or restate these on `/small-business`. |
| `src/pages/Legal.tsx:134` | "Not intended for commercial property management" | Legal terms | **Important constraint** — the terms already disclaim commercial property management. `/small-business` copy must not contradict this. |
| `src/pages/Glossary.tsx:32` | "Serial Number" definition mentions tools and equipment | Definition | No. |
| `src/pages/ScheduleProfessional.tsx:242` | "Commercial Property" select option | In-product form | No. |

No public page currently owns business/equipment documentation intent at a URL. The strongest existing content is the `/features` Businesses tab.

## C. Keyword / Demand Findings

Third-party Semrush estimates, US database — not verified Google data.

- `small business asset tracking` — 70/mo, KD 29, CPC **$17.62**, competition 0.66. Highest commercial signal in the set, but the surrounding cluster is software: `asset management software` 6,600/mo ($35.58), `asset tracking` 5,400/mo ($27.51), `asset tracking software` 2,400/mo ($41.78), `asset panda` 4,400/mo, `asset tiger` 2,900/mo, `it asset management software` 3,600/mo, `fixed asset management software` 1,300/mo. These are IT asset management, GPS/barcode tracking, and depreciation tools — **not Asset Safe's use case**.
- `business inventory app` — 50/mo, KD 32, CPC $14.74. Its cluster is squarely stock control: `inventory management systems` 90,500/mo, `inventory management software` 12,100/mo, `sortly` 12,100/mo, `zoho inventory` 6,600/mo, `inflow` 5,400/mo. **All SKU/stock intent.**
- `equipment inventory` — 170/mo, KD 21, CPC $7.70. Mixed and noisy: related terms are dominated by equipment *marketplaces* (`machinery trader` 33,100/mo, `equipment trader` 14,800/mo, `used equipment for sale`) and by `equipment management software` 1,600/mo ($35.64). Question cluster is more usable: `how to keep track of equipment inventory` 30/mo, `how to manage equipment inventory` 30/mo, `how to inventory computer equipment` 50/mo, `how to create an equipment inventory list in excel` 30/mo, `how to inventory equipment` 20/mo. Several `how to equip … inventory` results are video-game noise — ignore.
- `business equipment inventory` — 10/mo, KD 0, CPC $0. `how to inventory equipment for small business` — effectively 0/mo.
- `equipment maintenance records` — 10/mo, KD 0, CPC **$31.03**, competition 1.0. Tiny volume, very high commercial signal.
- `business property documentation` — no Semrush data. Treat as untracked/near-zero.

Reading: **this is the thinnest demand of any Phase 3 page so far, and the largest share of it is the wrong intent.** The realistic organic targets are the low-volume, high-CPC record-keeping long tail (`business equipment inventory`, `equipment maintenance records`, `how to keep track of equipment inventory`, `how to inventory equipment for small business`) plus the question cluster. `/small-business` should be justified primarily as an **audience/conversion page** that completes the Phase 3 set and gives business-intent visitors a landing surface — not as a high-volume organic play. Set expectations accordingly.

## D. Search Console Findings

No Google Search Console connection is linked to this project (`no_project_connection` for `getassetsafe.com`). No verified impressions, clicks, CTR, position, or landing-page data for business, small business, equipment, commercial, inventory, assets, property records, maintenance, or claims queries. All demand data in C is third-party estimate only. Connecting Search Console remains the single highest-value SEO input available and matters more here than on any prior Phase 3 page, because the keyword case is weak.

## E. Primary /small-business Search Intent

Commercial/solution intent from an owner or operator of a small business who wants one organized place for the physical property the business owns — equipment, tools, machinery, furnishings, fixtures, and the premises — together with photos, identifiers, receipts, warranties, condition, and repair history. Not stock, not accounting, not IT asset management.

## F. Search-Intent Ownership Map

The proposed separation is sound:

- `/small-business` — business-owned equipment, premises, and supporting records
- `/landlords` — rental-property-owner documentation history
- `/renters` — renter belongings + rental condition
- `/home-inventory` — personal household inventory
- `/asset-documentation` — what information to document
- `/photography-guide` — photography technique
- `/claims` — insurance claim documentation
- `/scenarios` — loss-event scenarios

## G. Cannibalization Risks

1. **`/features` Businesses tab (highest)** — identical capability list. Prevention: `/small-business` is search-intent copy; the tab stays a feature summary; one contextual link each way.
2. **`/landlords`** — both can drift into "multiple properties, one account". Prevention: `/landlords` says *rental property / unit / turnover*; `/small-business` says *location / premises / workspace*. Never "unit" or "tenancy" on `/small-business`; never "equipment your business owns" on `/landlords`.
3. **`/asset-documentation`** — the recordkeeping framework, and it already names small-business equipment. Prevention: `/small-business` summarizes business-specific applications only and links out.
4. **`/home-inventory`** — shares "inventory" as a word. Prevention: different audience noun in every heading; **no link between them** (see AA/Z).
5. **`/photography-guide`** — equipment and serial-plate photos. Prevention: what to capture, not how; one link out.
6. **Drift into inventory-management SERPs** — the biggest strategic risk; see I.
7. **Drift into tax/depreciation** — the demand exists in the asset-management cluster and must be declined outright.

## H. Core Small-Business Value Proposition

The hypothesis holds with one adjustment: **supporting records (serials, receipts, warranties) should merge into the equipment pillar rather than stand alone**, because in the product they live on the same item record, and separating them creates two thin sections.

Recommended order:
1. Document business equipment and property (lead)
2. Photos, serial and model numbers, receipts, warranties, condition
3. Repairs, maintenance, and replacements (strongest differentiator)
4. Improvements and premises/fixtures
5. Insurance preparedness (secondary, short)
6. Multi-location organization (modest, structural only)

## I. Inventory-vs-Documentation Boundary

This is the defining constraint of the page. "Inventory" in the business SERP means stock, SKUs, reorder points, barcodes, and warehouses — capabilities Asset Safe does not have and must not imply.

- **Preferred (use freely):** equipment documentation, business property records, business property documentation, asset documentation, equipment records, documented equipment list, records for the equipment your business owns.
- **Use sparingly and always qualified (at most 2–3 times, never in H1/title/meta):** "documented equipment inventory", "an inventory of what your business owns" — always adjacent to the word *documented* or *records*.
- **Never:** stock, SKU, reorder, barcode, scanning, warehouse, quantities on hand, stock levels, products for sale, point of sale, cost of goods.

## J. Asset-Tracking Terminology Recommendation

**Avoid "tracking" entirely** in headings, title, meta, and CTA copy. Asset Safe provides no GPS, no barcode workflow, no check-in/check-out, no employee assignment, no automated depreciation, and no lifecycle management, so "asset tracking" sets an expectation the product cannot meet — and the $17–42 CPC on those terms means the SERP is owned by tools that do all of it. Replace with **document, record, organize, keep a history of**. A single body-copy sentence acknowledging the difference is acceptable inside the boundary section ("Asset Safe documents what you own rather than tracking equipment location or check-out"), but do not target the term.

## K. Equipment Documentation Positioning

Give this the lead section plus one supporting section. On `/small-business`, keep it to a compact list of what to capture — equipment photos, make/model, serial numbers, purchase records, receipts, warranties, condition, estimated values, and supporting documents/manuals — with one link to `/asset-documentation` for the full framework. Do not restate the framework's reasoning; that is `/asset-documentation`'s job. All items listed are shipped capabilities (Property Profiles, Photos & Videos, Documents & Records, Asset Values, Upgrades & Repairs).

## L. Commercial Property Positioning

Keep **secondary and physical**. Safe: offices, shops, studios, workshops, storage areas, service-business spaces, furnishings, tools, fixtures, and improvements to a space. Avoid: commercial real estate investment language, leasing, tenants, building operations, or anything resembling commercial property management — `src/pages/Legal.tsx:134` explicitly states Asset Safe is "not intended for commercial property management", and the marketing copy must not contradict the terms. Warehouses may be named only as a *space being documented*, never as warehouse inventory.

## M. Repairs / Maintenance / Replacements Positioning

Treat as the strongest differentiator after the lead, mirroring the `/landlords` treatment: repair history, maintenance records, dates, before/after photos, invoices, receipts, warranties, equipment replacement, upgrades, product sources, and vendor notes. Supported by shipped Upgrades & Repairs, Documents & Records, Trusted Professionals, Source Websites, and Smart Calendar. State the boundary in-line once: Asset Safe organizes the documentation; it does not dispatch technicians, create service tickets, or manage work orders. Never claim maintenance scheduling automation beyond the calendar reminders that actually ship.

## N. Insurance Positioning

Secondary and short, one card: organized equipment, property, receipt, and condition documentation may be useful when preparing a business-property insurance claim. Link `/claims` (primary) and `/scenarios` (loss context). Prohibited: commercial coverage types, policy interpretation, limits, deductibles, exclusions, business interruption, reimbursement or payout expectations, settlement speed. Never in title, H1, or meta.

## O. Multi-Location Positioning

**Verified but keep modest.** The product supports unlimited property profiles (property limits are effectively unlimited in the current entitlement logic), and `featuresContent.ts` already claims "Document each location and the equipment inside it" and "across multiple locations". Safe: a separate Property Profile per location, rooms and areas within each, records kept with the location they belong to, the same structure repeated. Avoid: enterprise location management, operational dashboards, branch analytics, franchise management, headcount or role hierarchies beyond the shipped Authorized Users model. One compact section, not a pillar.

## P. Relationship to /asset-documentation

`/asset-documentation` keeps what-to-document. `/small-business` summarizes the business-specific application — equipment, premises, receipts, serials, warranties, condition, maintenance history — in list form and links out once from the equipment section. No duplicated framework prose.

## Q. Relationship to /photography-guide

Business capture list stays on `/small-business` (workspace overview shots, equipment and machinery, tools, serial/model plates, existing condition, before/after repair). Technique stays on `/photography-guide`. Exactly one contextual link, placed in the photos/identifiers section.

## R. Relationship to /claims

`/claims` keeps claim documentation. `/small-business` gets one short business-specific preparedness paragraph and links out. No business-insurance guidance of any kind.

## S. Relationship to /landlords

Hard vocabulary split:

| Concept | `/landlords` | `/small-business` |
|---|---|---|
| The place | "rental property", "each unit", "the property you own" | "your business location", "premises", "workspace", "shop", "office" |
| The things | "appliances, fixtures, and included property" | "equipment, tools, machinery, furnishings, and fixtures the business owns" |
| Multi-property | "one account, a separate documented profile for each rental property" | "a separate documented profile for each business location" |
| Change events | "turnover", "move-in / move-out" | "replacement", "upgrade", "repair" |

`/small-business` must never use *tenant*, *tenancy*, *turnover*, or *move-in/move-out*. No link between the two pages.

## T. Business-Software Boundary

Terminology that would falsely imply ERP/CRM/POS/accounting/stock/warehouse/barcode/fleet/CMMS: *manage inventory, stock levels, reorder, SKU, barcode scan, point of sale, invoicing, bookkeeping, ledger, general ledger, depreciation schedule, fixed asset register, work orders, service tickets, dispatch, fleet, CMMS, ERP, pipeline, customers/leads*. Ban all of them.

Recommended concise boundary statement (one card, ~2 sentences, positive not defensive):

> Asset Safe is the documentation layer for the physical property and records your business owns. It works alongside the accounting, inventory, and operations software you already use rather than replacing it.

Do not name specific products and do not imply integrations — none ship.

## U. Recommended Page Structure

The proposed 15 sections are sound with two changes: merge #4 into the equipment area as a supporting card, and merge #11 (loss scenarios) into #10 (insurance preparedness) to keep the page from thinning out. Recommended 14 sections:

| # | Section | Purpose | Intent served | Overlap risk | Contextual link |
|---|---|---|---|---|---|
| 1 | Hero (H1 + subhead + 2 CTAs) | Establish business audience and documentation promise | Commercial | Low | /pricing, /sample-dashboard |
| 2 | Why business documentation matters | Problem framing: records scattered across email, folders, camera rolls, invoices | Informational | Low | — |
| 3 | Document equipment and business property (lead) | Core pillar | Commercial | `/asset-documentation` | /asset-documentation |
| 4 | Photos, serials, receipts, and warranties | What to capture per item | Informational | `/photography-guide` | /photography-guide |
| 5 | Organize records by location and area | Structural organization | Commercial | `/landlords` | /features |
| 6 | Repairs and maintenance history | Strongest differentiator | Commercial | Low | — |
| 7 | Equipment replacements and improvements | Differentiator, second half | Commercial | Low | — |
| 8 | Premises, furnishings, and fixtures | Physical space documentation | Commercial | `/landlords` | — |
| 9 | Supporting documents and records | Licenses, leases, purchase paperwork, manuals | Informational | Low | — |
| 10 | Insurance preparedness and unexpected loss | Secondary benefit + loss context | Informational | `/claims`, `/scenarios` | /claims, /scenarios |
| 11 | Alongside your business software (boundary) | Prevent false capability expectation | Trust | Low | — |
| 12 | Related guidance (link row) | Internal linking / discovery | Navigational | Low | 5–6 links |
| 13 | FAQ (8 visible) | Long-tail question cluster + FAQPage | Informational | Low | — |
| 14 | Closing CTA band | Conversion | Commercial | Low | /pricing, /sample-dashboard |

No full page copy written, per instruction.

## V. SEO Title Candidates

1. `Business Equipment & Property Documentation | Asset Safe` — 55 chars **(recommended)**
2. `Small Business Property & Equipment Records | Asset Safe` — 56 chars
3. `Document Business Equipment and Property | Asset Safe` — 53 chars

All avoid "inventory management", "tracking", insurance-first framing, and any accounting/tax implication.

## W. Meta Description Candidates

1. `Small businesses can document equipment, premises, and records in one place — photos, serial numbers, receipts, warranties, condition, and repair history.` — 154 chars **(recommended)**
2. `Keep organized records of the equipment and property your business owns, including photos, serial numbers, receipts, warranties, repairs, and improvements.` — 155 chars
3. `Document business equipment, tools, fixtures, and premises with photos, identifiers, receipts, warranties, and maintenance history — organized by location.` — 155 chars

## X. H1 Candidates

1. `Document the Equipment and Property Your Business Owns` — 54 chars **(recommended)**
2. `Keep Organized Records for Your Business Equipment and Property` — 63 chars
3. `Business Equipment and Property Documentation` — 45 chars

Recommended pairing: H1 #1 + Title #1 + Description #1 — consistent with the Phase 3B/3C pattern where the H1 is an action phrase and the title is the keyword phrase.

## Y. FAQ Recommendations (8 visible, informational)

1. What business equipment should I document?
2. What records should a small business keep for its equipment and property?
3. Should I photograph equipment, serial numbers, and model plates?
4. Can receipts, warranties, and manuals stay with the equipment record?
5. How should a business document repairs, maintenance, and equipment replacements?
6. Can Asset Safe organize more than one business location?
7. Is business property documentation useful when preparing an insurance claim?
8. Does Asset Safe replace inventory-management or accounting software?

Answers must be informational, capability-accurate, free of tax/legal/insurance-outcome language, and identical to the FAQPage schema text.

## Z. Internal-Link Plan

**Inbound (always-visible contextual, one sentence each):**
- `/features` — inside the Businesses audience tab (matches the `/renters` and `/landlords` pattern; `forceMount` keeps it crawlable)
- `/asset-documentation` — after the existing renters/landlords sentences
- `/photography-guide` — after the existing renters/landlords sentences
- `/claims` — after the existing renters/landlords sentences
- `/scenarios` — after the existing landlords sentence
- `/resources` — new resource card
- `SearchService.ts` — new `small-business` entry

**Optional / judgment:**
- `src/pages/BlogPost.tsx` `what-documents-to-upload`, "Business & Professional Documents" section — natural but blog-body edits are riskier; recommend deferring.
- `/glossary` — no genuinely business-specific term exists; **do not add**.
- `/partnership`, `/b2b-opportunities` — different audience (partners, not customers); **do not add**.

**Outbound from `/small-business`:** `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`, `/features`, `/resources`, `/pricing`, `/sample-dashboard`. **No link to `/landlords`** (different asset class, blur risk) and **no link to `/home-inventory`** (personal vs business — same rule applied on `/landlords`).

## AA. Structured-Data Recommendation

Use the existing helpers in `src/utils/structuredData.ts` inside a single `@graph`:
- `breadcrumbSchema` — Home → Resources → Small Business
- `faqSchema` — exactly the 8 visible FAQs, verbatim

Do not add LocalBusiness (Asset Safe is not the local business, and neither is the reader), Organization for the customer, Review, AggregateRating, Product review, or SoftwareApplication.

## AB. CTA Recommendation

Keep the Phase 3 pattern unchanged: primary `Get Started` → `/pricing`, secondary `View Sample Dashboard` → `/sample-dashboard`, in the hero and repeated in a `bg-brand-blue` closing band after the FAQ. No change to payment-first onboarding, pricing, or checkout.

## AC. Compliance / Claims Boundaries

Prohibited: tax advice, depreciation, deductions, write-offs, accounting or bookkeeping guidance, valuation or appraisal guarantees, certified appraisal implication, insurance reimbursement or payout guarantees, faster-claim guarantees, business interruption advice, legal advice, regulatory or industry compliance claims, invented statistics, invented customer outcomes, unverified AI claims, and "SOC 2 Compliant".

Safe alternatives: "estimated values you record yourself" (not appraisal); "documentation that may be useful when preparing a claim" (not reimbursement); "records you can hand to your accountant or advisor" (not tax guidance); "SOC 2–aligned practices" if security is mentioned at all; "organized records" instead of "compliance-ready".

## AD. Exact Existing Files That Would Need Changes

| File | Current wording / state | Purpose of change |
|---|---|---|
| `src/App.tsx` | No `/small-business` route | Add import + public route beside `/landlords` |
| `src/pages/SmallBusiness.tsx` | Does not exist | New page |
| `public/sitemap.xml` | 37 `<loc>` entries | Add one `/small-business` entry in the Resources block |
| `src/services/SearchService.ts` | `landlords` entry ends at line 109 | Add a `small-business` entry (title, description, path, category `help`, business keywords) |
| `src/pages/Resources.tsx` | `resourceLinks` includes Home Inventory, Renters, Landlords | Add a Small Business card |
| `src/pages/Features.tsx` | Has `audience.id === 'renters'` and `'landlords'` contextual blocks | Add the same one-sentence block for `audience.id === 'business'` |
| `src/pages/AssetDocumentation.tsx` | Renters + landlords sentences after the framework card | Add one business sentence |
| `src/pages/PhotographyGuide.tsx` | Renters + landlords sentences | Add one business sentence |
| `src/pages/Claims.tsx` | Renters + landlords sentences under the intro | Add one business sentence |
| `src/pages/Scenarios.tsx` | Landlords sentence in the property-damage block | Add one business sentence |

No broad rewrites. Out of scope but noted for a later pass: `src/pages/BlogPost.tsx:553` ("Tax deductions: Business expenses need documentation") is tax-adjacent language predating Phase 3.

## AE. Sitemap Recommendation

37 → **38 unique URLs**. `/small-business` added once with `changefreq monthly`, `priority 0.7`, matching `/renters` and `/landlords`. No fabricated `lastmod`. No existing route needs removal or noindex; no current sitemap URL is noindexed.

## AF. Navigation Recommendation After Phase 3D

After 3D the site has four audience/category pages: `/home-inventory`, `/renters`, `/landlords`, `/small-business`. That is the right size to justify grouping — but **not in this phase**.

Recommendation for a separate navigation pass after 3D lands:
- Introduce a **"Who It's For"** group (clearer than "Solutions", which reads enterprise/B2B and conflicts with the documentation positioning).
- Include all four pages. `/home-inventory` belongs in the group — it is the homeowner/household audience even though its name reads like a feature.
- Prefer a **Navbar dropdown** over Resources-only. Resources already carries eight-plus cards and buries the audience pages among guides; a dropdown gives each page a site-wide always-visible internal link, which is the single biggest available internal-linking gain for these pages. Current Navbar density should be checked before committing — if the desktop bar is already tight, replacing an existing low-value item is preferable to adding a sixth.
- Footer should gain the same four links as a compact "Who It's For" column, giving every page a second site-wide always-visible link.
- SEO note: dropdown contents must be rendered in the DOM (not mounted on hover only), the same crawlability requirement that `forceMount` solves on the `/features` tabs.

Do not implement any of this during 3D.

## AG. Product-Owner Decisions Required Before Codex Implementation

1. Approve the strategic framing: `/small-business` is primarily an **audience/conversion page**, not a high-volume organic play (see C).
2. Confirm the pillar order in H, including merging supporting records into the equipment pillar.
3. Approve the 14-section structure in U (two merges vs the proposed 15).
4. Choose Title / Description / H1 from V / W / X.
5. Approve the boundary statement wording in T.
6. Approve the "avoid tracking entirely" recommendation in J.
7. Confirm multi-location stays a modest section, not a pillar (O).
8. Approve the 8 FAQs in Y.
9. Confirm no link to `/landlords` and no link to `/home-inventory` (Z).
10. Confirm the inbound-link file list in AD, and whether the blog link is deferred.
11. Decide whether `BlogPost.tsx:553` tax wording is cleaned in this pass or a later one.
12. Confirm the navigation pass (AF) is a separate phase after 3D.
