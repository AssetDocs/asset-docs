// @ts-nocheck
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { REQUESTED_OUTCOMES } from '@/components/legacy-continuity/types';
import { REQUEST_TYPE_LABEL } from './constants';

const Field = ({ label, value }: any) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
    <div className="text-sm whitespace-pre-wrap mt-1">{value || '—'}</div>
  </div>
);

const CaseRequestSummary: React.FC<{ caseData: any }> = ({ caseData }) => {
  const m = caseData.metadata || {};
  const outcomes = m.requested_outcomes || [];
  return (
    <div className="space-y-5 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Request Type" value={REQUEST_TYPE_LABEL[caseData.request_type] || caseData.request_type} />
        <Field label="Date Submitted" value={new Date(caseData.created_at).toLocaleString()} />
        <Field label="Relationship to Account Holder" value={m.relationship} />
        <Field label="Claims Legal Authority" value={m.legal_authorization} />
        <Field label="Account Holder Deceased" value={m.passed_away} />
      </div>
      <Field label="Situation Explanation" value={caseData.situation_explanation} />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Requested Actions</div>
        <div className="flex flex-wrap gap-2">
          {outcomes.length === 0 && <span className="text-sm text-muted-foreground">None specified</span>}
          {outcomes.map((o: string) => {
            const opt = REQUESTED_OUTCOMES.find((x) => x.value === o);
            return <Badge key={o} variant="outline">{opt?.label || o}</Badge>;
          })}
          {m.outcome_other && <Badge variant="outline">Other: {m.outcome_other}</Badge>}
        </div>
      </div>
    </div>
  );
};

export default CaseRequestSummary;
