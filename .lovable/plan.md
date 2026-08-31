# Rebuild the Public Partnerships Page (`/partnership`)

Replace the current proposal-style page (stacked white cards, founder contact block in the header, outdated claims) with a modern, concise public partnerships page that matches the rest of the Asset Safe marketing site.

## Scope

- Only `src/pages/Partnership.tsx` is rewritten. Route, URL, and indexability stay the same.
- The internal admin B2B strategy page (`/admin/b2b-opportunities`) and all other admin partnership pages are untouched.
- No auth, billing, dashboard, database, or subscription changes.

## New page structure

1. **Hero** — H1 "Partner With Asset Safe", supporting headline, two-paragraph intro, primary CTA "Explore Partnership Opportunities" (anchors to the opportunities section) and secondary CTA "See What Asset Safe Does" (links to `/features`). No founder name or phone in the hero.
2. **Why Partner** — "Extend the value of what you already do." plus four benefit cards: Add Meaningful Value, Strengthen Relationships, Encourage Preparedness, Differentiate Your Organization.
3. **Partnership Opportunities** — "Built for Organizations That Serve People, Homes & Communities". Responsive grid (3 columns desktop, 2 tablet, 1 mobile) of the nine cards: Real Estate, HOAs, Mortgage/Lending/Title/Financial, Property Management, Insurance Agents, Restoration & Disaster Recovery, Estate Planning/Trust/Elder Care, Employer Benefits & EAPs, Builders/Developers/New Construction. Each card uses the supplied title, subheading, and body verbatim.
4. **Flexible Ways to Partner** — five concise rows: Sponsored Memberships, Closing & Welcome Programs, Organization & Community Programs, Educational Partnerships, Co-Branded Introductions. No affiliate/commission language.
5. **Privacy & Trust** — visually distinct tinted band: "Your Relationship. Their Information." with the supplied copy and a simple three-step sequence (organization provides the benefit → customer owns the account → their information stays private).
6. **Core Partnership Insight** — "Built to Support What You Already Care About" with the emphasized three-line statement.
7. **Final CTA** — "Let's Explore What Asset Safe Could Look Like for Your Organization", primary "Explore a Partnership" and secondary "Contact Asset Safe", both routed to the existing `/contact` page/form (plus a `mailto:support@assetsafe.net` link). Small audience line beneath.

## Content removals

Everything currently on the page that conflicts with present positioning goes: AI-assisted valuation, "accurate settlement amounts", "expedite insurance claims processing" as a promise, asset verification for loans/mortgages/investments, passive income / affiliate revenue program, "professional-grade home inventory" framing, the founder contact card at the top, the emoji-led card headers, and the mission/blockquote block. No invented stats, logos, testimonials, or endorsements.

## Design & technical notes

- Existing design system only: `Card`, `Button`, Tailwind semantic tokens (`bg-background`, `bg-muted/30`, `text-primary`, `border-border`). No hardcoded colors, no emoji.
- Alternating subtle section backgrounds instead of boxing every paragraph; generous vertical spacing; restrained lucide icons (one per card, decorative with `aria-hidden`).
- The page currently imports `Navbar` and `Footer` but never renders them. The rebuild will render both so the page matches every other public marketing page.
- Anchor scroll: opportunities section gets `id="partnership-opportunities"` with `scroll-mt` offset for the sticky navbar; the hero CTA is a real anchor link so it works with keyboard.
- Heading order H1 → H2 per section → H3 per card; semantic `<section>` with `aria-labelledby`.
- Mobile: single-column stacks, no fixed widths, tap-friendly full-width CTAs, verified at 390px for overflow.
- SEO via the existing `SEOHead`: title "Partnership Opportunities | Asset Safe", the supplied meta description, self-canonical `https://getassetsafe.com/partnership`, index/follow retained. No new structured data.

## Verification

Build + typecheck, load `/partnership` in a browser at 390px and desktop, grep the rendered page for the banned terms (AI valuation, settlement amounts, passive revenue, asset verification, RE/MAX), and confirm the admin B2B page is unchanged.
