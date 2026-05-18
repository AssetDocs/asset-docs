export type ContinuityRequestType =
  | 'temporary_assistance'
  | 'data_export'
  | 'ownership_transfer'
  | 'account_closure';

export type ContinuityStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_requested'
  | 'approved'
  | 'denied'
  | 'completed';

export const REQUEST_TYPE_OPTIONS: {
  value: ContinuityRequestType;
  label: string;
  description: string;
}[] = [
  {
    value: 'temporary_assistance',
    label: 'Temporary Assistance Access',
    description:
      'For situations where the account holder is temporarily unable to manage their account.',
  },
  {
    value: 'data_export',
    label: 'Data Export Request',
    description:
      'Request an export of account records for estate, family, or legal management purposes.',
  },
  {
    value: 'ownership_transfer',
    label: 'Ownership Transfer Request',
    description:
      'Request permanent transfer of account ownership due to death or permanent incapacity.',
  },
  {
    value: 'account_closure',
    label: 'Account Closure Request',
    description: 'Request closure of the account after review by Asset Safe.',
  },
];

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  temporary_assistance: 'Temporary Assistance Access',
  data_export: 'Data Export Request',
  ownership_transfer: 'Ownership Transfer Request',
  account_closure: 'Account Closure Request',
  // legacy values from old form
  closure: 'Account Closure Request',
  export: 'Data Export Request',
};

export const STATUS_LABEL: Record<ContinuityStatus | string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  additional_info_requested: 'Additional Information Requested',
  approved: 'Approved',
  denied: 'Denied',
  completed: 'Completed',
};

export const STATUS_BADGE_CLASS: Record<ContinuityStatus | string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  submitted: 'bg-muted text-foreground border-border',
  under_review: 'bg-amber-50 text-amber-900 border-amber-200',
  additional_info_requested: 'bg-amber-50 text-amber-900 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  denied: 'bg-rose-50 text-rose-900 border-rose-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
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
  'Other legal documentation',
];

export const REQUESTED_OUTCOMES = [
  { value: 'temporary_access', label: 'Temporary access assistance' },
  { value: 'export_contents', label: 'Export account contents' },
  { value: 'transfer_ownership', label: 'Transfer ownership' },
  { value: 'preserve_as_is', label: 'Preserve account as-is' },
  { value: 'close_account', label: 'Close account' },
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
