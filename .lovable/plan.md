

# Comprehensive SEO Audit and Update Plan

## Summary

This plan covers a full SEO overhaul across all public-facing pages of getassetsafe.com, aligning meta tags, headings, structured data, sitemap, and robots.txt with the current product UX and feature set.

---

## Scope of Work

### Phase 1: Global SEO Foundation

**SEOHead Component Update** (`src/components/SEOHead.tsx`)
- Ensure default canonical uses `https://www.getassetsafe.com` (already correct)
- Add `noindex` support via an optional prop for pages that should not be indexed
- No other component changes needed; defaults are well-configured

**sitemap.xml Update** (`public/sitemap.xml`)
- Add missing public pages:
  - `/photography-guide`
  - `/press-news`
  - `/asset-documentation`
  - `/legacy-locker-info` (redirect canonical: `/legacy-locker`)
  - `/install`
  - `/partnership`
  - `/sample-dashboard` (already present, confirm)
- Remove any references to deprecated features (floor plans)
- Confirm `lastmod` dates are set to `2026-02-15`

**robots.txt Update** (`public/robots.txt`)
- Add disallow rules for admin sub-routes (`/admin/*`)
- Add disallow for `/test-email`, `/feedback`, `/complete-pricing`
- Add disallow for `/contributor-welcome`, `/dev-invite`, `/acknowledge-access`
- Verify no orphaned routes from previous UX versions remain allowed

### Phase 2: Add SEOHead to Pages Missing It (22+ Pages)

The following public pages currently lack `<SEOHead>`:

| Page | File | Proposed Title (max 60 chars) | Proposed Description |
|------|------|------|------|
| Q&A / FAQ | `QA.tsx` | `FAQ - Common Questions Answered \| Asset Safe` | `Find answers to common questions about digital home inventory, insurance documentation, Legacy Locker, pricing, and account security.` |
| Contact | `Contact.tsx` | `Contact Us - Get Support \| Asset Safe` | `Reach the Asset Safe team for questions about property documentation, account support, or partnership inquiries. Fast response guaranteed.` |
| Terms | `Terms.tsx` | `Terms and Conditions \| Asset Safe` | `Read the Asset Safe terms of service covering usage, privacy, intellectual property, and subscription policies for our documentation platform.` |
| Legal | `Legal.tsx` | `Legal & Ethical Considerations \| Asset Safe` | `Important legal disclaimers about property valuations, documentation standards, and ethical considerations for Asset Safe users.` |
| Cookie Policy | `CookiePolicy.tsx` | `Cookie Policy \| Asset Safe` | `Learn how Asset Safe uses cookies to improve your experience. Manage your cookie preferences and understand our data practices.` |
| Awareness Guide | `AwarenessGuide.tsx` | `Home Risk Awareness Guide \| Asset Safe` | `Identify hidden home risks from dryer vents to mold. Protect your property with proactive awareness and documentation strategies.` |
| State Requirements | `StateRequirements.tsx` | `State Insurance Requirements \| Asset Safe` | `Understand how insurance requirements and claim processes vary by state. Regional guidance for property documentation compliance.` |
| Industry Requirements | `IndustryRequirements.tsx` | `Industry Claims Requirements \| Asset Safe` | `Complete guide to industry-standard insurance claims processes. Steps, documentation, and requirements for filing property claims.` |
| Video Help | `VideoHelp.tsx` | `Video Tutorials & Help \| Asset Safe` | `Watch step-by-step video tutorials on account setup, property documentation, photo uploads, and dashboard features.` |
| Photography Guide | `PhotographyGuide.tsx` | `Photography Guide for Documentation \| Asset Safe` | `Best practices for photographing your assets. Lighting, angles, and tips to create insurance-ready property documentation.` |
| Press & News | `PressNews.tsx` | `Press & Insurance News \| Asset Safe` | `Latest news on insurance claims, industry investigations, and property protection. Stay informed with curated articles.` |
| Asset Documentation | `AssetDocumentation.tsx` | `Asset Documentation Types \| Asset Safe` | `Understand asset categories: liquid, fixed, tangible, intangible, and operating assets. Learn what to document and why.` |
| Install (PWA) | `Install.tsx` | `Install the App \| Asset Safe` | `Install Asset Safe on your phone or desktop for quick offline access. Available as a progressive web app on iOS and Android.` |
| Partnership | `Partnership.tsx` | `Partnership Opportunities \| Asset Safe` | `Explore partnership opportunities with Asset Safe. Insurance, real estate, and home service professionals welcome.` |
| Sample Dashboard | `SampleDashboard.tsx` | `Sample Dashboard Preview \| Asset Safe` | `Preview the Asset Safe dashboard before signing up. See how property documentation, inventory tracking, and security features work.` |
| NotFound (404) | `NotFound.tsx` | `Page Not Found \| Asset Safe` | Add `noindex` meta tag |
| Subscription Agreement | Already has SEOHead | Verify title fits 60-char limit | -- |

