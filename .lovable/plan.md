

# Domain Migration: assetsafe.net → getassetsafe.com (Updated Plan)

## Key Decision

**All email addresses stay as `@assetsafe.net`** (Google Workspace). Only website URLs and display references change to `getassetsafe.com`. This means no Resend domain changes are needed.

---

## What Changes

| Category | What changes | What stays the same |
|----------|-------------|-------------------|
| Website URLs | `assetsafe.net` → `getassetsafe.com` | -- |
| Email "from" addresses | -- | `support@assetsafe.net`, `noreply@assetsafe.net`, etc. |
| `mailto:` links | -- | `support@assetsafe.net` |
| Email template links | `assetsafe.net/...` → `getassetsafe.com/...` | -- |
| Email template logo URLs | `assetsafe.net/lovable-uploads/...` → `getassetsafe.com/lovable-uploads/...` | -- |

---

## Phase 1 — SEO and Static Files

Update all canonical URLs, Open Graph tags, and sitemap entries.

**Files:**
- `index.html` — canonical, og:url, og:image, twitter:image URLs
- `public/sitemap.xml` — all page URLs (~20 entries)
- `public/robots.txt` — Sitemap URL
- `src/utils/structuredData.ts` — organization schema, product schema, breadcrumb URLs, logo URL

**~24 page files** with `canonicalUrl` or `breadcrumbSchema` references:
- `Index.tsx`, `About.tsx`, `Blog.tsx`, `Claims.tsx`, `Contact.tsx`, `CookiePolicy.tsx`, `Features.tsx`, `Gift.tsx`, `Glossary.tsx`, `Install.tsx`, `Insurance.tsx`, `AwarenessGuide.tsx`, `IndustryRequirements.tsx`, `Legal.tsx`, `LegacyLockerInfo.tsx`, `PhotographyGuide.tsx`, `Pricing.tsx`, `QA.tsx`, `Resources.tsx`, `Scenarios.tsx`, `SocialImpact.tsx`, `StateRequirements.tsx`, `Terms.tsx`, `Testimonials.tsx`

---

## Phase 2 — Frontend Display References

Update hardcoded website references (not email addresses).

- `src/pages/Install.tsx` — PWA instructions mentioning `assetsafe.net`
- `src/components/ExportAssetsButton.tsx` — alert text referencing `AssetSafe.net`
- `src/pages/TestEmail.tsx` — display text referencing domain
- Any other UI text that says "assetsafe.net" as a website name

**Not changing:** Any `mailto:support@assetsafe.net` references remain as-is.

---

## Phase 3 — Edge Function Email Templates (Links and Images Only)

Update only the **website URLs and logo image URLs** inside email HTML templates. The `from:` addresses stay unchanged.

**21 edge functions affected (links/images only, NOT from addresses):**
- `send-gift-email`
- `send-cancellation-notice`
- `send-contact-email`
- `send-contributor-invitation`
- `send-delegate-access-email`
- `send-subscription-welcome-email`
- `send-deletion-confirmation`
- `send-test-email`
- `send-reminder-email`
- `send-payment-reminder`
- `send-recovery-request-email`
- `send-recovery-approved-email`
- `send-recovery-rejected-email`
- `send-property-update`
- `send-security-alert`
- `send-storage-warning`
- `send-payment-receipt` / `send-payment-receipt-internal`
- `invite-dev-team-member`
- `submit-deletion-request`
- `respond-deletion-request`
- `send-welcome-email`
- `notify-visitor-access`

**What changes in each function:**
- `https://www.assetsafe.net/account` → `https://www.getassetsafe.com/account` (and similar page links)
- `https://www.assetsafe.net/lovable-uploads/...` → `https://www.getassetsafe.com/lovable-uploads/...` (logo images)
- Any footer text referencing the website URL

**What does NOT change:**
- `from: "AssetSafe <support@assetsafe.net>"` — stays
- `to: ["support@assetsafe.net"]` — stays
- `mailto:support@assetsafe.net` in email footers — stays

---

## Phase 4 — Verification

- Test email delivery by sending a test email from the TestEmail page
- Verify all email links point to `getassetsafe.com`
- Verify logo images load in emails
- Check sitemap and robots.txt are accessible at `getassetsafe.com`

---

## No Prerequisites Needed

Since we are keeping all `@assetsafe.net` email addresses and only changing website URLs, there are no Resend domain verification steps required before implementation.

---

## Technical Detail

The migration is a targeted find-and-replace:
- `https://www.assetsafe.net` → `https://www.getassetsafe.com` (website URLs)
- `https://assetsafe.net` → `https://getassetsafe.com` (without www)
- Display text `"assetsafe.net"` → `"getassetsafe.com"` (where referring to the website, not email)

All `@assetsafe.net` email addresses and `mailto:` links are explicitly excluded from changes.

