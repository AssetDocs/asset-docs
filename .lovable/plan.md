# Asset Safe SEO Phase 2 — Existing Content & Search-Intent Architecture Audit

Audit only. No files changed. No Phase 3 pages designed.

---

## A. Executive Summary

Phase 1 fixed how metadata is delivered. Phase 2 exposes a harder problem: **the metadata is now clean, but a large share of what it describes is about a different company than Asset Safe is today.**

Five findings drive everything else.

**1. The site's center of gravity is insurance, not documentation.** Of the 27 non-blog indexable URLs, at least eight are substantively insurance-industry content: `/claims`, `/scenarios`, `/industry-requirements`, `/state-requirements`, `/press-news`, `/glossary`, plus insurance framing inside `/photography-guide` and `/awareness-guide`. `/glossary` is 55 terms and the ones it leads with are *Policyholder, Claim, Premium, Deductible, Coverage Limit, Exclusion, Rider, Underwriting, Subrogation, Salvage Value* — that is an insurance dictionary, not an asset-documentation product's vocabulary. To a search engine building a topical model of this domain, Asset Safe currently looks like an insurance claims resource that also sells software.

**2. `/asset-documentation` targets the wrong audience entirely, and the previous audit's finding is confirmed unchanged.** The page still defines six accounting asset classes — Current/Liquid, Fixed, Tangible, Intangible, Operating, Non-Operating — with examples like *accounts receivable, marketable securities, brand reputation, trademarks, research & development*. Its opening body copy is about **mortgage lenders assessing net worth**. Its use-case cards are Loan Approvals, Mortgage Applications, Business Transactions, Business Liquidation. This page attracts accounting students, CFO-adjacent searchers, and mortgage applicants. None of them will ever buy Asset Safe. It also holds the exact URL slug that the product's single most important concept needs.

**3. `/press-news` contains fabricated journalism, and one item makes a specific, verifiably false legal claim.** The listing carries invented case studies with named individuals ("the Martinez family", "Jane Wilson", "Maria Santos"), invented statistics ("40% of claims delayed", "35% higher insurance payouts"), and invented authorities ("Insurance Research Institute", "Dr. James Mitchell", "Attorney Sarah Chang", bylined as **"FEMA Communications"**). One article states that **California Assembly Bill 2273 mandates stricter documentation requirements for property insurance claims**. AB 2273 is the California Age-Appropriate Design Code Act — a children's online-privacy law with no connection to insurance. This is not an SEO problem first; it is a credibility and liability problem that happens to also be an SEO problem. It is the single most urgent item in this audit.

**4. The internal-link graph is almost entirely footer navigation.** Across twelve Phase 2 routes there are exactly **three** contextual in-body links: `/claims` → `/photography-guide`, `/state-requirements` → `/glossary`, and the `/resources` hub's four cards. `/awareness-guide`, `/scenarios`, `/photography-guide`, `/asset-documentation`, and `/qa` contain **zero** outbound contextual links. Every blog post links only to `/pricing` — twelve times across the post bodies, and never once to an evergreen guide. Google has no signal about which of these pages is authoritative on anything.

**5. Cannibalization is real but narrower than expected.** `/claims` and `/scenarios` are better differentiated than the brief assumed — `/scenarios` is genuinely event-based, `/claims` is genuinely document-based. The severe overlap is elsewhere: **`/industry-requirements` duplicates `/claims`** (proof of loss, receipts, photos, inventory, appraisal, adjuster), and **`/press-news` duplicates `/claims` and `/scenarios`** across a dozen articles about claim denials and documentation failures.

The Phase 2 job is subtraction and reassignment, not writing. Roughly a third of the indexable surface should stop competing for search traffic so the pages that represent the actual product can own their intents.

---

## B. Current Existing-Content Architecture

The live sitemap advertises 37 URLs: 27 non-blog pages, 1 blog index, 9 blog posts. Grouped by what they actually are:

```text
PRODUCT / COMMERCIAL  (aligned with current positioning)
  /                       homepage — "Everything you love. Protected in one place."
  /features               Asset Documentation · Knowledge Hub · Secure Vault
  /pricing                one plan
  /legacy-locker-info     digital legacy + instructions
  /gift                   gifting
  /about  /contact  /testimonials  /social-impact  /sample-dashboard  /partnership

INSURANCE CONTENT CLUSTER  (the drift)
  /claims                 what documents an insurance claim needs
  /scenarios              which loss events require which records
  /industry-requirements  claims process, coverage levels, exclusions, rate-setting
  /state-requirements     state-by-state insurance variation
  /glossary               55 insurance / valuation terms
  /press-news             13 curated + fabricated insurance news items
  /press-news/digital-documentation-guide   product comparison article

DOCUMENTATION EDUCATION  (closest to the real product)
  /photography-guide      how to photograph belongings
  /asset-documentation    (mis-scoped: accounting asset classes)
  /awareness-guide        10 hidden home risks
  /resources              two-tab hub: Educational Resources | Security & Trust
  /qa                     FAQ accordion

BLOG
  /blog + 9 posts

UTILITY (noindexed in Phase 1 — correct, unchanged)
  /features-list  /video-help  /account-assistance
```

The imbalance is structural: **six full pages serve insurance-research intent; one under-built page (`/photography-guide`, ~2 min read) serves the documentation intent the product is actually named after.**

