import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SecureStorage from '@/utils/secureStorage';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import { LogOut, Shield, Users, Database, Settings } from 'lucide-react';

const Admin = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
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
            <p className="text-muted-foreground">Manage your AssetDocs platform</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage security settings and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/account-settings')}>
                View Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Users</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Database</CardTitle>
              <CardDescription>Access database statistics and health</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" disabled>
                Coming Soon
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Platform overview and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Total Assets</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
