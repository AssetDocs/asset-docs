# SEO Phase 4B — Structural Corrections

## Audit findings (completed, read-only)

**1. /partnership — Verdict: A, general partnership content with legacy RE/MAX framing.**
The page's substance is generic: "What is Asset Safe", "Why Partner with Asset Safe?", four generic partnership opportunities (Premium Closing Gift, Relocation & Life Transition Support, Affiliate Revenue Program, Co-Branded Materials), agent benefits, internal links to /gift, /claims, and a founder contact block. RE/MAX-specific framing is confined to 6 strings: the H1 "Partnership Proposal: Asset Safe x RE/MAX", a "Presented to: Chris Harden, RE/MAX Broker" line, and four "RE/MAX agents / custom RE/MAX partner package" mentions. No endorsement is claimed anywhere, but the H1 and the "Presented to" line read as a named-partner pitch on an indexable public URL. This qualifies for the de-branding path, not the STOP path.

**2. Public /admin exposure:** exactly one occurrence — `src/components/Footer.tsx:150`. Navbar has none.

**3. Intentional noindex routes — all correct, no regression:**

| Route | robots meta | Canonical | In sitemap | robots.txt | Public |
|---|---|---|---|---|---|
| /features-list | noindex (RouteMeta default `noIndex = true`) | self | No | `Allow: /features-list` | Yes |
| /video-help | noindex (SEOHead `noIndex`) | self | No | `Allow: /video-help` | Yes |
| /account-assistance | noindex (both states) | self | No | not listed (covered by `Allow: /`) | Yes |
| /industry-requirements | noindex (SEOHead `noIndex`) | self | No | `Allow: /industry-requirements` | Yes |
| /state-requirements | noindex (SEOHead `noIndex`) | self | No | `Allow: /state-requirements` | Yes |

No sitemap or robots.txt changes needed for these.

**4. /install:** live home-screen-shortcut helper rendering `HomeScreenInstructions`, with a "Back to Dashboard" link to `/account`. Already `noIndex`, self-canonical, not in the sitemap, linked only from the Footer. It is an account-utility page, not the retired PWA install prompt, and its content is current. **Recommendation: NO CHANGE (keep public, keep noindex, keep out of the sitemap).**

**5. Legacy press redirects:** `src/App.tsx:475-476` client-side `<Navigate replace>` for `/press-news` → `/resources` and `/press-news/digital-documentation-guide` → `/digital-documentation-guide`. `public/_redirects` already uses Netlify-style syntax (`/subscription-agreement /terms 301` plus the SPA fallback), so server 301s go there, above the `/*` fallback.

## Changes to implement

1. **`src/pages/Partnership.tsx`** — de-brand public framing only:
   - H1 → `Partner With Asset Safe`.
   - Remove the "Presented to: Chris Harden, RE/MAX Broker" line; keep the From/Contact lines.
   - "RE/MAX agents can offer clients…" → "real estate professionals can offer clients…"; "How This Helps RE/MAX Agents" → "How This Helps Real Estate Professionals"; "provides RE/MAX agents with flyers…" → "provides partners with flyers…"; "custom RE/MAX partner package" → "custom partner package".
   - Keep route, title, description, canonical, and indexability unchanged. No new partner claims. Structure, cards, and CTAs untouched.

2. **`src/components/Footer.tsx`** — delete the `/admin` link item (line ~150) and its wrapper `<li>`. Nothing else in the footer changes. `/admin` route, auth, and RLS untouched.

3. **`public/_redirects`** — add above the SPA fallback:
   ```text
   /press-news/digital-documentation-guide  /digital-documentation-guide  301
   /press-news                              /resources                    301
   ```
   Keep the React `<Navigate>` routes as fallback. No wildcard on `/press-news/*`, so no other press paths and no loops.

Not touched: sitemap.xml (stays 38 URLs), robots.txt, the four audience pages, homepage, pricing, checkout, auth, Supabase, vault, `/install`, Admin.tsx's internal RE/MAX links (admin-only workspace, not public).

## Verification

Playwright check of `/partnership` (H1, title, robots), `/` and `/resources` (no `/admin` in footer, `/install` still linked), the five noindex routes still `noindex`, `_redirects` syntax, sitemap count still 38, then `npm run build` and `npx tsc --noEmit -p tsconfig.app.json`.
