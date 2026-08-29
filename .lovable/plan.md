# "Who It's For" Navigation & Internal-Link Architecture Audit (AUDIT ONLY)

No files changed. No navigation implemented. No routes, content, sitemap, or schema touched.

## A. Executive Recommendation

Introduce a **"Who It's For"** dropdown in the public Navbar with four links (Homeowners, Renters, Landlords, Small Business), add a matching compact **Footer** group, and add **one** contextual link in the Features homeowners tab. Do not restructure Resources, do not rewrite the homepage, do not change breadcrumbs, schema, or the sitemap.

Density note: the public Navbar currently carries five text items plus two buttons and a search control, at a 96px logo height. A sixth text item is affordable only if one existing lower-value item is relocated — recommendation below is to move **Blog** into the new grouping's sibling position by demoting it (details in J).

## B. Current Navbar Structure (`src/components/Navbar.tsx`, 370 lines)

Flat `NavLink` list, no dropdowns anywhere. Two entirely duplicated branches (authenticated / anonymous) × two layouts (desktop / mobile) = four hand-maintained link lists.

Public (anonymous) desktop, in order: Search control → About (`/about`) → Features (`/features`) → Pricing (`/pricing`) → Gift (`/gift`) → Blog (`/blog`) → Login button (`/login`) → Get Started button (`/pricing`).

Authenticated desktop adds a Dashboard pill (`/account`) and `AccountSwitcher` before About, and replaces the two buttons with an account link and Sign Out.

Density: logo `h-24` (96px) plus `space-x-6` between five text items and two buttons already fills the row at ~1024–1280px. Adding a sixth top-level trigger without removing anything is the tightest constraint in this audit.

Mobile: `md:hidden` hamburger toggling `isMenuOpen`; the panel is conditionally rendered (`{isMenuOpen && ...}`), so mobile links are absent from the DOM until opened — acceptable because the desktop list carries the same URLs. Login/Get Started sit outside the hamburger. The toggle button has `focus:outline-none` and **no `aria-label`, no `aria-expanded`, no `aria-controls`** — a pre-existing accessibility gap, not caused by this work.

Redundant / low-value at top level: **Gift** (also in Footer → Services, and a homepage `GiftSection`) and **Blog** (also in Footer → References). Both remain valuable pages; neither needs a top-level slot.

## C. Current Footer Structure (`src/components/Footer.tsx`)