---

## C. Search-Intent Ownership Map

Hypotheses from the brief were tested against actual page content. Three confirmed, three rejected.

| Search intent | Canonical owner | Supporting pages | Currently competing | Should stop targeting |
|---|---|---|---|---|
| **Documenting belongings & property (core)** | **`/asset-documentation`** — *after repositioning; it does not serve this today* | `/photography-guide`, `/features` | `/press-news/digital-documentation-guide`, blog "Digital Home Inventory" | — |
| **Photographing belongings / condition evidence** | `/photography-guide` — **confirmed** | `/asset-documentation`, `/claims` | none | — |
| **Insurance claim documentation** | `/claims` — **confirmed** | `/glossary`, `/photography-guide` | **`/industry-requirements`**, ~8 press-news articles, blog "Documentation Speeds Up Claims" | `/industry-requirements`, `/press-news` |
| **Loss events (fire, theft, storm, water)** | `/scenarios` — **confirmed** | `/claims`, `/awareness-guide` | `/press-news` case studies, blog "Disaster Preparedness" | `/press-news` |
| **Home risk awareness / prevention** | `/awareness-guide` — **confirmed, and it is cleaner than expected** | `/scenarios` | blog "Disaster Preparedness Checklist" (partial) | — |
| **Educational hub / "asset safe guides"** | `/resources` — **confirmed as a hub, but it is navigation, not content** | `/blog` | `/blog` (weakly) | — |
| **Insurance terminology** | `/glossary` | `/claims` | none | — |
| **Insurance regulation by state** | **no owner should exist** | — | `/state-requirements` | `/state-requirements` |
| **Insurance industry process/coverage** | **no owner should exist** | — | `/industry-requirements` | `/industry-requirements` |
| **Insurance news** | **no owner should exist** | — | `/press-news` | `/press-news` |
| **Digital legacy / continuity** | `/legacy-locker-info` | blog "Estate Planning Digital Vault", "Legacy Locker" | — | — |
| **Product FAQ** | `/qa` | `/pricing` FAQ block | minor | — |

The two intents with **no page owning them today** are the two most valuable: *"how do I document what I own"* as a practical task, and *"home inventory"* as a category term. `/asset-documentation` holds the right URL for the first and is spending it on accounting theory.

---

## D. Page-by-Page Classification Table

| Page | Purpose today | Primary intent today | Matches product? | Depth | Classification |
|---|---|---|---|---|---|
| `/asset-documentation` | Explains accounting asset classes for lenders | Financial/accounting definitions | **No** | Medium (312 lines, wrong topic) | **REPOSITION / REWRITE** |
| `/claims` | What documents an insurance claim needs | Insurance claim prep | Supporting use case — yes | Medium, well-scoped | **LIGHT OPTIMIZATION** |
| `/scenarios` | Loss events and records each needs | Event-driven documentation | Supporting use case — yes | Medium, thin per-item | **LIGHT OPTIMIZATION** |
| `/industry-requirements` | Claims process, coverage levels, exclusions, rate-setting | Insurance industry research | **No** | Deep but off-topic | **NOINDEX** (interim) → RETIRE |
| `/state-requirements` | State-by-state insurance variation | Insurance regulation research | **No** | Deep, high maintenance | **NOINDEX** (interim) → RETIRE |
| `/press-news` | Curated + fabricated insurance news | Insurance news | **No — and factually unsafe** | 13 items, ~50 KB | **RETIRE** (urgent) |
| `/press-news/digital-documentation-guide` | DIY vs Asset Safe comparison | Product comparison | Yes | Good, genuinely useful | **REPOSITION** (move off `/press-news/`) |
| `/photography-guide` | 7 photo tips | Documentation how-to | Yes — best-aligned page | **Thin (~2 min read)** | **REPOSITION / REWRITE** (expand) |
| `/awareness-guide` | 10 hidden home risks | Prevention / maintenance | Yes, adjacent | Thin but coherent | **LIGHT OPTIMIZATION** |
| `/resources` | Two-tab hub, 4 cards + checklist | Navigation | Yes | **Very thin as a page** | **LIGHT OPTIMIZATION** |
| `/qa` | FAQ accordion + FAQPage schema | Product questions | Yes | Adequate | **KEEP AS-IS** |
| `/glossary` | 55 insurance/valuation terms | Insurance definitions | Partially | Deep | **LIGHT OPTIMIZATION** |
| `/blog` | Index of 9 posts | Blog browsing | Yes | Fine | **KEEP AS-IS** |
| 9 blog posts | See section L | Mixed | Mixed | Mixed | See section L |

---

## E. `/asset-documentation` Recommendation

**Finding: the accounting terminology is fully intact. Nothing from the earlier audit was addressed.**

Still present, verbatim:

| Card | Description | Examples given |
|---|---|---|
| Current/Liquid Assets | "converted into cash within a year" | Cash, inventory, **accounts receivable, marketable securities** |
| Fixed Assets | "cannot easily be converted into cash" | Real estate, **patents**, machinery, long-term investments |
| Tangible Assets | physical | Cash, office supplies, tools, equipment, furniture, vehicles |
| Intangible Assets | "no physical presence" | **Brand reputation, trademarks, patents, R&D** |
| Operating Assets | "generate ongoing revenue" | Equipment, patents, inventory, business real estate |
| Non-Operating Assets | — | Short-term investments, unused equipment, vacant land |

