import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Users, Gift, CreditCard, UserX, Search, RefreshCw, UserPlus } from 'lucide-react';

interface UserRecord {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  account_number: string | null;
  plan_id: string | null;
  plan_status: string | null;
  subscription_tier: string | null;
  created_at: string;
  subscribed: boolean | null;
  isContributor?: boolean;
  contributorRole?: string | null;
  ownerEmail?: string | null;
  ownerName?: string | null;
  ownerAccountNumber?: string | null;
}

interface ContributorRecord {
  id: string;
  contributor_email: string;
  contributor_user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  account_owner_id: string;
  created_at: string;
  accepted_at: string | null;
}

interface OwnerWithContributors {
  ownerId: string;
  ownerName: string;
  ownerEmail: string | null;
  accountNumber: string | null;
  contributors: ContributorRecord[];
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
  const [ownersWithContributors, setOwnersWithContributors] = useState<OwnerWithContributors[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contributorSearchTerm, setContributorSearchTerm] = useState('');

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
          phone,
          account_number,
          plan_id,
          plan_status,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Fetch all contributors
      const { data: contributorsData } = await supabase
        .from('contributors')
        .select('*')
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

        // Create a map of owner user_id to their profile info
        const ownerProfileMap = new Map(
          usersData.map(u => [u.user_id, u])
        );

        // Create a map of contributor user_id to their contributor record
        const contributorMap = new Map<string, ContributorRecord>();
        contributorsData?.forEach(c => {
          if (c.contributor_user_id) {
            contributorMap.set(c.contributor_user_id, c);
          }
        });

        const mergedUsers = usersData.map(user => {
          const contributorRecord = contributorMap.get(user.user_id);
          const ownerProfile = contributorRecord ? ownerProfileMap.get(contributorRecord.account_owner_id) : null;
          const ownerEmail = ownerProfile ? (subscriberMap.get(ownerProfile.user_id)?.email || authEmails[ownerProfile.user_id]) : null;
          
          return {
            ...user,
            phone: user.phone || null,
            account_number: user.account_number || null,
            email: subscriberMap.get(user.user_id)?.email || authEmails[user.user_id] || null,
            subscription_tier: subscriberMap.get(user.user_id)?.subscription_tier || null,
            subscribed: subscriberMap.get(user.user_id)?.subscribed || null,
            isContributor: !!contributorRecord,
            contributorRole: contributorRecord?.role || null,
            ownerEmail: ownerEmail || null,
            ownerName: ownerProfile ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() : null,
            ownerAccountNumber: ownerProfile?.account_number || null
          };
        });

        setUsers(mergedUsers);

        // Build owners with contributors data
        const ownersMap = new Map<string, OwnerWithContributors>();
        
