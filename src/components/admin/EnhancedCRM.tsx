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
  Target, BarChart, DollarSign, HardDrive, Clock, Sparkles,
  Calendar, CheckCircle, XCircle, Activity
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

interface EngagementStats {
  user_id: string;
  property_count: number;
  item_count: number;
  document_count: number;
  photo_count: number;
  receipt_count: number;
  total_item_value: number;
  total_property_value: number;
  engagement_score: number;
}

interface StorageStats {
  user_id: string;
  storage_quota_gb: number;
  total_used_bytes: number;
  file_count: number;
  usage_percentage: number;
}

interface TrialUser {
  user_id: string;
  email: string;
  trial_end: string;
  days_remaining: number;
  trial_reminder_sent: boolean;
  plan_status: string;
}

interface RevenueMetric {
  metric_name: string;
  metric_value: number;
  metric_period: string;
}

interface FeatureAdoption {
  feature_name: string;
  users_with_feature: number;
  total_users: number;
  adoption_percentage: number;
}

const EnhancedCRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leadsBySource, setLeadsBySource] = useState<LeadsBySource[]>([]);
  const [activationData, setActivationData] = useState<ActivationData[]>([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>([]);
  const [engagementStats, setEngagementStats] = useState<EngagementStats[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats[]>([]);
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetric[]>([]);
  const [featureAdoption, setFeatureAdoption] = useState<FeatureAdoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        leadsRes,
        contactsRes,
        sourceRes,
        activationRes,
        atRiskRes,
        engagementRes,
        storageRes,
        trialRes,
        revenueRes,
        adoptionRes
      ] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.rpc('get_leads_by_source'),
        supabase.rpc('get_activation_funnel'),
        supabase.rpc('get_at_risk_customers'),
        supabase.rpc('get_user_engagement_stats'),
        supabase.rpc('get_storage_stats'),
        supabase.rpc('get_trial_management_data'),
        supabase.rpc('get_revenue_metrics'),
        supabase.rpc('get_feature_adoption')
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
      if (sourceRes.data) setLeadsBySource(sourceRes.data as LeadsBySource[]);
      if (activationRes.data) setActivationData(activationRes.data as ActivationData[]);
      if (atRiskRes.data) setAtRiskCustomers(atRiskRes.data as AtRiskCustomer[]);
      if (engagementRes.data) setEngagementStats(engagementRes.data as EngagementStats[]);
      if (storageRes.data) setStorageStats(storageRes.data as StorageStats[]);
      if (trialRes.data) setTrialUsers(trialRes.data as TrialUser[]);
      if (revenueRes.data) setRevenueMetrics(revenueRes.data as RevenueMetric[]);
      if (adoptionRes.data) setFeatureAdoption(adoptionRes.data as FeatureAdoption[]);

    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

  const getEngagementBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Highly Engaged</Badge>;
    if (score >= 50) return <Badge className="bg-blue-500">Moderate</Badge>;
    if (score >= 20) return <Badge className="bg-yellow-500">Low</Badge>;
    return <Badge variant="destructive">At Risk</Badge>;
  };

  const getMetricValue = (name: string) => {
    const metric = revenueMetrics.find(m => m.metric_name === name);
    return metric?.metric_value ?? 0;
  };

  const totalLeads = leadsBySource.reduce((sum, s) => sum + s.count, 0);
  const avgActivationRate = activationData.length > 0
    ? (activationData.reduce((sum, a) => sum + a.activation_rate_pct, 0) / activationData.length).toFixed(1)
    : '0';
  const avgEngagement = engagementStats.length > 0
    ? Math.round(engagementStats.reduce((sum, e) => sum + e.engagement_score, 0) / engagementStats.length)
    : 0;

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Activation</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold">{atRiskCustomers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(getMetricValue('mrr'))}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{avgEngagement}/100</span>
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
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="trials">Trials</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="adoption">Feature Adoption</TabsTrigger>
          <TabsTrigger value="activation">Activation</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk</TabsTrigger>
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

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                User Engagement Scores
              </CardTitle>
              <CardDescription>Composite engagement metrics based on user activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : engagementStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead className="text-right">Properties</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Documents</TableHead>
                      <TableHead className="text-right">Photos</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engagementStats
                      .sort((a, b) => b.engagement_score - a.engagement_score)
                      .slice(0, 50)
                      .map((stat) => (
                        <TableRow key={stat.user_id}>
                          <TableCell className="font-mono text-xs">{stat.user_id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-right">{stat.property_count}</TableCell>
                          <TableCell className="text-right">{stat.item_count}</TableCell>
                          <TableCell className="text-right">{stat.document_count}</TableCell>
                          <TableCell className="text-right">{stat.photo_count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(stat.total_item_value) + Number(stat.total_property_value))}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={stat.engagement_score} className="w-16 h-2" />
                              <span className="font-medium">{stat.engagement_score}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getEngagementBadge(stat.engagement_score)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No engagement data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Storage Usage by User
              </CardTitle>
              <CardDescription>Per-user storage consumption vs quota</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : storageStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead className="text-right">Quota</TableHead>
                      <TableHead className="text-right">Files</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storageStats
                      .filter(s => s.total_used_bytes > 0)
                      .sort((a, b) => b.usage_percentage - a.usage_percentage)
                      .slice(0, 50)
                      .map((stat) => (
                        <TableRow key={stat.user_id}>
                          <TableCell className="font-mono text-xs">{stat.user_id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-right">{formatBytes(Number(stat.total_used_bytes))}</TableCell>
                          <TableCell className="text-right">{stat.storage_quota_gb} GB</TableCell>
                          <TableCell className="text-right">{stat.file_count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={Number(stat.usage_percentage)} 
                                className={`w-24 h-2 ${Number(stat.usage_percentage) > 90 ? '[&>div]:bg-red-500' : Number(stat.usage_percentage) > 75 ? '[&>div]:bg-yellow-500' : ''}`}
                              />
                              <span className="text-sm">{Number(stat.usage_percentage).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Number(stat.usage_percentage) > 90 ? (
                              <Badge variant="destructive">Critical</Badge>
                            ) : Number(stat.usage_percentage) > 75 ? (
                              <Badge className="bg-yellow-500">Warning</Badge>
                            ) : (
                              <Badge className="bg-green-500">OK</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No storage data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Trial Management
              </CardTitle>
              <CardDescription>Users on trial with expiration tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : trialUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Trial Ends</TableHead>
                      <TableHead className="text-right">Days Left</TableHead>
                      <TableHead>Reminder Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{formatDate(user.trial_end)}</TableCell>
                        <TableCell className="text-right">
                          <span className={user.days_remaining <= 3 ? 'text-red-500 font-bold' : ''}>
                            {user.days_remaining}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.trial_reminder_sent ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.plan_status}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.days_remaining <= 0 ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : user.days_remaining <= 3 ? (
                            <Badge className="bg-red-500">High</Badge>
                          ) : user.days_remaining <= 7 ? (
                            <Badge className="bg-yellow-500">Medium</Badge>
                          ) : (
                            <Badge className="bg-green-500">Low</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No trial users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <span className="text-3xl font-bold">{formatCurrency(getMetricValue('mrr'))}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <span className="text-3xl font-bold">{formatCurrency(getMetricValue('revenue_30d'))}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-6 h-6 ${getMetricValue('churn_rate') > 5 ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="text-3xl font-bold">{getMetricValue('churn_rate')}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Revenue Metrics
              </CardTitle>
              <CardDescription>Key financial indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueMetrics.map((metric, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium capitalize">
                        {metric.metric_name.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {metric.metric_name.includes('rate') 
                          ? `${metric.metric_value}%`
                          : metric.metric_name.includes('mrr') || metric.metric_name.includes('revenue')
                            ? formatCurrency(metric.metric_value)
                            : metric.metric_value
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{metric.metric_period.replace('_', ' ')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Feature Adoption
              </CardTitle>
              <CardDescription>Percentage of users using each feature</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : featureAdoption.length > 0 ? (
                <div className="space-y-6">
                  {featureAdoption.map((feature) => (
                    <div key={feature.feature_name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{feature.feature_name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {feature.users_with_feature} / {feature.total_users} users
                          </span>
                          <span className="font-bold">{feature.adoption_percentage}%</span>
                        </div>
                      </div>
                      <Progress 
                        value={Number(feature.adoption_percentage)} 
                        className="h-3"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No feature adoption data available</p>
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