
# Fix: Remove Property Limit Enforcement

## Root Cause

The property limit is coming from the `profiles.property_limit` database column (which is NULL for most users, defaulting to `1`). The code in `subscriptionFeatures.ts` correctly defines unlimited properties for all tiers, but this config is never actually used in the property-add flow.

The chain of failure:
1. Edge function `check-subscription` reads `profile.property_limit` from the database -- gets NULL, defaults to `1`
2. `SubscriptionContext` receives `property_limit: 1`, stores it as `propertyLimit`
3. `PropertyManagement.handleAddProperty()` checks `properties.length < propertyLimit` (i.e., `< 1`), blocks the user

## Fix (3 files)

### 1. `supabase/functions/check-subscription/index.ts`

Change the `propertyLimit` assignment (line 71) to always return `Infinity` (or a very large number like `999999` since JSON cannot serialize `Infinity`):

```
// Before
let propertyLimit = profile?.property_limit || 1;

// After
let propertyLimit = 999999; // Unlimited for all plans
```

Remove the same pattern from the contributor fallback (line 126) and the error response (line 158).

### 2. `src/contexts/SubscriptionContext.tsx`

Change line 66 to default to unlimited instead of 1:

```
// Before
const propertyLimit = subscriptionStatus.property_limit || 1;

// After
const propertyLimit = subscriptionStatus.property_limit || 999999;
```

### 3. `src/components/PropertyManagement.tsx`

Simplify `handleAddProperty` (lines 123-141) to remove the limit check entirely, since properties are unlimited for all plans. Also remove the "X properties allowed" subtitle text or update it to always say "Unlimited".

## No database migration needed

The `profiles.property_limit` column can remain as-is -- we simply stop using it as a gate.
