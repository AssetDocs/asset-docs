
## Fold Subscription Agreement into Terms of Service + US-Only Clarification

### What Exists Today

**Terms of Service (`/terms`)** — 12 sections. Already contains:
- §10: Geographic Availability (one paragraph, thin — U.S. billing address only)
- §11: Billing and Payments (auto-renewal, refund contact)
- §12: Privacy Policy

**Subscription Agreement (`/subscription-agreement`)** — 7 sections with content not yet in Terms:
- §1: Geographic Availability — more detailed than ToS §10
- §2: Subscription Plans — subscription start date, billing period
- §3: Billing & Renewal — auto-renewal, pricing change notice
- §4: Cancellations & Access — cancel anytime, period-end access, no partial refunds, payment failure
- §5: Data Storage & Retention — user backup responsibility, data archival on inactivity
- §6: No Legal/Financial/Insurance Advice — already partially in ToS §5 (Service Limitations)
- §7: Updates to This Agreement — covered by ToS §8

---

### Changes Required

#### 1. `src/pages/Terms.tsx` — Expand and add sections

**Update §10 (Geographic Availability):**
Replace the current thin one-paragraph version with the fuller language from SA §1, explicitly calling out that paid subscriptions require a U.S. billing address and that this applies to all subscription types (monthly, yearly, and gifted):

> Paid subscription plans for Asset Safe — including monthly, yearly, and gift subscriptions — are currently available only to users with a valid United States billing address. While the platform is accessible globally for browsing and free account creation, completing a paid subscription requires a U.S. billing address at checkout. Asset Safe reserves the right to expand paid subscription availability to additional countries in the future.

**Add §13 — Subscription Plans:**
Merges SA §2. Covers: single plan model, subscription start date, billing period, identical access for monthly and yearly billing.

**Update §11 (Billing and Payments) → expand it:**
Merge SA §3 (Billing & Renewal) into the existing §11, which is currently thin. Add: auto-renewal language, payment authorization, pricing change notice with advance notification.

**Add §14 — Cancellations & Access:**
Merges SA §4. Covers: cancel anytime, access through end of billing period, no partial refunds for monthly periods, payment failure handling.

**Add §15 — Data Storage & Retention:**
Merges SA §5. Covers: user responsibility for their own backup copies, data archival or removal after extended inactivity or non-payment.

**Update the SEO description** on the Terms page to reflect the consolidated content:
> "Read the Asset Safe Terms of Service covering usage, subscription terms, billing, cancellations, data storage, privacy, and U.S.-only availability."

**Update the `canonicalUrl`** — keep `/terms`.

#### 2. `src/components/Footer.tsx` — Remove Subscription Agreement link

The Legal section currently has:
- Subscription Agreement → `/subscription-agreement`
- Legal & Ethical Considerations → `/legal`
- Terms of Use → `/terms`
- Cookie Policy → `/cookie-policy`

Remove the "Subscription Agreement" list item entirely. "Terms of Use" already points to `/terms` and will now contain all the merged content. No replacement link needed.

#### 3. `src/pages/Pricing.tsx` — Update link

Line 261–263: Change `href="/subscription-agreement"` → `href="/terms"`, update link text from "Subscription Agreement" to "Terms of Service".

#### 4. `src/pages/GiftCheckout.tsx` — Update link

Line 303–305: Change `href="/subscription-agreement"` → `href="/terms"`, update link text to "Terms of Service".

#### 5. `src/pages/SignupLegacy.tsx` — Update link

Line 404–406: Change `to="/subscription-agreement"` → `to="/terms"`, update link text from "Subscription Agreement" to "Terms of Service".

#### 6. `src/App.tsx` — Remove route + import

Remove:
```tsx
import SubscriptionAgreement from './pages/SubscriptionAgreement';
// and
<Route path="/subscription-agreement" element={<SubscriptionAgreement />} />
```

#### 7. Delete `src/pages/SubscriptionAgreement.tsx`

The file is no longer needed once its content is folded into Terms.

#### 8. `public/_redirects` — Add a 301 redirect

To handle anyone who bookmarked the old URL or finds it via search engines:
```
/subscription-agreement  /terms  301
```

---

### Summary Table

| File | Action |
|------|--------|
| `src/pages/Terms.tsx` | Update §10 with U.S.-only language for all subscription types; expand §11 (Billing); add §13 (Subscription Plans), §14 (Cancellations & Access), §15 (Data Storage & Retention); update SEO description |
| `src/components/Footer.tsx` | Remove "Subscription Agreement" link item from Legal section |
| `src/pages/Pricing.tsx` | Change `/subscription-agreement` → `/terms`; update link text |
| `src/pages/GiftCheckout.tsx` | Change `/subscription-agreement` → `/terms`; update link text |
| `src/pages/SignupLegacy.tsx` | Change `/subscription-agreement` → `/terms`; update link text |
| `src/App.tsx` | Remove import + route for `SubscriptionAgreement` |
| `src/pages/SubscriptionAgreement.tsx` | Delete file |
| `public/_redirects` | Add `301` redirect from `/subscription-agreement` to `/terms` |

No database changes. No edge function changes. No Stripe changes.
