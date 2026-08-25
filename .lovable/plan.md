# Refresh the Public “About Asset Safe” Page

Copy and presentation refresh only for `/about`. No backend, Auth, billing, dashboard, product architecture, or route changes.

---

## Goal

Update the About page so it tells the current Asset Safe story: a place to document what you own, organize what you need to know, protect what is private, and be better prepared — without narrowing the narrative to home inventory or insurance claims.

## Scope

- **In scope**: `src/pages/About.tsx` copy, value-card titles/descriptions, CTA, Mission section, closing quote, SEO metadata, and minor layout/spacing adjustments needed for the revised copy.
- **Out of scope**: Dashboard, Features page, Knowledge Hub, Secure Vault behavior, Auth, MFA, Authorized Users, gifts, billing, Stripe, Supabase, RLS, storage, subscriptions, schema, Edge Functions, pricing, legal pages, and any new routes.

## Changes

### 1. Opening story

Replace the insurance-only framing with broader, human copy.

New opening:
- Lead: *“Asset Safe was built around a simple idea: the things you value, the information you rely on, and the memories you want to preserve should be easier to organize and protect.”*
- Include brand line: *“Everything you love. Protected in one place.”*
- Acknowledge the full scope in a few lines: property/asset documentation, important records, everyday household information, contacts and notes, memories, preparedness information, and sensitive legacy/digital-access information.
- Remove the italic “Insurance pays for what you can prove / Asset Safe helps you prove it.”

### 2. Three value cards

Keep the three-card layout and visual style, update titles and descriptions.

| Card | Title | Description |
|---|---|---|
| 1 | **Document What Matters** | Keep photos, receipts, records, values, and property details organized so important documentation is easier to find when you need it. |
| 2 | **Keep Life Organized** | Bring contacts, notes, reminders, household details, and meaningful family information together in one organized place. |
| 3 | **Protect What’s Private** | Keep sensitive digital-access and legacy information protected inside your Secure Vault. |

Keep existing circular icons unless a natural swap is needed. Keep card colors: brand-blue, teal-500, blue-600 backgrounds.

### 3. CTA

Replace “Start Your Documentation” with **“Get Started”**, linking to `/pricing` (existing approved CTA route).

### 4. “Our Mission” rewrite

Replace the property-documentation-only mission with:

- Heading: **Our Mission**
- Body: *“Asset Safe exists to make preparedness simpler. We help people organize the property, records, information, and memories they may need today — and make sure important details are easier to find when they matter most.”*
- Second paragraph: *“From documenting belongings and maintaining household knowledge to preparing for emergencies and preserving important instructions, Asset Safe brings the details of everyday life together in one organized place.”*

No disaster-prevention, reimbursement-guarantee, professional-advice-replacement, access-guarantee, or ownership-transfer claims.

### 5. Closing quote

Replace the disaster-loss quote with:

*“Being prepared isn’t only about what happens after something goes wrong. It’s about knowing the information that matters is already organized when you need it.”*

### 6. Terminology

Use current product labels only where they appear naturally: Asset Documentation, Knowledge Hub, Secure Vault, Legacy Locker, Digital Access, Authorized Users, Emergency Instructions.

Do not use retired terminology: Family Archive, Insights & Tools, Password and Accounts Catalog, Quick Notes as standalone, administrator/contributor/viewer roles.

### 7. Security language

Use restrained wording only: protected, organized, encrypted Secure Vault, private information. No zero-knowledge, end-to-end encryption, SOC 2 compliant, or absolute inaccessibility claims.

### 8. SEO metadata

Update `SEOHead` props in `About.tsx`:
- Title: keep as “About Asset Safe” or slightly broader if it improves clarity.
- Description: broaden from “help people organize and protect assets, important information, records, and memories” to reflect documentation, organization, and preparedness, while keeping the route/canonical at `https://getassetsafe.com/about`.
- Keywords: refresh to include preparedness, household information, secure vault, legacy planning, digital access, and similar current terms.

### 9. Audience breadth

Ensure the copy reads naturally for homeowners, renters, landlords, small businesses, and individuals/families. Do not assume every user owns a house, has children, is planning an estate, or is filing an insurance claim.

### 10. Layout

Preserve the existing compact structure: H1 heading, intro block, three value cards, primary CTA, Mission section, closing quote. Only adjust spacing if revised copy makes it necessary.

## Verification

After implementation, report:
- Final opening copy
- Final three value-card titles and descriptions
- Final CTA label and destination
- Final Mission copy
- Final closing statement
- Updated SEO title/description/keywords if changed
- Exact files changed
- `tsgo` typecheck and production build result
- Confirmation that no backend/product logic was touched
