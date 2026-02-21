

## Fix: Change-Plan Edge Function - Inactive Stripe Product Error

### What Happened
When you clicked "Confirm Change," the `change-plan` edge function tried to update your Stripe subscription by creating a new price under the **same product** that the subscription was originally created with. However, that product (`prod_TMWaSMQF7iKDhN`) has been marked as **inactive** in your Stripe dashboard, so Stripe rejected the request.

### Root Cause
The current code does this:
```text
price_data: {
  product: mainItem.price?.product,  // <-- reuses the INACTIVE product
  unit_amount: newAmount,
  ...
}
```

### The Fix
Change the edge function to use `product_data` (which creates a new inline product) instead of referencing the old inactive product. This matches how your `create-checkout` function already works successfully.

### Changes

**File: `supabase/functions/change-plan/index.ts`**

Replace the `price_data` block in the `stripe.subscriptions.update()` call. Instead of:
```text
price_data: {
  currency: "usd",
  product: mainItem.price?.product as string,  // broken - inactive product
  unit_amount: priceConfig.amount,
  recurring: { interval: currentInterval },
}
```

Use:
```text
price_data: {
  currency: "usd",
  product_data: { name: priceConfig.product_name },  // creates new inline product
  unit_amount: priceConfig.amount,
  recurring: { interval: currentInterval },
}
```

This is the only change needed. The `PLAN_PRICES` config already has `product_name` defined for each plan/interval combination, so no other modifications are required.

### Technical Summary
- **1 file modified**: `supabase/functions/change-plan/index.ts`
- **What changes**: Replace `product: mainItem.price?.product` with `product_data: { name: priceConfig.product_name }` in the subscription update call
- **Why it works**: `product_data` tells Stripe to create a new product inline rather than referencing the old inactive one
- **Risk**: None -- this is how `create-checkout` already works, and proration behavior is unaffected
