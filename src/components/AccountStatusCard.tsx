import React, { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import UserStatusBadge from '@/components/UserStatusBadge';

interface AccountStatusCardProps {
  compact?: boolean;
}

const AccountStatusCard: React.FC<AccountStatusCardProps> = ({ compact = false }) => {
  const { status, loading, progress } = useVerification();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return null; // Minimal loading - just hide until ready
  }

  const criteria = status?.criteria;

  // Determine status label
  const getStatusLabel = () => {
    if (status?.is_verified_plus) return 'Verified+';
    if (status?.is_verified) return 'Verified';
    return 'User';
  };

  const statusLabel = getStatusLabel();

  // Criteria items with checkboxes
  const criteriaItems = [
    { 
      key: 'email', 
      label: 'Email Confirmed', 
      met: criteria?.email_verified ?? true // Default to true since email auth is required
    },
    { 
      key: 'age', 
      label: 'Account Age: 14+ days', 
      met: criteria?.account_age_met ?? false 
    },
    { 
      key: 'uploads', 
      label: `Uploads: ${criteria?.upload_count ?? 0} / 10`, 
      met: criteria?.upload_count_met ?? false 
    },
    { 
      key: 'profile', 
      label: 'Profile Complete', 
      met: criteria?.profile_complete ?? false 
    },
    { 
      key: 'property', 
      label: 'Property Added', 
      met: criteria?.has_property ?? false 
    },
  ];

  // Don't show expanded content if already verified+
  const showProgress = !status?.is_verified_plus;

  // Compact version for embedding in header
  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg bg-white/20 backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/90">Status:</span>
                <UserStatusBadge status={statusLabel} size="sm" className="bg-white/30 border-white/40" />
              </div>
              <ChevronDown 
                className={cn(
                  "h-3 w-3 text-white/70 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} 
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {showProgress && (
              <div className="px-3 pb-3 pt-1">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-white/30 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Criteria checklist */}
                <div className="space-y-1.5">
                  {criteriaItems.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center w-3.5 h-3.5 rounded border",
                        item.met 
                          ? "bg-green-400 border-green-400 text-white" 
                          : "border-white/50 text-white/50"
                      )}>
                        {item.met ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2 w-2" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        item.met ? "text-white" : "text-white/70"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified+ info when already verified */}
            {status?.is_verified && !status?.is_verified_plus && (
              <div className="px-3 pb-3 pt-1">
                <p className="text-xs text-white/80">
                  Enable MFA to upgrade to <span className="text-amber-300 font-medium">Verified+</span>
                </p>
              </div>
            )}

            {status?.is_verified_plus && (
              <div className="px-3 pb-3 pt-1">
                <p className="text-xs text-green-300">
                  Maximum protection enabled ✓
                </p>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Full version (original)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Account Status:</span>
              <UserStatusBadge status={statusLabel} size="sm" />
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {showProgress && (
            <div className="px-4 pb-4 pt-1 border-t border-border">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Progress to Verified</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-brand-blue rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Criteria checklist */}
              <div className="space-y-2">
                {criteriaItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 rounded border",
                      item.met 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-muted-foreground/40 text-muted-foreground"
                    )}>
                      {item.met ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-2.5 w-2.5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      item.met ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified+ info when already verified */}
          {status?.is_verified && !status?.is_verified_plus && (
            <div className="px-4 pb-4 pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Enable Multi-Factor Authentication to upgrade to <span className="text-amber-600 font-medium">Verified+</span>
              </p>
            </div>
          )}

          {status?.is_verified_plus && (
            <div className="px-4 pb-4 pt-1 border-t border-border">
              <p className="text-xs text-green-600">
                Maximum protection enabled with MFA
              </p>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AccountStatusCard;
