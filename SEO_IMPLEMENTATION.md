# Asset Safe - SEO Implementation Guide
**Last Updated: January 2, 2026**

## Overview
This document outlines the comprehensive SEO implementation for Asset Safe, including technical optimizations, schema markup, content strategy, and keyword cannibalization handling.

---

## ✅ Completed SEO Improvements

### 1. Unique Title Tags & Meta Descriptions
- **Status**: Complete on all public pages
- **Implementation**: Reusable `SEOHead` component (`src/components/SEOHead.tsx`)
- **Pages with SEO**:
  - Homepage, Features, Pricing, About, Blog, Contact
  - Gift, Legacy Locker, Scenarios, Claims, Testimonials
  - Social Impact, Glossary, Resources, Q&A
  - All blog posts (dynamic SEO)
- **Details**: Each page has unique, keyword-optimized titles (50-60 chars) and descriptions (140-160 chars)

### 2. Clean URL Structure
- **Status**: Complete
- **URLs**: All routes use clean, human-readable URLs
  - `/features`, `/pricing`, `/scenarios`, `/about`, `/contact`, etc.
  - No query strings except where necessary

### 3. H1 + Hierarchical Headings
- **Status**: Complete
- **Details**: 
  - Single H1 per page with primary keyword
  - Proper H2, H3, H4 hierarchy throughout
  - Keyword placement in first 100 words of body content

### 4. Structured Data (Schema.org)
- **Status**: Complete
- **Location**: `src/utils/structuredData.ts`
- **Schemas Implemented**:
  | Schema Type | Usage |
  |-------------|-------|
  | Organization | Homepage, About page |
  | WebApplication | Homepage |
  | SoftwareApplication | App-related pages |
  | Product | Pricing page (Standard & Premium plans), Gift page |
  | FAQPage | Homepage, Pricing, Legacy Locker |
  | BreadcrumbList | All pages |
  | Article | All blog posts |
  | VideoObject | Homepage hero video |
  | HowTo | Claims page (step-by-step guide) |
  | Service | Scenarios page |

### 5. XML Sitemap
- **Status**: Complete
- **Location**: `public/sitemap.xml`
- **Includes**: 30+ URLs with priorities, changefreq, and lastmod dates
- **Categories**: Core pages, Blog, Product pages, Resources, Use-case pages, Legal

### 6. Robots.txt Optimization
- **Status**: Complete
- **Location**: `public/robots.txt`
- **Allowed**: All public marketing pages, blog, resources
- **Disallowed**: Auth flows, admin, user dashboards, checkout flows
- **Sitemap reference**: Included

### 7. Canonical Tags
- **Status**: Complete
- **Details**: Added via SEOHead component to all pages

### 8. Open Graph & Twitter Cards
- **Status**: Complete
- **Details**: Full OG and Twitter Card meta tags on all pages
- **Includes**: og:type, og:image, og:url, twitter:card, twitter:image

### 9. Image Optimization
- **Status**: Complete
- **Implemented**:
  - Descriptive alt tags on all images
  - Lazy loading (`loading="lazy"`) on non-critical images
  - Width/height attributes to prevent layout shift

### 10. Video Schema
- **Status**: Complete
- **Details**: VideoObject schema on homepage hero video with title, description, thumbnail, duration, embedUrl

---

## 🔍 Keyword Cannibalization Strategy

### Problem
Use-case pages (Scenarios, Claims) and industry pages (Industry Requirements, State Requirements) could compete for similar keywords.

### Solution: Topic Differentiation

| Page | Primary Keywords | Unique Angle |
|------|------------------|--------------|
| **Scenarios** | "insurance claim scenarios", "natural disaster documentation" | **Event types** - what can happen |
| **Claims** | "insurance claim documentation", "proof of loss" | **Process** - what documents you need |
| **Industry Requirements** | "insurance industry requirements", "claims process" | **Compliance** - industry standards |
| **State Requirements** | "state insurance requirements", "regional differences" | **Geography** - state-specific rules |
| **Features (Homeowners)** | "homeowner property documentation" | **User type** - feature benefits |
| **Features (Renters)** | "renter inventory documentation" | **User type** - renter-specific |
| **Features (Business)** | "business asset documentation" | **User type** - business needs |
| **Features (Landlords)** | "landlord property documentation" | **User type** - landlord needs |

### Internal Linking Strategy
Each page links contextually to related pages, establishing topical authority:
- **Scenarios** → links to Claims (for "what documents you need")
- **Claims** → links to Glossary (for term definitions)
- **Industry Requirements** ↔ State Requirements (cross-reference)
- **Blog posts** → link to relevant feature pages

