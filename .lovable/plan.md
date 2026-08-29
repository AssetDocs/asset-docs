# Phase 3B — Renters Acquisition Page Planning Audit (AUDIT ONLY)

No files changed. No routes created. No page written.

## A. Executive Recommendation

Build `/renters` as a single commercial/category page owning one intent no existing page owns: **documenting personal belongings AND the condition of a rental you do not own**. Lead with the dual-record idea (what you own + how the unit looked), keep security deposit and renters insurance as supporting sections with hedged, non-legal wording, and route all detail to `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`. Contextual links only — no Navbar change. Sitemap goes 35 → 36.

## B. Existing Renter Content Footprint

Verified occurrences on public surfaces:

| Location | Visible wording | Intent | Competes with /renters? |
|---|---|---|---|
| `src/data/featuresContent.ts:417-448` (renders on `/features` as the "Renters" audience tab) | "For Renters", "Your belongings and your condition record travel with you", move-in/move-out condition, lease + renter policy paperwork | Product/feature framing for renters | Closest thing to a renter page today, but it is a tab inside `/features` — not indexable as its own URL. No cannibalization; it becomes the strongest inbound link source. |
| `src/components/DocumentProtectSection.tsx:9,91` (homepage) | "Property profiles (homes, rentals, vacation properties)"; "Built for: Homeowners • Renters • Families • Property owners • Small businesses" | Brand audience list | No. Natural inbound link anchor. |
| `src/pages/PhotographyGuide.tsx:134,179` | "move-in or move-out condition"; "Document move-in, move-out, and renovation condition" | Informational, how to photograph | No. Owns technique. |
| `src/pages/Glossary.tsx:47` | "Move-In/Move-Out Condition" definition | Definition | No. |
| `src/pages/HomeInventory.tsx:45` | FAQ mentions keeping records for "a rental" | General inventory | Minor; keep. |
| `src/pages/Scenarios.tsx:189` | "property owners, renters, and business professionals" | Loss-event CTA copy | No. |
| `src/pages/BlogPost.tsx:40,56` | "Rental or lease agreements", "Renters insurance policies" (document-checklist post) | Informational list | No; add contextual link. |

**Current strongest page for renter searches:** none. `/features` (Renters tab) is the only renter-specific content and it is not a standalone URL. Renter intent is unowned.

## C. Keyword / Demand Findings (Semrush third-party estimates, US)

- `home inventory app` 1,000/mo, KD 21, CPC $1.20; `home inventory` 1,300/mo — already owned by `/home-inventory`.
- `moving out checklist` 1,900/mo; `move in checklist` 1,300/mo; `move out checklist` 1,300/mo; `tenant move out checklist` 1,300/mo; `rental inspection checklist` 720/mo (KD high-competition); `apartment inspection checklist` 590/mo; `apartment move out checklist` 590/mo; `move in inspection checklist` 390/mo, KD 33.
- `renters insurance inventory` only 20/mo; question variants 0–10/mo.
- No Semrush data returned for `apartment inventory app`, `renters inventory`, or `security deposit documentation` — treat as very low/untracked volume, not as zero opportunity.

Reading: the renter demand pool is **move-in/move-out condition**, not "renters inventory app". Checklist-phrased queries carry the volume, but the brief forbids a generic checklist page — so `/renters` should target the *documentation* framing of those queries and any future checklist asset stays a separate decision.

## D. Search Console Findings

No Google Search Console connection is linked to this project (`no_project_connection` for `getassetsafe.com`). No verified impressions, clicks, CTR, position, or landing-page data available. All demand figures above are third-party estimates only.

## E. Primary /renters Search Intent

Commercial/solution intent from a renter who wants one place to hold (1) a personal belongings inventory and (2) dated condition records of a unit they lease. Secondary: move-in/move-out documentation intent. Tertiary: deposit-disagreement preparedness and renters-insurance claim preparation.

## F. Search-Intent Ownership Map

The proposed separation is sound as written:

