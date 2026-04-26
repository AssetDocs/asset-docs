# Fix Pricing Page bullet alignment

## Problem
On `/pricing`, two feature bullets render as two visually-centered lines with the parenthetical descriptor sitting awkwardly under the main label:

- "Secure Vault" / "(Legacy & Digital Access)"
- "Legacy Locker" / "(family continuity & instructions)"

Cause: in `src/pages/Pricing.tsx` the `unifiedFeatures` array stores these two entries with an embedded newline (`\n`). The `SubscriptionPlan` list item renders text with `whitespace-pre-line`, so the `\n` forces a hard break and the second line, lacking the checkmark gutter, looks indented/centered rather than aligned to the first line.

The other rows (e.g. "50GB secure cloud storage (+ add-ons available)") are single strings with no `\n`, so they wrap naturally and stay left-aligned next to the checkmark.

## Fix
Edit `src/pages/Pricing.tsx` (lines 149–150) to remove the `\n` and join each label with its descriptor inline, matching the 50GB row's style:

```ts
"Secure Vault (Legacy & Digital Access)",
"Legacy Locker (family continuity & instructions)",
```

Result: both bullets render as a single line that wraps naturally if needed, with text left-aligned next to the checkmark — identical treatment to the 50GB row.

## Files touched
- `src/pages/Pricing.tsx` — two-line string change inside the `unifiedFeatures` array.

No changes needed to `SubscriptionPlan.tsx` (the underlying component is already correct) or to `PricingPlans.tsx` (its strings are already inline).

## Out of scope
- The similar `(n & instructions)` truncation showing in `ManageTab.tsx`, `SubscriptionTab.tsx`, and `CompletePricing.tsx` looks like a separate bug (likely a botched find-and-replace). Happy to clean those up in a follow-up if you confirm.
