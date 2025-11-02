import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import SecureStorage from '@/utils/secureStorage';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import { LogOut, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeadsBySource {
  source: string;
  count: number;
}

interface ActivationData {
  wk: string;
  signups: number;
  activated: number;
  activation_rate_pct: number;
}

interface AtRiskCustomer {
  email: string;
  plan_id: string;
  last_activity: string | null;
}

const CRM = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [leadsBySource, setLeadsBySource] = useState<LeadsBySource[]>([]);
  const [activationData, setActivationData] = useState<ActivationData[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const adminAccess = await SecureStorage.getItem('admin_access');
      setHasAccess(adminAccess === 'granted');
      setIsChecking(false);
    };
    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      loadCRMData();
    }
  }, [hasAccess]);

  const loadCRMData = async () => {
    setLoading(true);
    try {
      // Fetch leads by source
      const { data: leadsData } = await supabase.rpc('get_leads_by_source');
      if (leadsData) setLeadsBySource(leadsData as LeadsBySource[]);

      // Fetch activation funnel
      const { data: activationFunnelData } = await supabase.rpc('get_activation_funnel');
      if (activationFunnelData) setActivationData(activationFunnelData as ActivationData[]);

      // Fetch at-risk customers
      const { data: atRiskData } = await supabase.rpc('get_at_risk_customers');
      if (atRiskData) setAtRiskCustomers(atRiskData as AtRiskCustomer[]);
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
            <p className="text-muted-foreground">Customer Relationship Management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Back to Admin
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Leads by Source (30d)</CardTitle>
              <CardDescription>New leads in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  {leadsBySource.map((item) => (
                    <div key={item.source} className="flex justify-between">
                      <span className="capitalize">{item.source}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Activation Funnel</CardTitle>
              <CardDescription>Signup to first upload rate</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  {activationData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex justify-between">
                        <span>Week {new Date(item.wk).toLocaleDateString()}</span>
                        <span className="font-bold">{item.activation_rate_pct}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.activated} / {item.signups} activated
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="w-8 h-8 mb-2 text-destructive" />
              <CardTitle>At-Risk Customers</CardTitle>
              <CardDescription>No activity in 30+ days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  {atRiskCustomers.slice(0, 5).map((customer, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium truncate">{customer.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.plan_id || 'No plan'} • Last: {customer.last_activity ? new Date(customer.last_activity).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Reports */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activation Funnel (Full)</CardTitle>
              <CardDescription>Weekly signup to first upload conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Activated</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activationData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(row.wk).toLocaleDateString()}</TableCell>
                      <TableCell>{row.signups}</TableCell>
                      <TableCell>{row.activated}</TableCell>
                      <TableCell>{row.activation_rate_pct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>At-Risk Customers (Full)</CardTitle>
              <CardDescription>Active customers with no recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskCustomers.map((customer, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.plan_id || 'None'}</TableCell>
                      <TableCell>
                        {customer.last_activity ? new Date(customer.last_activity).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CRM;