- `/renters` — renter category page: belongings + rental condition
- `/home-inventory` — general home inventory app/category
- `/asset-documentation` — what to document
- `/photography-guide` — how to photograph
- `/claims` — insurance claim documentation
- `/scenarios` — fire, theft, storm, water loss events
- future `/landlords` — ownership-side, multi-property

## G. Cannibalization Risks and Prevention

1. **/home-inventory overlap** — highest risk. Prevention: `/renters` never uses "home inventory app" in title/H1/meta, keeps its belongings section short, and links out for the full inventory method.
2. **/photography-guide overlap** — `/renters` explains *why* photos matter and *what* to capture in a rental; no lighting/technique instruction.
3. **/asset-documentation overlap** — `/renters` gives a renter-filtered summary only, links for the full framework.
4. **/claims overlap** — no record checklists for claims on `/renters`; one link.
5. **Future /landlords** — no owner-side terminology (see L).
6. **Drift into tenant-rights content** — hard boundary; no statutes, no deadlines, no rights language.

## H. Core Renter Value Proposition

Weight roughly 45/45 with condition documentation leading the hook, because it is the differentiator versus every generic inventory app and matches where the demand sits:

1. Lead: documenting the rental as you found it (rooms, walls, floors, appliances, existing damage), dated.
2. Equal partner: documenting belongings (photos, receipts, values, serials, warranties).
3. Supporting: maintenance concerns and repairs over the tenancy; move-out condition; receipts/records kept with the items.

## I. Security-Deposit Positioning

Include one modest section, conceptual only. Safe framing: "a dated visual record of how the unit looked when you moved in", "your own copy of maintenance requests and responses", "an easier move-in vs move-out comparison", "clearer documentation available if a disagreement comes up". Explicitly avoid guarantees, liability/proof claims, admissibility, jurisdiction-specific rules, or any obligation on a landlord. Add a plain line that Asset Safe is a documentation tool and not legal advice.

## J. Renters Insurance Positioning

One short section, never the page identity. Permitted: documenting belongings, values, and receipts can make preparing a renters-insurance claim easier. Forbidden: coverage limits, deductibles, exclusions, policy interpretation, payout expectations. Links: `/claims` (primary), `/scenarios` (loss events), `/home-inventory` (method).

## K. Relationship to /home-inventory

Boundary is sufficiently distinct: `/home-inventory` answers "how do I create and maintain an inventory of what I own?"; `/renters` answers "how do I document my belongings *and* the condition of a place I rent?". Link both ways: `/renters` → `/home-inventory` from its belongings section; `/home-inventory` → `/renters` from one contextual line (not a nav block). `/home-inventory` content is otherwise untouched.

## L. Relationship to Future /landlords

Reserve for `/landlords`: landlord, property manager, portfolio/multi-property management, tenant turnover, tenant screening, rent, lease enforcement, unit-by-unit owner records, capital improvements, ROI. `/renters` speaks only in the renter's first person ("your unit", "your belongings", "the condition you found"). No `/landlords` design in this phase.

## M. Relationship to /asset-documentation

`/asset-documentation` keeps "what information should I document?". `/renters` carries a compact renter-relevant summary (item identity, receipts, values, serials, condition) with a link out, and adds no new documentation framework of its own.

## N. Relationship to /photography-guide

`/renters` lists *what to capture in a rental* — wide room views, walls/floors/ceilings, appliances and fixtures, existing marks and damage, belongings, serial/model labels, and a matching move-out set — and states why dated visuals help. All technique (lighting, framing, readable documents, video walkthroughs) stays on `/photography-guide`, linked once from the condition section.

## O. Recommended Page Structure

