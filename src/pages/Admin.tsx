import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import SecureStorage from '@/utils/secureStorage';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminDatabase from '@/components/admin/AdminDatabase';
import EnhancedCRM from '@/components/admin/EnhancedCRM';
import AdminQuickStats from '@/components/admin/AdminQuickStats';
import StripeReconciliation from '@/components/admin/StripeReconciliation';
import SystemInfrastructure from '@/components/admin/SystemInfrastructure';
import SecurityChecklist from '@/components/admin/SecurityChecklist';
import { LogOut, Shield, Users, Database, Settings, Handshake, BarChart, CreditCard, Server, FileText, ShieldCheck } from 'lucide-react';
import AdminLegalAgreements from './AdminLegalAgreements';

const Admin = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has valid admin access
    const checkAccess = async () => {
      const adminAccess = await SecureStorage.getItem('admin_access');
      setHasAccess(adminAccess === 'granted');
      setIsChecking(false);
    };
    checkAccess();
  }, []);

  const handleLogout = () => {
    SecureStorage.removeItem('admin_access');
    setHasAccess(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return <AdminPasswordGate onPasswordCorrect={() => setHasAccess(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Asset Safe platform</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-9 gap-2 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Infra
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <AdminQuickStats />

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
                <CardHeader>
                  <Users className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View users, subscriptions, and gift orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('database')}>
                <CardHeader>
                  <Database className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Database Health</CardTitle>
                  <CardDescription>Monitor tables, storage, and errors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Database
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('crm')}>
                <CardHeader>
                  <BarChart className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>CRM Dashboard</CardTitle>
                  <CardDescription>Leads, contacts, and customer analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View CRM
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage security settings and access controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/account/settings')}>
                    View Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Settings className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Business Opportunities Section */}
            <Card className="mt-6">
              <CardHeader>
                <Handshake className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Business Opportunities & Partnerships</CardTitle>
                <CardDescription>Strategic partnership proposals and business development materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/compass-partnership')}
                  >
                    <span className="font-semibold">Compass Realty Partnership</span>
                    <span className="text-sm text-muted-foreground">Real estate partnership proposal</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/home-improvement-partnership')}
                  >
                    <span className="font-semibold">Home Improvement Partnership</span>
                    <span className="text-sm text-muted-foreground">Lowe's retail strategy</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/partnership')}
                  >
                    <span className="font-semibold">RE/MAX Partnership</span>
                    <span className="text-sm text-muted-foreground">Real estate partnership proposal</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/aha-partnership')}
                  >
                    <span className="font-semibold">American Homeowners Association</span>
                    <span className="text-sm text-muted-foreground">AHA Member Protection Vault</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/ara-partnership')}
                  >
                    <span className="font-semibold">American Real Estate Association</span>
                    <span className="text-sm text-muted-foreground">ARA Member Protection Benefit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/b2b-opportunities')}
                  >
                    <span className="font-semibold">B2B Opportunities</span>
                    <span className="text-sm text-muted-foreground">Strategic partnership categories</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/dev-partner-strategy')}
                  >
                    <span className="font-semibold">Dev Partner Strategy</span>
                    <span className="text-sm text-muted-foreground">Backend stability & ownership brief</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start text-left"
                    onClick={() => navigate('/admin/habitat-partnership')}
                  >
                    <span className="font-semibold">Habitat for Humanity</span>
                    <span className="text-sm text-muted-foreground">Homeownership Protection & Resilience</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeReconciliation />
          </TabsContent>

          <TabsContent value="database">
            <AdminDatabase />
          </TabsContent>

          <TabsContent value="security">
            <SecurityChecklist />
          </TabsContent>

          <TabsContent value="infrastructure">
            <SystemInfrastructure />
          </TabsContent>

          <TabsContent value="crm">
            <EnhancedCRM />
          </TabsContent>

          <TabsContent value="legal">
            <AdminLegalAgreements />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Shield className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage security configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/account/settings')}>
                    Open Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Handshake className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Partnership Materials</CardTitle>
                  <CardDescription>Access partnership presentations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={() => navigate('/admin/compass-partnership')}>
                    Compass Realty Proposal
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/home-improvement-partnership')}>
                    Home Improvement Partnership
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/partnership')}>
                    RE/MAX Partnership
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/aha-partnership')}>
                    American Homeowners Association
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/ara-partnership')}>
                    American Real Estate Association
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/b2b-opportunities')}>
                    B2B Opportunities
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/dev-partner-strategy')}>
                    Dev Partner Strategy
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/admin/habitat-partnership')}>
                    Habitat for Humanity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