        contributorsData?.forEach(contributor => {
          const ownerProfile = ownerProfileMap.get(contributor.account_owner_id);
          if (ownerProfile) {
            const ownerId = contributor.account_owner_id;
            if (!ownersMap.has(ownerId)) {
              ownersMap.set(ownerId, {
                ownerId,
                ownerName: `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim(),
                ownerEmail: subscriberMap.get(ownerId)?.email || authEmails[ownerId] || null,
                accountNumber: ownerProfile.account_number,
                contributors: []
              });
            }
            ownersMap.get(ownerId)?.contributors.push({
              ...contributor,
              accepted_at: contributor.accepted_at || null
            });
          }
        });

        setOwnersWithContributors(Array.from(ownersMap.values()));
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

  const filteredOwnersWithContributors = ownersWithContributors.filter(owner => {
    const searchLower = contributorSearchTerm.toLowerCase();
    if (!searchLower) return true;
    return (
      owner.ownerName.toLowerCase().includes(searchLower) ||
      owner.ownerEmail?.toLowerCase().includes(searchLower) ||
      owner.accountNumber?.toLowerCase().includes(searchLower) ||
      owner.contributors.some(c => 
        c.contributor_email.toLowerCase().includes(searchLower) ||
        c.first_name?.toLowerCase().includes(searchLower) ||
        c.last_name?.toLowerCase().includes(searchLower)
      )
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

  // Map Stripe price IDs and plan_ids to friendly plan info
  const getPlanInfo = (planId: string | null, subscriptionTier: string | null) => {
    if (!planId && !subscriptionTier) {
      return { name: 'None', price: '-' };
    }
    
    // Lifetime plan
    if (planId === 'premium_lifetime') {
      return { name: 'Premium (Lifetime)', price: 'ASL2025' };
    }
    
    // Check subscription_tier first
    const tier = subscriptionTier?.toLowerCase();
    if (tier === 'premium') {
      return { name: 'Premium', price: '$189/yr' };
    }
    if (tier === 'standard') {
      return { name: 'Standard', price: '$129/yr' };
    }
    
    // Map known Stripe price IDs (patterns)
    if (planId) {
      const lowerPlanId = planId.toLowerCase();
      // Check for premium indicators
      if (lowerPlanId.includes('premium') || lowerPlanId.includes('189')) {
        return { name: 'Premium', price: '$189/yr' };
      }
      // Default Stripe price IDs - check based on amount pattern
      // price_1SehXDEyVj2Ir7a8nRAVcXwh appears to be Standard based on $129
      if (planId.startsWith('price_')) {
        // For Stripe price IDs, we can infer Standard is $129/yr
        return { name: 'Standard', price: '$129/yr' };
      }
    }
    
    return { name: subscriptionTier || planId || 'Unknown', price: '-' };
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
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
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
                      <TableHead>Account #</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role/Type</TableHead>
                      <TableHead>Linked Owner</TableHead>
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
                        <TableCell>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {user.account_number || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{user.email || '-'}</p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isContributor ? (
                            <Badge variant="outline" className="capitalize">
                              {user.contributorRole}
                            </Badge>
                          ) : (
                            <Badge className="bg-primary">Owner</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isContributor && user.ownerEmail ? (
                            <div>
                              <p className="text-sm font-medium">{user.ownerName || '-'}</p>
                              <p className="text-xs text-muted-foreground">{user.ownerEmail}</p>
                              {user.ownerAccountNumber && (
                                <p className="text-xs font-mono text-muted-foreground mt-1">
                                  {user.ownerAccountNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const planInfo = getPlanInfo(user.plan_id, user.subscription_tier);
                            return (
                              <div>
                                <p className="font-medium">{planInfo.name}</p>
                                <p className="text-xs text-muted-foreground">{planInfo.price}</p>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.plan_status, user.subscribed)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
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

        <TabsContent value="contributors" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by owner name, account #, or contributor email..."
              value={contributorSearchTerm}
              onChange={(e) => setContributorSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredOwnersWithContributors.length > 0 ? (
            <div className="space-y-6">
              {filteredOwnersWithContributors.map((owner) => (
                <Card key={owner.ownerId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          {owner.ownerName || 'Unknown Owner'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded mr-2">
                            {owner.accountNumber || 'No Account #'}
                          </span>
                          {owner.ownerEmail && <span>{owner.ownerEmail}</span>}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary">
                        <UserPlus className="w-3 h-3 mr-1" />
                        {owner.contributors.length} Contributor{owner.contributors.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead>Accepted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {owner.contributors.map((contributor) => (
                          <TableRow key={contributor.id}>
                            <TableCell className="font-medium">
                              {contributor.first_name || contributor.last_name 
                                ? `${contributor.first_name || ''} ${contributor.last_name || ''}`.trim()
                                : '-'}
                            </TableCell>
                            <TableCell>{contributor.contributor_email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  contributor.role === 'administrator' 
                                    ? 'border-green-500 text-green-600' 
                                    : contributor.role === 'viewer' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-yellow-500 text-yellow-600'
                                }
                              >
                                {contributor.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={contributor.status === 'accepted' ? 'default' : 'secondary'}>
                                {contributor.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(contributor.created_at)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {contributor.accepted_at ? formatDate(contributor.accepted_at) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No accounts with contributors found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
