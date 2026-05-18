// @ts-nocheck
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SCOPE_LABEL, type TransferScope } from './executionConstants';

interface Props {
  open: boolean;
  onClose: () => void;
  scope: TransferScope | null;
  caseData: any;
  snapshot: any | null;
  onAcknowledge: () => void;
}

const Section: React.FC<any> = ({ title, items }) => (
  <div>
    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">{title}</div>
    <ul className="space-y-1 text-sm">
      {items.map((i: any, idx: number) => <li key={idx} className="flex justify-between gap-2"><span>{i.label}</span><span className="text-muted-foreground">{i.value}</span></li>)}
    </ul>
  </div>
);

const TransferPreviewDialog: React.FC<Props> = ({ open, onClose, scope, caseData, snapshot, onAcknowledge }) => {
  if (!scope) return null;

  const sections: any = {
    transfer: {
      before: [
        { label: 'Primary owner', value: 'Current owner' },
        { label: 'Billing authority', value: 'Current owner' },
        { label: 'Secure Vault control', value: 'Current owner' },
        { label: 'Legacy Admin', value: 'Designated' },
      ],
      after: [
        { label: 'Primary owner', value: 'Legacy Admin → New Owner' },
        { label: 'Previous owner role', value: 'Archived Owner' },
        { label: 'Billing authority', value: 'New Owner' },
        { label: 'Secure Vault control', value: 'New Owner' },
        { label: 'Continuity preferences', value: 'Reset required' },
      ],
      changed: [
        { label: 'Account ownership', value: 'Transferred' },
        { label: 'Billing', value: 'Transferred' },
        { label: 'Authorized user management', value: 'Transferred' },
        { label: 'Export & deletion authority', value: 'Transferred' },
      ],
      restricted: [
        { label: 'Previous owner edits', value: 'Blocked' },
        { label: 'Previous owner billing', value: 'Blocked' },
        { label: 'Reclaim via normal UI', value: 'Blocked' },
      ],
    },
    temporary: {
      before: [{ label: 'Owner', value: 'Unchanged' }, { label: 'Access', value: 'Owner only' }],
      after: [{ label: 'Owner', value: 'Unchanged' }, { label: 'Legacy Admin access', value: 'Time-bound' }],
      changed: [{ label: 'Legacy Admin permissions', value: 'Limited stewardship' }],
      restricted: [{ label: 'Ownership changes', value: 'Blocked' }, { label: 'Deletion', value: 'Blocked' }],
    },
    archive: {
      before: [{ label: 'Custodian access', value: 'None' }],
      after: [{ label: 'View/export', value: 'Granted' }, { label: 'Modify/delete', value: 'Blocked' }],
      changed: [{ label: 'Custodian view & export', value: 'Enabled' }],
      restricted: [{ label: 'Editing', value: 'Blocked' }, { label: 'Deletion', value: 'Blocked' }, { label: 'Invitations', value: 'Blocked' }],
    },
  };

  const audit = [
    { label: 'Snapshot reference', value: snapshot?.snapshot_reference || '— (will be created)' },
    { label: 'Execution event', value: 'continuity_execution_events' },
    { label: 'Timeline event', value: 'Created' },
    { label: 'Audit log entry', value: 'Created' },
    ...(scope === 'transfer' ? [{ label: 'Ownership transfer history', value: 'Created' }, { label: 'Account ownership metadata', value: 'Stamped' }] : []),
  ];

  const s = sections[scope];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Transfer Preview <Badge variant="outline">{SCOPE_LABEL[scope]}</Badge>
          </DialogTitle>
          <DialogDescription>
            Review the exact changes that will occur before executing this continuity action.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <Section title="Before" items={s.before} />
          <Section title="After" items={s.after} />
          <Section title="Changed Permissions" items={s.changed} />
          <Section title="Restricted Permissions" items={s.restricted} />
          <div className="col-span-2"><Section title="Audit Records to be Created" items={audit} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onAcknowledge}>I have reviewed the preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferPreviewDialog;
