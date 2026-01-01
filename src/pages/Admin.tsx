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
import { LogOut, Shield, Users, Database, Settings, Handshake, BarChart } from 'lucide-react';

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
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              CRM
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
                  <Handshake className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Compass Partnership</CardTitle>
                  <CardDescription>View strategic partnership proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/admin/compass-partnership')}>
                    View Presentation
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
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="database">
            <AdminDatabase />
          </TabsContent>

          <TabsContent value="crm">
            <EnhancedCRM />
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
                <CardContent>
                  <Button className="w-full" onClick={() => navigate('/admin/compass-partnership')}>
                    View Compass Proposal
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
