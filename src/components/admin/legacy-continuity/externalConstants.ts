export const EXT_STATUS_OPTIONS = [
  "submitted", "under_review", "needs_verification", "owner_notified",
  "preservation_hold", "billing_review", "closure_review",
  "denied", "completed", "archived",
] as const;

export const EXT_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  needs_verification: "Needs Verification",
  owner_notified: "Owner Notified",
  preservation_hold: "Preservation Hold Applied",
  billing_review: "Billing Review",
  closure_review: "Closure Review",
  denied: "Denied",
  completed: "Completed",
  archived: "Archived",
};

export const EXT_STATUS_BADGE: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-900 border-blue-200",
  under_review: "bg-amber-50 text-amber-900 border-amber-200",
  needs_verification: "bg-orange-50 text-orange-900 border-orange-200",
  owner_notified: "bg-indigo-50 text-indigo-900 border-indigo-200",
  preservation_hold: "bg-violet-50 text-violet-900 border-violet-200",
  billing_review: "bg-cyan-50 text-cyan-900 border-cyan-200",
  closure_review: "bg-rose-50 text-rose-900 border-rose-200",
  denied: "bg-slate-700 text-slate-50 border-slate-700",
  completed: "bg-emerald-50 text-emerald-900 border-emerald-200",
  archived: "bg-muted text-muted-foreground border-border",
};

export const EXT_REASON_LABEL: Record<string, string> = {
  billing: "Billing concern",
  closure_inquiry: "Account closure inquiry",
  deceased: "Deceased account holder",
  incapacitated: "Incapacitated account holder",
  continuity_support: "Continuity / preservation support",
  memorialization: "Memorialization inquiry",
  export_inquiry: "Export inquiry",
  unsure: "Unsure / need assistance",
};
