
# Pricing Page UX Restructure — Email, Consent & US-Only Notice

## Context: Name Collection (Answered)

Name is collected **after** payment in the onboarding wizard (`/onboarding`), not on the pricing page. The flow is:
Pricing → Stripe Checkout → Email Magic Link → Create Password → Onboarding (Name / Phone / First Property) → Dashboard.
No name field is needed here.

## What's Changing

All three elements (email input, consent checkbox, Continue button) currently live in three separate blocks **below** the `SubscriptionPlan` card. The plan is to reorganize them so they sit **inside** the features card itself, in the correct order, with the US-only notice appearing just below the card.

### Desired order inside the card:
1. Features list (existing — unchanged)
2. Email input field (guest-only, with helper text)
3. Agreement checkbox
4. Continue button

### Below the card:
- "Paid subscriptions are currently available to U.S. billing addresses only."

---

## Technical Approach

The `SubscriptionPlan` component renders the Continue button in its own `<CardFooter>`. To place the email field and checkbox **inside** the card above the button, the cleanest approach is to extend `SubscriptionPlan` to accept optional `children` rendered between the feature list and the footer button — or, since this only applies to `Pricing.tsx`, pass the email/consent JSX as a `footerSlot` prop.

However, the simplest approach that requires the fewest changes and follows the existing pattern is to **pass the email input, checkbox, and button entirely from `Pricing.tsx`** by removing the `onClick` / `buttonText` from `SubscriptionPlan` and instead rendering the full footer block from the parent. This keeps `SubscriptionPlan` generic and avoids over-engineering.

**Chosen approach**: Add an optional `footer` prop (type `React.ReactNode`) to `SubscriptionPlan`. When provided, it replaces the default `<Button>` in `CardFooter`. `Pricing.tsx` passes the assembled email + checkbox + button block as this prop.

---

## Files to Change

### `src/components/SubscriptionPlan.tsx`
- Add optional `footer?: React.ReactNode` prop to the interface.
- In `CardFooter`, render `footer` if provided, otherwise render the existing `<Button>`.

### `src/pages/Pricing.tsx`
- Build a `footerBlock` JSX variable containing, in order:
  1. **Email input** (guest-only, `!user && !subscriptionStatus.subscribed`):
     - Label: "Your email address"
     - Helper text below the input: *"We'll use this to create your account and send access after payment."*
     - Same `Mail` icon in the input
  2. **Consent checkbox** with Terms / Privacy links (all users, when not subscribed)
  3. **Continue button** (`w-full`, brand-orange)
- Pass `footerBlock` as the `footer` prop to `SubscriptionPlan`.
- Remove the three separate blocks that currently appear below `SubscriptionPlan` (the standalone guest email div, consent gate div, and US-only `<p>`).
- Add the US-only notice as a `<p>` directly **below** the `<SubscriptionPlan ... />` call, outside the card.

---

## Visual Result (For You tab, guest user)

```text
┌─────────────────────────────────────────┐
│  Asset Safe Plan                        │
│  $18.99 / month + tax                   │
│  No long-term contract. Cancel anytime. │
│                                         │
│  ✓ Feature 1                            │
│  ✓ Feature 2  ... (existing list)       │
│                                         │
│  ─────────────────────────────────────  │
│  Your email address                     │
│  [✉  you@example.com               ]   │
│  We'll use this to create your account  │
│  and send access after payment.         │
│                                         │
│  ☐ I agree to the Terms of Service     │
│    and Privacy Policy.                  │
│                                         │
│  [         Continue          ]          │
└─────────────────────────────────────────┘
  Paid subscriptions are currently
  available to U.S. billing addresses only.
```

For logged-in users, the email input is hidden and the card shows only checkbox + button.

---

## No other files need to change
