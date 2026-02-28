
## Pricing & FAQ Text Updates

### Summary
Three targeted text changes across two files. No logic, no structure, no layout changes.

---

### File 1 — `src/components/PricingPlans.tsx` (line 14)

**Change:** Update the feature list item in the Asset Safe Plan features array.

- **From:** `"Secure Vault & Password Catalog"`
- **To:** `"Secure Vault & Digital Access Catalog"`

---

### File 2 — `src/components/FAQAccordion.tsx`

This file powers both the Q&A navigation page (footer link) and the dropdown FAQ on the pricing page, so both update in sync.

**Change A — FAQ question title (line 372)**
- **From:** `What is the Password & Accounts Catalog?`
- **To:** `What is the Password & Digital Access Catalog?`

**Change B — FAQ answer body (line 374)**
- **From:** `The Password & Accounts Catalog is a secure, encrypted section of Asset Safe where you can record login credentials, account numbers, PINs, subscriptions, and other access information that trusted individuals may need during an emergency or transition.`
- **To:** `The Password & Digital Access Catalog is a secure, encrypted section of Asset Safe where you can record login credentials for everyday online accounts like subscriptions, utilities, and personal services. And, other access information that trusted individuals may need during an emergency or transition.`

**Change C — "What types of accounts can I store?" list (lines 396–403)**

Remove the first two bullet points only:
- ~~Banking and investment accounts~~
- ~~Mortgage and insurance portals~~

Keep:
- Email and social media accounts
- Utilities and subscription services
- Medical and healthcare portals
- Cloud storage and photo accounts

---

### What Is NOT Changing
- The section heading "Password & Account Security" on line 368 — not referenced in the request
- The answer on line 388 referencing "Password & Accounts Catalog" (the authorized users question) — not referenced in the request, but can be updated in a follow-up if desired
- All other FAQ entries, pricing pages (SubscriptionTab, CompletePricing, GiftCheckout, Pricing.tsx) — only `PricingPlans.tsx` was specified for the pricing table change
- No encryption, routing, database, or logic changes