The meta description reinforces it: *"Understand asset categories: liquid, fixed, tangible, intangible, and operating assets."* Body copy leads with mortgage lenders and net worth. Use-case cards are Loan Approvals, Mortgage Applications, Shipping & Insurance, Business Transactions, Business Liquidation, Estate Planning. A later section contrasts "Asset Document" vs "Asset Statement" — a banking distinction.

**Wrong audience, confirmed.** Searchers for "types of assets" or "intangible assets" are students, bookkeepers, and finance professionals. They bounce. Worse, the page teaches Google that `getassetsafe.com` is topically about corporate finance.

**Intent this page should own:** the practical, high-value core question — *what should I document about the things I own, and what details matter*. Concretely: belongings, property, equipment, photos, videos, receipts, purchase information, values, serial numbers, appraisals, property records. This is also the natural home for the **"home inventory"** category term the site currently has no owner for.

**Recommendation: REPOSITION / REWRITE.** Keep the URL — it is the correct slug and Phase 1 already routed the fixed `/resources` link here. Replace the six accounting cards with the practical categories above. Retire the mortgage/lending/liquidation framing. Keep estate planning only as a one-line supporting mention, not a use-case card. This is the highest-value single rewrite in Phase 2.

---

## F. `/claims` vs `/scenarios` Recommendation

**Finding: these two are the *least* problematic pair in the audit. The hypothesized distinction already holds.**

| | `/claims` | `/scenarios` |
|---|---|---|
| H1 | Insurance Claims Documentation | Insurance Claim Scenarios |
| Organizing principle | **Document type** | **Event type** |
| Sections | Proof of Loss Statement · Photos & Videos · Item Inventory · Proof of Ownership · Repair Estimates · Official Reports · Additional Requirements | Natural Disasters · Man-Made Events / Other Insurable Incidents · Special Insurance Scenarios |
| Vocabulary concentration | receipt ×4, photos ×3, inventory ×3, proof of loss ×2, serial number ×2, appraisal | fire ×5, storm ×4, theft, vandalism, hurricane, flood |

The vocabulary profiles barely intersect — `/claims` is documents, `/scenarios` is events. That is exactly the intended split.

**Real issues, both minor:**

- **Title cannibalization, not content cannibalization.** Both titles begin with the insurance frame: `Claims Documentation | Asset Safe` and `Insurance Claim Scenarios | Asset Safe`. For the query *"insurance claim documentation"* Google sees two candidates. The fix is title-level differentiation — lead `/scenarios` with the event framing ("Fire, Theft, Storm & Water Damage") rather than the claim framing.
- **`/scenarios` is shallow per item.** Three category buckets covering many events means no single event (fire, water damage, theft) gets enough depth to rank for its own query. It reads as a list, not a resource.
- **The brief's "moving damage" is absent.** Neither page covers it.

**Missing links between them, in both directions:**
- `/scenarios` → `/claims` — a reader who identifies their event needs the document list next. **This link does not exist.** `/scenarios` has zero contextual outbound links; its only two links are `/auth` and `/pricing`.
- `/claims` → `/scenarios` — does not exist either. `/claims` links only to `/photography-guide`.

**Recommendation: LIGHT OPTIMIZATION for both.** Do not merge. Do not rewrite. Differentiate the titles, add the two reciprocal contextual links, and optionally deepen `/scenarios` per event. The real cannibalization threat to `/claims` is `/industry-requirements`, not `/scenarios`.

---

## G. Industry / State Requirements Recommendation

### `/industry-requirements` — **NOINDEX** (interim), **RETIRE** (target)

Content: claims-process steps, **Coverage Levels, Standard Coverage Includes, Common Exclusions, How Rates Are Determined**. Its vocabulary (receipt ×4, proof of loss ×3, appraisal ×2, adjuster, inventory, photos) is a near-copy of `/claims`.

Three independent problems:
1. **Directly cannibalizes `/claims`** on the intent `/claims` should own.
2. **Not Asset Safe's subject.** Explaining how insurers set rates and what policies exclude is insurance-carrier content. Searchers arriving on it want a policy, not a documentation product.
3. **Perpetual maintenance liability.** Coverage levels, standard inclusions, and exclusions change. Wrong statements here read as advice about someone's actual coverage.

The SEO value does not justify the burden — this page competes with carriers and comparison sites that will always outrank a documentation product on insurance-mechanics queries.

### `/state-requirements` — **NOINDEX** (interim), **RETIRE** (target)

Content: how requirements vary by state, "State-Specific Examples", a "Real-World Example", "Additional Provider Variables", and a "Know Your State" directive block.

Same three problems, more acutely:
1. **Highest maintenance burden on the site.** State insurance regulation changes continuously across 50 jurisdictions. Any stale statement is a factual error about law.
2. **Quasi-regulatory statements** from a company with no regulatory standing.
3. Named state examples create the strongest implicit legal-advice exposure of any page audited.

Its one redeeming feature — the contextual link to `/glossary` — is trivially preserved elsewhere.

**Why NOINDEX before RETIRE for both:** noindex is reversible and non-destructive. It stops the topical dilution and the cannibalization of `/claims` immediately, keeps the pages reachable for anyone with a link, and buys time to confirm in Search Console that neither page was quietly earning traffic. Retire once that is confirmed. **Do not `Disallow` them in robots.txt** — Phase 1 established that pattern correctly for the other three utility routes: crawlable, but noindexed.

