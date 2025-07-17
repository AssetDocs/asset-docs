
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileTab from '@/components/ProfileTab';
import BillingTab from '@/components/BillingTab';
import SubscriptionTab from '@/components/SubscriptionTab';
import NotificationsTab from '@/components/NotificationsTab';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, CreditCard, Package, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <DashboardBreadcrumb />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-blue">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, billing, and subscription preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountSettings;
