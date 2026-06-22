export const STATUS_OPTIONS = [
  'submitted', 'under_review', 'needs_documentation', 'escalated',
  'approved', 'denied', 'temporary_access_granted',
  'ownership_transfer_pending', 'completed', 'archived',
] as const;

export const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  needs_documentation: 'Needs Documentation',
  escalated: 'Escalated',
  approved: 'Approved',
  denied: 'Denied',
  temporary_access_granted: 'Temporary Continuity Access Active',
  ownership_transfer_pending: 'Continuity Action Pending',
  completed: 'Completed',
  completed_memorialization: 'Memorialization Activated',
  completed_preservation: 'Preservation Activated',
  closure_waiting_period: 'Closure Waiting Period',
  closure_completed: 'Closure Completed',
  approved_export: 'Export Authorized',
  archived: 'Archived',
  // legacy
  draft: 'Draft',
  additional_info_requested: 'Additional Info Requested',
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  submitted: 'bg-blue-50 text-blue-900 border-blue-200',
  under_review: 'bg-amber-50 text-amber-900 border-amber-200',
  needs_documentation: 'bg-orange-50 text-orange-900 border-orange-200',
  escalated: 'bg-rose-50 text-rose-900 border-rose-200',
  approved: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  denied: 'bg-slate-700 text-slate-50 border-slate-700',
  temporary_access_granted: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  ownership_transfer_pending: 'bg-violet-50 text-violet-900 border-violet-200',
  completed: 'bg-slate-100 text-slate-800 border-slate-200',
  archived: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-muted text-muted-foreground border-border',
  additional_info_requested: 'bg-amber-50 text-amber-900 border-amber-200',
};

export const RISK_LEVELS = ['low', 'moderate', 'elevated', 'critical'] as const;
export const RISK_LABEL: Record<string, string> = {
  low: 'Low', moderate: 'Moderate', elevated: 'Elevated', critical: 'Critical',
};
export const RISK_BADGE_CLASS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  moderate: 'bg-amber-50 text-amber-900 border-amber-200',
  elevated: 'bg-orange-50 text-orange-900 border-orange-200',
  critical: 'bg-rose-50 text-rose-900 border-rose-200',
};

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  temporary_assistance: 'Temporary Continuity Access',
  data_export: 'Continuity Export',
  preservation: 'Preservation Mode',
  memorialization: 'Account Memorialization',
  account_closure: 'Account Closure Review',
  // legacy
  ownership_transfer: 'Legacy Admin Access (legacy)',
  closure: 'Account Closure Review',
  export: 'Continuity Export',
};

export const DOC_VERIFICATION_OPTIONS = [
  'unreviewed', 'verified', 'rejected', 'requires_clarification', 'suspicious',
] as const;
export const DOC_VERIFICATION_LABEL: Record<string, string> = {
  unreviewed: 'Unreviewed',
  verified: 'Verified',
  rejected: 'Rejected',
  requires_clarification: 'Requires Clarification',
  suspicious: 'Suspicious',
};
export const DOC_VERIFICATION_BADGE: Record<string, string> = {
  unreviewed: 'bg-muted text-muted-foreground border-border',
  verified: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-900 border-rose-200',
  requires_clarification: 'bg-amber-50 text-amber-900 border-amber-200',
  suspicious: 'bg-rose-100 text-rose-950 border-rose-300',
};

export const CHECKLIST_DEFINITION: { category: string; items: { key: string; label: string }[] }[] = [
  {
    category: 'Legacy Admin Identity',
    items: [
      { key: 'identity_email', label: 'Email verified' },
      { key: 'identity_phone', label: 'Phone verified' },
      { key: 'identity_gov_id', label: 'Government ID reviewed' },
      { key: 'identity_name_match', label: 'Name matches documentation' },
      { key: 'identity_address', label: 'Address reviewed if available' },
    ],
  },
  {
    category: 'Legal Authority',
    items: [
      { key: 'legal_poa', label: 'Power of attorney reviewed' },
      { key: 'legal_executor', label: 'Executor documentation reviewed' },
      { key: 'legal_guardianship', label: 'Guardianship paperwork reviewed' },
      { key: 'legal_trust', label: 'Trust documentation reviewed' },
      { key: 'legal_court', label: 'Court documentation reviewed' },
      { key: 'legal_death_cert', label: 'Death certificate reviewed, if applicable' },
    ],
  },
  {
    category: 'Account Safety',
    items: [
      { key: 'safety_mfa', label: 'MFA status reviewed' },
      { key: 'safety_recent_changes', label: 'Recent account changes reviewed' },
      { key: 'safety_access_history', label: 'Prior access history reviewed' },
      { key: 'safety_conflicts', label: 'Conflicting requests checked' },
      { key: 'safety_suspicious', label: 'Suspicious activity checked' },
    ],
  },
];

export const CHECKLIST_STATUS_OPTIONS = [
  'not_started', 'passed', 'failed', 'not_applicable', 'needs_follow_up',
] as const;
export const CHECKLIST_STATUS_LABEL: Record<string, string> = {
  not_started: 'Not Started',
  passed: 'Passed',
  failed: 'Failed',
  not_applicable: 'Not Applicable',
  needs_follow_up: 'Needs Follow-up',
};
export const CHECKLIST_STATUS_BADGE: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground border-border',
  passed: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  failed: 'bg-rose-50 text-rose-900 border-rose-200',
  not_applicable: 'bg-muted text-muted-foreground border-border',
  needs_follow_up: 'bg-amber-50 text-amber-900 border-amber-200',
};

