import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DevSupportType = 'bug_report' | 'feature_request' | 'ux_issue' | 'question' | 'account_recovery';
export type DevSupportPriority = 'low' | 'medium' | 'high' | 'critical';
type RecoveryScenario = 'lost_mfa' | 'lost_backup_codes' | 'lost_email_access' | 'lost_mfa_and_backup_codes' | 'lost_email_and_mfa' | 'other';

interface AddSupportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    reported_by?: string;
    type?: DevSupportType;
    priority?: DevSupportPriority;
    recovery_scenario?: RecoveryScenario;
    identity_verification_status?: 'needs_review';
    billing_verification_status?: 'needs_review';
    recovery_action_status?: 'needs_review';
  }) => Promise<boolean>;
}

export const AddSupportIssueModal: React.FC<AddSupportIssueModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [type, setType] = useState<DevSupportType>('bug_report');
  const [priority, setPriority] = useState<DevSupportPriority>('medium');
  const [recoveryScenario, setRecoveryScenario] = useState<RecoveryScenario>('lost_mfa_and_backup_codes');
  const [loading, setLoading] = useState(false);
  const isAccountRecovery = type === 'account_recovery';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const success = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      reported_by: reportedBy.trim() || undefined,
      type,
      priority,
      recovery_scenario: isAccountRecovery ? recoveryScenario : undefined,
      identity_verification_status: isAccountRecovery ? 'needs_review' : undefined,
      billing_verification_status: isAccountRecovery ? 'needs_review' : undefined,
      recovery_action_status: isAccountRecovery ? 'needs_review' : undefined,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setReportedBy('');
      setType('bug_report');
      setPriority('medium');
      setRecoveryScenario('lost_mfa_and_backup_codes');
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Support Issue</DialogTitle>
          <DialogDescription>
            Log a user-reported issue, recovery case, feature request, or UX feedback
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="User can't upload photos on mobile"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => {
                    const nextType = v as DevSupportType;
                    setType(nextType);
                    if (nextType === 'account_recovery' && priority === 'medium') {
                      setPriority('high');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="ux_issue">UX Issue</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="account_recovery">Account Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as DevSupportPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isAccountRecovery && (
              <div className="space-y-2">
                <Label htmlFor="recovery_scenario">Recovery Scenario</Label>
                <Select value={recoveryScenario} onValueChange={(v) => setRecoveryScenario(v as RecoveryScenario)}>
                  <SelectTrigger id="recovery_scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost_mfa">Lost MFA</SelectItem>
                    <SelectItem value="lost_backup_codes">Lost Backup Codes</SelectItem>
                    <SelectItem value="lost_email_access">Lost Email Access</SelectItem>
                    <SelectItem value="lost_mfa_and_backup_codes">Lost MFA and Backup Codes</SelectItem>
                    <SelectItem value="lost_email_and_mfa">Lost Email and MFA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reported_by">Reported By</Label>
              <Input
                id="reported_by"
                placeholder="user@example.com or User Name"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue, steps to reproduce, expected behavior..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Adding...' : 'Add Issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