---

## H. Press / News Recommendation

### `/press-news` (listing) — **RETIRE. Treat as urgent and separate from SEO.**

This is the most serious finding in the audit, and the SEO argument is the *second* reason to act.

**Content integrity.** The listing presents 13 items styled as journalism. Verified against the source:

| Article | Byline | Problem |
|---|---|---|
| "New California Law Requires Enhanced Documentation Standards for Insurance Claims" | "Legal Team" | **Factually false.** Claims AB 2273 "mandates stricter documentation requirements for property insurance claims." AB 2273 is the **California Age-Appropriate Design Code Act** — children's online privacy. Verified against leginfo.legislature.ca.gov and the Governor's 2022 signing statement. No relation to insurance. |
| "FEMA Updates Documentation Requirements for Disaster Relief" | **"FEMA Communications"** | Bylined as if authored by a federal agency. |
| "Insurance Industry Report: 40% of Claims Delayed…" | "Insurance Research Institute" | Statistic and institute both unverifiable. |
| "Study: Homeowners With Digital Documentation Receive 35% Higher Payouts" | "Dr. James Mitchell, Insurance Research Institute" | "University research" with no university, no study, no citation. |
| "Family Loses $50,000 After Fire Claim Denied…" | "Sarah Johnson" | Named family ("the Martinez family") in an unverifiable case study. |
| "Hurricane Victim's $75,000 Claim Rejected" | "Michael Chen" | Named individual ("Jane Wilson"). |
| "Small Business Owner Recovers $180,000…" | "Business Weekly" | Named individual ("Maria Santos"), publication-styled byline. |
| "Legal Expert: Why Courts Are Increasingly Requiring Digital Evidence" | "Attorney Sarah Chang, Insurance Law Specialist" | Legal opinion from an unverifiable attorney. |
| "Renters Win $25,000 Settlement…" | "Emma Rodriguez" | Unverifiable settlement figure. |
| "Tornado Survivors Share…" | "Disaster Recovery Network" | Unverifiable organization. |
| CBS 60 Minutes / Merlin Law Group item | "Chip Merlin" | The only entry citing a real, checkable source. |

This is invented statistics, invented experts, invented case studies with named people and dollar figures, a byline impersonating a federal agency, and a false statement about a specific numbered state law — all published on a commercial site as marketing support. Search-quality guidelines aside, this is a consumer-protection and defamation-adjacent exposure that no SEO consideration outweighs.

**Topical damage, secondary but real.** Thirteen insurance-news items with news-style categories (Breaking News, Legal Update, Industry Report, Case Study, Personal Story) is the single strongest signal on the domain that Asset Safe is **an insurance news publication**. It also duplicates `/claims` and `/scenarios` across roughly eight articles about claim denials and documentation failures.

**Recommendation:** retire the listing page and remove the fabricated articles from the codebase. Do not attempt to "reposition" it — the content cannot be salvaged by reframing, only by deletion or by sourcing every claim, which is not a realistic Phase 2 scope. Handle this ahead of the rest of Phase 2, and treat the AB 2273 statement as the immediate item.

### `/press-news/digital-documentation-guide` — **REPOSITION, and keep**

Evaluated independently, as instructed, and it grades out **completely differently**. It is a genuine product-comparison article — "Digital Asset Documentation vs. DIY Methods" (spreadsheets and phone photos), a comparison table covering proof of condition, timestamps and metadata, "Who Benefits", "The Asset Safe Advantage". Product-relevant, on-message, no fabricated statistics, and Phase 1 just gave it correct metadata.

Its only real defects are structural: it lives under a `/press-news/` parent that is being retired, and its visible title renders as `CardTitle`, not `<h1>` (see section P).

**Recommendation:** keep the content, move it to a durable URL outside `/press-news/` — `/asset-documentation` cluster or `/resources` — with a redirect from the current path, and give it a real `<h1>`. Sequence this **before** retiring the listing so the guide is never orphaned. Note it is one of the 37 sitemap URLs, so the sitemap must be updated in the same change.

---

## I. Photography Guide Recommendation

**Finding: the best-aligned page on the site, and the most under-built.**

Current content is seven tips — natural lighting, declutter, multiple angles, include scale, avoid reflections, neutral background, sharp focus — plus a pro-tip card. Self-labeled **"2 min read"**. H1 is good and specific: *"How to Capture High-Quality Photos for Asset Documentation."*

What is right: it is entirely about documenting belongings, mentions serial numbers and identifying labels, and needs no repositioning of intent — only depth.

Weaknesses:
- **Too thin to rank.** Seven bullets will not compete for "how to photograph belongings for insurance" or "home inventory photos."
- **Insurance-first framing** in the meta description ("insurance-ready property documentation photos") and intro ("for insurance and planning purposes") — narrower than the product.
- **"A plain wall or table helps the AI focus on the item itself"** — references an AI capability with no explanation, and no other public page explains AI-assisted recognition. Verify this still reflects shipped behavior before it stays in a rewrite.
- **Zero outbound contextual links.** Not to `/claims`, not to `/asset-documentation`, not to `/resources`.

**Intent it should own:** photographing and visually documenting belongings and property condition — evidence capture. Distinct from `/asset-documentation` (*what* to record) and `/claims` (*what a claim requires*).

