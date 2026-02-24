

## Match Billing Toggle Style in SubscriptionTab

Update the Monthly/Yearly toggle in the "Complete Your Subscription" section (`src/components/SubscriptionTab.tsx`, lines 360-370) to match the pricing page's orange pill style.

### What Changes

**Current:** Default Radix `TabsList` with flat gray styling and a green "Save" badge.

**Updated:** Rounded pill container with orange active-state highlights, matching the pricing page toggle exactly:
- `TabsList` gets `bg-muted rounded-full p-1` (pill container)
- Both `TabsTrigger` elements get `rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white` (orange active pill)
- The "Save" `Badge` keeps its existing `bg-brand-green/10 text-brand-green` styling (already correct) but adds `border-0` to remove any border

### Technical Details

**File:** `src/components/SubscriptionTab.tsx` (lines 361-369)

Replace the `TabsList` and its children with:

```tsx
<TabsList className="bg-muted rounded-full p-1">
  <TabsTrigger
    value="month"
    className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white"
  >
    Monthly
  </TabsTrigger>
  <TabsTrigger
    value="year"
    className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white"
  >
    Yearly
    <Badge className="ml-2 text-xs bg-brand-green/10 text-brand-green border-0 font-semibold">Save</Badge>
  </TabsTrigger>
</TabsList>
```

No new imports or dependencies needed -- `Badge`, `Tabs`, `TabsList`, and `TabsTrigger` are already imported in this file.
