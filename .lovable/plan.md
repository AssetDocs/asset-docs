# Asset Safe SEO Phase 3A — Final Corrections

Implement exactly the three verified corrections against current `origin/main` (`5c72c70b`), fetched and clean. No new Phase 3 page, no B2. Two files change: `src/pages/HomeInventory.tsx`, `src/pages/Index.tsx`. Sitemap stays at 35 URLs.

## 1. Hero CTA — `src/pages/HomeInventory.tsx`

Change the hero primary button label `View Pricing` → `Get Started`, keeping `to="/pricing"` and all styling untouched. Secondary CTA unchanged (`View Sample Dashboard` → `/sample-dashboard`).

## 2. Closing CTA — `src/pages/HomeInventory.tsx`

Add one closing CTA section immediately after the FAQ section, matching the hero's visual system (`bg-brand-blue` band, centered, two buttons):

- Primary: `Get Started` → `/pricing` (white button, ArrowRight icon)
- Secondary: `View Sample Dashboard` → `/sample-dashboard` (outline button)

Copy kept to a short H2 ("Start Your Home Inventory Today") plus one supporting line. No third CTA, no new product claims.

## 3. Homepage HomeFAQ removal — `src/pages/Index.tsx`

- Remove `<HomeFAQ />` from the render tree and remove the now-unused `import HomeFAQ`.
- Keep `faqSchema(faqData)` in the homepage structured data: the 4 `faqData` Q&As are visibly rendered inside `FAQAccordion.tsx` (the accordion on the homepage), so the FAQPage schema remains schema-valid for visible content.
- Update the Q4 insurance answer to remove `maximize recovery`, replaced with wording consistent with Phase 2 hedging ("...to support insurance claim preparation").

## Verification (post-edit)

- Playwright check of `/home-inventory`: hero buttons `Get Started → /pricing` + `View Sample Dashboard → /sample-dashboard`; closing CTA present after FAQ with the same pair; metadata/H1/canonical/robots/7-FAQ schema/BreadcrumbList unchanged.
- Playwright check of `/`: hero unchanged, title/description/canonical unchanged, no 11-question accordion, FAQPage schema matches the visible accordion, no `maximize recovery`.
- `rg -ni "maximize recovery" src` returns zero.
- Sitemap: 35 unique `<loc>` entries, `/home-inventory` exactly once.
- `npm run build` and `npx tsc --noEmit -p tsconfig.app.json` pass.
- Report final commit SHA and origin/main reachability. Commit but do not force-push.

## Explicitly not touched

Pricing/checkout/Stripe/auth/Supabase/RLS/Secure Vault/encryption/billing/gifting, Phase 2 redirects, requirements-page noindex, B2, and all other Phase 3A files (sitemap, blog, Resources, Glossary, SearchService, link architecture).
