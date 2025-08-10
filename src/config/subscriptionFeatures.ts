export type SubscriptionTier = 'basic' | 'standard' | 'premium';

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
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to start uploading photos'
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
    requiredTier: 'basic',
    fallbackMessage: 'Storage limits apply based on your subscription tier'
  },

  // AI and Advanced Features
  ai_valuation: {
    name: 'AI Valuation',
    description: 'AI-powered item identification and valuation',
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to access AI-powered valuations'
  },
  advanced_ai: {
    name: 'Advanced AI Features',
    description: 'Premium AI analysis and insights',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for advanced AI features'
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

  // Export and Reporting
  export_assets: {
    name: 'Export Assets',
    description: 'Export comprehensive asset summary and download files',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard or Premium to export assets'
  },
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
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to access documentation checklists'
  },
  custom_checklists: {
    name: 'Custom Checklists',
    description: 'Create and customize your own checklists',
    requiredTier: 'standard',
    fallbackMessage: 'Upgrade to Standard to create custom checklists'
  }
};

export const getTierHierarchy = (): Record<SubscriptionTier, number> => ({
  basic: 1,
  standard: 2,
  premium: 3
});

export const hasFeatureAccess = (
  userTier: SubscriptionTier | null | undefined,
  requiredTier: SubscriptionTier
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
  basic: 50 * 1024 * 1024 * 1024, // 50GB
  standard: 200 * 1024 * 1024 * 1024, // 200GB
  premium: 750 * 1024 * 1024 * 1024 // 750GB
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