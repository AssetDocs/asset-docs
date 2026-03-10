// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileTab from '@/components/ProfileTab';
import ManageTab from '@/components/ManageTab';
import NotificationsTab from '@/components/NotificationsTab';
import CookieSettings from '@/components/CookieSettings';
import MFADropdown from '@/components/MFADropdown';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import StorageDashboard from '@/components/StorageDashboard';
import { ViewerRestrictionBanner } from '@/components/ViewerRestriction';
import { useContributor } from '@/contexts/ContributorContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Copy, Check, Shield, Lock, Eye, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

// Restricted profile tab - only allows name, email, password changes
const RestrictedProfileTab: React.FC<{ roleLabel: string }> = ({ roleLabel }) => {
  return (
    <div>
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
            <Eye className="h-5 w-5" />
            {roleLabel} - Limited Profile Settings
          </CardTitle>
          <CardDescription className="text-amber-700">
            You can only update your own name, email, and password. Other settings are managed by the account owner.
          </CardDescription>
        </CardHeader>
      </Card>
      <ProfileTab viewerMode={true} />
    </div>
  );
};

const AccountSettings: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isViewer, isContributorRole, ownerName } = useContributor();
  const { unreadCount, markAllRead } = useUnreadNotifications();

  // Restricted tabs for viewers and contributors
  const restrictedTabs = ['manage', 'security', 'notifications', 'privacy'];

  // Check if user has restricted access
  const hasRestrictedAccess = isViewer || isContributorRole;

  // Valid tab names
  const validTabs = ['profile', 'manage', 'security', 'notifications', 'privacy'];

  const getTabFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (hasRestrictedAccess && restrictedTabs.includes(tab || '')) return 'profile';
    return validTabs.includes(tab || '') ? tab || 'profile' : 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  // Keep activeTab in sync with URL changes (e.g. browser back/forward)
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`?tab=${value}`, { replace: true });
  };

  useEffect(() => {
    const fetchAccountNumber = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_number')
          .eq('user_id', user.id)
          .single();
        if (profile?.account_number) setAccountNumber(profile.account_number);
      }
    };
    fetchAccountNumber();
  }, []);

  const copyAccountNumber = async () => {
    if (accountNumber) {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({ title: "Account number copied", description: "Your account number has been copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleLabel = () => {
    if (isViewer) return "Viewer Access";
    if (isContributorRole) return "Contributor Access";
    return "";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <DashboardBreadcrumb hidePageName />

          <ViewerRestrictionBanner />

          {/* Storage Dashboard at top */}
          <div className="mb-6">
            <StorageDashboard />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-blue">Account Settings</h1>
            <p className="text-gray-600">
              {hasRestrictedAccess
                ? `Viewing ${ownerName || 'account owner'}'s settings (${isViewer ? 'read-only' : 'limited'} access)`
                : 'Manage your profile, billing, and subscription preferences'
              }
            </p>
            {accountNumber && (
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-sm font-medium border-brand-blue text-brand-blue px-3 py-1">
                  Account #: {accountNumber}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAccountNumber}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-500" />
                  )}
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className={`grid w-full ${hasRestrictedAccess ? 'grid-cols-1' : 'grid-cols-5'}`}>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              {!hasRestrictedAccess && (
                <>
                  <TabsTrigger value="manage" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Manage</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2" onClick={() => markAllRead()}>
                    <div className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline">Alerts</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="profile">
              {hasRestrictedAccess ? <RestrictedProfileTab roleLabel={getRoleLabel()} /> : <ProfileTab />}
            </TabsContent>

            {!hasRestrictedAccess && (
              <>
                <TabsContent value="manage">
                  <ManageTab />
                </TabsContent>

                <TabsContent value="security">
                  <MFADropdown collapsible={false} />
                </TabsContent>

                <TabsContent value="notifications">
                  <NotificationsTab />
                </TabsContent>

                <TabsContent value="privacy">
                  <CookieSettings />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountSettings;
