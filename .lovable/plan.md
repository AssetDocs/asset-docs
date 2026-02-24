

## Billing Tab Improvements

Two changes to streamline the Billing tab with a "read-only summary + manage in Stripe" pattern.

### 1. Simplify Payment Methods Card

**Current state:** Shows card details with a per-card "Manage" button AND a separate "Add or Update Payment Method" button -- redundant CTAs.

**Change:** Keep the read-only card display (brand, last4, expiration) but remove the per-card "Manage" button. Replace the bottom "Add or Update Payment Method" button with a single "Manage Payment Methods" button. When no cards are on file, show the same single CTA.

**File:** `src/components/BillingTab.tsx`
- Remove the `<Button>` inside each card row (lines 99-107)
- Change the bottom button label to "Manage Payment Methods"
- Same button in the empty state

### 2. Add "View Full Billing History" CTA to Payment History

**Current state:** Shows recent payments in-app with no way to access invoices, PDFs, or refund details.

**Change:** Add a "View Full Billing History" button at the bottom of the payment list that opens the Stripe Customer Portal (same `customer-portal` edge function already used by BillingTab).

**File:** `src/components/PaymentHistory.tsx`
- Import `Button` from ui/button and `ExternalLink` from lucide-react
- Add `supabase` import (already present)
- Add `handleViewFullHistory` function that invokes `customer-portal` and opens the URL
- Add a `Button` after the payment list: "View Full Billing History in Stripe"
- Also show this button in the empty state as a secondary option

### No Backend Changes
Both changes reuse the existing `customer-portal` edge function. No new edge functions, database changes, or secrets needed.