export const EVIDENCE_REQUIREMENT_LABEL: Record<string, string> = {
  required: 'Required',
  conditional: 'Conditional',
  recommended: 'Recommended',
};
export const EVIDENCE_REQUIREMENT_BADGE: Record<string, string> = {
  required: 'bg-rose-50 text-rose-900 border-rose-200',
  conditional: 'bg-amber-50 text-amber-900 border-amber-200',
  recommended: 'bg-blue-50 text-blue-900 border-blue-200',
};

export const NOTE_CATEGORIES = [
  'general', 'identity_concern', 'legal_concern', 'documentation_concern',
  'fraud_concern', 'communication_summary', 'decision_rationale',
] as const;
export const NOTE_CATEGORY_LABEL: Record<string, string> = {
  general: 'General',
  identity_concern: 'Identity Concern',
  legal_concern: 'Legal Concern',
  documentation_concern: 'Documentation Concern',
  fraud_concern: 'Fraud Concern',
  communication_summary: 'Communication Summary',
  decision_rationale: 'Decision Rationale',
};

export const MESSAGE_TEMPLATES = [
  { key: 'request_additional_docs', subject: 'Additional documentation requested', body: 'Asset Safe is reviewing your continuity request. We need additional supporting documentation before we can proceed. Please reply with the requested items.' },
  { key: 'request_clarification', subject: 'Clarification requested', body: 'Asset Safe needs clarification on information provided in your continuity request. Please reply with additional detail.' },
  { key: 'notify_under_review', subject: 'Your continuity request is under review', body: 'Asset Safe has received your continuity request and it is now under manual review. We will follow up if additional information is needed.' },
  { key: 'notify_approval', subject: 'Continuity request approved', body: 'Asset Safe has approved your continuity request. Next steps will be communicated separately.' },
  { key: 'notify_denial', subject: 'Continuity request denied', body: 'After review, Asset Safe was unable to approve your continuity request at this time. Please contact us if you have additional information.' },
  { key: 'notify_temp_access', subject: 'Temporary access granted', body: 'Asset Safe has granted limited temporary access in connection with your continuity request. Please review the access details and expiration date.' },
  { key: 'notify_ownership_transfer', subject: 'Ownership transfer review next steps', body: 'Asset Safe has begun the ownership transfer review for the account. Ownership will not transfer until you complete the acceptance steps that will be sent to you.' },
];

export const DENIAL_REASONS = [
  'Insufficient documentation',
  'Unable to verify identity',
  'Unable to verify legal authority',
  'Conflicting information',
  'Suspected fraud',
  'Account dispute',
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

export const TEMP_ACCESS_STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  revoked: 'Revoked',
};
export const TEMP_ACCESS_STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  expiring_soon: 'bg-amber-50 text-amber-900 border-amber-200',
  expired: 'bg-muted text-muted-foreground border-border',
  revoked: 'bg-rose-50 text-rose-900 border-rose-200',
};

export const TRANSFER_STATUS_LABEL: Record<string, string> = {
  recommended: 'Recommended',
  awaiting_senior_approval: 'Awaiting Senior Approval',
  approved_for_invitation: 'Approved for Invitation',
  invitation_sent: 'Invitation Sent',
  awaiting_acceptance: 'Awaiting Acceptance',
  ready_to_execute: 'Ready to Execute',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
export const TRANSFER_STATUS_BADGE: Record<string, string> = {
  recommended: 'bg-blue-50 text-blue-900 border-blue-200',
  awaiting_senior_approval: 'bg-amber-50 text-amber-900 border-amber-200',
  approved_for_invitation: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  invitation_sent: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  awaiting_acceptance: 'bg-violet-50 text-violet-900 border-violet-200',
  ready_to_execute: 'bg-amber-50 text-amber-900 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

// Role -> capability mapping
export type AdminCap =
  | 'view' | 'add_notes' | 'send_messages' | 'review_documents' | 'complete_checklist'
  | 'recommend_transfer' | 'apply_preservation_hold' | 'approve_temp_access'
  | 'senior_approve_transfer' | 'execute_transfer' | 'revoke_temp_access' | 'archive';

export function capabilitiesForRole(role: string | null): Set<AdminCap> {
  const caps = new Set<AdminCap>(['view']);
  if (!role) return caps;
  // qa = support admin
  if (['qa', 'developer', 'dev_lead', 'admin', 'owner'].includes(role)) {
    caps.add('add_notes'); caps.add('send_messages');
  }
  if (['developer', 'dev_lead', 'admin', 'owner'].includes(role)) {
    caps.add('review_documents'); caps.add('complete_checklist'); caps.add('recommend_transfer');
  }
  if (['dev_lead', 'admin', 'owner'].includes(role)) {
    caps.add('apply_preservation_hold'); caps.add('approve_temp_access'); caps.add('senior_approve_transfer');
  }
  if (['admin', 'owner'].includes(role)) {
    caps.add('execute_transfer'); caps.add('revoke_temp_access'); caps.add('archive');
  }
  return caps;
}

export const CAP_REQUIREMENT_HELP: Record<AdminCap, string> = {
  view: '',
  add_notes: 'Requires Support Admin permission.',
  send_messages: 'Requires Support Admin permission.',
  review_documents: 'Requires Continuity Reviewer permission.',
  complete_checklist: 'Requires Continuity Reviewer permission.',
  recommend_transfer: 'Requires Continuity Reviewer permission.',
  apply_preservation_hold: 'Requires Senior Reviewer permission.',
  approve_temp_access: 'Requires Senior Reviewer permission.',
  senior_approve_transfer: 'Requires Senior Reviewer permission.',
  execute_transfer: 'Requires Ownership Administrator permission.',
  revoke_temp_access: 'Requires Ownership Administrator permission.',
  archive: 'Requires Ownership Administrator permission.',
};