Relationships to build: `/photography-guide` → `/asset-documentation` (what details to capture alongside the photo) and → `/claims` (how photos are used in a claim). `/claims` → `/photography-guide` already exists and is correct.

**Recommendation: REPOSITION / REWRITE — expand.** Broaden past the insurance framing, add condition documentation, serial numbers and labels, room-level coverage, high-value item close-ups, and video walkthroughs. Highest-upside expansion in Phase 2 after `/asset-documentation`.

---

## J. Resources Recommendation

**Finding: navigation, not a hub.**

The whole page is 71 lines: an H1 ("Resources & Security"), one subtitle, and a two-tab switcher — **Educational Resources** (4 cards) and **Security & Trust**. There is no introductory copy, no framing, no original content. The four cards point to `/photography-guide`, an in-page checklist anchor, `/claims`, and `/asset-documentation`.

Problems:
- **No indexable substance of its own.** Nothing for Google to rank beyond a title and four link labels.
- **Tabbed content is half-hidden.** Only the default "education" tab renders on load; the Security & Trust content is behind a click and weakly discoverable.
- **Mixed purpose.** "Resources & Security" bolts a trust/compliance section onto an educational hub — two audiences, one URL.
- **A card mislabels its destination.** "Asset Valuation Explained — Understanding how to document and value your assets" points to `/asset-documentation`, which today explains liquid vs intangible assets. The card describes the page as it *should* be, not as it is. (Phase 1 correctly repointed this away from the dead `/ai-valuation-guide`; the label just never caught up.)
- **`/blog` is not linked from it at all** — the hub omits the site's largest content library.

**Role it should serve:** the canonical entry point for "Asset Safe guides" — a real hub with a short intent-setting introduction, links to every educational asset including `/blog`, `/awareness-guide`, `/scenarios`, and the relocated documentation guide, and the security material either given its own URL or demoted to a section rather than a co-equal tab.

**Recommendation: LIGHT OPTIMIZATION.** Add introductory copy, expand the card set, fix the valuation card's label after `/asset-documentation` is rewritten, and link `/blog`. Not a rewrite — the structure is fine, it is just empty.

---

## K. Awareness Guide Recommendation

**Finding: more distinct than expected. Keep it.**

Ten hidden home risks — dryer vents, roofs and gutters, electrical, water heaters, mold, pests, foundation and drainage, chimney creosote, sump pumps, security and cyber. Framing is **prevention and maintenance**: "clean once per year", "flush yearly", "test your sump pump".

Overlap check against the cluster:
- vs `/scenarios`: minimal. `/scenarios` is *after a loss occurs*; this is *before*. Shared vocabulary is two mentions each of fire and flood — incidental.
- vs `/claims`: none. No claim vocabulary at all.
- vs `/resources`: none — it is not even linked from the hub.

It occupies a genuinely different position in the customer journey and is the only page addressing prevention.

Weaknesses: thin (ten cards, one line each); an H1/H2 pattern where the H2 ("Top 10 Hidden Risks That Can Damage Your Home or Business") carries the actual search value while the H1 is the brandy *"🏠🔒 Asset Safe Awareness Guide"*; and **zero outbound links** — no path to `/scenarios`, `/asset-documentation`, or any product page, so its traffic dead-ends.

**Recommendation: LIGHT OPTIMIZATION.** Keep and keep indexed. Strengthen the H1 toward the searchable phrasing currently sitting in the H2, add contextual links to `/scenarios` and the documentation cluster, and surface it from `/resources`.

---

## L. Existing Blog Assessment

Nine posts. Publication dates run Dec 2024 – Feb 2026.

| Post | Category | Primary intent | Aligned? | Duplicates evergreen? | Assessment |
|---|---|---|---|---|---|
| The Complete Guide to Creating a Digital Home Inventory | Guides | Informational — "home inventory" | **Yes — strongly** | **Overlaps the rewritten `/asset-documentation`** | Strongest post. Owns "home inventory" today by default. Must be deliberately positioned as supporting the rewritten page, not competing with it. |
| What Documents Should I Upload to Asset Safe? | Guides | Product-informational | Yes | Overlaps `/asset-documentation` + `/qa` | Keep; link to canonical pages. |
| The Smart Way to Organize Receipts and Warranties | Organization | Informational | Yes | Slight `/asset-documentation` overlap | Keep — good non-insurance topic. |
| Protecting High-Value Items: A Collector's Guide | Protection | Informational | Yes | Overlaps `/photography-guide` | Keep. **Phase 3 boundary:** High-Value Items is a listed Phase 3 page — do not build it now; note the future relationship. |
| Legacy Locker — Protect Your Wishes, Memories, and Home | Estate Planning | Product | Yes | Supports `/legacy-locker-info` | Keep; ensure it links there. |
| Why Every Estate Plan Needs a Digital Vault | Estate Planning | Informational | Partially | Supports `/legacy-locker-info` | **Watch positioning** — "estate plan" framing edges toward estate-planning-service territory the product does not claim. |
| Disaster Preparedness: Your Essential Checklist | Preparedness | Informational | Yes | **Overlaps `/awareness-guide` and `/scenarios`** | Keep, but assign clearly: preparedness checklist ≠ risk awareness ≠ loss events. |
| How Proper Documentation Speeds Up Insurance Claims | Insurance | Informational | Supporting use case | **Overlaps `/claims`** | Keep as support; must link to `/claims` as canonical. |
| Welcome to Asset Safe — Your Home, Your Legacy, Our Mission | Company News | Brand | Yes, but dated | No | Low search value. Check for retired terminology. |
| The Best Closing Gift Real Estate Agents Can Give | Real Estate | **B2B / partner acquisition** | Different audience | No | **Narrow positioning.** Real-estate-agent gifting is a channel play, not core intent. Fine to keep, but it should not shape topical identity. |

