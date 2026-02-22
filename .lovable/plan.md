
## Fix Plan Change Edge Function and Update Dialog Text

### Issue 1: Edge Function Error (Root Cause)

The Stripe Subscriptions API does **not** support `product_data` inside `price_data` when updating subscription items. This parameter is only supported in Checkout Sessions. The error message from Stripe confirms this:

> "Received unknown parameter: items[0][price_data][product_data]. Did you mean product?"

**The fix:** Instead of using `price_data` at all, we need to first create a Stripe Product and Price separately, then pass the `price` ID to the subscription update. The approach:

1. Create a Stripe product using `stripe.products.create()`
2. Create a Stripe price using `stripe.prices.create()` linked to that product
3. Update the subscription item using the `price` ID (not `price_data`)

This is the only reliable way to change a subscription item's price via the Stripe API.

### Issue 2: Dialog Text Update

Change the confirmation dialog text from:
- "Your billing will be prorated -- you'll receive credit for unused time on your current plan."
- "The change takes effect immediately."

To:
- "Your plan will upgrade immediately."
- "You'll only be charged the difference for the remainder of your billing period."

### Files to Modify

**1. `supabase/functions/change-plan/index.ts`**
- Replace the `stripe.subscriptions.update()` call that uses `price_data` with `product_data`
- Instead: create a new Stripe price (with a product) first, then update the subscription using the price ID
- This matches how Stripe's subscription update API actually works

**2. `src/components/SubscriptionTab.tsx`**
- Update the two paragraphs in the confirmation dialog to the new wording

### Technical Detail: Updated Edge Function Logic

```text
// Step 1: Create or find a product
const product = await stripe.products.create({
  name: priceConfig.product_name,
});

// Step 2: Create a price for that product
const newPrice = await stripe.prices.create({
  currency: "usd",
  product: product.id,
  unit_amount: priceConfig.amount,
  recurring: { interval: currentInterval },
});

// Step 3: Update subscription with the price ID
await stripe.subscriptions.update(subscription.id, {
  items: [{ id: mainItem.id, price: newPrice.id }],
  proration_behavior: "create_prorations",
});
```

This approach works because Stripe's subscription update API accepts a `price` ID but does **not** accept inline `price_data` with `product_data` (that's a Checkout Session-only feature).
