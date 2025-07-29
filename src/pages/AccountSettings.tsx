
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileTab from '@/components/ProfileTab';
import BillingTab from '@/components/BillingTab';
import SubscriptionTab from '@/components/SubscriptionTab';
import NotificationsTab from '@/components/NotificationsTab';
import CookieSettings from '@/components/CookieSettings';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, CreditCard, Package, Bell, Copy, Check, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AccountSettings: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <DashboardBreadcrumb />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-blue">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, billing, and subscription preferences</p>
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

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="billing">
              <BillingTab />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionTab />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="privacy">
              <CookieSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountSettings;