**Cross-cutting blog finding — the most actionable item in this section:** every post body links **only to `/pricing`** (twelve occurrences across post bodies) plus `/blog` and one `/features`. **Not one post links to `/claims`, `/photography-guide`, `/asset-documentation`, `/scenarios`, or `/awareness-guide`.** Nine posts of topical authority are passing zero internal signal to the pages meant to own those intents. Fixing this is cheap and high-leverage.

No new blog calendar proposed, per scope.

---

## M. Cannibalization Findings

**Cluster 1 — Insurance claim documentation** *(severe)*
- Competing: `/claims`, `/industry-requirements`, ~8 `/press-news` articles, blog "Documentation Speeds Up Claims"
- Overlap: proof of loss, receipts, photos, item inventory, proof of ownership, appraisals, adjusters
- Strongest: **`/claims`** — purpose-built, correctly scoped, already the linking hub
- Owner: `/claims`
- Others should target: `/industry-requirements` → nothing (noindex); press articles → removed; blog post → supporting, linking up to `/claims`
- Consolidation: yes — `/industry-requirements` is largely redundant with `/claims`

**Cluster 2 — Asset / property documentation** *(severe, by absence)*
- Competing: `/asset-documentation` (wrong topic), `/press-news/digital-documentation-guide`, blog "Digital Home Inventory", blog "What Documents Should I Upload"
- Overlap: what to document and why
- Strongest: **currently the blog post**, because the page that should own this does not address it
- Owner: `/asset-documentation` **after rewrite**
- Others: guide → comparison angle; blog posts → supporting, linking up
- Consolidation: no — reassignment

**Cluster 3 — Loss events** *(moderate)*
- Competing: `/scenarios`, `/press-news` case studies, blog "Disaster Preparedness"
- Strongest: `/scenarios`
- Owner: `/scenarios`; press items removed; blog post stays preparedness-focused

**Cluster 4 — Insurance industry / regulatory** *(self-inflicted, resolves on noindex)*
- Competing: `/industry-requirements`, `/state-requirements`, `/glossary`, `/press-news`
- Owner: **none should exist.** `/glossary` survives as a support asset for `/claims`, not as an insurance destination.

**Cluster 5 — Prevention & preparedness** *(mild)*
- Competing: `/awareness-guide`, blog "Disaster Preparedness"
- Owner: `/awareness-guide`; blog post supports with a checklist angle

**Cluster 6 — Educational hub** *(mild)*
- Competing: `/resources`, `/blog`
- Owner: `/resources` as hub, `/blog` as library — they should link to each other, and today do not

---

## N. Outdated Positioning / Terminology

Flagged, not changed.

| Signal | Where | Severity |
|---|---|---|
| **Accounting asset tracker** — liquid/fixed/intangible/operating assets, accounts receivable, marketable securities, trademarks, R&D | `/asset-documentation` (page + meta description) | **High** |
| **Mortgage/lending tool** — "lenders typically require asset documentation listing everything contributing to your net worth"; Loan Approvals, Mortgage Applications, Business Liquidation cards | `/asset-documentation` | **High** |
| **Insurance news resource** — Breaking News, Legal Update, Industry Report categories; agency and publication bylines | `/press-news` | **High** |
| **Insurance claims application** — insurance-first framing in titles and descriptions across the cluster | `/claims`, `/scenarios`, `/industry-requirements`, `/state-requirements`, `/photography-guide` meta | **Medium** |
| **Insurance-carrier voice** — Coverage Levels, Common Exclusions, How Rates Are Determined | `/industry-requirements` | **Medium** |
| **Estate planning service** — "Why Every Estate Plan Needs a Digital Vault"; Estate Planning use-case card | blog, `/asset-documentation` | **Low–Medium** — supporting use case is fine; *service* framing is not |
| **Simple home inventory** — "digital home inventory" as the lead concept | `/qa` meta description, blog | **Low** — category term worth owning, just should not be the ceiling |
| **Unexplained AI claim** — "helps the AI focus on the item itself" | `/photography-guide` | **Low** — verify against shipped behavior |
| **Insurance-heavy vocabulary as site identity** — Policyholder, Premium, Deductible, Underwriting, Subrogation leading a 55-term glossary | `/glossary` | **Medium** — reframe as claim-support, not insurance education |

**Not found (good):** no password-manager language, no financial-credential-storage claims, no retired role terminology (contributor / administrator / delegate) on public pages, no stale pricing. Phase 1 and the earlier terminology passes held.

**One stale internal reference:** `src/services/SearchService.ts` still describes `/about` as "About **Asset Docs** and our mission" — an old product name. Internal search only, not indexable, but it is drift.

---

## O. Internal-Link Findings

Contextual in-body links that exist across all twelve Phase 2 routes — the complete list:

