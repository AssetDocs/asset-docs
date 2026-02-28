
## Remove Legacy Locker Premium Gate

**File:** `src/components/LegacyLocker.tsx`

**Context:** The Legacy Locker currently gates access behind a `isPremium` check. Since all users now have full access on the single Asset Safe Plan, this gate is obsolete and should be removed entirely.

---

### What needs to change

**Three targeted edits, all in `src/components/LegacyLocker.tsx`:**

**Edit 1 — Remove the `PremiumFeatureGate` import (line 30)**
The `PremiumFeatureGate` component will no longer be referenced anywhere in this file so the import can be removed cleanly.

**Edit 2 — Remove the `isPremium` / `subscriptionLoading` usage and `hasLegacyLockerAccess` variable (lines 92, 116)**

Line 92:
```tsx
// REMOVE:
const { isPremium, loading: subscriptionLoading } = useSubscription();
```

Line 116:
```tsx
// REMOVE entirely:
const hasLegacyLockerAccess = isPremium || isContributor || subscriptionLoading || !contributorCheckDone;
```

The `useSubscription` import itself can also be removed from line 31 since it will no longer be used in this file.

**Edit 3 — Remove the premium gate block (lines 712–723)**
```tsx
// REMOVE entirely:
// Premium gate - show upgrade prompt for non-premium users who aren't contributors
if (!hasLegacyLockerAccess) {
  return (
    <PremiumFeatureGate 
      featureKey="legacy_locker"
      title="Legacy Locker"
      description="..."
    >
      <div />
    </PremiumFeatureGate>
  );
}
```

---

### What does NOT change

- The contributor role checks (`isContributor`, `contributorRole`, `contributorCheckDone`) remain — these are used for determining editing vs. read-only access within the locker, not for gating entry to it.
- The master password / encryption flow is unchanged.
- The recovery delegate and `isDelegate` / `hasPendingRequest` logic is unchanged.
- No database, RLS, or edge function changes required.

---

### Result

All authenticated users with an active Asset Safe Plan subscription will see the Legacy Locker without any upgrade prompt. Contributors to an account will continue to see a read-only or edit view based on their assigned role. The gate is fully removed.