Five columns: Get Social (4 icon links) · Quick Links (Services: All Features, Pricing, Gift Subscriptions, Testimonials; Support: FAQ's, Contact, Account Assistance, Add to Home Screen, Video Help) · About + Legal (About Us, Social Impact, Partnership, Technical; Legal & Ethical, Terms of Use, Cookie Policy, Admin) · References (Blog, Resources & Security, Awareness Guide, Asset Documentation, Claims Documentation, Industry Requirements, Scenarios, Glossary, State Requirements, Industry Applications) · Contact Us.

**Zero audience/category links today** — none of the four pages appears in the Footer. The grid is `md:grid-cols-5`; the References column already runs 10 items, so a compact 4-item audience group fits naturally either as a sixth column (would require `grid-cols-6`) or, lower-risk, as a labelled sub-block inside the References column above "Blog".

## D. Audience Page Discovery Matrix

| | /home-inventory | /renters | /landlords | /small-business |
|---|---|---|---|---|
| Intent | commercial / category ("home inventory app", belongings) | commercial + informational (rental condition, move-in/out) | commercial category (multi-property condition & repair history) | commercial category (business equipment records) |
| Inbound source files | 10 | 9 | 7 | 6 |
| Always-visible contextual inbound | AssetDocumentation, Claims, PhotographyGuide, Glossary, BlogPost, Renters, EducationalResources, Resources card, Features hero | AssetDocumentation, Claims, PhotographyGuide, Glossary, BlogPost, HomeInventory, Landlords, Resources card | AssetDocumentation, Claims, PhotographyGuide, Scenarios, Renters, Resources card | AssetDocumentation, Claims, PhotographyGuide, Scenarios, Resources card |
| Features tab link | **none** (only a hero-paragraph link, line 69) | yes (`renters` tab) | yes (`landlords` tab) | yes (`business` tab) |
| Resources hub card | yes | yes | yes | yes |
| Navbar | no | no | no | no |
| Footer | no | no | no | no |
| Site-wide link | none | none | none | none |

All current inbound links are **contextual, in-body, always visible** (the Features tab links use `forceMount`, so they are in the DOM but visually behind a tab). Click depth from the homepage is 2–3. Note: `HomeFAQ.tsx` also links `/home-inventory` but is no longer rendered anywhere (orphaned after the Phase 3A homepage correction) — it contributes zero live link equity.

## E. "Who It's For" vs No Group — Recommendation: **Option B**

- **Option A (status quo)**: acceptable but leaves four commercial-intent pages with no site-wide link and no path for a visitor who self-identifies ("I rent") rather than browsing guides.
- **Option B (Who It's For dropdown)**: best clarity/SEO/scalability balance. Groups four pages under one trigger, adds four site-wide links, reduces click depth to 1, and scales to future audiences.
- **Option C (Solutions)**: same mechanics, wrong tone — see F.
- **Option D (inside an existing dropdown)**: impossible without inventing one; the Navbar has no dropdowns at all, so this is the same build cost as B with worse discoverability.

## F. "Who It's For" vs "Solutions" — Recommendation: **"Who It's For"**

Asset Safe is consumer + small-business documentation. "Solutions" is enterprise-software vocabulary; it implies configurable products, tiers, or verticals and invites B2B expectations the product deliberately avoids (Landlords and Small Business pages both carry explicit "not property-management / not inventory-management software" boundaries). "Who It's For" is plain-language, answers the visitor's actual question, and reads correctly to all four audiences. Keep "Solutions" out of the vocabulary entirely.

## G/H/I. Exact Labels, Order, Homeowners

Recommended set and order — **broadest audience first, then customer journey, then business**:

1. Homeowners → `/home-inventory`
2. Renters → `/renters`
3. Landlords → `/landlords`
4. Small Business → `/small-business`

Drop the "For " prefix: the group heading already supplies it, and "For Homeowners" inside "Who It's For" is redundant and widens the dropdown. Not alphabetical — alphabetical order (Homeowners, Landlords, Renters, Small Business) breaks the personal → rental → business progression and separates the two rental audiences.

**Homeowners → `/home-inventory` is correct and safe.** The URL stays unchanged. The page's H1 and title own the home-inventory keyword; the nav label answers "is this me?". A feature-sounding nav label ("Home Inventory") next to three audience labels reads as an inconsistent list, and would compete with the Features/Resources framing. This does not misrepresent the page — its content is a homeowner-oriented, room-by-room belongings record. Anchor-text variety ("Homeowners" in nav, "home inventory guide" in body) is healthy, not a loss.

## J. Navbar Density — Recommendation

Add "Who It's For" as a new top-level trigger **and relocate Blog out of top level** into the Footer-only position it already occupies (Footer → References → Blog), keeping the row at five text items + two buttons. Blog is the lowest-value top-level slot: it is an editorial archive, not a conversion or self-identification path, and it is already linked from the Footer and from Resources. Access is preserved everywhere; nothing is deleted.

Alternative if the product owner wants Blog retained at top level: demote **Gift** instead (already in Footer → Services and a full homepage section). Do not remove About, Features, or Pricing.

## K. Dropdown Technical Recommendation

The project already ships the right primitives — no new dependency:

- `src/components/ui/navigation-menu.tsx` (Radix NavigationMenu) — correct for desktop: keyboard support, `aria-expanded`, escape-to-close, and Radix renders the content in the DOM behind `data-state`, so links are crawlable without hover. Preferred.
- `src/components/ui/dropdown-menu.tsx` — avoid here: Radix DropdownMenu content is **portal-mounted on open**, so links would not exist in the DOM until interaction (JS-only crawlability dependency).
- `src/components/ui/accordion.tsx` or `collapsible.tsx` — correct for the mobile panel.

Safest pattern: NavigationMenu on desktop, an Accordion section inside the existing mobile panel, and a single shared `audienceLinks` array so the four hand-maintained link lists cannot drift.

## L. Mobile Navigation — Recommendation

**Accordion section inside the existing hamburger panel**, labelled "Who It's For", with the four links as direct rows. No hover dependency, one level of nesting only, all four reachable in two taps (hamburger → expand). Do not nest a second menu layer or add a separate drawer. Rows should be full-width with ≥44px height.

## M. Accessibility Requirements

- Desktop trigger must expose `aria-expanded` and reference its panel (Radix NavigationMenu/Accordion do this) — do not hand-roll hover-only markup.
- Escape closes; focus returns to the trigger; arrow-key traversal inside the panel.
- Mobile accordion trigger needs `aria-expanded` and a ≥44×44px target.
- Do not create a hidden duplicate of the whole navigation for crawlers.
- Pre-existing, in-scope-adjacent gap worth fixing in the same pass: the hamburger `<button>` has no `aria-label` / `aria-expanded` / `aria-controls` and uses `focus:outline-none` with no visible replacement.

## N. Internal-Link SEO Impact

Real but modest, and worth doing:

- **Crawl discovery / depth**: click depth from any page drops to 1; today these pages depend on in-body links from a handful of guides.
- **Authority distribution**: a site-wide link from every page is the strongest internal signal the site can give these four commercial-intent pages; they are currently the weakest-linked of the acquisition set (`/small-business` has 5 always-visible inbound links).
- **Anchor text**: "Homeowners / Renters / Landlords / Small Business" adds clean audience anchors alongside existing descriptive body anchors.
- **Caveats**: site-wide navigation links are discounted relative to editorial in-body links, and this changes nothing about content quality, so do not expect ranking movement on its own. The material gain is discovery and click depth, not a ranking lever.

Verdict: materially more useful than Resources/contextual-only, primarily as a UX and crawl-architecture improvement.

## O. Footer Recommendation: **ADD**

Add a compact "Who It's For" group with all four links. It appropriately mirrors the Navbar (footers are the conventional place for full category coverage), gives a non-JS, always-in-DOM path to all four pages on every route, and fixes the current gap where zero audience links exist in the Footer. Include all four — a partial set looks arbitrary. Lowest-risk placement: a labelled sub-block at the top of the existing References column, avoiding a `grid-cols-5` → `grid-cols-6` layout change.

## P. Homepage Contextual Links

Homepage hero: no audience wording to link — leave untouched.

- **Recommended**: none. Once Navbar + Footer links exist, homepage discovery is already solved.
- **Optional**: `src/components/DocumentProtectSection.tsx:91` — "Built for: Homeowners • Renters • Families • Property owners • Small businesses" is the one place where existing visible text maps almost 1:1 to the four pages. Linking Homeowners / Renters / Property owners / Small businesses there is a natural, non-rewriting change. Note "Property owners" would link to `/landlords`, which is a slight wording mismatch worth a product decision. Line 51 ("property managers") should **not** link to `/landlords` — that page explicitly disclaims property-management software.
- **Unnecessary**: any hero, CTA, or comparison-section rewrite.

## Q. Features Audience-Link Recommendation

One small link completes the architecture. `src/pages/Features.tsx` has conditional contextual paragraphs for `renters`, `landlords`, and `business` (lines 180–195) but **not** for the `homeowners` tab; the only `/home-inventory` link on the page sits in the hero paragraph (line 69). Add one parallel `audience.id === 'homeowners'` sentence linking `/home-inventory`. Nothing else on Features should change.

## R. Resources Recommendation: **leave unchanged**

`resourceLinks` already contains all four cards, first in the array, ahead of the educational guides. Once Navbar and Footer links exist, a separate "Who It's For" subsection adds a redesign with no discovery gain. Minimum-change solution: no edit.

## S. Exact Anchor Text

Site-wide (Navbar + Footer), exactly:

```text
Homeowners      → /home-inventory
Renters         → /renters
Landlords       → /landlords
Small Business  → /small-business
```

Nav anchors should differ from page titles/H1s — that is intentional and healthy: titles/H1s carry the keyword phrasing, nav anchors carry audience self-identification. No keyword stuffing ("Home Inventory App for Homeowners") in navigation.

## T. Breadcrumb Recommendation: **leave unchanged**

Keep `Home → Resources → [Audience Page]` on all four pages. Resources is a real indexable URL that genuinely lists all four; "Who It's For" would be a navigation grouping with no URL, and fabricating one (or emitting a breadcrumb item without a resolvable `item`) is worse than the accurate current trail.

## U. Structured-Data Recommendation: **no change**

Do not add `SiteNavigationElement` — Google does not use it for navigation understanding, and adding schema purely for SEO is not justified. Existing `BreadcrumbList` and `FAQPage` graphs stay as-is; `organizationSchema` / `webApplicationSchema` on the homepage are unaffected.

## V. Sitemap Impact: **none**

No new URLs. Sitemap stays at 38 unique URLs. No `lastmod` should be introduced.

## W. Files That Would Need Changes

| File | Current role | Proposed purpose |
|---|---|---|
| `src/components/Navbar.tsx` | Flat public + authenticated nav, desktop + mobile duplicated | Add "Who It's For" NavigationMenu trigger (both auth branches), mobile accordion section, relocate Blog per J |
| `src/components/Footer.tsx` | Five-column footer, no audience links | Add compact "Who It's For" group in References column |
| new `src/data/audienceNav.ts` (or similar) | — | Single shared source for the four label/href pairs used by Navbar and Footer |
| `src/components/ui/navigation-menu.tsx` | Existing Radix primitive | Consume only — no edit expected |
| `src/pages/Features.tsx` | Audience tabs with contextual links | Add one `homeowners` → `/home-inventory` sentence (Q) |
| `src/components/DocumentProtectSection.tsx` | Homepage "Built for:" line | Optional only, pending decision (P) |
| `src/pages/Resources.tsx` | Resources hub cards | No change recommended |

## X. Minimal Implementation Scope

1. Shared `audienceNav` data module (4 entries).
2. Navbar: "Who It's For" NavigationMenu on desktop (both auth branches) + mobile accordion; Blog relocated out of top level.
3. Footer: compact "Who It's For" group, all four links.
4. Features: one homeowners contextual link.
5. Optional, only if approved: `DocumentProtectSection` "Built for:" inline links.

Excluded: homepage rewrite, Resources redesign, audience-page content edits, new routes, new acquisition pages, prerendering/B2, schema, sitemap.

## Y. Risks / Regression Boundaries

- **Four duplicated link lists** in `Navbar.tsx` (auth × desktop/mobile) is the main defect risk — the shared data module is the mitigation.
- **Crawlability**: using `dropdown-menu.tsx` instead of `navigation-menu.tsx` would portal-mount links on open and remove them from the static DOM. Must be verified in the hydrated DOM after implementation.
- **Density/wrap**: the 96px logo plus a sixth trigger can wrap at ~1024px if nothing is relocated — verify at 1024/1280/1440.
- **Mobile layout**: the accordion must not push Login/Get Started or break the existing `md:hidden` panel.
- **Untouched by design**: audience-page canonicals, titles, descriptions, robots, H1s, CTAs, structured data, sitemap, and all authenticated/pricing/checkout code. Navigation work must not edit the four audience pages at all.
- Accessibility fixes to the hamburger button are additive and low-risk but do widen the diff — confirm whether they belong in this pass.

## Z. Product-Owner Decisions Required Before Implementation

1. Approve the label **"Who It's For"** (over "Solutions").
2. Approve **Homeowners → `/home-inventory`** as the nav label.
3. Choose the density trade-off: relocate **Blog** (recommended) or **Gift**, or accept six top-level text items.
4. Footer placement: sub-block inside References (recommended) vs a sixth column.
5. Decide on the optional homepage `DocumentProtectSection` inline links, including whether "Property owners" should link to `/landlords`.
6. Confirm whether the pre-existing hamburger accessibility fixes are in scope for this pass.
