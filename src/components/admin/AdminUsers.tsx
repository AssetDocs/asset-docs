import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Users, Gift, CreditCard, UserX, Search, RefreshCw } from 'lucide-react';

interface UserRecord {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  plan_id: string | null;
  plan_status: string | null;
  subscription_tier: string | null;
  created_at: string;
  subscribed: boolean | null;
}

interface GiftSubscription {
  id: string;
  purchaser_name: string;
  purchaser_email: string;
  recipient_name: string;
  recipient_email: string;
  plan_type: string;
  amount: number | null;
  status: string;
  redeemed: boolean | null;
  created_at: string;
}

interface PaymentEvent {
  id: string;
  event_type: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
  user_id: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [giftSubscriptions, setGiftSubscriptions] = useState<GiftSubscription[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all users with subscription info
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          plan_id,
          plan_status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (usersData) {
        // Get subscriber info
        const { data: subscribersData } = await supabase
          .from('subscribers')
          .select('user_id, email, subscription_tier, subscribed');

        // Get user emails from auth.users via edge function
        let authEmails: Record<string, string | null> = {};
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-get-user-emails');
          if (emailData?.userEmails) {
            authEmails = emailData.userEmails;
          }
        } catch (e) {
          console.error('Error fetching user emails:', e);
        }

        const subscriberMap = new Map(
          subscribersData?.map(s => [s.user_id, s]) || []
        );

        const mergedUsers = usersData.map(user => ({
          ...user,
          email: subscriberMap.get(user.user_id)?.email || authEmails[user.user_id] || null,
          subscription_tier: subscriberMap.get(user.user_id)?.subscription_tier || null,
          subscribed: subscriberMap.get(user.user_id)?.subscribed || null,
        }));

        setUsers(mergedUsers);
      }

      // Fetch gift subscriptions
      const { data: giftsData } = await supabase
        .from('gift_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (giftsData) setGiftSubscriptions(giftsData);

      // Fetch payment events
      const { data: paymentsData } = await supabase
        .from('payment_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsData) setPaymentEvents(paymentsData);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string | null, subscribed: boolean | null) => {
    if (subscribed) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (status === 'active') {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (status === 'trialing') {
      return <Badge className="bg-blue-500">Trial</Badge>;
    }
    if (status === 'canceled') {
      return <Badge variant="destructive">Canceled</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Comprehensive user activity and subscription tracking</p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{users.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">
                {users.filter(u => u.subscribed || u.plan_status === 'active').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gift Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{giftSubscriptions.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{paymentEvents.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-users">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="gifts">Gift Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>All registered users with subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>{user.subscription_tier || user.plan_id || 'None'}</TableCell>
                        <TableCell>{getStatusBadge(user.plan_status, user.subscribed)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gifts">
          <Card>
            <CardHeader>
              <CardTitle>Gift Subscription Orders</CardTitle>
              <CardDescription>All gift subscriptions with purchaser and recipient details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : giftSubscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchaser</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Redeemed</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftSubscriptions.map((gift) => (
                      <TableRow key={gift.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{gift.purchaser_name}</p>
                            <p className="text-xs text-muted-foreground">{gift.purchaser_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{gift.recipient_name}</p>
                            <p className="text-xs text-muted-foreground">{gift.recipient_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{gift.plan_type}</TableCell>
                        <TableCell>{formatAmount(gift.amount, 'usd')}</TableCell>
                        <TableCell>
                          <Badge variant={gift.status === 'paid' ? 'default' : 'secondary'}>
                            {gift.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {gift.redeemed ? (
                            <Badge className="bg-green-500">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(gift.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No gift subscriptions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Events</CardTitle>
              <CardDescription>Stripe webhook events including subscriptions, cancellations, and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : paymentEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge variant="outline">{event.event_type}</Badge>
                        </TableCell>
                        <TableCell>{formatAmount(event.amount, event.currency)}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'succeeded' ? 'default' : 'secondary'}>
                            {event.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.user_id ? event.user_id.slice(0, 8) + '...' : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(event.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payment events recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
