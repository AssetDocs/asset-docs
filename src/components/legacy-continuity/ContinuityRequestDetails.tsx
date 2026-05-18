// @ts-nocheck
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText } from 'lucide-react';
import {
  REQUEST_TYPE_LABEL,
  STATUS_LABEL,
  STATUS_BADGE_CLASS,
} from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: any | null;
}

const ContinuityRequestDetails: React.FC<Props> = ({ open, onOpenChange, request }) => {
  if (!request) return null;
  const meta = request.metadata || {};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Continuity Request Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{REQUEST_TYPE_LABEL[request.request_type] || request.request_type}</span>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[request.status] || ''}>
              {STATUS_LABEL[request.status] || request.status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Submitted {new Date(request.created_at).toLocaleString()}
            {request.updated_at && request.updated_at !== request.created_at && (
              <> · Updated {new Date(request.updated_at).toLocaleString()}</>
            )}
          </div>

          <div className="border-t pt-3 space-y-2">
            {meta.relationship && <div><span className="text-muted-foreground">Relationship:</span> {meta.relationship}</div>}
            {meta.legal_authorization && <div><span className="text-muted-foreground">Legal authorization:</span> {meta.legal_authorization}</div>}
            {meta.passed_away && <div><span className="text-muted-foreground">Account holder passed away:</span> {meta.passed_away}</div>}
          </div>

          {request.reason && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Situation explanation</div>
              <p className="whitespace-pre-wrap text-sm">{request.reason}</p>
            </div>
          )}

          {meta.requested_outcomes?.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Requested outcomes</div>
              <ul className="list-disc list-inside text-sm">
                {meta.requested_outcomes.map((o: string) => <li key={o}>{o}{o === 'other' && meta.outcome_other ? `: ${meta.outcome_other}` : ''}</li>)}
              </ul>
            </div>
          )}

          {meta.documents?.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Supporting documentation</div>
              <ul className="space-y-1">
                {meta.documents.map((d: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{d.name}</span>
                    <span className="text-xs text-muted-foreground">· {d.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {request.admin_notes && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Asset Safe review notes</div>
              <p className="whitespace-pre-wrap text-sm">{request.admin_notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContinuityRequestDetails;
