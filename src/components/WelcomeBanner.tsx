// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, X, Settings, Home, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import AccountSwitcher from '@/components/AccountSwitcher';

interface WelcomeBannerProps {
  onTabChange?: (tab: string) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onTabChange }) => {
  const { profile, user } = useAuth();
  const { accountName, ownerName, isOwner, accountRole, hasMultipleAccounts } = useAccount();
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState<string>('');

  useEffect(() => {
    const fetchAccountNumber = async () => {
      if (!user) return;
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('account_number')
        .eq('user_id', user.id)
        .single();
      if (userProfile?.account_number) {
        setAccountNumber(userProfile.account_number);
      }
    };
    fetchAccountNumber();
  }, [user]);

  const getDisplayName = () => {
    const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
    const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.email?.split('@')[0] || 'User';
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'full_access': return 'Full Access';
      case 'read_only': return 'Read Only';
      case 'owner': return 'Owner';
      default: return '';
    }
  };

  const isMobile = useIsMobile();
  const [hideInstallPrompt, setHideInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isInstallPromptCollapsed, setIsInstallPromptCollapsed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) setHideInstallPrompt(true);
    const collapsed = localStorage.getItem('installPromptCollapsed');
    if (collapsed === 'true') setIsInstallPromptCollapsed(true);
  }, []);

  const handleDismissInstallPrompt = () => {
    setHideInstallPrompt(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleToggleInstallPromptCollapse = () => {
    const newState = !isInstallPromptCollapsed;
    setIsInstallPromptCollapsed(newState);
    localStorage.setItem('installPromptCollapsed', String(newState));
  };

  const showMobileInstallPrompt = isMobile && !isAppInstalled && !hideInstallPrompt;

  return (
    <div className="space-y-3 mb-6">
      <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">
              Welcome, {getDisplayName()}!
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-2xl font-bold">
                {accountName || 'Your Asset Safe Dashboard'}
              </h1>
              {hasMultipleAccounts && <AccountSwitcher />}
            </div>
            {!isOwner && accountRole && (
              <div className="mt-1 space-y-1">
                <p className="text-white/90 font-medium">
                  Authorized User — {getRoleLabel(accountRole)}
                </p>
                {ownerName && (
                  <p className="text-white/70 text-sm">
                    Account Owner: {ownerName}
                  </p>
                )}
              </div>
            )}
            <p className="text-white/70 text-sm mt-2">
              Everything you document today — protects you for tomorrow.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {accountNumber && (
              <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
                Account #: {accountNumber}
              </span>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => navigate('/account/settings')}
                className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
                title="Account Settings"
              >
                <Settings className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">Settings</span>
              </button>
              <button
                onClick={() => navigate('/account/properties')}
                className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
                title="Property Profiles"
              >
                <Home className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">Properties</span>
              </button>
              <button
                onClick={() => onTabChange?.('access-activity')}
                className="flex flex-col items-center justify-center gap-1 bg-white/15 hover:bg-white/25 transition-colors rounded-lg w-[72px] h-[56px] text-white/90 hover:text-white"
                title="Access & Activity"
              >
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">Users</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMobileInstallPrompt && (
        <div className="bg-gradient-to-r from-brand-orange to-orange-500 p-4 rounded-lg text-white relative">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleToggleInstallPromptCollapse}
              className="flex items-center gap-2 text-white hover:text-white/90 font-semibold transition-colors"
            >
              {isInstallPromptCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
              <span className="text-2xl">📲</span>
              <span className="text-sm">One-Tap Mobile Access</span>
            </button>
            <button 
              onClick={handleDismissInstallPrompt}
              className="text-white/70 hover:text-white text-xs flex items-center gap-1"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
              <span>Don't show again</span>
            </button>
          </div>
          {!isInstallPromptCollapsed && (
            <div className="flex items-start gap-3 mt-3 ml-6">
              <div className="flex-1">
                <p className="font-semibold text-sm">Add Asset Safe to Your Home Screen</p>
                <p className="text-white/90 text-xs mt-1">
                  One-tap access to your dashboard — even during emergencies with limited internet.
                </p>
                <Button 
                  asChild 
                  size="sm"
                  className="mt-2 bg-white text-brand-orange hover:bg-white/90 font-medium"
                >
                  <Link to="/install">
                    Learn How
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