### Phase 3: Update Existing SEOHead Tags for Accuracy

Update meta titles and descriptions on pages that already have SEOHead but need refinement:

**Homepage** (`Index.tsx`)
- Title: `Digital Home Inventory & Legacy Planning | Asset Safe` (53 chars)
- Description: `Document your home, belongings, and important records in one secure platform. Insurance-ready inventory, Legacy Locker, and estate planning tools.`

**Features** (`Features.tsx`)
- Title: `All Features - Documentation & Protection | Asset Safe` (54 chars)
- Description: keep current (good)

**Pricing** (`Pricing.tsx`)
- Title: `Plans & Pricing - Starting at $12.99/mo | Asset Safe` (52 chars)
- Description: keep current (good)

**About** (`About.tsx`)
- Title: `About Us - Our Mission & Story | Asset Safe` (44 chars)
- Description: refine to 155 chars max

**Blog** (`Blog.tsx`)
- Title: `Blog - Property & Estate Planning Insights | Asset Safe` (55 chars)

**Scenarios** (`Scenarios.tsx`)
- Title: `Insurance Claim Scenarios | Asset Safe` (38 chars)

**Legacy Locker Info** (`LegacyLockerInfo.tsx`)
- Title: `Legacy Locker - Secure Digital Vault | Asset Safe` (49 chars)
- Canonical: confirm `/legacy-locker` vs `/legacy-locker-info` route alignment

**Gift** (`Gift.tsx`) - Title fits, keep as-is

**Glossary** (`Glossary.tsx`) - Title fits, keep as-is

**Social Impact** (`SocialImpact.tsx`) - Title fits, keep as-is

**Testimonials** (`Testimonials.tsx`) - Verify title length

### Phase 4: H1 Tag Audit

Ensure exactly one H1 per page matching page intent:

- `QA.tsx`: H1 = "Frequently Asked Questions" (good)
- `Contact.tsx`: H1 = "Contact Us" (good)
- `Terms.tsx`: H1 = "Terms and Conditions" (good)
- `Legal.tsx`: H1 = "Legal & Ethical Considerations" (good)
- `Scenarios.tsx`: H1 = "Scenarios" -- Update to "Insurance Claim Scenarios" (match SEO intent)
- `HeroSection.tsx` (Index): H1 = "Everything you own. Protected in one place." (good)
- Verify no pages have multiple H1 tags or missing H1

### Phase 5: Structured Data Enhancements

**Add FAQ schema** to:
- `QA.tsx` (primary FAQ page -- highest priority)
- `Contact.tsx` (has Q&A section referencing FAQ)

**Add BreadcrumbList schema** to pages missing it:
- `Contact.tsx`, `QA.tsx`, `Terms.tsx`, `Legal.tsx`, `CookiePolicy.tsx`, `VideoHelp.tsx`, `StateRequirements.tsx`, `IndustryRequirements.tsx`, `AwarenessGuide.tsx`, `PressNews.tsx`, `AssetDocumentation.tsx`, `PhotographyGuide.tsx`

**Verify existing schemas**:
- `organizationSchema` -- correct
- `webApplicationSchema` -- verify price reflects current plans
- `softwareApplicationSchema` -- review `aggregateRating` (only use if real reviews exist)
- `videoSchema` on Index -- confirm video URL is current

### Phase 6: Terminology & Feature Alignment

Update SEO copy across all pages to use current product terminology:
- "Authorized Users" (not "Trusted Contacts") in SEO meta where applicable
- "Secure Vault" for the Password Catalog + Legacy Locker combined area
- "Memory Safe" / "Family Archive" where relevant
- Remove any references to floor plans in descriptions or keywords
- Ensure "MFA" is used, never "2FA"

