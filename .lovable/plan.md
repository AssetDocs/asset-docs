

## Billing and Subscription Management Improvements

### Overview
Four changes to improve how users manage their payment methods, storage add-ons, and subscription plan from within their dashboard.

---

### 1. Simplify Payment Methods Card (BillingTab)

**Current:** Shows "No payment methods on file" text and icon when empty, which is unnecessary clutter.

**Change:** Remove the empty-state text/icon. Always show just the card title, description, and a single "Manage Payment Methods" button regardless of whether cards are on file.

**File:** `src/components/BillingTab.tsx`
- Remove the loading skeleton, the card display loop, and the empty-state block
- Replace with a single "Manage Payment Methods" button that opens the Stripe Customer Portal
- Keep the title "Payment Methods" and description "Your saved payment methods for subscriptions"

---

### 2. Add Storage Add-on CTA (SubscriptionTab - Subscribed View)

**Current:** The storage add-on info section (lines 634-652) shows "+25GB for $4.99/month" with bullet points but has **no button** to actually purchase it.

**Change:** Add an "Add Storage" button at the bottom of that section. This button will open the Stripe Customer Portal where users can adjust their storage add-on quantity (1x25GB, 2x25GB, etc.).

**File:** `src/components/SubscriptionTab.tsx` (subscribed view, ~line 651)
- Add a "Add Storage via Stripe" button that calls the existing `handleManageBilling` function

---

### 3. Stripe Customer Portal Configuration (Information)

The Stripe Customer Portal must be configured in the **Stripe Dashboard** to allow plan switching and product management. This is **not a code change** -- it requires updating settings at:

**Stripe Dashboard > Settings > Billing > Customer Portal**

- Enable "Allow customers to switch plans" and add your Standard and Premium prices
- Enable "Allow customers to update subscriptions" to let them adjust the 25GB storage add-on quantity
- These settings control what options appear when users click "Manage Billing"

This is a Stripe-side configuration, not a Lovable change.

---

### 4. Add "Manage Subscription" CTA to Plan Tab (SubscriptionTab - Subscribed View)

**Current:** The subscribed view shows the current plan details and a single "Manage Billing" button at the bottom. There's no clear CTA specifically for upgrading/downgrading plans.

**Change:** Add a dedicated "Upgrade or Change Plan" button inside the current plan display card (the green box), making it immediately visible. This will also open the Stripe Customer Portal.

**File:** `src/components/SubscriptionTab.tsx` (subscribed view, ~line 607)
- Add a "Change Plan" button inside the current plan card that calls `handleManageBilling`

---

### Technical Details

**Files to modify:**
- `src/components/BillingTab.tsx` -- Simplify to title + description + single CTA
- `src/components/SubscriptionTab.tsx` -- Add two buttons (storage add-on CTA + change plan CTA)

**No backend changes needed.** All buttons reuse the existing `customer-portal` edge function.

**Important Stripe Dashboard action required:** Configure the Customer Portal to allow plan switching and subscription updates. Without this, the portal will only show invoice history and payment method management.

