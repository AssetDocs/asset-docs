import React, { useEffect } from 'react';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  completed: boolean;
}

const OnboardingProgress: React.FC = () => {
  const { status, loading, refreshVerification } = useVerification();
  const { profile } = useAuth();

  // Refresh verification on mount to ensure we have latest data
  useEffect(() => {
    refreshVerification();
  }, []);

  if (loading && !status) {
    return null; // Don't show anything while loading initially
  }

  // Determine step completion
  const isProfileComplete = status?.criteria?.profile_complete ?? !!(profile?.first_name);
  const hasProperty = status?.criteria?.has_property ?? false;
  const hasUploads = (status?.criteria?.upload_count ?? 0) > 0;

  const steps: Step[] = [
    { label: 'Complete Your Profile', completed: isProfileComplete },
    { label: 'Create Your First Property', completed: hasProperty },
    { label: 'Upload Your First Photos or Documents', completed: hasUploads },
  ];

  // Count completed steps
  const completedCount = steps.filter(s => s.completed).length;

  // If all 3 steps are complete, don't show the bar
  if (completedCount === 3) {
    return null;
  }

  return (
    <div className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Getting Started
        </p>
        <p className="text-xs text-muted-foreground">
          {completedCount} of {steps.length} complete
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-3">
        {steps.map((step, index) => (
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
    </div>
  );
};

export default OnboardingProgress;
