import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, TrendingUp, AlertTriangle, Search, RefreshCw, 
  Mail, Phone, Building, Calendar, Target, BarChart 
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  how_heard: string;
  created_at: string;
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  lifecycle: string | null;
  source: string | null;
  created_at: string;
}

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

const EnhancedCRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leadsBySource, setLeadsBySource] = useState<LeadsBySource[]>([]);
  const [activationData, setActivationData] = useState<ActivationData[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    setLoading(true);
    try {
      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsData) setLeads(leadsData);

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contactsData) setContacts(contactsData);

      // Fetch leads by source using RPC
      const { data: sourceData } = await supabase.rpc('get_leads_by_source');
      if (sourceData) setLeadsBySource(sourceData as LeadsBySource[]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLifecycleBadge = (lifecycle: string | null) => {
    switch (lifecycle) {
      case 'customer':
        return <Badge className="bg-green-500">Customer</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'lead':
        return <Badge className="bg-yellow-500">Lead</Badge>;
      case 'churned':
        return <Badge variant="destructive">Churned</Badge>;
      default:
        return <Badge variant="secondary">{lifecycle || 'Unknown'}</Badge>;
    }
  };

  const totalLeads = leadsBySource.reduce((sum, s) => sum + s.count, 0);
  const avgActivationRate = activationData.length > 0
    ? (activationData.reduce((sum, a) => sum + a.activation_rate_pct, 0) / activationData.length).toFixed(1)
    : '0';

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.city?.toLowerCase().includes(searchLower)
    );
  });

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name?.toLowerCase().includes(searchLower) ||
      contact.last_name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">CRM Dashboard</h2>
          <p className="text-muted-foreground">Customer relationship management and analytics</p>
        </div>
        <Button onClick={loadCRMData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalLeads}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{contacts.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Activation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold">{avgActivationRate}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold">{atRiskCustomers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources (Last 30 Days)</CardTitle>
          <CardDescription>Where your leads are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {leadsBySource.length > 0 ? (
            <div className="space-y-4">
              {leadsBySource.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{source.source}</span>
                    <span className="text-muted-foreground">{source.count} leads ({totalLeads > 0 ? ((source.count / totalLeads) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <Progress value={totalLeads > 0 ? (source.count / totalLeads) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No lead data available</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activation">Activation Funnel</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lead Capture List</CardTitle>
              <CardDescription>All captured leads from website forms</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : filteredLeads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.city}, {lead.state}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.how_heard}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No leads found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contact Directory</CardTitle>
              <CardDescription>All contacts with lifecycle status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : filteredContacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Lifecycle</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell>{getLifecycleBadge(contact.lifecycle)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.source || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(contact.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No contacts found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activation">
          <Card>
            <CardHeader>
              <CardTitle>Activation Funnel</CardTitle>
              <CardDescription>Weekly signup to first upload conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : activationData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-right">Signups</TableHead>
                      <TableHead className="text-right">Activated</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activationData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(row.wk).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{row.signups}</TableCell>
                        <TableCell className="text-right">{row.activated}</TableCell>
                        <TableCell className="text-right font-medium">{row.activation_rate_pct}%</TableCell>
                        <TableCell className="w-32">
                          <Progress value={row.activation_rate_pct} className="h-2" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No activation data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Customers</CardTitle>
              <CardDescription>Active subscribers with no activity in 30+ days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : atRiskCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Days Inactive</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskCustomers.map((customer, idx) => {
                      const lastActivity = customer.last_activity ? new Date(customer.last_activity) : null;
                      const daysInactive = lastActivity 
                        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
                        : 'Never';
                      
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{customer.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.plan_id || 'None'}</Badge>
                          </TableCell>
                          <TableCell>
                            {lastActivity ? lastActivity.toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeof daysInactive === 'number' && daysInactive > 60 ? 'destructive' : 'secondary'}>
                              {daysInactive} {typeof daysInactive === 'number' ? 'days' : ''}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No at-risk customers identified</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCRM;
