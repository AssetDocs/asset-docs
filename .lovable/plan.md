
# Fix: "Continue" Button Fails for Unauthenticated Users

## Root Cause (Confirmed from Edge Function Logs)

Every failed request in the logs shows the exact same error:

```
"Email is required - either through authentication or in request body"
```

This is thrown by `create-checkout` at this line:
```typescript
if (!userEmail) {
  throw new Error("Email is required - either through authentication or in request body");
}
```

For **authenticated users**, `userEmail` comes from the JWT. For **unauthenticated users**, it must come from `body.email`. Currently, `handleSubscribe` only sends:

```typescript
body: { planLookupKey: lookupKey }
// No email — so unauthenticated users always fail
```

There is no email input on the pricing page for guests, so there is nothing to pass. This is the only remaining issue.

## The Fix

**File: `src/pages/Pricing.tsx`**

1. Add a `guestEmail` state variable (`useState('')`).

2. Render an email input field **below the consent checkbox**, visible only when the user is **not** logged in and not already subscribed. It sits naturally in the existing consent gate area.

3. In `handleSubscribe`, pass `email: guestEmail` in the `create-checkout` body when the user is not authenticated:
   ```typescript
   body: { 
     planLookupKey: lookupKey,
     ...(user ? {} : { email: guestEmail })
   }
   ```

4. Add a guard: if the user is not logged in and `guestEmail` is empty, show a toast and return early.

## UI Placement

The email input will appear between the billing cycle toggle and the consent checkbox, only for unauthenticated users. Styled to match the existing muted card design already used for the consent gate.

## Files to Change

| File | Change |
|---|---|
| `src/pages/Pricing.tsx` | Add `guestEmail` state, email input UI for unauthenticated users, pass email to `create-checkout` |

## No other files need to change

The `create-checkout` edge function already supports `email` in the request body — this is purely a missing UI/data wiring issue on the frontend.
