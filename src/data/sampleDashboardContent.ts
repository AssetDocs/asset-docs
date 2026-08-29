/**
 * Sample Dashboard demo copy.
 *
 * Single source of truth for the public /sample-dashboard demo cards, rows,
 * and hover/click explainer text. Presentation-only: nothing here performs a
 * real action or reads real data.
 *
 * Keep terminology aligned with the live dashboard:
 * Asset Documentation · Knowledge Hub · Secure Vault (Legacy Locker - Digital Access).
 * Never reintroduce "Family Archive", "Insights & Tools", or "Password Catalog".
 */

export interface SampleCardCopy {
  title: string;
  description: string;
  tags?: string[];
  actionLabel: string;
  explainer: string;
}

export interface SampleRowCopy {
  label: string;
  explainer: string;
}

export const sampleDemoBanner =
  'Sample Dashboard — Hover over or click sections to learn what each part of the dashboard does. Interactive features are shown for demonstration only.';

export const sampleWelcome = {
  greeting: 'Welcome, Demo User!',
  heading: 'Your Asset Safe Dashboard',
  supporting: 'Everything you use today — and what protects you for tomorrow.',
  accountLabel: 'Account #: DEMO-12345',
};

export const sampleQuickAdd = {
  label: 'Add',
  supporting: 'Quickly add documentation and details',
  explainer:
    'Quick Add gives users a faster way to jump directly into common create actions without first navigating into each section. In the live dashboard, this helps users quickly add documentation or important information.',
};

export const sampleAssetDocumentation: SampleCardCopy = {
  title: 'Asset Documentation',
  description: 'Claim-ready proof for your home and belongings.',
  tags: ['Photos', 'Videos', 'Documents', 'Records'],
  actionLabel: 'Open Documentation',
  explainer:
    'Asset Documentation is where users organize property and belonging records, including photos, videos, documents, receipts, and supporting records that help keep documentation clear and accessible.',
};

export const sampleKnowledgeHub: SampleCardCopy = {
  title: 'Knowledge Hub',
  description: 'Everyday life, organized and protected.',
  tags: ['Contacts', 'Notes', 'Property Details', 'Records', 'Memories'],
  actionLabel: 'Open Knowledge Hub',
  explainer:
    'Knowledge Hub helps organize everyday information in one place. It brings together contacts, notes, household details, reminders, records, and memories so important information is easier to find when needed.',
};

export const sampleSecureVault = {
  title: 'Secure Vault',
  supporting: 'A single encrypted space for digital access and legacy planning.',
  badge: 'Encrypted',
  explainer:
    'Secure Vault is the protected area for a user’s most private information. It includes Legacy Locker for continuity and important instructions, and Digital Access for sensitive online account information. In the live platform, both live inside the same encrypted vault experience.',
  inner: {
    title: 'Legacy Locker - Digital Access',
    description: 'Your most private information, protected in one encrypted space.',
    actionLabel: 'Open Legacy Locker - Digital Access',
  },
};

export const sampleDocumentationChecklist: SampleRowCopy = {
  label: 'Documentation Checklist',
  explainer:
    'Documentation Checklist helps users see what core documentation areas still need attention, making it easier to build a more complete account over time.',
};

export const sampleMfa: SampleRowCopy = {
  label: 'Multi-Factor Authentication (MFA)',
  explainer:
    'Multi-Factor Authentication adds another layer of account protection by helping confirm that only the authorized user can access the account.',
};

export const sampleAssetValues: SampleRowCopy = {
  label: 'Asset Values',
  explainer:
    'Asset Values helps users review, track, and organize value-related information connected to documented property and belongings.',
};

export const sampleEmergencyInstructions: SampleRowCopy = {
  label: 'Emergency Instructions',
  explainer:
    'Emergency Instructions gives users a place to organize information someone may need if they ever have to step in during an urgent or unexpected situation.',
};

export const sampleUtilityCards = [
  {
    key: 'export-account-archive',
    title: 'Export Account Archive',
    description: 'PDF summary plus ZIP of account records and files.',
    actionLabel: 'Export Account Archive',
    explainer:
      'Creates a downloadable summary of important account records and files.',
  },
  {
    key: 'download-all-files',
    title: 'Download All Files',
    description: 'Download all files in a single ZIP.',
    actionLabel: 'Download All',
    explainer: 'Lets users download their uploaded files in one place.',
  },
  {
    key: 'post-damage-report',
    title: 'Post Damage Report',
    description: 'Document damage and organize post-incident details.',
    actionLabel: 'Post Report',
    explainer: 'Helps organize damage-related information after an incident.',
  },
] as const;