### URL Hierarchy
```
/scenarios          → Event-based documentation needs
/claims             → Process-based documentation guide
/industry-requirements → Compliance standards
/state-requirements    → Geographic variations
/features           → Product features by user type
```

---

## 📊 Core Web Vitals Optimization

### Performance Measures
1. **Preconnect links** in `index.html` for Supabase, fonts
2. **Lazy loading** for images and non-critical components
3. **Code splitting** via React Router
4. **Tailwind CSS purging** for minimal CSS bundle
5. **Vite bundling** with tree shaking

### Target Metrics
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Testing Recommendations
- Test with Google PageSpeed Insights monthly
- Monitor Core Web Vitals in Google Search Console
- Use Chrome DevTools Lighthouse audit

---

## 📝 Target Keywords by Intent

### Informational (Blog)
- "what is a digital home inventory"
- "how to document home for insurance"
- "estate planning digital vault"
- "legacy locker vs will"
- "what documents for insurance claim"

### Commercial (Features/Pricing)
- "home inventory app"
- "property documentation software"
- "digital asset management for homeowners"
- "insurance claim documentation app"
- "digital estate vault"

### Transactional (Pricing/Gift)
- "buy home inventory subscription"
- "gift home documentation service"
- "property protection subscription"

---

## 🔗 Internal Linking Map

```
Homepage
├── Features (via nav + CTA)
├── Pricing (via nav + CTA)
├── Blog (via nav)
├── About (via nav)
└── Gift (via pricing tab)

Features
├── Pricing (CTA)
├── Legacy Locker (feature highlight)
└── Scenarios (use cases)

Pricing
├── Features (learn more)
├── Gift (tab)
└── FAQ (internal anchors)

Blog
├── Individual posts → Features, Pricing, Resources
├── Category filters
└── CTA → Pricing

Resources
├── Glossary
├── Checklists
└── Q&A

Topical Flow:
Scenarios → Claims → Glossary
State Requirements ↔ Industry Requirements
```

---

## 🚀 Next Steps & Recommendations

### Immediate (This Week)
1. Submit updated sitemap to Google Search Console
2. Verify structured data with Google Rich Results Test
3. Test all pages with PageSpeed Insights

### Short-term (This Month)
1. Add FAQ schema to Features and Gift pages
2. Create "Related Articles" section in blog posts
3. Add more internal links within blog content

### Ongoing
- Monitor keyword rankings weekly
- Update sitemap dates when content changes
- Publish 2-4 blog posts monthly
- Review Core Web Vitals quarterly

---

## Technical Details

### Files Created/Updated
| File | Purpose |
|------|---------|
| `src/components/SEOHead.tsx` | Reusable SEO meta tag component |
| `src/utils/structuredData.ts` | Schema markup generators (12 schema types) |
| `public/sitemap.xml` | XML sitemap (30+ URLs) |
| `public/robots.txt` | Crawler directives |
| `index.html` | Base meta tags, preconnects |

### Pages with Full SEO Implementation
- `Index.tsx` - Organization, WebApp, FAQ, Video schemas
- `Features.tsx` - Breadcrumb schema
- `Pricing.tsx` - Product, FAQ, Breadcrumb schemas
- `Blog.tsx` - Breadcrumb schema
- `BlogPost.tsx` - Article, Breadcrumb schemas (dynamic)
- `Gift.tsx` - Product, Breadcrumb schemas
- `LegacyLockerInfo.tsx` - FAQ, Breadcrumb schemas
- `Scenarios.tsx` - Service, Breadcrumb schemas
- `Claims.tsx` - HowTo, Breadcrumb schemas
- `Testimonials.tsx` - WebPage, Breadcrumb schemas
- `SocialImpact.tsx` - Breadcrumb schema
- `Glossary.tsx` - Breadcrumb schema
- `About.tsx` - Organization, Breadcrumb schemas
- `Resources.tsx` - Breadcrumb schema

---

## Compliance & Best Practices

✅ Mobile-first responsive design
✅ HTTPS enabled (via Lovable hosting)
✅ Clean, semantic HTML (<header>, <main>, <section>, <footer>)
✅ Accessible navigation
✅ Fast page load times
✅ No duplicate content
✅ Canonical tags on all pages
✅ Video schema for embedded content
✅ Article schema for blog posts

---

## Resources

- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Documentation](https://schema.org)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

*Document maintained by the Asset Safe development team.*
