import React, { useEffect, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, ChevronUp, Shield, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import UserStatusBadge from '@/components/UserStatusBadge';
import { Progress } from '@/components/ui/progress';
import DocumentationChecklist from '@/components/DocumentationChecklist';

const SecurityProgress: React.FC = () => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile, user } = useAuth();
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  // Additional data for all phases
  const [hasContributors, setHasContributors] = useState(false);
  const [hasVaultEncryption, setHasVaultEncryption] = useState(false);
  const [hasVaultData, setHasVaultData] = useState(false);
  const [hasPasswordEntries, setHasPasswordEntries] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [hasRecoveryDelegate, setHasRecoveryDelegate] = useState(false);

  useEffect(() => {
    const progressState = localStorage.getItem('securityProgressOpen');
    const checklistState = localStorage.getItem('securityChecklistOpen');
    if (progressState === 'true') setIsProgressOpen(true);
    if (checklistState === 'true') setIsChecklistOpen(true);
  }, []);

  useEffect(() => {
    refreshVerification();
  }, []);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!user) return;

      const [contributorsRes, legacyRes, passwordsRes, docsRes] = await Promise.all([
        supabase.from('contributors').select('id').eq('account_owner_id', user.id).limit(1),
        supabase.from('legacy_locker').select('id, is_encrypted, full_legal_name, executor_name, delegate_user_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('password_catalog').select('id').eq('user_id', user.id).limit(1),
        supabase.from('property_files').select('id').eq('user_id', user.id).eq('file_type', 'document').limit(1),
      ]);

      setHasContributors((contributorsRes.data?.length ?? 0) > 0);

      const legacyLocker = legacyRes.data;
      const hasLegacyData = legacyLocker && (legacyLocker.full_legal_name || legacyLocker.executor_name);
      setHasVaultData(!!hasLegacyData);
      setHasVaultEncryption(legacyLocker?.is_encrypted ?? false);
      setHasRecoveryDelegate(!!legacyLocker?.delegate_user_id);

      setHasPasswordEntries((passwordsRes.data?.length ?? 0) > 0);
      setHasDocuments((docsRes.data?.length ?? 0) > 0);
    };

    fetchAdditionalData();
  }, [user]);

  if (loading && !status) return null;

  // Build all tasks across all phases
  const isProfileComplete = status?.criteria?.profile_complete ?? !!(profile?.first_name);
  const hasProperty = status?.criteria?.has_property ?? false;
  const hasUploads = (status?.criteria?.upload_count ?? 0) > 0;
  const has2FA = status?.criteria?.has_2fa ?? false;

  const allTasks = [
    { label: 'Complete Your Profile', completed: isProfileComplete, phase: 1 },
    { label: 'Create Your First Property', completed: hasProperty, phase: 1 },
    { label: 'Upload Your First Photos or Documents', completed: hasUploads, phase: 1 },
    { label: 'Add a Trusted Contact', completed: hasContributors, phase: 2 },
    { label: 'Enable Multi-Factor Authentication', completed: has2FA, phase: 2 },
    { label: 'Upload Important Documents & Records', completed: hasDocuments, phase: 2 },
    { label: 'Enable Secure Vault Protection', completed: hasVaultEncryption, phase: 3 },
    { label: 'Add Legacy Locker & Password Catalog Details', completed: hasVaultData && hasPasswordEntries, phase: 3 },
    { label: 'Assign a Recovery Delegate', completed: hasRecoveryDelegate, phase: 3 },
  ];

  const completedCount = allTasks.filter(t => t.completed).length;
  const totalCount = allTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Determine status label
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

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      {/* ─── Section 1: Security Progress ─── */}
      <button
        onClick={handleToggleProgress}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">Security Progress</span>
              <UserStatusBadge status={statusLabel} size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {isProgressOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Expanded: All 9 Tasks */}
      {isProgressOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Complete these steps to strengthen your account protection:
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

          {/* Summary note */}
          <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
            {completedCount} of {totalCount} completed · {statusLabel === 'User' 
              ? 'Complete 5 milestones to reach Verified status' 
              : statusLabel === 'Verified' 
              ? 'Enable MFA to reach Verified+ status' 
              : 'Maximum protection enabled'}
          </p>
        </div>
      )}

      {/* ─── Section 2: Documentation Checklist ─── */}
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

        {isChecklistOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isChecklistOpen && (
        <div className="border-t border-border">
          <DocumentationChecklist embedded />
        </div>
      )}
    </div>
  );
};

export default SecurityProgress;
