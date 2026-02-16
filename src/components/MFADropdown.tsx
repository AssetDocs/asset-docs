import React, { useState } from 'react';
import { Shield, ChevronDown, Check } from 'lucide-react';
import TOTPSettings from './TOTPSettings';
import BackupCodesSettings from './BackupCodesSettings';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useTOTP } from '@/hooks/useTOTP';

interface MFADropdownProps {
  collapsible?: boolean;
}

const MFADropdown: React.FC<MFADropdownProps> = ({ collapsible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnrolled } = useTOTP();

  const header = (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
        <Shield className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Multi-Factor Authentication (MFA)</h3>
        {!collapsible && (
          <p className="text-[11px] text-muted-foreground">Secure your account with an authenticator app or backup codes</p>
        )}
      </div>
      {collapsible && isEnrolled && (
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <Check className="h-3 w-3" />
          Enabled
        </span>
      )}
    </div>
  );

  const content = (
    <div className="space-y-6">
      <TOTPSettings />
      <BackupCodesSettings />
    </div>
  );

  if (!collapsible) {
    return (
      <div className="space-y-6">
        {header}
        {content}
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
            {header}
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-border">
            {content}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MFADropdown;
