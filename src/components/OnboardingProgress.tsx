import React, { useEffect, useState } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Step {
  label: string;
  completed: boolean;
}

type Phase = 'getting-started' | 'next-steps' | 'advanced-protection' | 'complete';

const OnboardingProgress: React.FC = () => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Additional data for phases 2 and 3
  const [hasContributors, setHasContributors] = useState(false);
  const [hasVaultData, setHasVaultData] = useState(false);
  const [hasVaultEncryption, setHasVaultEncryption] = useState(false);
  const [hasPasswordEntries, setHasPasswordEntries] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [hasRecoveryDelegate, setHasRecoveryDelegate] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('onboardingProgressDismissed');
    const collapsed = localStorage.getItem('onboardingProgressCollapsed');
    if (dismissed === 'true') setIsDismissed(true);
    if (collapsed === 'true') setIsCollapsed(true);
  }, []);

  // Refresh verification on mount to ensure we have latest data
  useEffect(() => {
    refreshVerification();
  }, []);

  // Fetch additional data for phase 2 and 3 checks
  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!user) return;

      // Check for contributors (trusted contacts)
      const { data: contributors } = await supabase
        .from('contributors')
        .select('id')
        .eq('account_owner_id', user.id)
        .limit(1);
      setHasContributors((contributors?.length ?? 0) > 0);

      // Check for legacy locker data, encryption, and recovery delegate
      const { data: legacyLocker } = await supabase
        .from('legacy_locker')
        .select('id, is_encrypted, full_legal_name, executor_name, delegate_user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const hasLegacyData = legacyLocker && (legacyLocker.full_legal_name || legacyLocker.executor_name);
      setHasVaultData(!!hasLegacyData);
      setHasVaultEncryption(legacyLocker?.is_encrypted ?? false);
      setHasRecoveryDelegate(!!legacyLocker?.delegate_user_id);

      // Check for password catalog entries
      const { data: passwords } = await supabase
        .from('password_catalog')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      setHasPasswordEntries((passwords?.length ?? 0) > 0);

      // Check for documents
      const { data: documents } = await supabase
        .from('property_files')
        .select('id')
        .eq('user_id', user.id)
        .eq('file_type', 'document')
        .limit(1);
      setHasDocuments((documents?.length ?? 0) > 0);
    };

    fetchAdditionalData();
  }, [user]);

  if (loading && !status) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  // Phase 1: Getting Started
  const isProfileComplete = status?.criteria?.profile_complete ?? !!(profile?.first_name);
  const hasProperty = status?.criteria?.has_property ?? false;
  const hasUploads = (status?.criteria?.upload_count ?? 0) > 0;

  const gettingStartedSteps: Step[] = [
    { label: 'Complete Your Profile', completed: isProfileComplete },
    { label: 'Create Your First Property', completed: hasProperty },
    { label: 'Upload Your First Photos or Documents', completed: hasUploads },
  ];
  const gettingStartedComplete = gettingStartedSteps.every(s => s.completed);

  // Phase 2: Next Steps
  const has2FA = status?.criteria?.has_2fa ?? false;
  const nextSteps: Step[] = [
    { label: 'Add a Trusted Contact', completed: hasContributors },
    { label: 'Enable Multi-Factor Authentication', completed: has2FA },
    { label: 'Upload Important Documents & Records', completed: hasDocuments },
  ];
  const nextStepsComplete = nextSteps.every(s => s.completed);

  // Phase 3: Advanced Protection
  const advancedSteps: Step[] = [
    { label: 'Enable Secure Vault Protection', completed: hasVaultEncryption },
    { label: 'Add Password Catalog & Legacy Locker Details', completed: hasVaultData && hasPasswordEntries },
    { label: 'Assign a Recovery Delegate', completed: hasRecoveryDelegate },
  ];
  const advancedComplete = advancedSteps.every(s => s.completed);

  // Determine current phase
  let currentPhase: Phase;
  let currentSteps: Step[];
  let phaseTitle: string;

  if (!gettingStartedComplete) {
    currentPhase = 'getting-started';
    currentSteps = gettingStartedSteps;
    phaseTitle = 'Getting Started';
  } else if (!nextStepsComplete) {
    currentPhase = 'next-steps';
    currentSteps = nextSteps;
    phaseTitle = 'Next Steps';
  } else if (!advancedComplete) {
    currentPhase = 'advanced-protection';
    currentSteps = advancedSteps;
    phaseTitle = 'Advanced Protection (Optional)';
  } else {
    return null; // All phases complete, hide the component
  }

  const completedCount = currentSteps.filter(s => s.completed).length;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('onboardingProgressDismissed', 'true');
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('onboardingProgressCollapsed', String(newState));
  };

  return (
    <div className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCollapse}
            className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wide hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            {phaseTitle}
          </button>
          <span className="text-xs text-muted-foreground">
            ({completedCount} of {currentSteps.length} complete)
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          title="Don't show again"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Don't show again</span>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-3">
          {currentSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded",
                step.completed 
                  ? "bg-green-500 text-white" 
                  : "border border-muted-foreground/40 text-muted-foreground"
              )}>
                {step.completed ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span className={cn(
                "text-sm",
                step.completed ? "text-foreground line-through" : "text-foreground"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;
