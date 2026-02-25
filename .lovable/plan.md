

## Subscription Page Enhancements

Three changes: a billing cycle note, a collapsible plan comparison table, and two missing features added to both the subscription and pricing pages.

---

### 1. Add billing cycle note inside the Current Plan box

Inside `src/components/SubscriptionTab.tsx`, add a small muted text note directly below the "Upgrade or Change Plan" button (line 610), still within the green current-plan box:

**"Plan changes take effect on your next billing cycle"**

Styled as `text-xs text-muted-foreground mt-2`.

---

### 2. Add collapsible "Compare Plans" section

In `src/components/SubscriptionTab.tsx`, immediately after the Current Plan box closes (after line 611), add a full-width collapsible section using the existing `Collapsible` component from `@radix-ui/react-collapsible`.

**Structure:**
- Trigger area shows:
  - Title: **"Compare Plans"**
  - Subtext: *"See what's included in Standard vs Premium"*
  - Chevron icon that rotates on open
- Collapsible content shows:
  - Side-by-side Standard and Premium plan cards (reusing `SubscriptionPlan` component, matching the pricing page layout -- no action buttons needed, so we'll use `buttonText` set to the price and disable click)
  - Below the cards: "Included in Both Plans" grid with the full common features list (no extra marketing copy like "no long-term contract")
  - Premium-Only Features section (matching pricing page)

---

### 3. Add "Memory Safe" and "Quick Notes" to common features

Update the `commonFeatures` array in **both** files:
- `src/components/SubscriptionTab.tsx` (line 61-75)
- `src/components/PricingPlans.tsx` (line 29-43)

Add these two items to the list:
- "Memory Safe"
- "Quick Notes"

---

### Technical Details

**Files modified:**

| File | Change |
|------|--------|
| `src/components/SubscriptionTab.tsx` | Add billing note (line ~610), add Collapsible section (after line 611), add 2 features to `commonFeatures` array |
| `src/components/PricingPlans.tsx` | Add "Memory Safe" and "Quick Notes" to `commonFeatures` array |

**New imports needed in SubscriptionTab.tsx:**
- `Collapsible, CollapsibleTrigger, CollapsibleContent` from `@/components/ui/collapsible`
- `ChevronDown` from `lucide-react`

**No new files or dependencies required.**

