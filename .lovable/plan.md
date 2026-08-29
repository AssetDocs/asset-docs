# Phase 3C — Landlords Acquisition Page Planning Audit (AUDIT ONLY)

No files changed. No route created. No page written. No Small Business, Knowledge Hub, High-Value Items, Emergency Information, or Digital Legacy planning included.

## A. Executive Recommendation

Build `/landlords` as a commercial/category page owning one intent: **a documented history for each rental property you own** — unit condition, move-in/move-out records, repairs, improvements, appliances and fixtures, receipts and warranties, organized per property. Lead with property documentation history (not inspections, not insurance, not deposits). Include one short "how this fits alongside property management software" section as the boundary statement. Minimize security-deposit content to a hedged owner-records paragraph. Sitemap 36 → 37. Keep out of Navbar and footer for now.

## B. Existing Landlord Content Footprint

| Location | Visible wording | Intent | Competes with /landlords? |
|---|---|---|---|
| `src/data/featuresContent.ts:485-517` (renders on `/features` as the "Landlords" audience tab) | "For Landlords", "One account, every property, documented consistently", "Every property in one account", "Condition documentation between tenancies", "Repairs and improvements per unit", "Contractors, paint codes, shutoff locations", "Renewal and maintenance reminders" | Product/feature framing for owners | **Strongest landlord content today** — but a tab inside `/features`, not its own URL. Becomes the primary inbound link and the source of truth for capability wording. No cannibalization. |
| `src/data/featuresContent.ts` Industries block ("Real Estate", "Property Management") | "Consistent documentation across units and turnovers, with repair and vendor history per property" | Industry framing | No; reuse the vocabulary. |
| `src/pages/Partnership.tsx:80,259` | "homeowners, renters, business, and landlords"; "Comprehensive documentation for rental properties and tenant management" | Partnership/B2B | Low. **"tenant management" is a boundary risk** — reads like property-management software. Worth a wording fix when `/landlords` launches. |
| `src/pages/DigitalDocumentationGuide.tsx:199` | "**Landlords & Investors:** Move-in/out documentation, asset depreciation" | Informational guide | Low SEO overlap, but "asset depreciation" is tax-adjacent language that conflicts with section AB. Recommend rewording in the same pass. |
| `src/pages/B2BOpportunities.tsx:180` | "especially strong for high-end rentals" | B2B | No. |
| `src/components/DocumentProtectSection.tsx:91` (homepage) | "Built for: Homeowners • Renters • Families • Property owners • Small businesses" | Audience list | No; natural anchor for a future contextual link. |
| `src/pages/Scenarios.tsx:189` | "property owners, renters, and business professionals" | CTA copy | No. |
| `src/pages/Renters.tsx` | Renter-first copy; the only occurrence of "landlord" is absent — condition copy is written as "a record you keep for yourself" | Renter-side | No. Boundary already clean. |
| `src/pages/BlogPost.tsx:40,47` | "Rental or lease agreements"; renters link | Informational | No; possible owner-side sentence later. |
| `src/pages/Glossary.tsx` | "Move-In/Move-Out Condition" (now links `/renters`) | Definition | Minor: one glossary entry can only link one page — keep it on `/renters`. |

No occurrences found of "landlord inventory", "tenant turnover" (owner-side), "multi-property documentation", or "rental property records" as standalone public content. Landlord intent is unowned outside the `/features` tab.

## C. Keyword / Demand Findings

Third-party Semrush estimates, US database — not verified Google data.

- `rental property inventory` — 30/mo, KD 3, CPC $4.07 (low volume, high commercial signal).
- `rental property inspection` — 260/mo, KD 26, CPC $3.26.
- `inspecting a property` 1,900/mo; `apartment inspection` 1,000/mo; `rental inspection checklist` 720/mo (KD high competition); `apartment inspection checklist` 590/mo; `move in inspection contract with tenant` 480/mo; `apartment walkthrough checklist` 390/mo.
- `inventory and condition form` / `inventory condition form` 210/mo each; `move in condition form` 90/mo; `rental inventory` 90/mo (CPC $6.67); `property inventory` 140/mo; `vacation rental inventory checklist pdf` 170/mo.
- `landlord record keeping` — 20/mo, KD 0; question cluster "how long do landlords keep rental/tenant records" 20–40/mo each.
- No Semrush data returned for `landlord inventory app`, `rental property inventory app`, `landlord document management`, or `tenant turnover checklist` — treat as very low/untracked.
- Notable: a large share of the surrounding demand is **form/checklist/template** intent (`inventory and condition form`, `rental inspection checklist`, `...pdf`) and **state-law question** intent (`california move in inspection`, "how much notice to inspect", "how often can a landlord inspect"). Both are outside the approved scope — do not chase them on this page.

