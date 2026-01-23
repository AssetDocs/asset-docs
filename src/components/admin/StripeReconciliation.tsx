import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Link as LinkIcon,
  Unlink,
  Search,
  CreditCard,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StripeSubscription {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  cancelAtPeriodEnd: boolean;
  created: string;
  customer: {
    id: string | null;
    email: string | null;
    name: string | null;
  };
  plan: {
    priceId: string | null;
    productId: string | null;
    productName: string | null;
    amount: number | null;
    currency: string | null;
    interval: string | null;
  };
  linkedUserId: string | null;
  linkedProfile: {
    firstName: string | null;
    lastName: string | null;
    planStatus: string | null;
    stripeCustomerId: string | null;
  } | null;
  syncStatus: 'synced' | 'mismatch' | 'orphaned';
}

interface UserRecord {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface Summary {
  total: number;
  active: number;
  synced: number;
  mismatched: number;
  orphaned: number;
}

const StripeReconciliation = () => {
  const [subscriptions, setSubscriptions] = useState<StripeSubscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelImmediateDialogOpen, setCancelImmediateDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<StripeSubscription | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Stripe subscriptions via edge function
      const { data, error } = await supabase.functions.invoke('admin-stripe-subscriptions');
      
      if (error) {
        throw error;
      }

      setSubscriptions(data.subscriptions || []);
      setSummary(data.summary || null);

      // Also load users for linking
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name');

      // Get emails via edge function
      const { data: emailData } = await supabase.functions.invoke('admin-get-user-emails');
      
      const usersWithEmails = (profilesData || []).map(p => ({
        ...p,
        email: emailData?.userEmails?.[p.user_id] || null,
      }));

      setUsers(usersWithEmails);
    } catch (error: any) {
      console.error('Error loading Stripe data:', error);
      toast.error('Failed to load Stripe data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
      case 'mismatch':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Mismatch</Badge>;
      case 'orphaned':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Orphaned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge className="bg-orange-500">Canceling</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-500">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'incomplete':
        return <Badge variant="secondary">Incomplete</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancelAtPeriodEnd = async () => {
    if (!selectedSubscription) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-link-stripe-customer', {
        body: {
          action: 'cancel',
          subscriptionId: selectedSubscription.subscriptionId,
        }
      });

      if (error) throw error;
      toast.success('Subscription will cancel at period end');
      setCancelDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to cancel: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelImmediately = async () => {
    if (!selectedSubscription) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-link-stripe-customer', {
        body: {
          action: 'cancel_immediately',
          subscriptionId: selectedSubscription.subscriptionId,
        }
      });

      if (error) throw error;
      toast.success('Subscription canceled immediately');
      setCancelImmediateDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to cancel: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkUser = async () => {
    if (!selectedSubscription || !selectedUserId) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-link-stripe-customer', {
        body: {
          action: 'link',
          stripeCustomerId: selectedSubscription.customer.id,
          userId: selectedUserId,
        }
      });

      if (error) throw error;
      toast.success('Customer linked to user successfully');
      setLinkDialogOpen(false);
      setSelectedUserId('');
      loadData();
    } catch (error: any) {
      toast.error('Failed to link: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.customer.email?.toLowerCase().includes(term) ||
      sub.customer.name?.toLowerCase().includes(term) ||
      sub.customer.id?.toLowerCase().includes(term) ||
      sub.subscriptionId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Stripe Reconciliation</h2>
          <p className="text-muted-foreground">
            Manage Stripe subscriptions and sync with user profiles
          </p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{summary.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{summary.active}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Synced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{summary.synced}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mismatched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{summary.mismatched}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orphaned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-2xl font-bold">{summary.orphaned}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, or customer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Subscriptions</CardTitle>
          <CardDescription>
            All subscriptions from Stripe with sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading Stripe data...</div>
          ) : filteredSubscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Linked Profile</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.subscriptionId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.customer.name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground">{sub.customer.email}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {sub.customer.id?.slice(0, 18)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.plan.productName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatAmount(sub.plan.amount, sub.plan.currency)}/{sub.plan.interval}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(sub.currentPeriodEnd)}
                    </TableCell>
                    <TableCell>
                      {sub.linkedProfile ? (
                        <div>
                          <p className="font-medium">
                            {sub.linkedProfile.firstName} {sub.linkedProfile.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {sub.linkedProfile.planStatus}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not linked</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSyncStatusBadge(sub.syncStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {sub.syncStatus !== 'synced' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setLinkDialogOpen(true);
                            }}
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            Link
                          </Button>
                        )}
                        {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600"
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <Unlink className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {(sub.status === 'active' || sub.status === 'past_due') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setCancelImmediateDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found in Stripe
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel at Period End Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription at Period End?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the subscription for {selectedSubscription?.customer.email} at the end of their 
              current billing period ({selectedSubscription && formatDate(selectedSubscription.currentPeriodEnd)}).
              They will retain access until then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelAtPeriodEnd}
              disabled={actionLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {actionLoading ? 'Processing...' : 'Confirm Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Immediately Dialog */}
      <AlertDialog open={cancelImmediateDialogOpen} onOpenChange={setCancelImmediateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Cancel Subscription Immediately?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-destructive">Warning:</strong> This will immediately cancel the subscription 
              for {selectedSubscription?.customer.email}. They will lose access right away with no refund.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelImmediately}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? 'Processing...' : 'Cancel Immediately'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link User Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Stripe Customer to User</DialogTitle>
            <DialogDescription>
              Link {selectedSubscription?.customer.email} to a user profile to sync their subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Stripe Customer</p>
              <div className="p-3 bg-muted rounded-md">
                <p>{selectedSubscription?.customer.name || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedSubscription?.customer.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Select User Profile</p>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{user.first_name} {user.last_name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({user.email || 'no email'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleLinkUser} disabled={!selectedUserId || actionLoading}>
              {actionLoading ? 'Linking...' : 'Link Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StripeReconciliation;
