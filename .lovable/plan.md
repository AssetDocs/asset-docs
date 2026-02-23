

## Update Pricing Page: Badge Width + Toggle Style

### 1. Fix "Most Popular" badge to single line

**File:** `src/pages/Pricing.tsx` (line 286-288)

The badge text "Most Popular for Families and Businesses" wraps because the pill uses `rounded-full` with no `whitespace-nowrap`. Add `whitespace-nowrap` to the `<span>` so the text stays on one line.

Only this instance on the Pricing page is changed -- the identical markup in `PricingPlans.tsx`, `CompletePricing.tsx`, and `SubscriptionTab.tsx` remains untouched.

### 2. Match billing toggle to Account Settings style

**File:** `src/pages/Pricing.tsx` (lines 250-272)

Currently the pricing page uses two separate `<button>` elements with `bg-brand-orange` active state and a plain green `<span>` for "Save". The Account Settings toggle (in `SubscriptionTab.tsx`) uses a Radix `Tabs` + `TabsList` + `TabsTrigger` with a `Badge` styled `bg-brand-green/10 text-brand-green`.

Replace the two-button toggle with:
- A Radix `Tabs` component (already imported on this page) with `TabsList` and two `TabsTrigger` values
- The "Monthly" trigger gets an orange active style via conditional class: `data-[state=active]:bg-brand-orange data-[state=active]:text-white`
- The "Yearly" trigger gets the same orange active style, plus a `Badge` with `bg-brand-green/10 text-brand-green` for the "Save" pill -- matching the Account Settings exactly
- Import `Badge` from `@/components/ui/badge`

This gives the orange pill highlight for the active tab and a bright green pill around "Save", matching the Account Settings toggle.