Reading: pure "landlord inventory app" demand is thin. The realistic ranking targets are `rental property inventory`, `rental property inspection`, `property inventory`, `rental property documentation`, and the record-keeping question cluster. Expect `/landlords` to win on low-competition, high-CPC commercial terms rather than volume.

## D. Search Console Findings

No Google Search Console connection is linked to this project (`no_project_connection` for `getassetsafe.com`). No verified impressions, clicks, CTR, position, or landing-page data for landlord, rental property, inspection, move-in/move-out, repair, maintenance, improvement, or rental-records queries. All demand data in C is third-party estimate only. Connecting Search Console before Phase 4 would materially improve targeting.

## E. Primary /landlords Search Intent

Commercial/solution intent from an owner of one or more rental properties who wants a single organized place for each property's documentation: condition at turnover, repairs and improvements with receipts, appliances and fixtures with serials and warranties, and supporting records — without buying property-management software.

## F. Search-Intent Ownership Map

The proposed separation is sound:

- `/landlords` — owner-side property documentation history, per property
- `/renters` — renter belongings + condition of a property they occupy
- `/home-inventory` — general personal home inventory
- `/asset-documentation` — what information to document
- `/photography-guide` — photography technique
- `/claims` — insurance claim documentation
- `/scenarios` — loss/event scenarios

## G. Cannibalization Risks

1. **`/renters` (highest)** — both pages cover move-in/move-out condition. Prevention: perspective and vocabulary split (see O); `/landlords` never says "your belongings" or "the place you rent".
2. **`/features` Landlords tab** — same capability list. Prevention: `/landlords` is search-intent copy, the tab stays a feature summary; single contextual link between them.
3. **`/asset-documentation`** — recordkeeping framework. Prevention: `/landlords` summarizes owner-specific applications only and links out.
4. **`/photography-guide`** — condition photos. Prevention: what to capture per unit, no technique.
5. **`/home-inventory`** — furnished-rental contents. Prevention: link only from the included-property section, if at all (see P).
6. **Drift into checklist/template intent** — the demand exists but a form/PDF page is a separate decision, not this page.
7. **Drift into landlord-tenant law** — hard boundary; the question demand is real and must be declined.

## H. Core Landlord Value Proposition

The hypothesis holds with one adjustment: multi-property should rise, because "one account, every property" is the clearest differentiator from a single-home inventory tool and is already the product's own landlord headline.

Recommended order:
1. A documented history for each property (lead)
2. Property condition, including move-in/move-out records
3. Repairs, maintenance, and improvements with receipts (strongest differentiator — see L)
4. Multi-property organization
5. Appliances, fixtures, and included property
6. Insurance preparedness (secondary, short)

## I. Multi-Property Positioning

Highlight strongly but structurally, not operationally. Safe: a separate profile per property; rooms, items, and records scoped to each address; documentation kept separated per rental; the same structure repeated across several properties; unlimited property entries (already true in-product). Avoid: portfolio accounting, rent roll, occupancy, vacancy, automation, CRM, "manage your portfolio". Preferred phrasing: "one account, a separate documented profile for each property".

## J. Move-In / Move-Out Positioning

Frame as **the owner's own property history**, not an inspection procedure: document unit condition before occupancy, photograph included appliances and fixtures, record existing condition and wear, document condition again after move-out, and compare your own records across time. Avoid: tenant liability, deposit deductions, "inspection requirements", notice periods, state obligations, or anything that reads as a legal inspection workflow. Prefer "condition records" and "documentation" over "inspection" in headings, while allowing "inspection" in body copy where it is the natural word.

## K. Security-Deposit / Dispute Recommendation

**MINIMIZE** — one short paragraph inside a broader "if questions come up" framing, not its own major section and not in the title/H1/meta. Acceptable: dated condition documentation available; your own repair and condition records; clearer records if questions arise. Excluded: permissible deductions, statutory deadlines, withholding, tenant liability, legal proof, state law. Include the same one-line disclaimer used on `/renters`: Asset Safe is a documentation tool and does not provide legal advice.

