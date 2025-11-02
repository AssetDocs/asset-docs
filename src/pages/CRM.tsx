import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, TrendingUp, AlertCircle, Mail, Phone, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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

const CRM = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [leadsBySource, setLeadsBySource] = useState<LeadsBySource[]>([]);
  const [activationData, setActivationData] = useState<ActivationData[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchReports();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching contacts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      // Leads by source (last 30 days)
      const { data: leadsData } = await supabase.rpc('get_leads_by_source');
      if (leadsData) setLeadsBySource(leadsData);

      // Activation funnel
      const { data: activationData } = await supabase.rpc('get_activation_funnel');
      if (activationData) setActivationData(activationData);

      // At-risk customers
      const { data: atRiskData } = await supabase.rpc('get_at_risk_customers');
      if (atRiskData) setAtRiskCustomers(atRiskData);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLifecycleBadge = (lifecycle: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      lead: "outline",
      trial: "secondary",
      active: "default",
      churned: "destructive"
    };
    return <Badge variant={variants[lifecycle || ''] || "outline"}>{lifecycle || 'unknown'}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
          <p className="text-muted-foreground">Manage contacts, deals, and customer relationships</p>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contacts
                </CardTitle>
                <CardDescription>View and manage your contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {loading ? (
                  <p>Loading contacts...</p>
                ) : (
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
                          <TableCell>
                            {contact.first_name || contact.last_name
                              ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                              : '-'}
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {contact.email}
                          </TableCell>
                          <TableCell>
                            {contact.phone ? (
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {contact.phone}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getLifecycleBadge(contact.lifecycle)}</TableCell>
                          <TableCell>{contact.source || '-'}</TableCell>
                          <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Leads by Source (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadsBySource.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadsBySource.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.source || 'Unknown'}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    At-Risk Customers
                  </CardTitle>
                  <CardDescription>No activity in 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {atRiskCustomers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Last Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atRiskCustomers.slice(0, 5).map((customer, i) => (
                          <TableRow key={i}>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.plan_id || '-'}</TableCell>
                            <TableCell>
                              {customer.last_activity
                                ? new Date(customer.last_activity).toLocaleDateString()
                                : 'Never'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No at-risk customers</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activation Funnel by Week</CardTitle>
                <CardDescription>Signup to first upload conversion</CardDescription>
              </CardHeader>
              <CardContent>
                {activationData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead className="text-right">Signups</TableHead>
                        <TableHead className="text-right">Activated</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activationData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{new Date(item.wk).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{item.signups}</TableCell>
                          <TableCell className="text-right">{item.activated}</TableCell>
                          <TableCell className="text-right">{item.activation_rate_pct}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRM;