export type ContinuityRequestType =
  | 'temporary_assistance'
  | 'data_export'
  | 'preservation'
  | 'memorialization'
  | 'account_closure'
  // legacy values retained for historical rows
  | 'ownership_transfer';

export type ContinuityStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_requested'
  | 'approved'
  | 'denied'
  | 'completed'
  | 'completed_memorialization'
  | 'completed_preservation'
  | 'closure_waiting_period'
  | 'closure_completed'
  | 'approved_export';

export const REQUEST_TYPE_OPTIONS: {
  value: ContinuityRequestType;
  label: string;
  description: string;
}[] = [
  {
    value: 'temporary_assistance',
    label: 'Temporary Continuity Access',
    description:
      'Time-bound assistance access while the account holder is temporarily unable to manage their account.',
  },
  {
    value: 'data_export',
    label: 'Continuity Export Request',
    description:
      'Request a controlled export of account records for family, executor, or legal preservation purposes.',
  },
  {
    value: 'preservation',
    label: 'Preservation Mode',
    description:
      'Place the account into a read-only preservation state to protect contents without changing ownership.',
  },
  {
    value: 'memorialization',
    label: 'Account Memorialization',
    description:
      'Move the account into a protected memorialized state honoring the account holder.',
  },
  {
    value: 'account_closure',
    label: 'Account Closure Review',
    description:
      'Request a manually reviewed account closure. Includes a mandatory 30-day waiting period.',
  },
];

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  temporary_assistance: 'Temporary Continuity Access',
  data_export: 'Continuity Export Request',
  preservation: 'Preservation Mode',
  memorialization: 'Account Memorialization',
  account_closure: 'Account Closure Review',
  // legacy values
  ownership_transfer: 'Legacy Admin Access (legacy)',
  closure: 'Account Closure Review',
  export: 'Continuity Export Request',
};

export const STATUS_LABEL: Record<ContinuityStatus | string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  additional_info_requested: 'Additional Information Requested',
  approved: 'Approved',
  denied: 'Denied',
  completed: 'Completed',
  completed_memorialization: 'Memorialization Activated',
  completed_preservation: 'Preservation Activated',
  closure_waiting_period: 'Closure Waiting Period',
  closure_completed: 'Closure Completed',
  approved_export: 'Export Authorized',
};

export const STATUS_BADGE_CLASS: Record<ContinuityStatus | string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  submitted: 'bg-muted text-foreground border-border',
  under_review: 'bg-amber-50 text-amber-900 border-amber-200',
  additional_info_requested: 'bg-amber-50 text-amber-900 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  denied: 'bg-rose-50 text-rose-900 border-rose-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
  completed_memorialization: 'bg-violet-50 text-violet-900 border-violet-200',
  completed_preservation: 'bg-sky-50 text-sky-900 border-sky-200',
  closure_waiting_period: 'bg-amber-50 text-amber-900 border-amber-200',
  closure_completed: 'bg-slate-700 text-slate-50 border-slate-700',
  approved_export: 'bg-emerald-50 text-emerald-900 border-emerald-200',
};

export const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Executor',
  'Attorney',
  'Power of Attorney',
  'Guardian',
  'Caregiver',
  'Business Partner',
  'Other',
];

export const DOCUMENT_CATEGORIES = [
  'Death certificate',
  'Power of attorney',
  'Trust documentation',
  'Letters testamentary',
  'Guardianship paperwork',
  'Physician statement',
  'Government ID',
  'Other supporting documentation',
];

export const REQUESTED_OUTCOMES = [
  { value: 'temporary_access', label: 'Temporary continuity access' },
  { value: 'export_contents', label: 'Continuity export of account contents' },
  { value: 'preserve_as_is', label: 'Preserve account in read-only state' },
  { value: 'memorialize', label: 'Memorialize the account' },
  { value: 'close_account', label: 'Close account after review' },
  { value: 'other', label: 'Other' },
];

export interface ContinuityMetadata {
  relationship?: string;
  legal_authorization?: 'yes' | 'no' | 'unsure';
  passed_away?: 'yes' | 'no' | 'unsure';
  requested_outcomes?: string[];
  outcome_other?: string;
  documents?: { name: string; category: string; path: string; size: number }[];
}
