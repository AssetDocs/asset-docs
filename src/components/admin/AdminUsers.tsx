// @ts-nocheck
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
  entitlement_source?: string | null;
  plan_lookup_key?: string | null;
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
  contributor_account_number?: string | null;
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
  recipient_user_id?: string | null;
  plan_type: string;
  amount: number | null;
  status: string;
  redeemed: boolean | null;
  redeemed_at?: string | null;
  redemption_status?: string | null;
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
  customer_id: string | null;
  subscription_id: string | null;
  event_data: any;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [giftSubscriptions, setGiftSubscriptions] = useState<GiftSubscription[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>([]);
  const [customerLookup, setCustomerLookup] = useState<Record<string, { name: string; email: string | null; accountNumber: string | null }>>({});
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

      // Fetch all contributors (legacy table)
      const { data: contributorsData } = await supabase
        .from('contributors')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch active account_memberships (authoritative source for AU status)
      const { data: membershipsData } = await supabase
        .from('account_memberships')
        .select('user_id, role, account_id, status, accounts!inner(owner_user_id, account_name)')
        .eq('status', 'active');

      if (usersData) {
        // Get subscriber info (legacy, used only for email fallback)
        const { data: subscribersData } = await supabase
          .from('subscribers')
          .select('user_id, email, subscription_tier, subscribed');

        // Get entitlements (authoritative source for subscription status)
        const { data: entitlementsData } = await supabase
          .from('entitlements')
          .select('user_id, entitlement_source, status, plan, plan_lookup_key, stripe_customer_id, billing_status, total_storage_gb');

        const entitlementMap = new Map(
          entitlementsData?.map(e => [e.user_id, e]) || []
        );

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

        // Create a map of contributor user_id to their contributor record (legacy)
        const contributorMap = new Map<string, ContributorRecord>();
        contributorsData?.forEach(c => {
          if (c.contributor_user_id) {
            contributorMap.set(c.contributor_user_id, c);
          }
        });

        // Build a map: user_id -> first active non-owner membership (Authorized User)
        const auMembershipMap = new Map<string, any>();
        membershipsData?.forEach((m: any) => {
          if (m.role && m.role !== 'owner') {
            if (!auMembershipMap.has(m.user_id)) {
              auMembershipMap.set(m.user_id, m);
            }
          }
        });

        const mergedUsers = usersData.map(user => {
          const auMembership = auMembershipMap.get(user.user_id);
          const contributorRecord = contributorMap.get(user.user_id);
          const entitlement = entitlementMap.get(user.user_id);
          const isActive = entitlement?.status === 'active' || entitlement?.status === 'trialing';

          // AU = any active non-owner membership OR legacy contributor record
          const isAU = !!auMembership || !!contributorRecord;

          let ownerUserId: string | null = null;
          let auRole: string | null = null;
          if (auMembership) {
            ownerUserId = auMembership.accounts?.owner_user_id || null;
            auRole = auMembership.role;
          } else if (contributorRecord) {
            ownerUserId = contributorRecord.account_owner_id;
            auRole = contributorRecord.role;
          }

          const ownerProfile = ownerUserId ? ownerProfileMap.get(ownerUserId) : null;
          const ownerEmail = ownerProfile
            ? (subscriberMap.get(ownerProfile.user_id)?.email || authEmails[ownerProfile.user_id])
            : null;

          return {
            ...user,
            phone: user.phone || null,
            account_number: user.account_number || null,
            email: subscriberMap.get(user.user_id)?.email || authEmails[user.user_id] || null,
            subscription_tier: entitlement?.plan || subscriberMap.get(user.user_id)?.subscription_tier || null,
            subscribed: isActive,
            plan_status: entitlement?.status || user.plan_status || null,
            isContributor: isAU,
            contributorRole: auRole,
            ownerEmail: ownerEmail || null,
            ownerName: ownerProfile ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() : null,
            ownerAccountNumber: ownerProfile?.account_number || null,
            entitlement_source: entitlement?.entitlement_source || null,
            plan_lookup_key: entitlement?.plan_lookup_key || null,
            billing_status: entitlement?.billing_status || null,
            total_storage_gb: entitlement?.total_storage_gb || null,
          };
        });

        setUsers(mergedUsers);

        // Build Stripe customer_id -> { name, email } lookup for Payment Events
        const lookup: Record<string, { name: string; email: string | null; accountNumber: string | null }> = {};
        entitlementsData?.forEach((e: any) => {
          if (!e.stripe_customer_id) return;
          const profile = ownerProfileMap.get(e.user_id);
          const name = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
            : '';
          const email = subscriberMap.get(e.user_id)?.email || authEmails[e.user_id] || null;
          const accountNumber = profile?.account_number || null;
          lookup[e.stripe_customer_id] = { name: name || '—', email, accountNumber };
        });
        setCustomerLookup(lookup);

        // Build owners with contributors data — combine legacy contributors + account_memberships
        const ownersMap = new Map<string, OwnerWithContributors>();

        const ensureOwner = (ownerId: string) => {
          const ownerProfile = ownerProfileMap.get(ownerId);
          if (!ownerProfile) return null;
          if (!ownersMap.has(ownerId)) {
            ownersMap.set(ownerId, {
              ownerId,
              ownerName: `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim(),
              ownerEmail: subscriberMap.get(ownerId)?.email || authEmails[ownerId] || null,
              accountNumber: ownerProfile.account_number,
              contributors: []
            });
          }
          return ownersMap.get(ownerId)!;
        };

        contributorsData?.forEach(contributor => {
          const bucket = ensureOwner(contributor.account_owner_id);
          if (bucket) {
            const auProfile = contributor.contributor_user_id
              ? ownerProfileMap.get(contributor.contributor_user_id)
              : null;
            bucket.contributors.push({
              ...contributor,
              accepted_at: contributor.accepted_at || null,
              contributor_account_number: auProfile?.account_number || null,
            });
          }
        });

        membershipsData?.forEach((m: any) => {
          if (!m.role || m.role === 'owner') return;
          const ownerId = m.accounts?.owner_user_id;
          if (!ownerId) return;
          const bucket = ensureOwner(ownerId);
          if (!bucket) return;
          const auProfile = ownerProfileMap.get(m.user_id);
          const auEmail = subscriberMap.get(m.user_id)?.email || authEmails[m.user_id] || null;
          const alreadyTracked = bucket.contributors.some(c =>
            c.contributor_user_id === m.user_id ||
            (auEmail && c.contributor_email?.toLowerCase() === auEmail.toLowerCase())
          );
          if (alreadyTracked) return;
          bucket.contributors.push({
            id: `membership-${m.user_id}-${m.account_id}`,
            contributor_email: auEmail || '',
            contributor_user_id: m.user_id,
            first_name: auProfile?.first_name || null,
            last_name: auProfile?.last_name || null,
            role: m.role,
            status: m.status,
            account_owner_id: ownerId,
            created_at: '',
            accepted_at: null,
            contributor_account_number: auProfile?.account_number || null,
          });
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
        c.last_name?.toLowerCase().includes(searchLower) ||
        c.contributor_account_number?.toLowerCase().includes(searchLower)
      )
    );
  });

  const getStatusBadge = (status: string | null, subscribed: boolean | null) => {
    // subscribed is now derived from entitlements.status
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

  // Build lookup: recipient_user_id -> redeemed gift
  const giftByRecipient = React.useMemo(() => {
    const m = new Map<string, GiftSubscription>();
    for (const g of giftSubscriptions) {
      if (g.recipient_user_id && (g.redeemed || g.redemption_status === 'redeemed')) {
        m.set(g.recipient_user_id, g);
      }
    }
    return m;
  }, [giftSubscriptions]);

  // Map plan info using entitlements data (plan + plan_lookup_key + entitlement_source)
  const getPlanInfo = (
    planId: string | null,
    subscriptionTier: string | null,
    entitlementSource?: string | null,
    stripeSubId?: string | null,
    planLookupKey?: string | null,
    gift?: GiftSubscription | null,
  ) => {
    if (!planId && !subscriptionTier && !gift) {
      return { name: 'None', price: '-', variant: 'none' as const };
    }

    // Lifetime plan by explicit planId
    if (planId === 'premium_lifetime') {
      return { name: 'Free Lifetime (ASL2025)', price: 'Lifetime', variant: 'lifetime' as const };
    }

    // Admin or lifetime entitlement source with no Stripe subscription = free lifetime
    if ((entitlementSource === 'admin' || entitlementSource === 'lifetime') && !stripeSubId && !gift) {
      return { name: 'Free Lifetime (ASL2025)', price: 'Lifetime', variant: 'lifetime' as const };
    }

    // Gift takes precedence over Stripe-style labeling
    if (gift) {
      return { name: 'Asset Safe Plan (Gift)', price: 'Gift · no recurring charge', variant: 'gift' as const };
    }

    // Single-plan model: Asset Safe Plan — distinguish monthly vs annual
    const tier = subscriptionTier?.toLowerCase();
    if (tier === 'standard' || tier === 'premium') {
      const key = planLookupKey?.toLowerCase() || '';
      const isAnnual = key.includes('annual') || key.includes('yearly') || key.includes('year');
      return isAnnual
        ? { name: 'Asset Safe Plan (Annual)', price: '$189/yr', variant: 'annual' as const }
        : { name: 'Asset Safe Plan (Monthly)', price: '$18.99/mo', variant: 'monthly' as const };
    }

    // Map known Stripe price IDs
    if (planId) {
      if (planId.startsWith('price_')) {
        return { name: 'Asset Safe Plan', price: 'Stripe', variant: 'monthly' as const };
      }
    }

    return { name: subscriptionTier || planId || 'Unknown', price: '-', variant: 'none' as const };
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
          <TabsTrigger value="contributors">Authorized Users</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                      <TableHead>Source</TableHead>
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
                            <Badge variant="outline">
                              {user.contributorRole === 'full_access'
                                ? 'Authorized User · Full Access'
                                : user.contributorRole === 'read_only'
                                ? 'Authorized User · Read Only'
                                : `Authorized User${user.contributorRole ? ` · ${user.contributorRole}` : ''}`}
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
                          {user.isContributor && !user.subscribed ? (
                            <div>
                              <p className="font-medium">Authorized User (AU)</p>
                              <p className="text-xs text-muted-foreground">No charge</p>
                            </div>
                          ) : (() => {
                            const gift = giftByRecipient.get(user.user_id) || null;
                            const planInfo = getPlanInfo(
                              user.plan_id,
                              user.subscription_tier,
                              user.entitlement_source,
                              null,
                              user.plan_lookup_key,
                              gift,
                            );
                            return (
                              <div>
                                <p className="font-medium">{planInfo.name}</p>
                                <p className="text-xs text-muted-foreground">{planInfo.price}</p>
                                {planInfo.variant === 'gift' && gift && (
                                  <div className="mt-1 pt-1 border-t text-xs">
                                    <p className="text-muted-foreground">Gifted by:</p>
                                    <p className="font-medium">{gift.purchaser_name || '—'}</p>
                                    <p className="text-muted-foreground">{gift.purchaser_email}</p>
                                    {gift.redeemed_at && (
                                      <p className="text-muted-foreground mt-0.5">
                                        Redeemed {formatDate(gift.redeemed_at)}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {giftByRecipient.has(user.user_id) ? (
                            <Badge className="bg-pink-600 text-white">Gift</Badge>
                          ) : user.entitlement_source === 'lifetime' ? (
                            <Badge className="bg-purple-600 text-white">Lifetime</Badge>
                          ) : user.entitlement_source === 'admin' ? (
                            <Badge className="bg-amber-500 text-white">Admin</Badge>
                          ) : user.entitlement_source === 'stripe' ? (
                            <Badge className="bg-blue-500 text-white">Stripe</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
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
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Account #</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentEvents.map((event) => {
                      // Extract amount from event_data if not in dedicated column
                      let displayAmount = event.amount;
                      let displayCurrency = event.currency || 'usd';
                      let customerInfo = event.customer_id;
                      let evtName: string | null = null;
                      let evtEmail: string | null = null;

                      if (event.event_data?.object) {
                        const obj = event.event_data.object;
                        if (!displayAmount) {
                          displayAmount = obj.amount_total || obj.amount_paid || obj.amount || obj.plan?.amount || null;
                        }
                        if (obj.currency) {
                          displayCurrency = obj.currency;
                        }
                        if (!customerInfo && obj.customer) {
                          customerInfo = obj.customer;
                        }
                        evtName = obj.customer_details?.name || obj.customer_name || null;
                        evtEmail = obj.customer_details?.email || obj.customer_email || obj.receipt_email || null;
                      }

                      const looked = customerInfo ? customerLookup[customerInfo] : null;
                      const displayName = looked?.name && looked.name !== '—' ? looked.name : (evtName || '—');
                      const displayEmail = looked?.email || evtEmail || '—';

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type.replace('customer.', '').replace('invoice.', '').replace('checkout.', '')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{displayName}</TableCell>
                          <TableCell className="text-sm">{displayEmail}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {looked?.accountNumber || '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs break-all max-w-[220px]">
                            {customerInfo || '—'}
                          </TableCell>
                          <TableCell>{formatAmount(displayAmount, displayCurrency)}</TableCell>
                          <TableCell>
                            <Badge variant={event.status === 'processed' ? 'default' : 'secondary'}>
                              {event.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(event.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
              <p className="text-center text-muted-foreground py-8">No payment events recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          {(() => {
            // Flatten all AUs across owners
            const flatRows = filteredOwnersWithContributors
              .flatMap((owner) =>
                owner.contributors.map((c) => ({ owner, c }))
              )
              .sort((a, b) => {
                const ow = (a.owner.ownerName || '').localeCompare(b.owner.ownerName || '');
                if (ow !== 0) return ow;
                const an = `${a.c.first_name || ''} ${a.c.last_name || ''}`.trim();
                const bn = `${b.c.first_name || ''} ${b.c.last_name || ''}`.trim();
                return an.localeCompare(bn);
              });
            const ownerCount = new Set(flatRows.map((r) => r.owner.ownerId)).size;

            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        All Authorized Users
                      </CardTitle>
                      <CardDescription>
                        {flatRows.length} Authorized User{flatRows.length !== 1 ? 's' : ''} across {ownerCount} Account{ownerCount !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search AU name, AU account #, email, owner name, owner account #..."
                        value={contributorSearchTerm}
                        onChange={(e) => setContributorSearchTerm(e.target.value)}
                        className="w-[360px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : flatRows.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Authorized User</TableHead>
                          <TableHead>AU Account #</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Authorized On (Owner)</TableHead>
                          <TableHead>Owner Account #</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead>Accepted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flatRows.map(({ owner, c }) => {
                          const auName =
                            c.first_name || c.last_name
                              ? `${c.first_name || ''} ${c.last_name || ''}`.trim()
                              : '-';
                          return (
                            <TableRow key={`${owner.ownerId}-${c.id}`}>
                              <TableCell className="font-medium">{auName}</TableCell>
                              <TableCell>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {c.contributor_account_number || '—'}
                                </span>
                              </TableCell>
                              <TableCell>{c.contributor_email || '-'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    c.role === 'administrator'
                                      ? 'border-green-500 text-green-600'
                                      : c.role === 'viewer'
                                      ? 'border-blue-500 text-blue-600'
                                      : 'border-yellow-500 text-yellow-600'
                                  }
                                >
                                  {c.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={c.status === 'accepted' ? 'default' : 'secondary'}>
                                  {c.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {owner.ownerName || 'Unknown Owner'}
                                {owner.ownerEmail && (
                                  <div className="text-xs text-muted-foreground">{owner.ownerEmail}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {owner.accountNumber || '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {c.created_at ? formatDate(c.created_at) : '-'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {c.accepted_at ? formatDate(c.accepted_at) : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No authorized users found
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>


        <TabsContent value="cancelled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Subscriptions</CardTitle>
              <CardDescription>Users who have cancelled their subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (() => {
                const cancelledUsers = users.filter(
                  (u) => u.plan_status === 'canceled' || u.plan_status === 'cancelled'
                );
                return cancelledUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Account #</TableHead>
                        <TableHead>Cancelled On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cancelledUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">
                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}
                          </TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {user.account_number || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(user.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No cancelled subscriptions</p>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
