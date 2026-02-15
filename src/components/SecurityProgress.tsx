import React, { useEffect, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, Shield, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserStatusBadge from '@/components/UserStatusBadge';
import { Progress } from '@/components/ui/progress';
import DocumentationChecklist from '@/components/DocumentationChecklist';

interface SecurityProgressProps {
  hideChecklist?: boolean;
}

const SecurityProgress: React.FC<SecurityProgressProps> = ({ hideChecklist = false }) => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile } = useAuth();
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  useEffect(() => {
    const progressState = localStorage.getItem('securityProgressOpen');
    const checklistState = localStorage.getItem('securityChecklistOpen');
    if (progressState === 'true') setIsProgressOpen(true);
    if (checklistState === 'true') setIsChecklistOpen(true);
  }, []);

  useEffect(() => {
    refreshVerification();
  }, []);

  if (loading && !status) return null;

  const criteria = status?.criteria;

  const allTasks = [
    { label: 'Complete Your Profile', completed: criteria?.profile_complete ?? !!(profile?.first_name), phase: 1 },
    { label: 'Create Your First Property', completed: criteria?.has_property ?? false, phase: 1 },
    { label: 'Upload Your First Photos or Documents', completed: criteria?.upload_count_met ?? false, phase: 1 },
    { label: 'Add an Authorized User', completed: criteria?.has_contributors ?? false, phase: 2 },
    { label: 'Enable Multi-Factor Authentication', completed: criteria?.has_2fa ?? false, phase: 2 },
    { label: 'Upload Important Documents & Records', completed: criteria?.has_documents ?? false, phase: 2 },
    { label: 'Enable Secure Vault Protection', completed: criteria?.has_vault_encryption ?? false, phase: 3 },
    { label: 'Add Legacy Locker & Password Catalog Details', completed: criteria?.has_vault_data_and_passwords ?? false, phase: 3 },
    { label: 'Assign a Recovery Delegate (inside the Secure Vault)', completed: criteria?.has_recovery_delegate ?? false, phase: 3 },
  ];

  const completedCount = allTasks.filter(t => t.completed).length;
  const totalCount = allTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const getStatusLabel = () => {
    if (status?.is_verified_plus) return 'Verified+';
    if (status?.is_verified) return 'Verified';
    return 'User';
  };

  const statusLabel = getStatusLabel();

  const getPhaseLabel = (phase: number) => {
    if (phase === 1) return 'Getting Started';
    if (phase === 2) return 'Next Steps';
    return 'Advanced';
  };

  const handleToggleProgress = () => {
    const newState = !isProgressOpen;
    setIsProgressOpen(newState);
    localStorage.setItem('securityProgressOpen', String(newState));
  };

  const handleToggleChecklist = () => {
    const newState = !isChecklistOpen;
    setIsChecklistOpen(newState);
    localStorage.setItem('securityChecklistOpen', String(newState));
  };

  const accountAgeNote = criteria?.account_age_met === false
    ? ' · Account must be 14+ days old to qualify'
    : '';

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={handleToggleProgress}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">Security Progress</span>
          <UserStatusBadge status={statusLabel} size="sm" />
          <Progress value={progressPercent} className="h-1.5 flex-1 min-w-0" />
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isProgressOpen ? '' : '-rotate-90'}`} />
      </button>

      {isProgressOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          <p className="text-[11px] text-muted-foreground mb-2">Overall account protection status</p>
          <p className="text-xs text-muted-foreground mb-3">
            Complete any 5 of the following steps to reach Verified status:
          </p>
          <div className="space-y-2">
            {allTasks.map((task, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded mt-0.5 flex-shrink-0 relative",
                  task.completed
                    ? "bg-primary text-primary-foreground"
                    : "border border-muted-foreground/40 text-muted-foreground"
                )}>
                  {task.completed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-[10px] font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-sm",
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  )}>
                    {task.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {getPhaseLabel(task.phase)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
            {completedCount} of {totalCount} completed · {statusLabel === 'User' 
              ? `Complete any 5 milestones to reach Verified status${accountAgeNote}` 
              : statusLabel === 'Verified' 
              ? 'Enable MFA to reach Verified+ status' 
              : 'Maximum protection enabled'}
          </p>
        </div>
      )}

      {!hideChecklist && (
        <>
          <button
            onClick={handleToggleChecklist}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 border-t border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Documentation Checklist</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isChecklistOpen ? '' : '-rotate-90'}`} />
          </button>

          {isChecklistOpen && (
            <div className="border-t border-border">
              <DocumentationChecklist embedded />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SecurityProgress;
