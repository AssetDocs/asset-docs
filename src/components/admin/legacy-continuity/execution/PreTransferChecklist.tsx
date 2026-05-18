// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PRE_EXECUTION_CHECKLIST, CHECKLIST_STATE_LABEL, CHECKLIST_STATE_BADGE,
  type ChecklistItemState,
} from './executionConstants';

interface Props {
  values: Record<string, ChecklistItemState>;
  onChange: (key: string, state: ChecklistItemState) => void;
  readOnly?: boolean;
}

const PreTransferChecklist: React.FC<Props> = ({ values, onChange, readOnly }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Critical Pre-Transfer Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PRE_EXECUTION_CHECKLIST.map((item) => {
          const state: ChecklistItemState = values[item.key] || 'incomplete';
          return (
            <div key={item.key} className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
              <div className="text-sm flex-1">
                {item.label}
                {item.required && <span className="text-rose-600 ml-1">*</span>}
              </div>
              <Badge variant="outline" className={CHECKLIST_STATE_BADGE[state]}>
                {CHECKLIST_STATE_LABEL[state]}
              </Badge>
              <Select value={state} onValueChange={(v) => onChange(item.key, v as ChecklistItemState)} disabled={readOnly}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHECKLIST_STATE_LABEL) as ChecklistItemState[]).map((s) => (
                    <SelectItem key={s} value={s}>{CHECKLIST_STATE_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PreTransferChecklist;

export function computeCanExecute(values: Record<string, ChecklistItemState>) {
  return PRE_EXECUTION_CHECKLIST.every((item) => {
    if (!item.required) return true;
    const v = values[item.key];
    return v === 'complete' || v === 'not_applicable';
  });
}
