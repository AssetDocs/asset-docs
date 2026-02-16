import React from 'react';
import { Shield } from 'lucide-react';
import TOTPSettings from './TOTPSettings';
import BackupCodesSettings from './BackupCodesSettings';

const MFADropdown: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Multi-Factor Authentication (MFA)</h3>
          <p className="text-[11px] text-muted-foreground">Secure your account with an authenticator app or backup codes</p>
        </div>
      </div>
      <TOTPSettings />
      <BackupCodesSettings />
    </div>
  );
};

export default MFADropdown;
