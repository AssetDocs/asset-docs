// Preparedness Assessment content, v1.
// Keep option ids and points in sync with
// supabase/functions/preparedness-assessment/assessment.ts (server is authoritative).

export const ASSESSMENT_VERSION = 'v1';

export type CategoryKey =
  | 'property_inventory'
  | 'property_value_awareness'
  | 'information_organization'
  | 'digital_access'
  | 'legacy_preparedness';

export interface AssessmentOption {
  id: 'a' | 'b' | 'c' | 'd';
  label: string;
  points: 0 | 1 | 2 | 3;
}

export interface ScoredQuestion {
  key: CategoryKey;
  weight: number;
  prompt: string;
  support?: string;
  options: AssessmentOption[];
}

export const SCORED_QUESTIONS: ScoredQuestion[] = [
  {
    key: 'property_inventory',
    weight: 0.2,
    prompt:
      'If everything inside your home disappeared tomorrow, how confidently could you create a complete list of what you owned?',
    options: [
      { id: 'a', label: 'Very confidently — I already have good records', points: 0 },
      { id: 'b', label: 'I could remember most of it', points: 1 },
      { id: 'c', label: 'I would probably miss quite a bit', points: 2 },
      { id: 'd', label: "I honestly wouldn't know where to begin", points: 3 },
    ],
  },
  {
    key: 'property_value_awareness',
    weight: 0.15,
    prompt: 'Do you know approximately how much everything in your home is worth?',
    options: [
      { id: 'a', label: 'Yes — I have a fairly accurate idea', points: 0 },
      { id: 'b', label: 'I could make a reasonable estimate', points: 1 },
      { id: 'c', label: 'Not really', points: 2 },
      { id: 'd', label: "I've never thought about it", points: 3 },
    ],
  },
  {
    key: 'information_organization',
    weight: 0.2,
    prompt:
      'How easy would it be to find all of your important household information right now?',
    support:
      'Insurance policies, warranties, account information, property records, passwords, receipts, and important documents.',
    options: [
      { id: 'a', label: "Very easy — it's organized", points: 0 },
      { id: 'b', label: 'I know where most of it is', points: 1 },
      { id: 'c', label: "It's scattered across several places", points: 2 },
      { id: 'd', label: "I'd have to search for quite a while", points: 3 },
    ],
  },
  {
    key: 'digital_access',
    weight: 0.15,
    prompt:
      'If you needed an important password, account number, or digital record right now, how confident are you that you could find it quickly?',
    options: [
      { id: 'a', label: 'Very confident — my digital information is organized', points: 0 },
      { id: 'b', label: 'Usually — although some things take a little searching', points: 1 },
      { id: 'c', label: 'It depends — a lot of it is scattered or difficult to remember', points: 2 },
      { id: 'd', label: 'Not confident — I regularly lose track of passwords or account information', points: 3 },
    ],
  },
  {
    key: 'legacy_preparedness',
    weight: 0.3,
    prompt:
      'If you were suddenly unable to manage your affairs, would someone you trust know where to find the information they need?',
    options: [
      { id: 'a', label: 'Yes — everything they would need is documented', points: 0 },
      { id: 'b', label: 'They know where most important information is', points: 1 },
      { id: 'c', label: 'They would have to figure a lot of it out', points: 2 },
      { id: 'd', label: "No — I've never really prepared for that", points: 3 },
    ],
  },
];

/** Deterministic tie-break order (highest weight first). */
export const GAP_TIE_BREAK: CategoryKey[] = [
  'legacy_preparedness',
  'property_inventory',
  'information_organization',
  'property_value_awareness',
  'digital_access',
];

export const GAP_COPY: Record<CategoryKey, { title: string; body: string }> = {
  property_inventory: {
    title: 'Property documentation',
    body: 'Recreating a complete record of your possessions after a loss could be difficult.',
  },
  property_value_awareness: {
    title: 'Property value awareness',
    body: 'You may not currently have a clear picture of the value represented by the possessions in your home.',
  },
  information_organization: {
    title: 'Information organization',
    body: 'Important records and information appear to be spread across multiple places.',
  },
  digital_access: {
    title: 'Digital access',
    body: 'Some passwords, account information, or digital records may be difficult to locate quickly.',
  },
  legacy_preparedness: {
    title: 'Emergency preparedness',
    body: "Someone you trust may not currently have all the information they would need if you couldn't manage things yourself.",
  },
};

export type BandKey =
  | 'strong_foundation'
  | 'some_gaps'
  | 'significant_opportunity'
  | 'strong_asset_safe_fit';

export const BAND_COPY: Record<BandKey, { heading: string; body: string[]; closing?: string }> = {
  strong_foundation: {
    heading: 'You already have a strong foundation.',
    body: [
      "You've put more thought into documenting and organizing important information than many people have.",
      "Asset Safe can help bring those pieces together, simplify how they're maintained, and make them easier to access when needed.",
    ],
    closing: "You're not starting from scratch. Asset Safe can help you finish the job.",
  },
  some_gaps: {
    heading: "You've got a good start — but there are some gaps.",
    body: [
      'You know where much of your important information is, but some of it may still depend on memory, scattered files, or knowing exactly where to look.',
      'Asset Safe is designed to help turn that collection of information into one organized system.',
    ],
  },
  significant_opportunity: {
    heading: 'You could benefit significantly from better organization.',
    body: [
      "Some of the information you'd need after a loss, emergency, or major life event may be difficult to recreate or locate quickly.",
      'Asset Safe is being built to help you document that information before you need it.',
    ],
  },
  strong_asset_safe_fit: {
    heading: 'Asset Safe was built for situations like yours.',
    body: [
      'Your answers suggest that a significant amount of important information currently depends on memory, scattered records, or information only you know.',
      'Bringing those details together now could make an enormous difference if something unexpected happens.',
    ],
    closing: "You're exactly who we're building Asset Safe for.",
  },
};

export const VALUE_LIST = [
  'home and property documentation',
  'possessions and receipts',
  'insurance information',
  'warranties and improvements',
  'important documents',
  'passwords and digital accounts',
  'family records',
  'information someone you trust may someday need',
];

export const WTP_OPTIONS = [
  { id: 'under_10', label: 'Under $10/month' },
  { id: '10_15', label: '$10–15/month' },
  { id: '16_20', label: '$16–20/month' },
  { id: '21_25', label: '$21–25/month' },
  { id: 'over_25', label: 'More than $25/month' },
  { id: 'prefer_annual', label: "I'd prefer an annual plan" },
  { id: 'would_not_pay', label: "I wouldn't pay for something like this" },
] as const;

export const AUDIENCE_OPTIONS = [
  { id: 'homeowner', label: 'Homeowner' },
  { id: 'renter', label: 'Renter' },
  { id: 'landlord', label: 'Landlord' },
  { id: 'business_owner', label: 'Business owner' },
  { id: 'other', label: 'Other' },
] as const;

export const INTEREST_OPTIONS = [
  { id: 'documenting_possessions', label: 'Documenting possessions' },
  { id: 'insurance_preparedness', label: 'Insurance preparedness' },
  { id: 'organizing_records', label: 'Organizing household records' },
  { id: 'passwords_accounts', label: 'Protecting passwords and accounts' },
  { id: 'family_preparation', label: 'Preparing information for my family' },
  { id: 'property_records', label: 'Managing property records' },
  { id: 'something_else', label: 'Something else' },
] as const;
