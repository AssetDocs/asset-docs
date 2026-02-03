export type SubscriptionTier = 'standard' | 'premium';

export interface FeatureConfig {
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  fallbackMessage?: string;
}

export const SUBSCRIPTION_FEATURES: Record<string, FeatureConfig> = {
  // =====================================
  // STANDARD FEATURES (available to all subscribers)
  // =====================================
  
  // Photo and Media Features
  photo_upload: {
    name: 'Photo Upload',
    description: 'Upload and manage property photos',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to start uploading photos'
  },
  video_upload: {
    name: 'Video Upload', 
    description: 'Upload and manage property videos',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard or Premium to upload videos'
  },
  storage_limits: {
    name: 'Storage Limits',
    description: 'Tier-based storage space allocation',
    requiredTier: 'standard',
    fallbackMessage: 'Storage limits apply based on your subscription tier'
  },

  // Download and Export Features
  export_assets: {
    name: 'Export Assets',
    description: 'Export your asset inventory to various formats (CSV, PDF, etc.)',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard or Premium to export your asset inventory.',
  },
  download_all_files: {
    name: 'Download All Files',
    description: 'Bulk download all your photos, videos, and documents',
    requiredTier: 'standard',
  },
  basic_export: {
    name: 'Basic Export',
    description: 'Claim-ready export with basic report download',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard for basic export capabilities'
  },

  // Property Management
  multiple_properties: {
    name: 'Multiple Properties',
    description: 'Manage unlimited properties',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to manage multiple properties'
  },
  property_limits: {
    name: 'Property Limits',
    description: 'Unlimited properties for all subscription tiers',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to manage properties'
  },

  // Export and Reporting
  export_reports: {
    name: 'Export Reports',
    description: 'Export detailed property reports',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to export reports'
  },

  // Documentation and Checklists
  documentation_checklists: {
    name: 'Documentation Checklists',
    description: 'Access comprehensive documentation checklists',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to access documentation checklists'
  },
  custom_checklists: {
    name: 'Custom Checklists',
    description: 'Create and customize your own checklists',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to create custom checklists'
  },

  // Voice Notes and Damage Features
  voice_notes: {
    name: 'Voice Notes',
    description: 'Record voice notes for items with sentimental or historical significance',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to access voice notes feature'
  },
  post_damage_reports: {
    name: 'Post Damage Reports',
    description: 'Generate comprehensive damage reports with photos and videos',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to access damage reporting feature'
  },

  // Password Catalog (accessible to all subscribers)
  password_catalog: {
    name: 'Password Catalog',
    description: 'Securely store and manage passwords (private use)',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to access Password Catalog'
  },

  // Secure Vault (private access)
  secure_vault_private: {
    name: 'Secure Vault (Private)',
    description: 'Private secure vault access',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard for private Secure Vault access'
  },

  // Standard Support
  standard_support: {
    name: 'Standard Support',
    description: 'Email support',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard for support access'
  },

  // =====================================
  // PREMIUM FEATURES (Premium tier only)
  // =====================================

  // Legacy Locker - Premium Only
  legacy_locker: {
    name: 'Legacy Locker',
    description: 'Secure legacy planning and document storage for family access',
    requiredTier: 'premium',
    fallbackMessage: 'Legacy Locker is available on Premium for trusted family access.'
  },

  // Trusted Contacts/Contributors - Premium Only
  trusted_contacts: {
    name: 'Trusted Contacts',
    description: 'Add trusted contacts to share access with family members',
    requiredTier: 'premium',
    fallbackMessage: 'Add trusted contacts with Premium to share access with family.'
  },
  contributor_roles: {
    name: 'Contributor Roles',
    description: 'Invite contributors (spouse, adult child, planner) to your account',
    requiredTier: 'premium',
    fallbackMessage: 'Invite contributors with Premium for family collaboration.'
  },

  // Emergency Access - Premium Only
  emergency_access: {
    name: 'Emergency Access Sharing',
    description: 'Share vault access during emergencies',
    requiredTier: 'premium',
    fallbackMessage: 'Emergency vault sharing requires Premium subscription.'
  },

  // Executor Tools - Premium Only
  executor_tools: {
    name: 'Executor Tools',
    description: 'Executor assignment and continuity planning',
    requiredTier: 'premium',
    fallbackMessage: 'Executor assignment available on Premium for continuity planning.'
  },

  // Advanced Exports - Premium Only
  advanced_exports: {
    name: 'Advanced Exports',
    description: 'Advanced claim and legal export bundles',
    requiredTier: 'premium',
    fallbackMessage: 'Advanced claim and legal export bundles require Premium.'
  },

  // Priority Support - Premium Only
  priority_support: {
    name: 'Priority Support',
    description: 'Priority email and phone support',
    requiredTier: 'premium',
    fallbackMessage: 'Priority support available with Premium subscription.'
  },

  // Verified+ Badge - Premium Only
  verified_plus_badge: {
    name: 'Verified+ Badge',
    description: 'Verified+ badge eligibility for your account',
    requiredTier: 'premium',
    fallbackMessage: 'Verified+ badge is available with Premium subscription.'
  },

  // Advanced Features - Premium Only
  advanced_features: {
    name: 'Advanced Features',
    description: 'Premium analysis and insights',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for advanced features'
  },
  unlimited_storage: {
    name: '100GB Storage',
    description: '100GB secure cloud storage',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for 100GB storage'
  },
  advanced_reporting: {
    name: 'Advanced Reporting',
    description: 'Comprehensive analytics and insights',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for advanced reporting'
  },
  professional_services: {
    name: 'Professional Services',
    description: 'Access to professional documentation services',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for professional services'
  },
};

