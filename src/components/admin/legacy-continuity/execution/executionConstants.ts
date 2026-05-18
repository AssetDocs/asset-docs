// Statuses where the execution panel is visible
export const EXECUTION_VISIBLE_STATUSES = new Set<string>([
  'approved',
  'approved_temporary',
  'approved_transfer',
  'ready_to_execute',
  'temporary_access_granted',
  'ownership_transfer_pending',
  'transfer_pending',
]);

export const EXECUTION_HIDDEN_STATUSES = new Set<string>([
  'submitted',
  'under_review',
  'additional_info_requested',
  'needs_documentation',
  'escalated',
  'denied',
  'completed',
  'archived',
]);

export type TransferScope = 'temporary' | 'transfer' | 'archive';

export const SCOPE_LABEL: Record<TransferScope, string> = {
  temporary: 'Temporary Stewardship',
  transfer: 'Full Ownership Transfer',
  archive: 'Archive Custodian Mode',
};

export const SCOPE_DESCRIPTION: Record<TransferScope, string> = {
  temporary:
    'Grant limited, time-bound management access without changing account ownership.',
  transfer:
    'Permanently transfer primary ownership of the Asset Safe account to the verified Legacy Admin.',
  archive:
    'Grant preservation-focused access for estate or legal administration without allowing modification of account records.',
};

export interface ChecklistItem {
  key: string;
  label: string;
  required: boolean;
}

export const PRE_EXECUTION_CHECKLIST: ChecklistItem[] = [
  { key: 'identity_verified', label: 'Identity verified', required: true },
  { key: 'legal_docs_reviewed', label: 'Legal documentation reviewed', required: true },
  { key: 'reviewer_approval', label: 'Reviewer approval completed', required: true },
  { key: 'secondary_approval', label: 'Secondary approval completed', required: true },
  { key: 'no_disputes', label: 'No active disputes', required: true },
  { key: 'no_fraud_flags', label: 'No pending fraud flags', required: true },
  { key: 'account_not_frozen', label: 'Account is not frozen', required: true },
  { key: 'preservation_hold_reviewed', label: 'Preservation hold reviewed', required: true },
  { key: 'documents_verified', label: 'Required documents marked verified', required: true },
  { key: 'snapshot_created', label: 'Export/archive snapshot created', required: true },
  { key: 'scope_selected', label: 'Transfer scope selected', required: true },
  { key: 'rationale_recorded', label: 'Internal decision rationale recorded', required: true },
];

export type ChecklistItemState = 'complete' | 'incomplete' | 'failed' | 'not_applicable';

export const CHECKLIST_STATE_LABEL: Record<ChecklistItemState, string> = {
  complete: 'Complete',
  incomplete: 'Incomplete',
  failed: 'Failed',
  not_applicable: 'Not Applicable',
};

export const CHECKLIST_STATE_BADGE: Record<ChecklistItemState, string> = {
  complete: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  incomplete: 'bg-muted text-muted-foreground border-border',
  failed: 'bg-rose-50 text-rose-900 border-rose-200',
  not_applicable: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const DEFAULT_TEMP_PERMISSIONS = {
  view_records: true,
  download_records: false,
  upload_records: false,
  billing_visibility: false,
  billing_management: false,
  user_management: false,
  vault_management: false,
  deletion: false,
};

export const TEMP_PERMISSION_LABEL: Record<string, string> = {
  view_records: 'View records',
  download_records: 'Download records',
  upload_records: 'Upload records',
  billing_visibility: 'Billing visibility',
  billing_management: 'Billing management',
  user_management: 'User management',
  vault_management: 'Secure Vault management',
  deletion: 'Deletion authority',
};

export const ARCHIVE_DEFAULT_PERMISSIONS = {
  can_view: true,
  can_export: true,
  can_download: true,
};

export const EXECUTION_DISABLED_HELP =
  'Execution is unavailable until all required review, verification, approval, and snapshot requirements are complete.';