1. `/claims` → `/photography-guide`
2. `/state-requirements` → `/glossary`
3. `/resources` → `/photography-guide`, `/claims`, `/asset-documentation`, in-page checklist anchor

Everything else is global footer navigation, which passes no topical signal.

**Pages with zero outbound contextual links:** `/awareness-guide`, `/photography-guide`, `/qa`, and effectively `/scenarios` and `/asset-documentation` (only `/auth`, `/pricing`, `/signup` conversion CTAs).

**Missing links, in priority order:**

| From | To | Why |
|---|---|---|
| `/scenarios` | `/claims` | Reader identifies their event, then needs the document list. Most valuable missing link on the site. |
| `/claims` | `/scenarios` | Reciprocal; reinforces the event/document split |
| `/photography-guide` | `/asset-documentation`, `/claims` | Best-aligned page currently dead-ends |
| `/asset-documentation` | `/photography-guide`, `/claims` | After rewrite, becomes the cluster hub |
| **all 9 blog posts** | relevant evergreen page | Nine posts currently pass signal only to `/pricing` |
| `/awareness-guide` | `/scenarios`, `/asset-documentation` | Currently zero outbound |
| `/resources` | `/blog`, `/awareness-guide`, `/scenarios` | Hub omits the largest content library |
| `/qa` | `/claims`, `/legacy-locker-info`, `/asset-documentation` | FAQ answers should route to canonical pages |

**One broken-for-the-public link:** `/glossary` links to **`/checklists`**, which `robots.txt` disallows as an authenticated account route. A logged-out visitor following it will not get the expected page. Worth confirming during Phase 2.

---

## P. H1 / Heading Issues

| Page | H1 status | Issue |
|---|---|---|
| `/press-news/digital-documentation-guide` | **No `<h1>`** | Confirmed still open. Visible title renders via `CardTitle` (a `<div>`) at `PressNews.tsx:354`. Live check returns an empty H1 list. **Yes — correct this in Phase 2**, alongside the URL move. Trivial change, and the page now has correct metadata so the missing H1 is the last structural gap. |
| `/asset-documentation` | H1 present | *"Asset Documentation Guide"* — generic, and subtitle says "business and personal financial matters". Targets outdated intent. |
| `/awareness-guide` | H1 present | *"🏠🔒 Asset Safe Awareness Guide"* is brand-led; the H2 below carries the real search value. Inverted priority. |
| `/scenarios` | H1 present | *"Insurance Claim Scenarios"* — leads with claim framing rather than event framing, which drives the title cannibalization in section F. |
| `/resources` | H1 present | *"Resources & Security"* — two purposes in one heading. |
| `/photography-guide` | H1 present | Good and specific. No change. |
| `/claims` | H1 present, single | *"Insurance Claims Documentation."* Correct. |
| `/industry-requirements` | H1 present | *"Industry Requirements"* — vague; moot if noindexed. |
| `/state-requirements` | H1 present | Fine; moot if noindexed. |
| `/press-news` | H1 present | Moot if retired. |
| `/qa`, `/glossary`, `/blog` | H1 present, single | Correct. |

No duplicate-H1 problems found anywhere. Several pages rely on `CardTitle` for section headings — cosmetically fine, but it means some section structure is invisible to crawlers as headings.

---

## Q. Search Console Findings

**Search Console does not yet contain enough post-Phase-1 data to influence Phase 2 architecture decisions.**

Two separate reasons, both worth stating precisely:

1. **No Search Console connection is linked to this Lovable project.** The property may well be verified and collecting data on Google's side — you connected it and submitted the sitemap — but this project has no linked connection, so no verified query, impression, click, CTR, position, or landing-page data is retrievable here. Linking it would make that data available for Phase 3.
2. **Even with access, the history is too short.** Phase 1 went live yesterday (2026-08-27) and indexing was only just requested. Search Console reports on complete days, and post-change data has not accumulated.

No queries, impressions, clicks, CTR, average position, or landing-page figures are reported, and none are estimated. Every finding above is derived from source inspection, live-site rendering, and verifiable external facts.

The structural work is not blocked by this. Nothing in sections C through P depends on performance history — misclassified audiences, fabricated articles, and missing internal links are wrong regardless of traffic. Re-check Search Console before Phase 3 keyword targeting, and specifically before **retiring** (as opposed to noindexing) `/industry-requirements` and `/state-requirements`.

---

## R. Pages to Keep As-Is

- **`/qa`** — accurate, current terminology, valid FAQPage schema, single H1. Only a future addition of outbound links to canonical pages.
- **`/blog`** (index) — correct structure and metadata; the work is in the posts, not the index.
- **`/claims`** — content and scope are right; only title differentiation and reciprocal links (classified Light Optimization for those, but no content rewrite).

Also unchanged and confirmed correct from Phase 1: the three noindexed utility routes, `robots.txt`, and canonical behavior sitewide.

---

## S. Pages to Rewrite