## L. Repairs / Improvements / Maintenance Positioning

Treat as the page's strongest differentiator and give it the most space after the lead: repair history, maintenance records, before/after photos, receipts and invoices, warranties, improvements and renovations, appliance replacements, paint codes and product sources — per property. The product already ships Upgrades & Repairs, Documents & Records, Paint Codes, Source Websites, Trusted Professionals, and Smart Calendar, so every claim is supported. State the boundary in-line once: Asset Safe organizes the documentation; it does not dispatch contractors or run work orders.

## M. Included Property / Inventory Positioning

One section summarizing owner-owned items in a rental — appliances, fixtures, provided furnishings, equipment, keys and accessory items where relevant — with serial/model numbers, warranties, receipts, and condition. Keep it to a compact list plus one link to `/asset-documentation` for the full framework; do not restate that framework.

## N. Insurance Positioning

Secondary and short: organized property, repair, and contents documentation may be useful when preparing a property-related insurance claim. Link `/claims` (primary) and `/scenarios` (loss context). No landlord insurance products, coverage, limits, deductibles, exclusions, or reimbursement expectations. Never in title, H1, or meta.

## O. Relationship to /renters

Perspective is the entire distinction. Vocabulary discipline:

| Concept | `/renters` wording | `/landlords` wording |
|---|---|---|
| The property | "your rental", "the place you rent" | "your rental property", "each unit", "the property you own" |
| Contents | "your belongings" | "appliances, fixtures, and included property you own" |
| Condition record | "a record you keep for yourself" | "your property's documented history" |
| Timing | "when you move in / move out" | "before occupancy / after move-out / at turnover" |
| Scope | one home | one property or several |

Reciprocal linking: yes, one contextual link each way — `/landlords` → `/renters` only where a sentence genuinely serves owners ("renters documenting their own side"), and one line added to `/renters` pointing owners to `/landlords`. `/renters` is not otherwise rewritten.

## P. Relationship to /home-inventory

Do not link by default. `/asset-documentation` is the stronger and more accurate outbound target for owner-owned contents. Include a single `/home-inventory` link only inside the furnished-rental/included-property sentence, where an item-level inventory method is genuinely the next step. No reciprocal `/home-inventory` → `/landlords` link — that page's intent is personal, and it already carries a `/renters` link.

## Q. Relationship to /asset-documentation

`/asset-documentation` keeps "what information should be documented". `/landlords` gives property-owner-specific applications (per-unit condition, repair history, appliance records) and links out once or twice for the framework. No new documentation framework, no restated checklists.

## R. Relationship to /photography-guide

`/landlords` lists what to capture per unit — wide room views, walls/floors/ceilings, appliances and fixtures, existing wear and damage, serial/model labels, before/after repair sets, matching turnover sets — and links once to `/photography-guide` for technique (lighting, framing, readable documents, video walkthroughs).

## S. Property-Management Software Boundary

Terminology that would falsely imply property-management software: rent collection, rent roll, tenant portal, tenant management, work orders, maintenance dispatch, leasing, lease e-signature, applicant/tenant screening, accounting, bookkeeping, ledger, CRM, vacancy marketing, occupancy, arrears, notices, evictions, automation/workflow.

Recommended handling: one short positive-framing section ("How Asset Safe fits alongside property management") that says Asset Safe is the documentation layer — property records, condition history, repairs, improvements, receipts, and warranties — and works alongside whatever a landlord already uses for leasing and rent. One sentence naming the boundary ("it isn't leasing, rent, or accounting software") is enough; do not enumerate every absent feature.

Also worth fixing in the same pass: `Partnership.tsx:259` "tenant management" and `DigitalDocumentationGuide.tsx:199` "asset depreciation".

## T. Recommended Page Structure

