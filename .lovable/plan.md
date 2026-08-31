# Reorganize the Public Site Footer

Footer information-architecture and responsive UI update only. No route, content, SEO metadata, backend, auth, billing, dashboard, or legal-content changes. All destination URLs preserved.

Resolved decisions:
- Re-add **Admin** (`/admin`) link under the Legal subsection (user explicitly confirmed).
- **Partnership stays out of the public footer** — it already exists in the admin workspace under "Business Opportunities & Partnerships" (`src/pages/Admin.tsx`, navigating to `/partnership`). No admin change needed.

## Changes

### 1. `src/components/Footer.tsx` (only file changed)

Retire the "References" heading and regroup into purpose-based columns. Keep dark `bg-brand-darkGray` styling, existing typography scale, social icons, and copyright line unchanged.

**Desktop (lg and up): 6-column grid — `hidden lg:grid lg:grid-cols-6`**

| Column | Contents |
|---|---|
| Get Social | Social icons (Facebook, X, YouTube, Instagram), then Contact Us block (McKinney, Texas / United States / Ask Ashley chat line) |
| Quick Links | Services: All Features, Pricing, Gift Subscriptions, Testimonials. Support: FAQs, Contact, Account Assistance, Add to Home Screen, Video Help |
| Who It's For | Homeowners, Renters, Landlords, Small Business (from `audienceNavLinks`), + Industry Applications (`/features#industries`) |
| Guides & Resources | Blog, Resources (`/resources`, label shortened from "Resources & Security"), Awareness Guide, Glossary |
| Documentation & Claims | Asset Documentation, Claims (`/claims`, label shortened from "Claims Documentation"), Scenarios, State Requirements, Industry Requirements |
| About | About Us, Social Impact, Technical. Legal subsection: Legal & Ethical Considerations, Terms of Use, Cookie Policy, Admin (`/admin`) |

- All links remain `<Link>`/`<a>` crawlable anchors with identical `to`/`href` values.
- Column balance: tallest columns ~7–9 items, no single catch-all column.

**Mobile & tablet (below lg): accordion layout — `lg:hidden`**

Use the existing shadcn `Accordion` (`src/components/ui/accordion.tsx`, already used in Navbar), `type="multiple"` so sections open/close independently. Groups:
1. Quick Links (Services + Support subgroups)
2. Who It's For
3. Guides & Resources
4. Documentation & Claims
5. About (incl. Legal subsection)
6. Support & Contact (address + Ask Ashley)

- Social icons and copyright render outside the accordion, always visible.
- AccordionTrigger provides keyboard access, chevron indicator, and `aria-expanded` out of the box; links inside content stay standard anchors in the DOM.
- Breakpoint `lg` (1024px) follows the project's existing Tailwind conventions — tablet gets the compact accordion rather than a cramped multi-column grid.

### 2. No other files

- `src/data/audienceNav.ts` reused as-is for the Who It's For links (single source of truth preserved).
- No sitemap, route, metadata, or page changes.

## Verification

1. `npm run build` / typecheck clean.
2. Playwright: desktop (1280px) — confirm 6 columns, no "References" heading, Industry Applications under Who It's For, Admin under Legal; tablet (834px) and mobile (390px) — confirm accordion renders, sections expand/collapse, `aria-expanded` toggles, social icons and copyright visible, no horizontal overflow.
3. Diff all footer `to`/`href` values before/after to confirm every destination URL preserved (plus the one intentional addition: `/admin`).
