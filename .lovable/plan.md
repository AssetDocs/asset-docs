# Modernize the Public Features Page

Public UI/copy only. No dashboard, Auth, MFA, RLS, storage, billing, gift, Stripe, subscription, schema, Edge Function, retention, or encryption changes.

Goal: `/features` teaches the same product structure users see after signing in — Asset Documentation, Knowledge Hub, Secure Vault.

---

## 1. New shared content config — `src/data/featuresContent.ts` (new file)

All public feature copy moves into one readable config so the four audience tabs can never drift apart again. Exports:

- `heroContent` — headline, subhead, audience line
- `primaryDestinations` — the three dashboard destinations
- `featureSections` — Asset Documentation, Knowledge Hub, Secure Vault, Access/Preparedness/Security (each with named groups and items)
- `secureVaultFraming` — What It Is / What It's Not / Why It Matters
- `audiences` — 4 audiences, each with 5 focus areas that *reference* feature names rather than restating the catalog
- `industries` — one trimmed list
- `closingCta`

Two rules written into the file header as comments:
- Every `name` must match the in-app label exactly. Retired labels are named explicitly as forbidden.
- Descriptions describe organization and preparation only — no guaranteed outcomes, compliance guarantees, credential storage, "end-to-end encryption", or "zero knowledge".

## 2. Hero

- H1: **"Everything you love. Protected in one place."**
- Sub: "Asset Safe brings your property documentation, everyday information, and most private records together in one organized place."
- Line: "Built for homeowners, renters, landlords, and small businesses."
- CTAs: View Pricing (`/pricing`) + See how people use Asset Safe (`/scenarios`)

## 3. Three-part product overview, directly below the hero

Three prominent cards mirroring `DashboardGrid`:

| Card | Tagline | Note |
|---|---|---|
| Asset Documentation | "Organized proof of your property, assets, and records." | Cross-audience wording, per your preference — the dashboard's "claim-ready proof for your home and belongings" is narrower than landlords/businesses need. Dashboard parity is preserved where it matters: the destination *name* and every feature name inside it match exactly. |
| Knowledge Hub | "Everyday life, organized and protected." | Exact dashboard phrase; already audience-neutral |
| Secure Vault | "A single encrypted space for digital access and legacy planning." | Exact dashboard phrase; explicit "Contains Digital Access and Legacy Locker" — amber accent to match the dashboard |

## 4. Rebuilt feature sections (described once, for everyone)

**Asset Documentation** — Property Profiles · Photos & Videos · Documents & Receipts · Manual Entry Item · Asset Values · High-Value Items · Documentation Checklist · Post Damage Report · Export Account Archive · Download All Files

**Knowledge Hub** — grouped as People (VIP Contacts, Trusted Professionals, Medication List) · Notes & Family (Written Notes, Voice Notes, Family Traditions & Recipes, Memory Safe) · Home & Property Details (Important Locations, Paint Codes, Upgrades & Repairs, Source Websites) · Planning (Smart Calendar). No "Family Archive", no "Insights & Tools", no standalone Quick Notes.

**Secure Vault** — parent section containing Digital Access · Legacy Locker · Legacy Instructions · Legacy Admin, plus the retained What It Is / What It's Not / Why It Matters block. "What It's Not" expands to disclaim will, estate plan, attorney, financial advisor, and banking-credential storage.

**Access, Preparedness & Security** — Authorized Users (Full Access / Read Only, stated as *account-level* access, and that Authorized Users do not get Secure Vault access) · Emergency Instructions · MFA · Encrypted Secure Vault · Secure cloud storage.

**No duplicate cards.** Per your note, Export Account Archive and Download All Files live **only** in Asset Documentation. The Preparedness group instead carries a one-line cross-reference on portability ("Your records stay portable — see Export Account Archive above"), not a second card. Every feature name appears as a card exactly once across the four sections.

**Storage figure is read, not hardcoded.** The canonical source is `SUBSCRIPTION_FEATURES.unlimited_storage.description` in `src/config/subscriptionFeatures.ts:166` — currently `"25 GB Secure Storage Included (+25 GB add-ons available)"`, which `CompletePricing.tsx:57` already renders verbatim. The Features page will import and render that same string rather than restating the number in prose, so a plan change updates all three surfaces at once and this page cannot fossilize. The surrounding sentence stays figure-free ("Files are stored encrypted in transit and at rest on managed cloud infrastructure, operated under SOC 2–aligned practices."). Same approach for unlimited properties, sourced from the same config.

Sections default **open**, not collapsed.

## 5. Audience tabs — narrative, not catalog

