
# Subscription Plan Restructure - Feature Matrix Update

## Overview
This plan restructures the Asset Safe subscription tiers to create clear differentiation between Standard (homeowner-focused) and Premium (family/legacy protection) plans. The key change is moving Legacy Locker, Trusted Contacts, and Emergency Access features to Premium-only.

---

## Current vs. New Feature Matrix

```text
┌─────────────────────────────────┬───────────────┬───────────────┐
│ Feature                         │ CURRENT       │ NEW           │
├─────────────────────────────────┼───────────────┼───────────────┤
│ Properties                      │ 3 / Unlimited │ Unlimited/Both│
│ Storage                         │ 25GB / 100GB  │ 25GB / 100GB  │
│ Password Catalog (Private)      │ Both          │ Both          │
│ Secure Vault (Private Only)     │ Both          │ Standard Only │
│ Legacy Locker                   │ Both          │ Premium Only  │
│ Trusted Contacts/Contributors   │ Both          │ Premium Only  │
│ Emergency Access Sharing        │ Both          │ Premium Only  │
│ Executor Assignment             │ Both          │ Premium Only  │
│ Verified+ Badge                 │ Premium       │ Premium Only  │
│ Priority Support                │ Both          │ Premium Only  │
│ Advanced Export Bundles         │ Both          │ Premium Only  │
└─────────────────────────────────┴───────────────┴───────────────┘
```

---

## Implementation Tasks

### Phase 1: Feature Configuration Updates

**File: `src/config/subscriptionFeatures.ts`**

Add new Premium-only feature keys:
- `legacy_locker` - Legacy Locker access
- `trusted_contacts` - Trusted contacts/contributors management
- `emergency_access` - Emergency vault sharing
- `executor_tools` - Executor assignment and continuity planning
- `verified_plus_badge` - Verified+ badge eligibility
- `priority_support` - Priority support access
- `advanced_exports` - Advanced claim and legal export bundles

Update property limits:
- Standard: Change from 3 to Unlimited
- Premium: Remain Unlimited

Update storage limits:
- Standard: 25GB (no change)
- Premium: 100GB (no change)

### Phase 2: Pricing Page Updates

**Files to update:**
- `src/pages/Pricing.tsx`
- `src/pages/CompletePricing.tsx`
- `src/components/PricingPlans.tsx`
- `src/components/SubscriptionTab.tsx`

**Standard Plan ($12.99/month) - New Feature List:**
- Unlimited Properties
- 25GB Secure Cloud Storage
- Guided Home Inventory System
- Room-by-Room Uploads (Photos + Video)
- Document Storage (Receipts, Manuals, Policies)
- Password Catalog (Private Use)
- Secure Vault Access (Private Only)
- Claim-Ready Export (Basic Report Download)
- Verified Email + Basic Account Security
- Standard Support

**Premium Plan ($18.99/month) - New Feature List:**
Everything in Standard, PLUS:
- 100GB Secure Cloud Storage
- Trusted Contacts Access
- Emergency Vault Sharing
- Legacy Locker Mode
- Executor Assignment + Continuity Planning
- Contributor Roles (Spouse, Adult Child, Planner)
- Verified+ Badge
- Priority Support
- Advanced Claim + Legal Export Bundles

**Locked Feature Indicators:**
Add visual indicators showing Standard users what they're missing:
- 🔒 Trusted Contacts (Premium Only)
- 🔒 Emergency Access Sharing (Premium Only)
- 🔒 Legacy Locker Mode (Premium Only)
- 🔒 Executor / Family Continuity Tools (Premium Only)

### Phase 3: UI Feature Gating

**File: `src/components/LegacyLocker.tsx`**
- Add Premium subscription check at component mount
- Show upgrade CTA card for Standard users instead of Legacy Locker content
- Message: "Legacy Locker is available in Premium for trusted family access."

**File: `src/components/ContributorsTab.tsx`**
- Add Premium subscription check
- Show locked state with upgrade CTA for Standard users
- Allow viewing existing contributors but block adding new ones
- Message: "Contributor roles are available with Premium to share access with family members."

**File: `src/components/SecureVault.tsx`**
- Keep Password Catalog accessible to all subscribers
- Gate Legacy Locker section to Premium only
- Show upgrade prompt for Standard users attempting to access Legacy Locker

**New Component: `src/components/PremiumFeatureGate.tsx`**
Create a reusable component for Premium feature gating with consistent styling:
```tsx
interface PremiumFeatureGateProps {
  featureName: string;
  description: string;
  children: React.ReactNode;
}
```

### Phase 4: Backend Enforcement (Edge Functions)

**Update: `supabase/functions/check-subscription/index.ts`**
- Add `has_premium_features` boolean to response
- Include list of available features based on tier

**New helper in SubscriptionContext:**
```tsx
isPremium: boolean; // Quick check for premium status
canAccessFeature: (feature: string) => boolean;
```

