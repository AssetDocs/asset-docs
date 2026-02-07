import React, { useEffect, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, ChevronUp, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import UserStatusBadge from '@/components/UserStatusBadge';
import { Progress } from '@/components/ui/progress';

const SecurityProgress: React.FC = () => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Additional data for all phases
  const [hasContributors, setHasContributors] = useState(false);
  const [hasVaultEncryption, setHasVaultEncryption] = useState(false);
  const [hasVaultData, setHasVaultData] = useState(false);
  const [hasPasswordEntries, setHasPasswordEntries] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [hasRecoveryDelegate, setHasRecoveryDelegate] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('securityProgressDismissed');
    const collapsed = localStorage.getItem('securityProgressCollapsed');
    if (dismissed === 'true') setIsDismissed(true);
    if (collapsed === 'true') setIsCollapsed(true);
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
  if (isDismissed) return null;

  // Build all tasks across all phases
  const isProfileComplete = status?.criteria?.profile_complete ?? !!(profile?.first_name);
  const hasProperty = status?.criteria?.has_property ?? false;
  const hasUploads = (status?.criteria?.upload_count ?? 0) > 0;
  const has2FA = status?.criteria?.has_2fa ?? false;

  const allTasks = [
    // Phase 1: Getting Started
    { label: 'Complete Your Profile', completed: isProfileComplete, phase: 1 },
    { label: 'Create Your First Property', completed: hasProperty, phase: 1 },
    { label: 'Upload Your First Photos or Documents', completed: hasUploads, phase: 1 },
    // Phase 2: Next Steps
    { label: 'Add a Trusted Contact', completed: hasContributors, phase: 2 },
    { label: 'Enable Multi-Factor Authentication', completed: has2FA, phase: 2 },
    { label: 'Upload Important Documents & Records', completed: hasDocuments, phase: 2 },
    // Phase 3: Advanced Protection
    { label: 'Enable Secure Vault Protection', completed: hasVaultEncryption, phase: 3 },
    { label: 'Add Legacy Locker & Password Catalog Details', completed: hasVaultData && hasPasswordEntries, phase: 3 },
    { label: 'Assign a Recovery Delegate', completed: hasRecoveryDelegate, phase: 3 },
  ];

  const completedCount = allTasks.filter(t => t.completed).length;
  const totalCount = allTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // All tasks done → hide widget
  if (completedCount === totalCount) return null;

  // Get next incomplete tasks (max 4)
  const nextActions = allTasks.filter(t => !t.completed).slice(0, 4);

  // Determine status label
  const getStatusLabel = () => {
    if (status?.is_verified_plus) return 'Verified+';
    if (status?.is_verified) return 'Verified';
    return 'User';
  };

  const statusLabel = getStatusLabel();

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('securityProgressDismissed', 'true');
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('securityProgressCollapsed', String(newState));
  };

  // Phase label for context
  const getPhaseLabel = (phase: number) => {
    if (phase === 1) return 'Getting Started';
    if (phase === 2) return 'Next Steps';
    return 'Advanced';
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header row: Status badge + progress + collapse/dismiss */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={handleToggleCollapse}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">Security Progress</span>
              <UserStatusBadge status={statusLabel} size="sm" />
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {progressPercent}%
              </span>
            </div>
          </div>

          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          title="Don't show again"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded: Next Actions */}
      {!isCollapsed && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Complete these steps to strengthen your account protection:
          </p>
          <div className="space-y-2">
            {nextActions.map((task, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded mt-0.5 flex-shrink-0",
                  task.completed
                    ? "bg-green-500 text-white"
                    : "border border-muted-foreground/40 text-muted-foreground"
                )}>
                  {task.completed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-[10px] font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{task.label}</span>
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
    </div>
  );
};

export default SecurityProgress;