| # | Section | Purpose | Intent | Overlap risk | Contextual links |
|---|---|---|---|---|---|
| 1 | Hero | Owner identity + documented-history promise; two CTAs | Commercial | none | `/pricing`, `/sample-dashboard` |
| 2 | Why rental-property documentation matters | Frame memory-vs-record problem across years and tenancies | Commercial/informational | low | — |
| 3 | One organized record for each property | Property profile model, lead pillar | Commercial | `/features` | `/features` |
| 4 | Document property condition | Room/area condition capture, what to photograph | Condition | `/photography-guide` | `/photography-guide` |
| 5 | Move-in and move-out records | Owner-side turnover documentation | Move-in/out | `/renters` (perspective split) | `/renters` |
| 6 | Appliances, fixtures, and included property | Owner-owned items, serials, warranties | Commercial | `/asset-documentation` | `/asset-documentation`, optional `/home-inventory` |
| 7 | Repairs and maintenance history | Differentiator; receipts, invoices, before/after | Commercial | low | `/features` |
| 8 | Improvements and renovations | Upgrade history and cost records per property | Commercial | low | — |
| 9 | Receipts, warranties, and supporting records | Keep paperwork with the property record | Commercial | `/asset-documentation` | `/asset-documentation` |
| 10 | Multiple properties, one account | Multi-property structure (safe wording per I) | Commercial | none | — |
| 11 | Insurance preparedness | Short, hedged | Insurance-adjacent | `/claims` | `/claims`, `/scenarios` |
| 12 | If questions come up | Minimized deposit/dispute framing + legal-advice disclaimer | Dispute | compliance, not SEO | — |
| 13 | How Asset Safe fits alongside property management | Boundary statement | Commercial | none | `/features` |
| 14 | Related guidance | Relationship block | Navigational | low | `/asset-documentation`, `/photography-guide`, `/renters`, `/resources` |
| 15 | FAQ (visible, 8) | Long-tail + FAQPage schema | Informational | low | contextual |
| 16 | Closing CTA | Conversion band (Phase 3 pattern) | Commercial | none | `/pricing`, `/sample-dashboard` |

## U. SEO Title Candidates

1. `Rental Property Documentation for Landlords | Asset Safe` — 56
2. `Landlord Property Records & Condition Documentation | Asset Safe` — 64 (over 60; use only if trimmed)
3. `Document Your Rental Properties | Asset Safe` — 44

Recommended: #1 — owner intent explicit, documentation-first, no software or insurance implication, under 60.

## V. Meta Description Candidates

1. 153 — "Keep a documented history for every rental you own: condition records, repairs, improvements, appliances, receipts, and warranties organized by property."
2. 153 — "Landlords can document each rental property in one place — unit condition, move-in and move-out records, repairs, improvements, receipts, and warranties."
3. 160 — "Organize documentation for one rental or several: property condition, appliances and fixtures, repair and improvement history, receipts, and supporting records."

Recommended: #2 — names the audience, covers condition + turnover + repairs, no management-software implication.

## W. H1 Candidates

1. `Documentation for Every Rental Property You Own` — 47
2. `Keep a Documented History for Each Rental Property` — 50
3. `Rental Property Documentation, Organized by Property` — 52

Recommended: #2 — matches the lead pillar; audience framing lives in the eyebrow label ("For landlords"), consistent with `/renters` and `/home-inventory`.

## X. FAQ Recommendations (8 visible, informational, non-legal)

1. What records should landlords keep for each rental property?
2. How should a landlord document a property's condition?
3. Should landlords photograph a rental before someone moves in?
4. What property items should be documented in a rental?
5. How can landlords keep repair and improvement records organized?
6. Can Asset Safe organize more than one rental property?
7. Is property documentation useful when preparing an insurance claim? (hedged: may help when preparing)
8. Does Asset Safe replace property-management software? (answer: no — documentation layer, works alongside)

Deliberately excluded despite demand: retention periods ("how long must landlords keep records"), notice/entry rules, deposit deductions — all legal.

## Y. Internal-Link Plan

**Inbound (recommend, always-visible contextual, one each):** `/features` Landlords audience tab (strongest), `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`, `/resources` (new card), `/renters` (one owner-facing line), plus a `SearchService.ts` entry. Optional and lower priority: `Partnership.tsx` (in place of the "tenant management" wording), `/qa`. Skip: homepage body, `/home-inventory`, `/glossary` (its Move-In/Move-Out entry already points to `/renters`), blog posts unless a sentence genuinely fits.

**Outbound from `/landlords`:** `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`, `/features`, `/resources`, `/renters`, `/pricing`, `/sample-dashboard`; `/home-inventory` only inside the included-property sentence. One contextual link each, no repetition.

## Z. Structured-Data Recommendation

`BreadcrumbList` (Home → Resources → Landlords) plus `FAQPage` from the visible 8-item array, using the existing `breadcrumbSchema` / `faqSchema` helpers passed to `SEOHead` as an `@graph` — identical to `/renters` and `/home-inventory`. Excluded: RealEstateAgent, LegalService, Review, AggregateRating, Product, SoftwareApplication.

