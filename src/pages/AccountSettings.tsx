import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileTab from '@/components/ProfileTab';
import BillingTab from '@/components/BillingTab';
import SubscriptionTab from '@/components/SubscriptionTab';
import NotificationsTab from '@/components/NotificationsTab';
import ContributorsTab from '@/components/ContributorsTab';
import CookieSettings from '@/components/CookieSettings';
import TOTPSettings from '@/components/TOTPSettings';
import BackupCodesSettings from '@/components/BackupCodesSettings';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import StorageDashboard from '@/components/StorageDashboard';
import { ViewerRestriction, ViewerRestrictionBanner } from '@/components/ViewerRestriction';
import { useContributor } from '@/contexts/ContributorContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, CreditCard, Package, Bell, Copy, Check, Shield, Users, Lock, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { isViewer, isContributor, isContributorRole, contributorRole, ownerName, canAccessSettings } = useContributor();
  
  // Restricted tabs for viewers and contributors (only administrators can access these)
  const restrictedTabs = ['billing', 'subscription', 'contributors', 'security', 'notifications', 'privacy'];
  
  // Check if user has restricted access (viewer or contributor role)
  const hasRestrictedAccess = isViewer || isContributorRole;
  
  // Get default tab from URL parameters
  const getDefaultTab = () => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    
    // If restricted access and trying to access restricted tab, default to profile
    if (hasRestrictedAccess && restrictedTabs.includes(tab || '')) {
      return 'profile';
    }
    
    return ['profile', 'billing', 'subscription', 'contributors', 'notifications', 'security', 'privacy'].includes(tab || '') 
      ? tab || 'profile' 
      : 'profile';
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
        
        if (profile?.account_number) {
          setAccountNumber(profile.account_number);
        }
      }
    };

    fetchAccountNumber();
  }, []);

  const copyAccountNumber = async () => {
    if (accountNumber) {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({
        title: "Account number copied",
        description: "Your account number has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestrictedTabClick = (e: React.MouseEvent) => {
    if (hasRestrictedAccess) {
      e.preventDefault();
      toast({
        title: "Access Restricted",
        description: isViewer 
          ? "Contributors with a viewer role are not allowed to access this section."
          : "Contributors with limited access cannot modify account settings. Please contact the account owner.",
        variant: "destructive",
      });
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
          <DashboardBreadcrumb />
          
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

          <Tabs defaultValue={getDefaultTab()} className="space-y-6">
            <TabsList className={`grid w-full ${hasRestrictedAccess ? 'grid-cols-1' : 'grid-cols-7'}`}>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              {!hasRestrictedAccess && (
                <>
                  <TabsTrigger value="billing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Billing</span>
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Plan</span>
                  </TabsTrigger>
                  <TabsTrigger value="contributors" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Authorized Users</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
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
                <TabsContent value="billing">
                  <BillingTab />
                </TabsContent>

                <TabsContent value="subscription">
                  <SubscriptionTab />
                </TabsContent>

                <TabsContent value="contributors">
                  <ContributorsTab />
                </TabsContent>

                <TabsContent value="notifications">
                  <NotificationsTab />
                </TabsContent>

                <TabsContent value="security">
                  <div className="space-y-6">
                    <TOTPSettings />
                    <BackupCodesSettings />
                  </div>
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
