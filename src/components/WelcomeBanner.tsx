import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Home, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import UserStatusBadge from '@/components/UserStatusBadge';
import { useVerification } from '@/hooks/useVerification';
import AccountStatusCard from '@/components/AccountStatusCard';
import OnboardingProgress from '@/components/OnboardingProgress';

const WelcomeBanner: React.FC = () => {
  const { profile, user } = useAuth();
  const [contributorInfo, setContributorInfo] = useState<{
    first_name: string | null;
    last_name: string | null;
    role: string;
    ownerName: string;
  } | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const { status: verificationStatus, refreshVerification } = useVerification();

  useEffect(() => {
    const fetchContributorInfo = async () => {
      if (!user) return;

      // Get user's profile for account number
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('account_number')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.account_number) {
        setAccountNumber(userProfile.account_number);
      }

      // Check if user is a contributor
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, first_name, last_name, role')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        // Get owner's name and account number
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, account_number')
          .eq('user_id', contributorData.account_owner_id)
          .single();

        if (ownerProfile?.account_number) {
          setAccountNumber(ownerProfile.account_number);
        }

        setContributorInfo({
          first_name: contributorData.first_name,
          last_name: contributorData.last_name,
          role: contributorData.role,
          ownerName: ownerProfile ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() : ''
        });
      }
    };

    fetchContributorInfo();
  }, [user]);

  // Refresh verification on mount
  useEffect(() => {
    if (user) {
      refreshVerification();
    }
  }, [user, refreshVerification]);
  
  const getDisplayName = () => {
    // If contributor, show their name from contributor record
    if (contributorInfo) {
      const name = `${contributorInfo.first_name || ''} ${contributorInfo.last_name || ''}`.trim();
      return name || user?.email?.split('@')[0] || 'Contributor';
    }
    // Owner - show their full name from profile
    const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
    const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isMobile = useIsMobile();
  const [hideInstallPrompt, setHideInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isInstallPromptCollapsed, setIsInstallPromptCollapsed] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      setHideInstallPrompt(true);
    }
    // Check if collapsed
    const collapsed = localStorage.getItem('installPromptCollapsed');
    if (collapsed === 'true') {
      setIsInstallPromptCollapsed(true);
    }
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

  // Check if mobile install prompt should show
  const showMobileInstallPrompt = isMobile && !isAppInstalled && !hideInstallPrompt;

  return (
    <div className="space-y-3 mb-6">
      <div className="bg-gradient-to-r from-brand-blue to-brand-lightBlue p-6 rounded-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Welcome, {getDisplayName()}!
              <UserStatusBadge 
                status={verificationStatus?.is_verified_plus ? 'Verified+' : verificationStatus?.is_verified ? 'Verified' : 'User'} 
                size="sm"
                showLabel={false}
                className="bg-white/20 border-white/30"
              />
            </h1>
            {contributorInfo && (
              <div className="mt-1 space-y-1">
                <p className="text-white/90 font-medium">
                  Contributor - {getRoleDisplay(contributorInfo.role)}
                </p>
                {contributorInfo.ownerName && (
                  <p className="text-white/70 text-sm">
                    Account Owner: {contributorInfo.ownerName}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button asChild variant="outline" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400">
                <Link to="/account/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-400">
                <Link to="/account/properties">
                  <Home className="mr-2 h-4 w-4" />
                  Property Profiles
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side: Account # and Account Status */}
          <div className="flex flex-col gap-2 sm:items-end">
            {accountNumber && (
              <span className="text-white/90 font-medium text-sm bg-white/20 px-3 py-1 rounded-md">
                Account #: {accountNumber}
              </span>
            )}
            {/* Account Status Card - compact version inside header */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <AccountStatusCard compact />
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side: Mobile Install Prompt + Onboarding Progress */}
      <div className={`grid gap-3 ${showMobileInstallPrompt ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Mobile Install Prompt - only shows on mobile devices, not already installed, and not dismissed */}
        {showMobileInstallPrompt && (
          <div className="bg-gradient-to-r from-brand-orange to-orange-500 p-4 rounded-lg text-white relative h-full">
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

        {/* Onboarding Progress - now inline */}
        <OnboardingProgress inline />
      </div>
    </div>
  );
};

export default WelcomeBanner;