export const getTierHierarchy = (): Record<SubscriptionTier, number> => ({
  standard: 1,
  premium: 2
});

export const hasFeatureAccess = (
  userTier: SubscriptionTier | null | undefined,
  requiredTier: SubscriptionTier,
  _isInTrial?: boolean // Deprecated - trial no longer supported
): boolean => {
  if (!userTier) return false;
  
  const hierarchy = getTierHierarchy();
  return hierarchy[userTier] >= hierarchy[requiredTier];
};

export const getFeaturesByTier = (tier: SubscriptionTier): FeatureConfig[] => {
  return Object.values(SUBSCRIPTION_FEATURES).filter(feature => 
    hasFeatureAccess(tier, feature.requiredTier)
  );
};

// Storage limits in bytes
export const STORAGE_LIMITS: Record<SubscriptionTier, number> = {
  standard: 25 * 1024 * 1024 * 1024, // 25GB
  premium: 100 * 1024 * 1024 * 1024 // 100GB
};

// Free/no-tier fallback (used when subscription state hasn't loaded yet or user is on free plan)
// Keep this small but functional so uploads don't silently fail.
export const FREE_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

export const getStorageLimit = (tier: SubscriptionTier | null | undefined): number | null => {
  if (!tier) return FREE_STORAGE_LIMIT_BYTES;
  return STORAGE_LIMITS[tier];
};

export const formatStorageSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

// Property limits by tier - Both tiers now have unlimited properties
export const PROPERTY_LIMITS: Record<SubscriptionTier, number> = {
  standard: Infinity, // Unlimited properties for Standard
  premium: Infinity   // Unlimited properties for Premium
};

// Contributor limits by tier - now unlimited for all tiers
export const CONTRIBUTOR_LIMITS: Record<SubscriptionTier, number> = {
  standard: Infinity,
  premium: Infinity
};

export const getPropertyLimit = (tier: SubscriptionTier | null | undefined): number => {
  if (!tier) return 0;
  return PROPERTY_LIMITS[tier];
};

export const getContributorLimit = (tier: SubscriptionTier | null | undefined): number => {
  if (!tier) return 0;
  return CONTRIBUTOR_LIMITS[tier];
};

export const checkPropertyLimit = (
  currentCount: number,
  userTier: SubscriptionTier | null | undefined,
  _isInTrial?: boolean // Deprecated - trial no longer supported
): { canAdd: boolean; limit: number; message?: string } => {
  const limit = getPropertyLimit(userTier);
  
  // If no tier but current count is 0, allow at least one property
  // This handles edge cases where subscription hasn't loaded yet
  if (!userTier && currentCount === 0) {
    return { canAdd: true, limit: 1 };
  }
  
  const canAdd = currentCount < limit;
  
  if (!canAdd) {
    const upgradeMessage = !userTier 
      ? 'Please subscribe to add more properties.'
      : 'You have reached the maximum number of properties for your plan.';
    
    return {
      canAdd: false,
      limit: limit || 1,
      message: upgradeMessage
    };
  }
  
  return { canAdd: true, limit: limit || 1 };
};

export const checkContributorLimit = (
  currentCount: number,
  userTier: SubscriptionTier | null | undefined,
  _isInTrial?: boolean // Deprecated - trial no longer supported
): { canAdd: boolean; limit: number; message?: string } => {
  // No limit on contributors - always allow adding
  if (!userTier) {
    return {
      canAdd: false,
      limit: 0,
      message: 'Please subscribe to invite authorized users.'
    };
  }
  
  return { canAdd: true, limit: Infinity };
};

// Check if user has Premium tier
export const isPremiumTier = (tier: SubscriptionTier | null | undefined): boolean => {
  return tier === 'premium';
};