### Phase 7: robots.txt & Sitemap Final Cleanup

**robots.txt additions**:
```
Disallow: /admin/*
Disallow: /test-email
Disallow: /feedback
Disallow: /complete-pricing
Disallow: /contributor-welcome
Disallow: /dev-invite
Disallow: /acknowledge-access
Disallow: /features-list
Disallow: /schedule-professional
Disallow: /account/*
Disallow: /damage/*
Disallow: /inventory
```

**sitemap.xml additions**:
```xml
<url><loc>https://www.getassetsafe.com/photography-guide</loc>...</url>
<url><loc>https://www.getassetsafe.com/press-news</loc>...</url>
<url><loc>https://www.getassetsafe.com/asset-documentation</loc>...</url>
<url><loc>https://www.getassetsafe.com/install</loc>...</url>
<url><loc>https://www.getassetsafe.com/partnership</loc>...</url>
<url><loc>https://www.getassetsafe.com/subscription-agreement</loc>...</url>
```

### Phase 8: Internal Linking Pass

- Verify homepage links to: Features, Pricing, Legacy Locker, Gift, Blog, Scenarios, Claims
- Add descriptive anchor text where "click here" or generic text exists
- Ensure Footer links cover all major public pages (already well-structured)

### Phase 9: Image Alt Text & Performance

- Verify all `<img>` tags have descriptive `alt` text aligned with page keywords
- Confirm `loading="lazy"` on below-fold images
- YouTube embeds: add `loading="lazy"` attribute

---

## Files to Be Modified

1. `src/components/SEOHead.tsx` -- add optional `noIndex` prop
2. `public/sitemap.xml` -- add missing pages, update dates
3. `public/robots.txt` -- expand disallow rules
4. `src/pages/QA.tsx` -- add SEOHead + FAQ schema
5. `src/pages/Contact.tsx` -- add SEOHead + breadcrumb schema
6. `src/pages/Terms.tsx` -- add SEOHead
7. `src/pages/Legal.tsx` -- add SEOHead
8. `src/pages/CookiePolicy.tsx` -- add SEOHead
9. `src/pages/AwarenessGuide.tsx` -- add SEOHead + breadcrumb
10. `src/pages/StateRequirements.tsx` -- add SEOHead + breadcrumb
11. `src/pages/IndustryRequirements.tsx` -- add SEOHead + breadcrumb
12. `src/pages/VideoHelp.tsx` -- add SEOHead + breadcrumb
13. `src/pages/PhotographyGuide.tsx` -- add SEOHead + breadcrumb
14. `src/pages/PressNews.tsx` -- add SEOHead + breadcrumb
15. `src/pages/AssetDocumentation.tsx` -- add SEOHead + breadcrumb
16. `src/pages/Install.tsx` -- add SEOHead
17. `src/pages/Partnership.tsx` -- add SEOHead
18. `src/pages/SampleDashboard.tsx` -- add SEOHead
19. `src/pages/NotFound.tsx` -- add SEOHead with noIndex
20. `src/pages/Index.tsx` -- update title/description
21. `src/pages/Scenarios.tsx` -- update H1 and title
22. `src/pages/About.tsx` -- trim title to 60 chars
23. `src/pages/Blog.tsx` -- trim title
24. `src/components/HeroSection.tsx` -- add `loading="lazy"` to YouTube iframe

---

## Recommended Future SEO Landing Pages

After implementation, these high-intent pages would strengthen organic search:

1. **"Home Inventory for Insurance Claims"** -- Target: homeowners searching for claims prep
2. **"What to Document Before a Natural Disaster"** -- Target: disaster preparedness searches
3. **"Digital Estate Planning Checklist"** -- Target: estate planning + digital assets
4. **"Renter's Inventory Guide for Security Deposits"** -- Target: renters protecting deposits
5. **"How to Photograph Your Home for Insurance"** -- Target: documentation how-to searches
6. **"Small Business Asset Documentation Guide"** -- Target: business owners needing compliance docs
7. **"Moving Checklist: Document Everything Before You Move"** -- Target: relocation + moving protection

