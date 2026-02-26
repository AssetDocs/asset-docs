export type SubscriptionTier = 'standard' | 'premium';

export interface FeatureConfig {
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  fallbackMessage?: string;
}

export const SUBSCRIPTION_FEATURES: Record<string, FeatureConfig> = {
  // All features are included in the Asset Safe Plan (single plan)
  
  photo_upload: {
    name: 'Photo Upload',
    description: 'Upload and manage property photos',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to start uploading photos'
  },
  video_upload: {
    name: 'Video Upload', 
    description: 'Upload and manage property videos',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to upload videos'
  },
  storage_limits: {
    name: 'Storage',
    description: 'Cloud storage allocation',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access cloud storage'
  },
  export_assets: {
    name: 'Export Assets',
    description: 'Export your asset inventory to various formats (CSV, PDF, etc.)',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to export your asset inventory.',
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
    fallbackMessage: 'Subscribe for export capabilities'
  },
  multiple_properties: {
    name: 'Multiple Properties',
    description: 'Manage unlimited properties',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to manage properties'
  },
  property_limits: {
    name: 'Property Limits',
    description: 'Unlimited properties',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to manage properties'
  },
  export_reports: {
    name: 'Export Reports',
    description: 'Export detailed property reports',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to export reports'
  },
  documentation_checklists: {
    name: 'Documentation Checklists',
    description: 'Access comprehensive documentation checklists',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access documentation checklists'
  },
  custom_checklists: {
    name: 'Custom Checklists',
    description: 'Create and customize your own checklists',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to create custom checklists'
  },
  voice_notes: {
    name: 'Voice Notes',
    description: 'Record voice notes for items with sentimental or historical significance',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access voice notes feature'
  },
  post_damage_reports: {
    name: 'Post Damage Reports',
    description: 'Generate comprehensive damage reports with photos and videos',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access damage reporting feature'
  },
  password_catalog: {
    name: 'Password Catalog',
    description: 'Securely store and manage passwords',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access Password Catalog'
  },
  secure_vault_private: {
    name: 'Secure Vault',
    description: 'Secure vault access',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for Secure Vault access'
  },
  standard_support: {
    name: 'Support',
    description: 'Email support',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for support access'
  },

  // All previously "premium-only" features are now included in the Asset Safe Plan
  legacy_locker: {
    name: 'Legacy Locker',
    description: 'Secure legacy planning and document storage for family access',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to access Legacy Locker.'
  },
  trusted_contacts: {
    name: 'Authorized Users',
    description: 'Add trusted contacts to share access with family members',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to add authorized users.'
  },
  contributor_roles: {
    name: 'Authorized Users',
    description: 'Invite contributors (spouse, adult child, planner) to your account',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to invite authorized users.'
  },
  emergency_access: {
    name: 'Emergency Access Sharing',
    description: 'Share vault access during emergencies',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe to enable emergency access sharing.'
  },
  executor_tools: {
    name: 'Executor Tools',
    description: 'Executor assignment and continuity planning',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for executor and continuity planning tools.'
  },
  advanced_exports: {
    name: 'Advanced Exports',
    description: 'Advanced claim and legal export bundles',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for advanced exports.'
  },
  priority_support: {
    name: 'Priority Support',
    description: 'Priority email and phone support',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for priority support.'
  },
  verified_plus_badge: {
    name: 'Verified+ Badge',
    description: 'Verified+ badge eligibility for your account',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for Verified+ badge eligibility.'
  },
  advanced_features: {
    name: 'Advanced Features',
    description: 'Full platform features and insights',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for full platform access'
  },
  unlimited_storage: {
    name: '25GB Storage',
    description: '25GB secure cloud storage (+ add-ons available)',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for cloud storage'
  },
  advanced_reporting: {
    name: 'Reporting',
    description: 'Comprehensive reports and exports',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for reporting'
  },
  professional_services: {
    name: 'Professional Services',
    description: 'Access to professional documentation services',
    requiredTier: 'standard',
    fallbackMessage: 'Subscribe for professional services'
  },
};

export const getTierHierarchy = (): Record<SubscriptionTier, number> => ({
  standard: 1,
  premium: 2
});

export const hasFeatureAccess = (
  userTier: SubscriptionTier | null | undefined,
  requiredTier: SubscriptionTier,
  _isInTrial?: boolean
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

// Storage limits — base 25GB; total governed by entitlements total_storage_gb
export const STORAGE_LIMITS: Record<SubscriptionTier, number> = {
  standard: 25 * 1024 * 1024 * 1024,
  premium: 25 * 1024 * 1024 * 1024
};

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

export const PROPERTY_LIMITS: Record<SubscriptionTier, number> = {
  standard: Infinity,
  premium: Infinity
};

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
  _isInTrial?: boolean
): { canAdd: boolean; limit: number; message?: string } => {
  const limit = getPropertyLimit(userTier);
  
  if (!userTier && currentCount === 0) {
    return { canAdd: true, limit: 1 };
  }
  
  const canAdd = currentCount < limit;
  
  if (!canAdd) {
    return {
      canAdd: false,
      limit: limit || 1,
      message: !userTier 
        ? 'Please subscribe to add more properties.'
        : 'You have reached the maximum number of properties for your plan.'
    };
  }
  
  return { canAdd: true, limit: limit || 1 };
};

export const checkContributorLimit = (
  currentCount: number,
  userTier: SubscriptionTier | null | undefined,
  _isInTrial?: boolean
): { canAdd: boolean; limit: number; message?: string } => {
  if (!userTier) {
    return {
      canAdd: false,
      limit: 0,
      message: 'Please subscribe to invite authorized users.'
    };
  }
  
  return { canAdd: true, limit: Infinity };
};

export const isPremiumTier = (tier: SubscriptionTier | null | undefined): boolean => {
  return tier === 'premium';
};
