/**
 * Single source of truth for the public /features and /features-list pages.
 *
 * Naming rule: every `name` below must exactly match the label the user sees
 * inside the authenticated app (DashboardGrid, AssetDocumentationGrid,
 * KnowledgeHubGrid, the knowledge-hub wrapper screens, or
 * src/config/subscriptionFeatures.ts). Do not invent marketing-only labels.
 *
 * Copy rule: no claims about insurance outcomes, settlement amounts, legal
 * results, regulatory compliance, or "end-to-end"/"zero-knowledge" encryption.
 */

export interface FeatureItem {
  /** Exact in-app label. */
  name: string;
  description: string;
  /** Where the label lives in source — kept for future label-parity audits. */
  source: string;
}

export interface FeatureGroup {
  heading: string;
  items: FeatureItem[];
}

export interface FeatureSection {
  id: string;
  name: string;
  tagline: string;
  /** Shown on /features under the section heading. */
  intro: string;
  groups: FeatureGroup[];
}

export interface DestinationCard {
  id: string;
  name: string;
  tagline: string;
  contains?: string;
  accent: 'red' | 'amber';
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const featuresHero = {
  title: 'Everything Asset Safe Does',
  subtitle:
    'One place to document what you own, organize the details of everyday life, and protect your most private information.',
  overview:
    'Asset Safe is organized around three destinations. They are the same three you see the moment you sign in.',
};

export const destinations: DestinationCard[] = [
  {
    id: 'asset-documentation',
    name: 'Asset Documentation',
    tagline: 'Organized proof of your property, assets, and records.',
    accent: 'red',
  },
  {
    id: 'knowledge-hub',
    name: 'Knowledge Hub',
    tagline: 'Everyday life, organized and protected.',
    accent: 'red',
  },
  {
    id: 'secure-vault',
    name: 'Secure Vault',
    tagline: 'A single encrypted space for digital access and legacy planning.',
    contains: 'Contains Digital Access and Legacy Locker.',
    accent: 'amber',
  },
];

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export const featureSections: FeatureSection[] = [
  {
    id: 'asset-documentation',
    name: 'Asset Documentation',
    tagline: 'Organized proof of your property, assets, and records.',
    intro:
      'Capture what you own — with photos, video, receipts, documents, and values — so the record already exists before you need it.',
    groups: [
      {
        heading: 'Capture & Organize',
        items: [
          {
            name: 'Property Profiles',
            description:
              'Create a profile for every property you want to document — your home, a second home, or rentals. Unlimited property entries are included.',
            source: 'src/pages/Properties.tsx',
          },
          {
            name: 'Photos & Videos',
            description:
              'Capture and organize photos and videos of your property and belongings, grouped by room or area.',
            source: 'src/components/AssetDocumentationGrid.tsx',
          },
          {
            name: 'Documents & Records',
            description:
              'Store policies, receipts, warranties, titles, licenses, and other critical records alongside the items they belong to.',
            source: 'src/components/AssetDocumentationGrid.tsx',
          },
          {
            name: 'Manual Entry Item',
            description:
              'Add an item by hand when there is nothing to photograph — with a description, details, and a value you record yourself.',
            source: 'src/components/AssetTypeSelector.tsx',
          },
        ],
      },
      {
        heading: 'Value & Review',
        items: [
          {
            name: 'Asset Values',
            description:
              'See the values you have recorded across your account, totaled in one place. Values are the figures you enter; Asset Safe does not appraise items.',
            source: 'src/components/DashboardGrid.tsx',
          },
          {
            name: 'High-Value Items',
            description:
              'Flag the items that deserve extra documentation so they stay easy to find and review.',
            source: 'src/components/PhotoGalleryFolders.tsx',
          },
          {
            name: 'Documentation Checklist',
            description:
              'A running checklist of what you have documented and what is still missing, so gaps are visible.',
            source: 'src/components/DocumentationChecklist.tsx',
          },
        ],
      },
      {
        heading: 'After an Incident',
        items: [
          {
            name: 'Post Damage Report',
            description:
              'Document damage and record post-incident details, photos, and notes in a dedicated report kept separate from your general media.',
            source: 'src/components/DashboardGrid.tsx',
          },
        ],
      },
      {
        heading: 'Take It With You',
        items: [
          {
            name: 'Export Account Archive',
            description:
              'Generate a PDF summary of your account records together with a ZIP of the underlying files.',
            source: 'src/components/DashboardGrid.tsx',
          },
          {
            name: 'Download All Files',
            description:
              'Download every photo, video, and document you have uploaded in a single ZIP.',
            source: 'src/components/DashboardGrid.tsx',
          },
        ],
      },
    ],
  },
  {
    id: 'knowledge-hub',
    name: 'Knowledge Hub',
    tagline: 'Everyday life, organized and protected.',
    intro:
      'The details that are not assets but still matter — who to call, what the paint code was, which tradition your family keeps.',
    groups: [
      {
        heading: 'People & Care',
        items: [
          {
            name: 'VIP Contacts',
            description:
              'Your most important people, kept in priority order so the right person is easy to reach.',
            source: 'src/components/knowledge-hub/ContactsHub.tsx',
          },
          {
            name: 'Trusted Professionals',
            description:
              'The contractors, agents, advisors, and service providers you actually rely on.',
            source: 'src/components/knowledge-hub/ContactsHub.tsx',
          },
          {
            name: 'Medication List',
            description:
              'Keep a personal reference list of medications and related notes. This is a record you maintain, not medical advice.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
        ],
      },
      {
        heading: 'Notes & Family',
        items: [
          {
            name: 'Written Notes',
            description: 'Notes, reminders, and context you want to keep with your records.',
            source: 'src/components/knowledge-hub/NotesHub.tsx',
          },
          {
            name: 'Voice Notes',
            description:
              'Record spoken details — history, significance, or instructions that are easier said than typed.',
            source: 'src/components/knowledge-hub/NotesHub.tsx',
          },
          {
            name: 'Family Traditions & Recipes',
            description: 'Preserve the traditions, stories, and recipes your family passes down.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
          {
            name: 'Memory Safe',
            description:
              'A protected place for the memories you want to keep — and pass on.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
        ],
      },
      {
        heading: 'Property & Household',
        items: [
          {
            name: 'Important Locations',
            description:
              'Where the shutoff valve, breaker panel, spare keys, and other need-to-know spots actually are.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
          {
            name: 'Paint Codes',
            description: 'Colors, brands, finishes, and the room each one belongs to.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
          {
            name: 'Upgrades & Repairs',
            description:
              'A running history of improvements and repairs, with the documentation attached.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
          {
            name: 'Source Websites',
            description: 'Product sources and reference links so you can reorder or re-match later.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
        ],
      },
      {
        heading: 'Planning',
        items: [
          {
            name: 'Smart Calendar',
            description:
              'Reminders and dated records — maintenance, renewals, and follow-ups — in one timeline.',
            source: 'src/components/KnowledgeHubGrid.tsx',
          },
        ],
      },
    ],
  },
  {
    id: 'secure-vault',
    name: 'Secure Vault',
    tagline: 'A single encrypted space for digital access and legacy planning.',
    intro:
      'Secure Vault is the parent space. Digital Access and Legacy Locker both live inside it, protected by a passphrase only you know.',
    groups: [
      {
        heading: 'Inside Secure Vault',
        items: [
          {
            name: 'Digital Access',
            description:
              'Account access details and codes for the everyday services your household depends on, encrypted with your vault passphrase.',
            source: 'src/pages/Account.tsx',
          },
          {
            name: 'Legacy Locker',
            description:
              'Personal messages, wishes, and the context your loved ones would need — stored encrypted and shared only if you choose to grant access.',
            source: 'src/pages/Account.tsx',
          },
          {
            name: 'Legacy Instructions',
            description:
              'Written instructions that explain your intent and what you would want done. Guidance for people, not a legal instrument.',
            source: 'src/components/AccountContinuityInstructions.tsx',
          },
          {
            name: 'Legacy Admin',
            description:
              'Optionally designate one person who can request vault access when it is genuinely needed. Access is granted, not standing — requests are approval-based, and you can revoke the designation at any time.',
            source: 'src/components/admin/legacy-continuity/OwnerRiskPanel.tsx',
          },
        ],
      },
    ],
  },
  {
    id: 'access-security',
    name: 'Access, Preparedness & Security',
    tagline: 'Who can see what, and how it is protected.',
    intro:
      'Sharing is deliberate and scoped. Secure Vault stays separate from the rest of the account.',
    groups: [
      {
        heading: 'Sharing & Preparedness',
        items: [
          {
            name: 'Authorized Users',
            description:
              'Invite someone to your account with Full Access or Read Only. Access is account-level. Authorized Users do not get Secure Vault access.',
            source: 'src/config/subscriptionFeatures.ts',
          },
          {
            name: 'Emergency Instructions',
            description:
              'Short, immediate instructions for the people who may need to act on your behalf.',
            source: 'src/components/DashboardGrid.tsx',
          },
        ],
      },
      {
        heading: 'Security',
        items: [
          {
            name: 'Two-Factor Authentication',
            description:
              'Add a second step at sign-in, with recovery codes you generate and keep yourself.',
            source: 'src/components/MFADropdown.tsx',
          },
          {
            name: 'Encrypted Secure Vault',
            description:
              'Secure Vault contents are encrypted with a passphrase you set. If you lose that passphrase, Asset Safe cannot recover the contents for you.',
            source: 'src/hooks/useVaultEncryptionStatus.ts',
          },
          {
            name: 'Secure cloud storage',
            description:
              'Files are protected in transit and at rest using managed cloud infrastructure and security practices aligned with recognized industry standards.',
            source: 'src/config/subscriptionFeatures.ts',
          },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Audience narratives                                                 */
/* ------------------------------------------------------------------ */

export interface AudienceFocus {
  heading: string;
  body: string;
  /** Feature names referenced — must exist in featureSections. */
  features: string[];
}

export interface Audience {
  id: string;
  label: string;
  headline: string;
  intro: string;
  focus: AudienceFocus[];
}

export const audiences: Audience[] = [
  {
    id: 'homeowners',
    label: 'Homeowners',
    headline: 'For Homeowners',
    intro:
      'Document the house once, then keep the record current as things change.',
    focus: [
      {
        heading: 'Document the house and what is in it',
        body: 'Room-by-room photos and video, receipts and warranties, and manual entries for the things that never got a photo.',
        features: ['Property Profiles', 'Photos & Videos', 'Documents & Records', 'Manual Entry Item'],
      },
      {
        heading: 'Be ready before you need to file anything',
        body: 'Recorded values, flagged high-value items, and a visible checklist of what is still undocumented — so a claim or a dispute starts from evidence you already have.',
        features: ['Asset Values', 'High-Value Items', 'Documentation Checklist'],
      },
      {
        heading: 'Keep the history of the home',
        body: 'Improvements, repairs, paint codes, and product sources, so the work you have done is documented rather than remembered.',
        features: ['Upgrades & Repairs', 'Paint Codes', 'Source Websites'],
      },
      {
        heading: 'Household knowledge in one place',
        body: 'Shutoffs and spare keys, the professionals you trust, and the reminders that keep maintenance from slipping.',
        features: ['Important Locations', 'Trusted Professionals', 'Smart Calendar'],
      },
      {
        heading: 'Plan for continuity',
        body: 'Private information stays encrypted in Secure Vault, with written instructions and an optional Legacy Admin who can request access when it is needed.',
        features: ['Legacy Locker', 'Legacy Instructions', 'Legacy Admin'],
      },
    ],
  },
  {
    id: 'renters',
    label: 'Renters',
    headline: 'For Renters',
    intro: 'Your belongings and your condition record travel with you.',
    focus: [
      {
        heading: 'Inventory what you own',
        body: 'Photograph and list your belongings so you have your own record, independent of any landlord or building.',
        features: ['Photos & Videos', 'Manual Entry Item', 'Asset Values'],
      },
      {
        heading: 'Document condition at move-in and move-out',
        body: 'Dated photos and video of the unit as you found it and as you left it, organized by room.',
        features: ['Property Profiles', 'Photos & Videos'],
      },
      {
        heading: 'Keep receipts and paperwork together',
        body: 'Lease documents, receipts, warranties, and renter policy paperwork stored alongside the items they cover.',
        features: ['Documents & Records'],
      },
      {
        heading: 'Personal information, protected',
        body: 'Account access details stay encrypted in Secure Vault rather than in a notes app.',
        features: ['Digital Access'],
      },
      {
        heading: 'Be ready if something happens',
        body: 'Damage or loss can be documented in a dedicated report, and everything you have stored can be exported when you need to hand it over.',
        features: ['Post Damage Report', 'Export Account Archive'],
      },
    ],
  },
  {
    id: 'business',
    label: 'Businesses',
    headline: 'For Businesses',
    intro:
      'Document premises, equipment, and the records that go with them.',
    focus: [
      {
        heading: 'Premises and equipment',
        body: 'Document each location and the equipment inside it, with photos, video, and recorded values.',
        features: ['Property Profiles', 'Photos & Videos', 'Asset Values'],
      },
      {
        heading: 'Records in one system',
        body: 'Policies, receipts, warranties, titles, and licenses stored against the assets they belong to.',
        features: ['Documents & Records'],
      },
      {
        heading: 'Maintenance and improvement history',
        body: 'A running record of repairs, upgrades, and the vendors who performed them.',
        features: ['Upgrades & Repairs', 'Trusted Professionals', 'Smart Calendar'],
      },
      {
        heading: 'Documentation to support insurance and review',
        body: 'Pre-loss documentation and incident reports give insurers, adjusters, and advisors something concrete to review.',
        features: ['Post Damage Report', 'Documentation Checklist'],
      },
      {
        heading: 'Controlled access for your team',
        body: 'Add people with Full Access or Read Only. Secure Vault remains outside Authorized User access.',
        features: ['Authorized Users', 'Two-Factor Authentication'],
      },
    ],
  },
  {
    id: 'landlords',
    label: 'Landlords',
    headline: 'For Landlords',
    intro: 'One account, every property, documented consistently.',
    focus: [
      {
        heading: 'Every property in one account',
        body: 'Create a profile per property — unlimited entries — and keep each one documented separately.',
        features: ['Property Profiles'],
      },
      {
        heading: 'Condition documentation between tenancies',
        body: 'Dated photos and video of each unit at turnover, organized by room and area.',
        features: ['Photos & Videos'],
      },
      {
        heading: 'Repairs and improvements per unit',
        body: 'Track what was fixed, what was upgraded, and what it cost, with the receipts attached.',
        features: ['Upgrades & Repairs', 'Documents & Records'],
      },
      {
        heading: 'The operational details that repeat',
        body: 'Contractors, paint codes, shutoff locations, and product sources — per property, not from memory.',
        features: ['Trusted Professionals', 'Paint Codes', 'Important Locations', 'Source Websites'],
      },
      {
        heading: 'Reminders and incident documentation',
        body: 'Renewal and maintenance reminders, plus a dedicated report when damage occurs.',
        features: ['Smart Calendar', 'Post Damage Report'],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */

export interface Industry {
  name: string;
  description: string;
  /** Optional scoping sentence for regulated or outcome-sensitive areas. */
  scope?: string;
}

export const industries: Industry[] = [
  {
    name: 'Real Estate',
    description:
      'Property condition records, improvement documentation, and organized history for listings and transactions.',
  },
  {
    name: 'Property Management',
    description:
      'Consistent documentation across units and turnovers, with repair and vendor history per property.',
  },
  {
    name: 'Insurance Documentation Support',
    description:
      'Pre-loss records and incident reports that give an insurer or adjuster organized evidence to review.',
    scope:
      'Asset Safe is not an insurer or adjuster and does not file, evaluate, or influence claims.',
  },
  {
    name: 'Moving & Storage',
    description:
      'Pre-move inventory and condition documentation for items in transit or in storage.',
  },
  {
    name: 'Construction & Home Services',
    description:
      'Tools, equipment, and job-site condition documentation across multiple locations.',
  },
  {
    name: 'Legal & Estate Planning Support',
    description:
      'Organized asset records and written intent that a professional can work from.',
    scope:
      'Asset Safe is not a law firm and does not provide legal advice or produce legal instruments.',
  },
  {
    name: 'Small Business',
    description:
      'Equipment, premises, and record documentation for owners without a dedicated asset system.',
  },
  {
    name: 'Art & Collectibles',
    description:
      'Detailed photography, provenance paperwork, and recorded values for individual pieces and collections.',
  },
];

/* ------------------------------------------------------------------ */
/* Secure Vault explainer                                              */
/* ------------------------------------------------------------------ */

export const secureVaultExplainer = {
  whatItIs:
    'An encrypted space inside Asset Safe for your most private information — account access details, personal messages, wishes, and the context your loved ones would need. It is protected by a passphrase you set, separate from your account password.',
  whatItIsNot:
    'Asset Safe is not a bank, password manager for financial institutions, financial advisor, will, estate plan, or substitute for legal advice. It is a companion resource that supports those documents and professionals rather than replacing them.',
  whyItMatters:
    'The information people need most is usually the least organized. Secure Vault keeps it in one encrypted place, shared only if and when you choose — which reduces confusion during an emergency or transition.',
};