**RLS Policy Considerations:**
The existing RLS policies on `contributors` and `legacy_locker` tables use `auth.uid()` for ownership. For Premium enforcement:
- Option A: Add `plan` check to RLS policies (more secure, database-level)
- Option B: Enforce in Edge Functions/UI only (simpler, current approach)

Recommendation: Keep enforcement at UI/Edge Function level for now, matching current patterns. Database already has ownership-based RLS.

### Phase 5: Storage Add-on Pricing Update

Update storage add-on options to be clearer:
- +25GB for $4.99/mo
- +50GB for $9.99/mo (available display)

Note: ~1,500 photos per 25GB benchmark messaging

---

## Technical Details

### Updated Feature Config Structure

```typescript
// src/config/subscriptionFeatures.ts

export const SUBSCRIPTION_FEATURES: Record<string, FeatureConfig> = {
  // STANDARD FEATURES (available to all subscribers)
  photo_upload: { requiredTier: 'standard', ... },
  video_upload: { requiredTier: 'standard', ... },
  password_catalog: { requiredTier: 'standard', ... },
  secure_vault_private: { requiredTier: 'standard', ... },
  basic_export: { requiredTier: 'standard', ... },
  standard_support: { requiredTier: 'standard', ... },
  
  // PREMIUM FEATURES (new restrictions)
  legacy_locker: {
    name: 'Legacy Locker',
    requiredTier: 'premium',
    fallbackMessage: 'Legacy Locker is available on Premium for trusted family access.'
  },
  trusted_contacts: {
    name: 'Trusted Contacts',
    requiredTier: 'premium',
    fallbackMessage: 'Add trusted contacts with Premium to share access with family.'
  },
  emergency_access: {
    name: 'Emergency Access Sharing',
    requiredTier: 'premium',
    fallbackMessage: 'Emergency vault sharing requires Premium subscription.'
  },
  contributor_roles: {
    name: 'Contributor Roles',
    requiredTier: 'premium',
    fallbackMessage: 'Invite contributors with Premium for family collaboration.'
  },
  executor_tools: {
    name: 'Executor Tools',
    requiredTier: 'premium',
    fallbackMessage: 'Executor assignment available on Premium for continuity planning.'
  },
  advanced_exports: {
    name: 'Advanced Exports',
    requiredTier: 'premium',
    fallbackMessage: 'Advanced claim and legal export bundles require Premium.'
  },
  priority_support: {
    name: 'Priority Support',
    requiredTier: 'premium',
    fallbackMessage: 'Priority support available with Premium subscription.'
  },
};

// Update property limits - both tiers get unlimited
export const PROPERTY_LIMITS: Record<SubscriptionTier, number> = {
  standard: Infinity, // Changed from 3
  premium: Infinity
};
```

### Upgrade CTA Component Design

```typescript
// Consistent upgrade messaging across all gated features
const PREMIUM_UPGRADE_MESSAGE = 
  "This feature is part of Premium — designed for family access, " +
  "legacy continuity, and emergency preparedness.";

const UPGRADE_BUTTON_TEXT = "Upgrade to Premium";
const UPGRADE_PATH = "/account/settings?tab=subscription";
```

---

## Files to Create/Modify

### New Files
1. `src/components/PremiumFeatureGate.tsx` - Reusable Premium gate component

### Modified Files
1. `src/config/subscriptionFeatures.ts` - Add Premium feature definitions
2. `src/pages/Pricing.tsx` - Update feature lists and locked indicators
3. `src/pages/CompletePricing.tsx` - Update feature lists
4. `src/components/PricingPlans.tsx` - Update feature matrix
5. `src/components/SubscriptionTab.tsx` - Update plan display and features
6. `src/components/LegacyLocker.tsx` - Add Premium gate
7. `src/components/ContributorsTab.tsx` - Add Premium gate
8. `src/components/SecureVault.tsx` - Gate Legacy Locker section
9. `src/contexts/SubscriptionContext.tsx` - Add `isPremium` helper

---

## Migration Considerations

### Existing Standard Users
- Users who currently have Standard subscriptions with Legacy Locker data will see an upgrade prompt
- Their data remains intact but inaccessible until upgrade
- Consider grace period or grandfather clause (business decision)

### Messaging Strategy
- Clear upgrade prompts with value proposition
- Show what Premium unlocks without being aggressive
- Position as "family protection" vs "individual protection"

---

## Testing Checklist

After implementation:
1. Verify Standard user sees locked Legacy Locker with upgrade CTA
2. Verify Standard user sees locked Contributors tab with upgrade CTA
3. Verify Premium user has full access to all features
4. Verify pricing pages show correct feature differentiation
5. Verify upgrade flow from locked feature to checkout works
6. Test both monthly and yearly billing cycle displays
7. Verify storage limits display correctly per tier
8. Test mobile responsive layout for pricing tables
