import React, { useEffect, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, Shield, ClipboardList, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserStatusBadge from '@/components/UserStatusBadge';
import { Progress } from '@/components/ui/progress';
import DocumentationChecklist from '@/components/DocumentationChecklist';
import { useNavigate } from 'react-router-dom';

interface SecurityProgressProps {
  hideChecklist?: boolean;
}

const SecurityProgress: React.FC<SecurityProgressProps> = ({ hideChecklist = false }) => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  useEffect(() => {
    refreshVerification();
  }, []);

  if (loading && !status) return null;

  const criteria = status?.criteria;

  const allTasks = [
    { label: 'Complete Your Profile', completed: criteria?.profile_complete ?? !!(profile?.first_name), phase: 1 },
    { label: 'Create Your First Property', completed: criteria?.has_property ?? false, phase: 1 },
    { label: 'Upload Your First Photos or Videos', completed: (criteria?.upload_count ?? 0) >= 1, phase: 1 },
    { label: 'Add an Authorized User', completed: criteria?.has_contributors ?? false, phase: 2 },
    { label: 'Enable Multi-Factor Authentication', completed: criteria?.has_2fa ?? false, phase: 2 },
    { label: 'Upload Important Documents & Records', completed: criteria?.has_documents ?? false, phase: 2 },
    { label: 'Enable Secure Vault Protection', completed: criteria?.has_vault_encryption ?? false, phase: 3 },
    { label: 'Add Legacy Locker Details', completed: criteria?.has_vault_data_and_passwords ?? false, phase: 3 },
    { label: 'Assign a Recovery Delegate', completed: criteria?.has_recovery_delegate ?? false, phase: 3 },
  ];

  const groups = [
    {
      label: 'Getting Started',
      tasks: allTasks.filter(t => t.phase === 1),
    },
    {
      label: 'Security Protection',
      tasks: allTasks.filter(t => t.phase === 2),
    },
    {
      label: 'Legacy Protection',
      tasks: allTasks.filter(t => t.phase === 3),
    },
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

  const handleToggleProgress = () => setIsProgressOpen(prev => !prev);
  const handleToggleChecklist = () => setIsChecklistOpen(prev => !prev);

  const accountAgeNote = criteria?.account_age_met === false
    ? ' · Account must be 14+ days old to qualify'
    : '';

  // Smart next task: Verified users only need MFA for Verified+
  const nextTask = (() => {
    if (status?.is_verified_plus) return null;
    if (status?.is_verified) {
      return allTasks.find(t => t.label === 'Enable Multi-Factor Authentication' && !t.completed) ?? null;
    }
    return allTasks.find(t => !t.completed) ?? null;
  })();

  const statusGoal = status?.is_verified ? 'Verified+' : 'Verified';

  const getNextTaskRoute = (label: string): string => {
    if (label === 'Complete Your Profile') return '/account/settings';
    if (label === 'Create Your First Property') return '/account/properties';
    if (label === 'Upload Your First Photos or Videos') return '/account/photos';
    if (label === 'Add an Authorized User') return '/account?tab=access-activity';
    if (label === 'Enable Multi-Factor Authentication') return '/account/settings?tab=security';
    if (label === 'Upload Important Documents & Records') return '/account/documents';
    if (label === 'Enable Secure Vault Protection') return '/account?tab=vault';
    if (label === 'Add Legacy Locker Details') return '/account?tab=vault';
    if (label === 'Assign a Recovery Delegate') return '/account?tab=vault';
    return '/account';
  };

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

      {/* Next step guided prompt — always visible below the progress bar */}
      {nextTask && (
      <div className="px-4 py-2.5 border-t border-border bg-muted/20">
          {/* Mobile: 2 lines. Desktop: single row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-3">
            <span className="text-[11px] text-muted-foreground">Next step to reach {statusGoal} status:</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-foreground">✔ {nextTask.label}</span>
              <button
                onClick={() => navigate(getNextTaskRoute(nextTask.label))}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap ml-1"
              >
                Go <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isProgressOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          <p className="text-[11px] text-muted-foreground mb-3">Overall account protection status</p>
          <div className="space-y-4">
            {groups.map((group) => {
              let taskIndex = 0;
              return (
                <div key={group.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.tasks.map((task) => {
                      const globalIndex = allTasks.findIndex(t => t.label === task.label);
                      return (
                        <div key={task.label} className="flex items-center gap-2.5">
                          <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded flex-shrink-0",
                            task.completed
                              ? "bg-primary text-primary-foreground"
                              : "border border-muted-foreground/40 text-muted-foreground"
                          )}>
                            {task.completed ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <span className="text-[10px] font-semibold">{globalIndex + 1}</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {task.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