| # | Section | Purpose | Intent | Overlap risk | Internal link |
|---|---|---|---|---|---|
| 1 | Hero | Renter identity + dual record promise, primary/secondary CTA | Commercial | none | `/pricing`, `/sample-dashboard` |
| 2 | Why renters document more than belongings | Frame the differentiator | Commercial/informational | low | — |
| 3 | Document your belongings | Items, photos, receipts, values, serials | Commercial | `/home-inventory` (keep short) | `/home-inventory` |
| 4 | Document the rental at move-in | Room-by-room condition capture | Move-in | `/photography-guide` | `/photography-guide` |
| 5 | Record existing damage and condition | Pre-existing marks, dated records | Move-in / deposit | low | — |
| 6 | Maintenance concerns and repairs | Ongoing tenancy record | Informational | low | `/features` |
| 7 | Receipts, records, communications | Keep paperwork with items | Commercial | `/asset-documentation` | `/asset-documentation` |
| 8 | Prepare for move-out | Matching move-out set, comparison | Move-out | low | — |
| 9 | If a deposit disagreement comes up | Hedged deposit positioning | Deposit | compliance, not SEO | — |
| 10 | Renters insurance preparedness | Short, hedged | Insurance-adjacent | `/claims` | `/claims` |
| 11 | Moving or unexpected loss | Relocation + loss events | Informational | `/scenarios` | `/scenarios` |
| 12 | How Asset Safe organizes it | Property → room → item, Knowledge Hub, Secure Vault | Commercial | `/features` | `/features` |
| 13 | Related guidance | Explicit relationship block | Navigational | low | `/home-inventory`, `/asset-documentation`, `/resources` |
| 14 | FAQ (visible) | Long-tail questions + FAQPage schema | Informational | low | contextual |
| 15 | Closing CTA | Conversion band (matches Phase 3A pattern) | Commercial | none | `/pricing` |

Drop nothing; sections 9 and 10 stay deliberately short.

## P. SEO Title Candidates

1. `Renter Inventory App | Document Your Apartment | Asset Safe` — 59
2. `Document Your Apartment & Belongings | Asset Safe` — 49
3. `Apartment Inventory & Move-In Documentation | Asset Safe` — 56

Recommended: #3 (renter intent obvious, avoids "home inventory" collision, no legal/insurance lead).

## Q. Meta Description Candidates

1. 149 chars — "Document your belongings and your rental's condition in one secure place. Photos, receipts, values, and move-in and move-out records with Asset Safe."
2. 156 chars — "Renters can record what they own and how the apartment looked at move-in, then keep receipts, maintenance notes, and move-out photos organized in one place."
3. 153 chars — "Build a renter inventory with photos, receipts, and values, and keep dated move-in and move-out condition records for your apartment in one secure place."

Recommended: #1 (under 160, no legal/insurance implication).

## R. H1 Candidates

1. `Document Your Belongings and Your Rental's Condition` — 52
2. `Asset Safe for Renters` — 22
3. `A Renter's Record of What You Own and How You Found It` — 54

Recommended: #1 — search-oriented and brand-clear; brand framing lives in the eyebrow label ("For renters"), as `/home-inventory` does.

## S. FAQ Recommendations (visible, informational, non-legal)

1. What should renters document when moving into an apartment?
2. Should I photograph a rental before I move in?
3. What belongings should renters include in an inventory?
4. How should I document damage that was already there?
5. Can documentation help if there is a disagreement about a security deposit? (hedged: helps you have a dated record available; no guarantee, no legal claim)
6. Should I keep my own copy of maintenance requests?
7. Is a belongings inventory useful for renters insurance? (hedged: useful when preparing a claim)
8. How often should renters update their documentation?

## T. Internal-Link Plan

**Inbound (contextual, always-visible):** `/features` Renters audience tab, `/home-inventory` (one line in the property/rooms section), `/asset-documentation`, `/resources` hub grid, `/photography-guide` (move-in/move-out mention), `/claims`, `/glossary` (Move-In/Move-Out Condition entry), the documents-checklist blog post, plus `SearchService.ts` for on-site search. Skip: homepage body, `/qa`, `/scenarios` unless a sentence genuinely fits.

