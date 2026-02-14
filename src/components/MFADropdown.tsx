import React, { useState, useEffect } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import TOTPSettings from './TOTPSettings';
import BackupCodesSettings from './BackupCodesSettings';

const MFADropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const state = localStorage.getItem('mfaDropdownOpen');
    if (state === 'true') setIsOpen(true);
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('mfaDropdownOpen', String(newState));
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Multi-Factor Authentication (MFA)</span>
        </div>

        <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
          <p className="text-[11px] text-muted-foreground">Secure your account with an authenticator app or backup codes</p>
          <TOTPSettings />
          <BackupCodesSettings />
        </div>
      )}
    </div>
  );
};

export default MFADropdown;
