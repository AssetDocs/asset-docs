export type SubscriptionTier = 'standard' | 'premium';

export interface FeatureConfig {
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  fallbackMessage?: string;
}

export const SUBSCRIPTION_FEATURES: Record<string, FeatureConfig> = {
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
  unlimited_storage: {
    name: 'Unlimited Storage',
    description: 'Unlimited photo and video storage',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for unlimited storage'
  },
  storage_limits: {
    name: 'Storage Limits',
    description: 'Tier-based storage space allocation',
    requiredTier: 'standard',
    fallbackMessage: 'Storage limits apply based on your subscription tier'
  },

  // Advanced Features
  advanced_features: {
    name: 'Advanced Features',
    description: 'Premium analysis and insights',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for advanced features'
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

  // Property Management
  multiple_properties: {
    name: 'Multiple Properties',
    description: 'Manage multiple properties',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to manage multiple properties'
  },
  property_sharing: {
    name: 'Property Sharing',
    description: 'Share property access with family/tenants',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to share property access'
  },
  property_limits: {
    name: 'Property Limits',
    description: 'Number of properties you can manage',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to manage more properties'
  },
  contributor_limits: {
    name: 'Contributor Limits',
    description: 'Number of contributors you can invite',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to invite contributors'
  },

  // Export and Reporting
  export_reports: {
    name: 'Export Reports',
    description: 'Export detailed property reports',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to export reports'
  },
  advanced_reporting: {
    name: 'Advanced Reporting',
    description: 'Comprehensive analytics and insights',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for advanced reporting'
  },

  // Support and Services
  priority_support: {
    name: 'Priority Support',
    description: 'Priority email and phone support',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard for priority support'
  },
  professional_services: {
    name: 'Professional Services',
    description: 'Access to professional documentation services',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for professional services'
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
  }
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

export const getStorageLimit = (tier: SubscriptionTier | null | undefined): number | null => {
  if (!tier) return null;
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

// Property limits by tier
export const PROPERTY_LIMITS: Record<SubscriptionTier, number> = {
  standard: 3,
  premium: 999999 // Unlimited
};

// Contributor limits by tier
export const CONTRIBUTOR_LIMITS: Record<SubscriptionTier, number> = {
  standard: 3,
  premium: 3
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
  const canAdd = currentCount < limit;
  
  if (!canAdd) {
    const upgradeMessage = userTier === 'standard'
      ? 'Upgrade to Premium for unlimited properties.'
      : 'You have reached the maximum number of properties for your plan.';
    
    return {
      canAdd: false,
      limit,
      message: upgradeMessage
    };
  }
  
  return { canAdd: true, limit };
};

export const checkContributorLimit = (
  currentCount: number,
  userTier: SubscriptionTier | null | undefined,
  _isInTrial?: boolean // Deprecated - trial no longer supported
): { canAdd: boolean; limit: number; message?: string } => {
  // Default limit is 3 for all paid subscribers
  const DEFAULT_CONTRIBUTOR_LIMIT = 3;
  const limit = userTier ? getContributorLimit(userTier) : DEFAULT_CONTRIBUTOR_LIMIT;
  const canAdd = currentCount < limit;
  
  if (!canAdd) {
    return {
      canAdd: false,
      limit,
      message: `You have reached the maximum of ${limit} contributors for your plan.`
    };
  }
  
  return { canAdd: true, limit };
};