## AA. CTA Recommendation

Keep the Phase 3 pattern unchanged: primary `Get Started` → `/pricing`, secondary `View Sample Dashboard` → `/sample-dashboard`, repeated in the closing band after the FAQ. No onboarding, pricing, or checkout changes.

## AB. Compliance / Claims Boundaries

Avoid: landlord-tenant legal advice; deposit deduction rules; tenant liability conclusions; state landlord/tenant law; eviction guidance; required inspection procedures or notice periods; guaranteed insurance reimbursement or faster/larger claims; property-value or appraisal guarantees; tax advice, depreciation, or deduction claims; invented statistics or case studies; unshipped AI features; "SOC 2 Compliant".

Safe alternatives: "your own dated records", "a documented history you keep", "clearer records if questions arise", "may be useful when preparing a claim", "records organized by property", "SOC 2–aligned practices", and the explicit line "Asset Safe is a documentation tool and does not provide legal advice."

## AC. Exact Existing Files That Would Need Changes

| File | Relevant existing wording | Proposed modification purpose |
|---|---|---|
| `src/pages/Landlords.tsx` | does not exist | new page |
| `src/App.tsx` | route table (`/renters`, `/home-inventory` pattern) | register `/landlords` |
| `public/sitemap.xml` | 36 `<loc>` entries | add `/landlords` → 37 |
| `src/services/SearchService.ts` | `renters` and `home-inventory` entries | add a Landlords entry (category `help`) |
| `src/pages/Features.tsx` + `src/data/featuresContent.ts:485-517` | "For Landlords" audience tab | one contextual link, mirroring the renters tab pattern |
| `src/pages/Resources.tsx` | resource card list incl. Renters | add a Landlords card |
| `src/pages/AssetDocumentation.tsx:89` | existing renters sentence | add one owner-side sentence |
| `src/pages/PhotographyGuide.tsx` | move-in/move-out + renters link | one owner-side link |
| `src/pages/Claims.tsx` | renters sentence under the claim intro | one owner-side link |
| `src/pages/Scenarios.tsx:189` | "property owners, renters, and business professionals" | one contextual link |
| `src/pages/Renters.tsx` | renter-side condition copy | one line pointing owners to `/landlords`; no repositioning |
| `src/pages/Partnership.tsx:259` | "rental properties and tenant management" | reword away from management-software implication; optional link |
| `src/pages/DigitalDocumentationGuide.tsx:199` | "Landlords & Investors: … asset depreciation" | remove the tax-adjacent phrase; optional link |

No rewrites of verified Phase 2 or Phase 3 pages — single-sentence insertions only.

## AD. Sitemap / Navigation Recommendation

Sitemap: 36 → **37** unique URLs, indexable, self-canonical `https://getassetsafe.com/landlords`, no fabricated `lastmod`. No existing URL needs removal or noindex in this phase; Phase 2 redirects and requirements-page noindex stay as they are.

Navigation: your preference is correct and consistent with `/home-inventory` and `/renters` — keep `/landlords` out of the primary Navbar and out of the footer as an individual entry. Discovery via `/resources`, contextual links, `SearchService`, and sitemap has already proven sufficient for two Phase 3 pages. Revisit a grouped "Who it's for" / Solutions menu only once Landlords and Small Business both exist, so the group launches with three or more entries rather than one.

## AE. Product-Owner Decisions Required Before Codex Implementation

1. Approve the URL `/landlords` (vs `/rental-property-documentation`).
2. Pick title, meta, and H1 from U/V/W.
3. Confirm the pillar order in H (documentation history → condition/turnover → repairs → multi-property → included property → insurance).
4. Confirm deposit/dispute content is MINIMIZED per K (or omitted entirely).
5. Confirm the "fits alongside property management" section is included, and approve its one-sentence boundary statement.
6. Approve the 16-section structure in T.
7. Decide whether `/home-inventory` is linked at all from `/landlords` (recommendation: only in the included-property sentence).
8. Approve the reciprocal `/renters` ↔ `/landlords` links.
9. Approve the two boundary wording fixes in `Partnership.tsx` and `DigitalDocumentationGuide.tsx` as part of this phase, or defer them.
10. Confirm form/checklist/template intent and landlord-tenant law questions stay out of scope (a checklist asset would be a separate future page).
11. Decide whether to connect Google Search Console before Phase 4, since no verified query data exists today.