**Outbound from `/renters`:** `/home-inventory`, `/asset-documentation`, `/photography-guide`, `/claims`, `/scenarios`, `/features`, `/pricing`, `/sample-dashboard`, `/resources` — one contextual link each, no repetition.

## U. Structured-Data Recommendation

`BreadcrumbList` (Home → Resources → Renters) plus `FAQPage` built from the visible FAQ array, using the existing `breadcrumbSchema` / `faqSchema` helpers in `src/utils/structuredData.ts` and passed through `SEOHead` as an `@graph`, exactly as `/home-inventory` does. No Review, AggregateRating, Product, LegalService, or SoftwareApplication.

## V. CTA Recommendation

Keep the Phase 3A hierarchy unchanged: primary `Get Started` → `/pricing`, secondary `View Sample Dashboard` → `/sample-dashboard`, repeated in a closing CTA band after the FAQ. Payment-first onboarding untouched.

## W. Compliance / Claims Boundaries

Avoid: deposit-return guarantees; "proof"/"legal proof"/admissibility; tenant-rights or state deposit-law statements; landlord obligations; guaranteed insurance reimbursement, faster claims, larger payouts, or claim approval; appraisal, tax, or legal advice; invented statistics or case studies; unshipped AI capabilities; "SOC 2 Compliant". Safe alternatives: "a dated record you keep yourself", "documentation available if a disagreement comes up", "easier to prepare a claim", "records organized in one place", and "SOC 2–aligned practices".

## X. Exact Existing Files That Would Need Changes

| File | Current relevant copy | Proposed purpose |
|---|---|---|
| `src/pages/Renters.tsx` | does not exist | new page |
| `src/App.tsx` | route table (Home Inventory pattern) | register `/renters` |
| `public/sitemap.xml` | 35 `<loc>` entries | add `/renters` → 36 |
| `src/services/SearchService.ts` | `home-inventory` entry (lines 86-93) | add a Renters search entry |
| `src/pages/Features.tsx` / `src/data/featuresContent.ts:417-448` | "For Renters" audience tab | one contextual link to `/renters` |
| `src/pages/HomeInventory.tsx` | rooms/properties section; FAQ mentions "a rental" | one contextual link, no restructure |
| `src/pages/AssetDocumentation.tsx` | practical property-records framing | one renter-context link |
| `src/pages/Resources.tsx` | resource/navigation grid incl. Home Inventory | add Renters card |
| `src/pages/PhotographyGuide.tsx:134,179` | move-in/move-out condition mentions | one link |
| `src/pages/Claims.tsx` | claim record lists | one renter link |
| `src/pages/Glossary.tsx:47` | Move-In/Move-Out Condition definition | link the definition |
| `src/pages/BlogPost.tsx:40,56` | lease agreements / renters insurance policies list | one contextual link |
| `src/components/EducationalResources.tsx` | resource link list | optional single entry |

No Phase 2 page rewrites; single-sentence link insertions only.

## Y. Sitemap / Navigation Recommendation

Sitemap: 35 → **36** unique URLs, indexable, self-referencing canonical `https://getassetsafe.com/renters`. No existing URL removed or noindexed in this phase; Phase 2 redirects and requirements-page noindex stay as-is. Navigation: keep out of the primary Navbar (consistent with `/home-inventory`); place in `/resources`, optionally the footer resources column, and rely on contextual links.

## Z. Product-Owner Decisions Required Before Codex Implementation

1. Approve URL `/renters` (vs `/renters-inventory` or `/apartment-inventory`).
2. Pick title, meta, and H1 from P/Q/R.
3. Confirm condition documentation leads over belongings (H).
4. Confirm the security-deposit section is included at the hedged scope in I — or omitted entirely.
5. Confirm the renters-insurance section stays to a single short block.
6. Approve the 15-section structure in O and whether 9/10 are kept.
7. Approve footer placement or contextual-links-only.
8. Confirm the "not legal advice" line may appear on the page.
9. Confirm whether a future move-in/move-out checklist asset is reserved for a separate page (it is excluded here).