| Page | Scope |
|---|---|
| **`/asset-documentation`** | Full rewrite. Remove the six accounting asset classes and the mortgage/lending/liquidation framing. Rebuild around belongings, property, equipment, photos, videos, receipts, purchase information, values, serial numbers, appraisals, property records. Keep the URL. Update title and description. **Highest priority.** |
| **`/photography-guide`** | Expand substantially. Broaden beyond insurance framing; add condition documentation, serial numbers and labels, room coverage, high-value close-ups, video walkthroughs. Verify the AI claim. Add outbound links. |
| **`/press-news/digital-documentation-guide`** | Not a content rewrite — relocate to a durable URL, add a real `<h1>`, redirect the old path, update the sitemap. |
| **`/scenarios`** | Light: differentiate the title toward event framing, add the `/claims` link. Optionally deepen per event. |
| **`/resources`** | Light: add introductory copy, expand cards, link `/blog`, fix the valuation card label. |
| **`/awareness-guide`** | Light: strengthen the H1, add outbound links. |
| **9 blog posts** | No rewrites. Add contextual links to canonical evergreen pages. |

---

## T. Pages to Consolidate / Noindex / Retire

| Page | Action | Rationale |
|---|---|---|
| **`/press-news`** | **RETIRE — urgent** | Fabricated case studies, invented statistics and institutions, a byline impersonating FEMA, and a false claim about California AB 2273. Also the strongest "insurance publication" signal on the domain. Not salvageable by reframing. |
| **`/industry-requirements`** | **NOINDEX now → RETIRE** | Cannibalizes `/claims`; insurance-carrier subject matter; ongoing accuracy burden on coverage and exclusions. |
| **`/state-requirements`** | **NOINDEX now → RETIRE** | Highest maintenance burden on the site (50 jurisdictions, changing law); quasi-regulatory statements; no defensible ranking position. |
| **`/glossary`** | **KEEP indexed, reposition** | Real depth (55 terms) and a legitimate support role for `/claims`. Should read as claim-support vocabulary, not insurance education. Revisit if it keeps pulling insurance-research traffic. |

Sitemap consequence: noindexing two pages and retiring `/press-news` while relocating the guide takes the sitemap from 37 URLs to roughly 33. That count must be recalculated deliberately, not estimated — Phase 1 established exact-count verification as the standard.

**Do not `Disallow` any of these in robots.txt.** Follow the Phase 1 pattern: crawlable so the `noindex` is readable.

---

## U. Recommended Phase 2 Implementation Sequence

Ordered so nothing is orphaned and the riskiest item lands first.

**Step 0 — Content integrity (do this ahead of the SEO work)**
Remove the fabricated `/press-news` articles, starting with the AB 2273 item and the FEMA-bylined item. This is a correctness action, not an SEO action.

**Step 1 — Preserve the good guide**
Move `/press-news/digital-documentation-guide` to its new URL, add the `<h1>`, redirect the old path, update the sitemap. Must precede Step 2.

**Step 2 — Retire the listing**
Remove `/press-news`, its route, its sitemap entry, and its footer link.

**Step 3 — Noindex the two requirements pages**
`/industry-requirements` and `/state-requirements`: `noIndex` via `SEOHead`, remove from the sitemap, leave crawlable. Verify exactly as Phase 1 did — one `noindex, nofollow`, no competing `index, follow`.

**Step 4 — Rewrite `/asset-documentation`**
The core repositioning. Everything downstream links into it.

**Step 5 — Expand `/photography-guide`**

**Step 6 — Title and heading differentiation**
`/scenarios` toward event framing; `/awareness-guide` H1; `/resources` H1 and intro copy.

**Step 7 — Internal linking pass**
All missing links from section O, including the nine blog posts. Cheapest step, largest compounding effect. Last, so every link points at final content at a final URL.

**Step 8 — Verify**
Recount the sitemap exactly, confirm every remaining URL still self-references its canonical and returns one robots directive, confirm redirects resolve, then request re-indexing.

---

## V. Product-Owner Decisions Required Before Codex Makes Changes

1. **`/press-news` — confirm deletion.** Retire the listing and delete the fabricated articles outright, or attempt to source and rewrite every claim? Recommendation: delete. Sourcing thirteen articles is a content project, not a Phase 2 task.
2. **Where does the documentation guide live?** `/asset-documentation/digital-vs-diy`, `/resources/digital-documentation-guide`, or a top-level `/digital-documentation-guide`? Determines the redirect and the sitemap entry.
3. **Noindex now, or retire immediately, for `/industry-requirements` and `/state-requirements`?** Recommendation: noindex now, decide on retirement once Search Console shows whether either earned traffic.
4. **How far does `/asset-documentation` broaden?** Purely consumer belongings and property, or explicitly include small-business equipment? Small Businesses is a listed Phase 3 audience — the decision here sets whether that page later extends this one or stands alone.
5. **Does `/glossary` stay insurance-led?** Keep as-is as claim support, or rebalance toward documentation and valuation vocabulary?
6. **Is the `/photography-guide` AI claim still accurate?** "A plain wall helps the AI focus on the item itself" — confirm against shipped behavior before it survives the rewrite.
7. **Should `/resources` split?** Keep "Resources & Security" as one tabbed page, or separate the security/trust material onto its own URL.
8. **Link the Search Console property to this project?** Not required for Phase 2, but it is what makes Phase 3 targeting evidence-based rather than inferred.
9. **Confirm the Phase 3 boundary holds.** Nothing in this audit creates Home Inventory, Renters, Landlords, Small Business, Knowledge Hub, High-Value Items, Emergency Information, or new Digital Legacy pages. `/asset-documentation` is being *corrected*, not expanded into a new landing page — please confirm that reading matches your intent.

---

Nothing was implemented. No files were changed.