Keep Homeowners / Renters / Businesses / Landlords. Each becomes ~5 focus areas explaining how the one platform serves that audience, each linking to the feature names it leans on. Homeowners: documentation, insurance preparation, home history, household knowledge, continuity. Renters: belongings, move-in/out, receipts, personal info, preparedness. Businesses: equipment/premises, records, maintenance, insurance support, operational reference — no consumer-family wording. Landlords: multiple properties, repairs/improvements, condition documentation, contractors/paint codes/locations, reminders + insurance support — **no tenant-sharing claim**.

## 6. Removals and corrections

Removed: Quick Notes card · duplicate Voice Notes card · Tenant Communication · Online Client Portal · "centralized management portal" · tenant-belongings tracking · CSV/unsupported export formats · "Join thousands of…" · "Court-ready documentation" · "faster claims processing and accurate settlements" · "Value Authentication" · unqualified regulatory-compliance claims · "financial account information" · "end-to-end encryption" · "Password and Accounts Catalog".

Renamed to current labels: Assets → Asset Documentation · Asset Valuation → Asset Values · Export Assets → Export Account Archive · Post Damage Documentation → Post Damage Report · Property Documentation → Asset Documentation · Manual Entry Items moved from Knowledge Hub to Asset Documentation.

## 7. Industries — merged and trimmed

Two overlapping sections (Industry Applications, Industries We Serve — 16 cards) collapse into one section of 8: Real Estate · Property Management · Insurance Documentation Support · Moving & Storage · Construction & Home Services · Legal & Estate Planning Support · Small Business · Art & Collectibles.

Dropped: Healthcare, Financial Services, Aviation & Marine, Manufacturing, Educational Institutions, Religious Organizations, Automotive — each carried compliance/clinical/credential inference risk disproportionate to its value. Insurance and Legal entries carry inline scoping sentences.

## 8. Same-family copy alignment (terminology only)

- `src/components/AskAssetSafe.tsx` — "SOC 2 compliant" → "SOC 2–aligned practices"; "End-to-end encryption" → client-side encryption wording; "Account passwords and access codes" scoped away from financial credentials.
  - **Legacy Admin wording is browse-free.** Per your note, the replacement will not imply a Legacy Admin can open and read the vault at will. Before writing the copy I'll re-read the actual path (`SecureVault.tsx` grant issuance, `delegateGrants.ts`, the recovery-request flow, and the Legacy Admin SELECT policy added earlier) and describe only what it permits: an optional single designee who can **submit a request** for vault access, which is approval-based, gated on an active designation and an active grant, revocable at any time, and destroys the wrapped key material on revoke. Phrasing will be along the lines of "an optional designee who can request access when it is genuinely needed — access is granted, not standing." If the code shows anything narrower than that, the copy narrows with it.
- `src/components/FAQAccordion.tsx:290-294` — replace "zero-knowledge encryption architecture" and the absolute "never have access to your vault contents" with accurate passphrase wording that acknowledges the approval-based Legacy Admin path.
- `src/components/HomeFAQ.tsx` — align encryption and Authorized Users wording with the new Features page.
- `src/pages/Index.tsx` — align the homepage Legacy Locker FAQ entry to the Secure Vault parent framing.

## 9. `/features-list` disposition

**Chosen: rebuild as a legitimate customer-facing "All Features" index, driven by the same `featuresContent.ts` config.** Route and URL preserved, stays indexable.

Rationale: the route is already public and indexable, so `noindex` leaves a dead page that still exists, and deleting it breaks any existing link. Rebuilding from shared data removes the two actual problems — the tech-stack disclosure (React/Supabase/Stripe/OpenAI/Google Maps) and the internal route map — while turning the page into a useful flat index that cannot drift from `/features`. The Technical and Workflow tabs are removed entirely.

## 10. SEO

`/features` keeps its canonical URL, single H1, breadcrumb schema, and existing `SEOHead` usage. Title and description updated to the new positioning. No SSR or prerendering.

## 11. Files changed

| File | Change |
|---|---|
| `src/data/featuresContent.ts` | **New** — shared config |
| `src/pages/Features.tsx` | Rewritten to render from config |
| `src/components/FeaturesList.tsx` | Rebuilt as customer-facing All Features index |
| `src/components/FeaturesSection.tsx` | **Deleted** — orphaned, imported nowhere |
| `src/components/AskAssetSafe.tsx` | Copy only |
| `src/components/FAQAccordion.tsx` | Copy only |
| `src/components/HomeFAQ.tsx` | Copy only |
| `src/pages/Index.tsx` | Copy only |

## 12. Verification

`tsgo` typecheck + production build, then a written report covering: final hero copy · the three primary sections · retired terms removed · current terms used · unsupported claims removed · each of the four tabs reviewed · industries merged/trimmed · Secure Vault ⊃ Digital Access + Legacy Locker made explicit · Knowledge Hub and Asset Documentation terminology matched to the dashboard · no standalone Quick Notes · no tenant-sharing or portal claims · `/features-list` disposition · same-family wording adjusted · exact files changed · confirmation that no backend, security, or business logic was touched.
