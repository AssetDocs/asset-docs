export type SubscriptionTier = 'free' | 'basic' | 'standard' | 'premium';

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
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to upload videos'
  },
  unlimited_storage: {
    name: 'Unlimited Storage',
    description: 'Unlimited photo and video storage',
    requiredTier: 'premium',
    fallbackMessage: 'Upgrade to Premium for unlimited storage'
  },

  // AI and Advanced Features
  ai_valuation: {
    name: 'AI Valuation',
    description: 'AI-powered item identification and valuation',
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to access AI-powered valuations'
  },
  floor_plan_scanning: {
    name: 'Floor Plan Scanning',
    description: 'Live camera floor plan scanning',
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to scan floor plans with your camera'
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
  export_reports: {
    name: 'Export Reports',
    description: 'Export detailed property reports',
    requiredTier: 'basic',
    fallbackMessage: 'Upgrade to Basic to export reports'
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
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
});

export const hasFeatureAccess = (
  userTier: SubscriptionTier | null | undefined,
  requiredTier: SubscriptionTier
): boolean => {
  if (!userTier) return requiredTier === 'free';
  
  const hierarchy = getTierHierarchy();
  return hierarchy[userTier] >= hierarchy[requiredTier];
};

export const getFeaturesByTier = (tier: SubscriptionTier): FeatureConfig[] => {
  return Object.values(SUBSCRIPTION_FEATURES).filter(feature => 
    hasFeatureAccess(tier, feature.requiredTier)
  );
};