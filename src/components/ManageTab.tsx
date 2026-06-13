// @ts-nocheck
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { invokeWithStepUp } from '@/lib/invokeWithStepUp';
import { useOpenCustomerPortal } from '@/hooks/useOpenCustomerPortal';
import { useStepUpPrompt } from '@/contexts/StepUpContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon, ExternalLink, CreditCard, Shield, Trash2, Clock,
  AlertTriangle, X, Check, HardDrive, ChevronDown, Receipt
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import AccountDeletedDialog from '@/components/AccountDeletedDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PaymentHistory from '@/components/PaymentHistory';
import CancelSubscriptionDialog from '@/components/billing/CancelSubscriptionDialog';
import DeleteAccountDialog from '@/components/account/DeleteAccountDialog';

const planConfig = {
  title: "Asset Safe Plan",
  monthlyPrice: "$18.99",
  yearlyPrice: "$189",
  yearlySavings: "Save when you pay yearly",
  description: "One simple plan. Everything included.",
  features: [
    "Unlimited properties",
    "25GB secure cloud storage (+ add-ons available)",
    "Photo, video & document uploads",
    "Room-by-room inventory organization",
    "Secure Vault & Password Catalog",
    "Legacy Locker (family continuity & instructions)",
    "Authorized Users",
    "Emergency Access Sharing",
    "Voice notes, damage reports, exports",
    "Memory Safe & Quick Notes",
    "MFA, full web platform access",
    "Service Pros Directory"
  ],
  icon: <Shield className="h-6 w-6 text-primary" />,
};

interface DeletionRequest {
  id: string;
  account_owner_id: string;
  requester_user_id: string;
  reason: string | null;
  grace_period_days: number;
  grace_period_ends_at: string;
  status: string;
  requested_at: string;
}

interface ContributorInfo {
  account_owner_id: string;
  role: string;
  status: string;
}

const CollapsiblePaymentHistory: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                <CardTitle>Payment History</CardTitle>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </div>
            <CardDescription>View your recent subscription payments and billing details</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <PaymentHistory embedded />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const ManageTab: React.FC = () => {
  const { toast } = useToast();
  const { promptStepUp } = useStepUpPrompt();
  const { user, profile, signOut } = useAuth();
  // Derive a stable primitive identity so the useCallback below does not
  // re-create on every auth-object refresh (TOKEN_REFRESHED loops).
  const userId = user?.id;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [subscriptionCheckError, setSubscriptionCheckError] = useState<string | null>(null);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [lastResponseWasAuthoritative, setLastResponseWasAuthoritative] = useState(false);
  // Same-tab navigation — no popup-blocker risk for the subscribed branch.
  const { open: openCustomerPortal, loading: portalLoading } = useOpenCustomerPortal();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewDeleteDialog, setShowNewDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAccountDeletedDialog, setShowAccountDeletedDialog] = useState(false);
  const [showDeletionRequestDialog, setShowDeletionRequestDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isContributor, setIsContributor] = useState(false);
  const [contributorInfo, setContributorInfo] = useState<ContributorInfo | null>(null);
  const [pendingDeletionRequest, setPendingDeletionRequest] = useState<DeletionRequest | null>(null);
  const [incomingDeletionRequests, setIncomingDeletionRequests] = useState<DeletionRequest[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
    plan_status?: string;
    property_limit?: number;
    storage_quota_gb?: number;
    plan_lookup_key?: string;
    base_storage_gb?: number;
    storage_addon_blocks_qty?: number;
    total_storage_gb?: number;
    cancel_at_period_end?: boolean;
  }>({ subscribed: false });

  // Monotonically increasing token — independent of user/account keys.
  // Guarantees that only the latest in-flight request can update state,
  // regardless of who/what triggered earlier requests.
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const checkIfContributor = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('contributors')
        .select('account_owner_id, role, status')
        .eq('contributor_user_id', userId)
        .eq('status', 'accepted')
        .neq('account_owner_id', userId);
      if (error) return;
      if (data && data.length > 0) {
        setIsContributor(true);
        setContributorInfo(data[0] as ContributorInfo);
        if (data[0].role === 'administrator') {
          const { data: requestData } = await supabase
            .from('account_deletion_requests')
            .select('*')
            .eq('account_owner_id', data[0].account_owner_id)
            .eq('requester_user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);
          if (requestData && requestData.length > 0) {
            setPendingDeletionRequest(requestData[0] as DeletionRequest);
          }
        }
      }
    } catch (error) {
      console.error('Error checking contributor status:', error);
    }
  };

  const checkIncomingDeletionRequests = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('account_owner_id', userId)
        .eq('status', 'pending');
      if (!error) setIncomingDeletionRequests((data || []) as DeletionRequest[]);
    } catch (error) {
      console.error('Error checking deletion requests:', error);
    }
  };

  // Full loading-state safeguards:
  //   - request-generation token guards against stale responses overwriting
  //     newer ones (overlapping refreshes for the same or different account)
  //   - isMountedRef guards against post-unmount setState
  //   - whole flow (including getSession) sits inside try/finally so a
  //     thrown session retrieval cannot leave loading=true forever
  //   - strict response-shape validation — only a 2xx with a real boolean
  //     `subscribed` is treated as authoritative; anything else surfaces as
  //     the error/retry state (never as "unsubscribed")
  //   - lastResponseWasAuthoritative is the only path that may render the
  //     "Complete Your Subscription" branch
  const checkSubscription = useCallback(async () => {
    const myId = ++requestIdRef.current;
    setIsCheckingSubscription(true);
    setSubscriptionCheckError(null);
    setIsSignedOut(false);
    setLastResponseWasAuthoritative(false);

    try {
      if (!userId) {
        if (!isMountedRef.current || myId !== requestIdRef.current) return;
        setIsSignedOut(true);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();

      // Stale/unmount guard BEFORE any signed-out write.
      if (!isMountedRef.current || myId !== requestIdRef.current) return;

      if (!sessionData?.session) {
        setIsSignedOut(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (!isMountedRef.current || myId !== requestIdRef.current) return;

      if (error) {
        setSubscriptionCheckError("Couldn't load your plan.");
        return;
      }

      // Strict shape validation — never trust an arbitrary 2xx payload.
      const valid =
        data !== null &&
        typeof data === 'object' &&
        typeof (data as { subscribed?: unknown }).subscribed === 'boolean';

      if (!valid) {
        setSubscriptionCheckError("Couldn't load your plan.");
        return;
      }

      setSubscriptionStatus(data);
      setLastResponseWasAuthoritative(true);
    } catch {
      if (!isMountedRef.current || myId !== requestIdRef.current) return;
      setSubscriptionCheckError("Couldn't load your plan.");
    } finally {
      if (isMountedRef.current && myId === requestIdRef.current) {
        setIsCheckingSubscription(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    checkSubscription();
    if (userId) {
      checkIfContributor();
      checkIncomingDeletionRequests();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('storage_added') === 'true' || urlParams.get('payment_success') === 'true') {
        toast({ title: "Billing Updated", description: "Your subscription changes have been applied." });
        window.history.replaceState({}, '', window.location.pathname + '?tab=manage');
      }
    }
    return () => {
      isMountedRef.current = false;
      // Invalidate any still-in-flight request so its delayed response
      // cannot overwrite state in a remounted component.
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSubscription]);

  const handleManageBilling = async () => {
    // Centralized: same MFA prompt, retry, sanitized toast behavior,
    // module-level concurrency lock as everywhere else billing is opened.
    // `busy` results are silently discarded — the button is also
    // disabled while portalLoading as UX defense.
    await openCustomerPortal();
  };

  const handleStartSubscription = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const lookupKey = billingInterval === 'year' ? 'asset_safe_annual' : 'asset_safe_monthly';
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planLookupKey: lookupKey },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to start subscription. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const { error } = await invokeWithStepUp(
        'delete-account',
        {},
        () => promptStepUp({
          title: 'Verify before deleting your account',
          description: 'For security, confirm your authenticator. This action is permanent.',
        }),
      );
      if (error) throw error;
      await signOut();
      setShowDeleteDialog(false);
      setShowAccountDeletedDialog(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete account. Please contact support.", variant: "destructive" });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdminDeleteAccount = async () => {
    if (!user || !contributorInfo) return;
    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { target_account_id: contributorInfo.account_owner_id },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (error) throw error;
      toast({ title: "Account Deleted", description: "The account has been permanently deleted." });
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete account.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSubmitDeletionRequest = async () => {
    if (!user || !contributorInfo) return;
    setIsSubmittingRequest(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('submit-deletion-request', {
        body: { account_owner_id: contributorInfo.account_owner_id, reason: deletionReason, grace_period_days: 14 },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (error) throw error;
      toast({ title: "Deletion Request Submitted", description: "The account owner has been notified and has 14 days to respond." });
      setPendingDeletionRequest(data.request);
      setShowDeletionRequestDialog(false);
      setDeletionReason('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit deletion request.", variant: "destructive" });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleRespondDeletionRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('respond-deletion-request', {
        body: { request_id: requestId, action },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (error) throw error;
      toast({
        title: action === 'approve' ? "Request Approved" : "Request Rejected",
        description: action === 'approve' ? "The administrator can now proceed." : "The deletion request has been rejected.",
      });
      checkIncomingDeletionRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to respond to request.", variant: "destructive" });
    }
  };

  const hasActivePlan = subscriptionStatus.plan_status === 'active' || subscriptionStatus.plan_status === 'canceling' || subscriptionStatus.subscribed;
  const totalStorageGb = subscriptionStatus.total_storage_gb || subscriptionStatus.storage_quota_gb || 0;
  const baseStorageGb = subscriptionStatus.base_storage_gb || 25;
  const addOnBlocks = subscriptionStatus.storage_addon_blocks_qty || 0;
  const addOnStorageGb = addOnBlocks * 25;
  const hasStorageAddOn = addOnStorageGb > 0;
  const isCancelAtPeriodEnd = subscriptionStatus.cancel_at_period_end || false;

  // ===== LOADING VIEW =====
  // Avoid a flash of the unsubscribed "Complete Your Subscription" card
  // while `check-subscription` is still in flight on first paint.
  if (isCheckingSubscription) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Loading your current plan…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-10">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== SIGNED-OUT VIEW =====
  // The session was missing on the server-trip. Do NOT render a checkout
  // CTA — we can't authenticate this user; redirect them to sign in.
  if (isSignedOut) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Sign in to manage your plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== ERROR / RETRY VIEW =====
  // The subscription check failed (network/edge/invalid shape). Never
  // assume "unsubscribed" — give the user a retry instead.
  if (subscriptionCheckError) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Couldn't load your plan</CardTitle>
            <CardDescription>{subscriptionCheckError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => checkSubscription()} disabled={isCheckingSubscription} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== NOT SUBSCRIBED VIEW =====
  // Only render this branch when the most recent response was an
  // authoritative `{subscribed: false}` — never on the default placeholder
  // value, never on a transient/loading state.
  if (lastResponseWasAuthoritative && !hasActivePlan) {
    const displayPrice = billingInterval === 'year' ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    const priceLabel = billingInterval === 'year' ? '/year' : '/month';

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>Start your Asset Safe membership and get full access to everything.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex justify-center">
              <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as 'month' | 'year')}>
                <TabsList className="bg-muted rounded-full p-1">
                  <TabsTrigger value="month" className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white">Monthly</TabsTrigger>
                  <TabsTrigger value="year" className="rounded-full px-6 py-2 font-medium data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                    Yearly
                    <Badge className="ml-2 text-xs bg-brand-green/10 text-brand-green border-0 font-semibold">Save</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Plan Card */}
            <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                {planConfig.icon}
                <h3 className="font-semibold text-lg">{planConfig.title}</h3>
              </div>
              <div className="text-3xl font-bold mb-1">
                {displayPrice}
                <span className="text-base font-normal text-muted-foreground">{priceLabel}</span>
              </div>
              {billingInterval === 'year' && <p className="text-sm text-green-600 font-medium mb-2">{planConfig.yearlySavings}</p>}
              <p className="text-sm text-muted-foreground mb-4">{planConfig.description}</p>
              <ul className="space-y-1">
                {planConfig.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary & CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {planConfig.icon}
                  <div>
                    <h4 className="font-semibold">{planConfig.title}</h4>
                    <p className="text-sm text-muted-foreground">{planConfig.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {billingInterval === 'year' ? planConfig.yearlyPrice : planConfig.monthlyPrice}
                  <span className="text-lg font-normal text-muted-foreground">{billingInterval === 'year' ? '/year' : '/month'}</span>
                </div>
                {billingInterval === 'year' && <p className="text-sm text-green-600 font-medium mb-2">{planConfig.yearlySavings}</p>}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">No long-term contract. Cancel anytime.</p>
                </div>
                <Button onClick={handleStartSubscription} disabled={isLoading} className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        {!isContributor && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you wish to delete your account, make sure you securely back up or export your dashboard files. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        )}

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          description="Are you sure you want to delete your account? All your data will be permanently removed and this action cannot be undone."
        />
      </div>
    );
  }

  // ===== DEFENSIVE FALLBACK =====
  // We have no authoritative response yet and no error. Should be
  // unreachable in practice (the loading/error/signed-out branches above
  // cover every code path), but render a neutral skeleton rather than
  // defaulting to the subscribed UI with placeholder data.
  if (!lastResponseWasAuthoritative) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Loading your current plan…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-10">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== SUBSCRIBED VIEW =====
  return (
    <div className="space-y-6">

      {/* 1 — Manage Payment Methods & Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Payment Methods & Invoices</CardTitle>
          <CardDescription>View and update payment methods, billing details, and invoice history through Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <h3 className="text-2xl font-bold text-green-900">Asset Safe Plan</h3>
                </div>
              </div>
              <Badge variant="secondary" className={`px-4 py-2 text-sm ${isCancelAtPeriodEnd ? 'bg-orange-500 text-white border-orange-600' : 'bg-green-600 text-white border-green-700'}`}>
                {isCancelAtPeriodEnd ? 'Canceling' : 'Active'}
              </Badge>
            </div>

            {isCancelAtPeriodEnd && subscriptionStatus.subscription_end && (
              <Alert className="border-orange-400 bg-orange-100 mb-4">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-700">Subscription Ending</AlertTitle>
                <AlertDescription className="text-orange-600">
                  Your subscription will end on {new Date(subscriptionStatus.subscription_end).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                  You can reactivate from the billing portal before then.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label className="text-sm text-muted-foreground">Billing</Label>
                <p className="text-base font-bold text-gray-900">
                  {subscriptionStatus.plan_lookup_key?.includes('annual') || subscriptionStatus.plan_lookup_key?.includes('yearly')
                    ? 'Billed yearly · $189/yr + tax'
                    : subscriptionStatus.plan_lookup_key?.includes('monthly')
                    ? 'Billed monthly · $18.99/mo + tax'
                    : '$18.99/mo or $189/yr + tax'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Total Storage</Label>
                <p className="text-xl font-bold text-gray-900">{totalStorageGb} GB</p>
                {hasStorageAddOn && (
                  <p className="text-xs text-muted-foreground">({baseStorageGb} GB base + {addOnStorageGb} GB add-on)</p>
                )}
              </div>
              {subscriptionStatus.subscription_end && (
                <div>
                  <Label className="text-sm text-muted-foreground">Next Billing Date</Label>
                  <p className="text-xl font-bold text-gray-900">{new Date(subscriptionStatus.subscription_end).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <Button onClick={handleManageBilling} disabled={portalLoading} variant="outline" className="mt-4">
              <ExternalLink className="h-4 w-4 mr-2" />
              {portalLoading ? 'Opening...' : 'Manage Payment Methods & Invoices'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Payment methods, billing address updates, and invoice history. Plan changes and cancellations are handled in Account Settings.</p>
          </div>
        </CardContent>
      </Card>

      {/* 4 — Add or Adjust Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Add or Adjust Storage
          </CardTitle>
          <CardDescription>Expand your cloud storage with flexible 25GB add-on blocks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasStorageAddOn && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <HardDrive className="h-4 w-4" /> Active Add-ons
              </h4>
              <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Storage Add-on — {addOnStorageGb} GB ({addOnBlocks}×25GB)</p>
                    <p className="text-sm text-blue-700">Additional cloud storage</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-900">${(addOnBlocks * 4.99).toFixed(2)}/mo</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Active</Badge>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-base font-semibold text-foreground mb-1">Need more room to grow?</p>
            <p className="text-sm text-muted-foreground mb-3">Flexible storage you can adjust anytime.</p>
            <div className="bg-background/60 rounded-lg p-3 mb-3">
              <p className="font-medium text-center">
                <span className="font-bold">+25GB</span> for <span className="text-brand-orange font-bold">$4.99 / month</span>
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 mb-3">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                Add multiple increments as needed
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                Upgrade or remove storage anytime
              </li>
            </ul>
            <Button onClick={handleManageBilling} disabled={portalLoading} variant="outline" className="w-full">
              <HardDrive className="h-4 w-4 mr-2" />
              {portalLoading ? 'Opening...' : 'Add or Adjust Storage'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">25GB ≈ ~1,500 photos + documents</p>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Deletion Requests Alert */}
      {!isContributor && incomingDeletionRequests.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Deletion Request</AlertTitle>
          <AlertDescription className="space-y-4">
            {incomingDeletionRequests.map((request) => {
              const gracePeriodEnds = new Date(request.grace_period_ends_at);
              const daysRemaining = Math.max(0, Math.ceil((gracePeriodEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={request.id} className="space-y-3">
                  <p>
                    An administrator has requested to delete your account.
                    {request.reason && <><br /><strong>Reason:</strong> {request.reason}</>}
                  </p>
                  <p className="text-sm">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {daysRemaining > 0
                      ? `You have ${daysRemaining} day(s) to respond before the administrator can proceed.`
                      : 'The grace period has expired. The administrator can now proceed.'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleRespondDeletionRequest(request.id, 'reject')}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRespondDeletionRequest(request.id, 'approve')}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* 5 — Cancel Subscription */}
      {!isContributor && hasActivePlan && !isCancelAtPeriodEnd && (
        <Card>
          <CardHeader>
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription>
              Stop future billing. Your records stay securely stored and remain available in read-only mode after expiration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 6 — Account Deletion */}
      {!isContributor && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This is separate from cancelling your subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              After your subscription expires, your records will remain securely stored and available in read-only mode.
              You may reactivate, export your information, or request permanent account deletion at any time.
            </p>
            <Button variant="destructive" onClick={() => setShowNewDeleteDialog(true)} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      )}

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onCancelled={() => checkSubscription()}
        periodEndIso={subscriptionStatus.subscription_end}
      />
      <DeleteAccountDialog
        open={showNewDeleteDialog}
        onClose={() => setShowNewDeleteDialog(false)}
        onScheduled={() => checkSubscription()}
      />


      {/* Admin Contributor Deletion */}
      {isContributor && contributorInfo?.role === 'administrator' && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account Deletion</CardTitle>
            <CardDescription>Request deletion of the account you manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDeletionRequest ? (
                <>
                  {pendingDeletionRequest.status === 'pending' && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Deletion Request Pending</AlertTitle>
                      <AlertDescription>
                        {(() => {
                          const gracePeriodEnds = new Date(pendingDeletionRequest.grace_period_ends_at);
                          const daysRemaining = Math.max(0, Math.ceil((gracePeriodEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                          return daysRemaining > 0
                            ? `Waiting for account owner response. ${daysRemaining} day(s) remaining.`
                            : 'The grace period has expired. You can now proceed with deletion.';
                        })()}
                      </AlertDescription>
                    </Alert>
                  )}
                  {pendingDeletionRequest.status === 'approved' && (
                    <Alert className="border-green-500 bg-green-50">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-700">Request Approved</AlertTitle>
                      <AlertDescription className="text-green-600">The account owner has approved your deletion request.</AlertDescription>
                    </Alert>
                  )}
                  {pendingDeletionRequest.status === 'rejected' && (
                    <Alert variant="destructive">
                      <X className="h-4 w-4" />
                      <AlertTitle>Request Rejected</AlertTitle>
                      <AlertDescription>The account owner has rejected your deletion request.</AlertDescription>
                    </Alert>
                  )}
                  {(pendingDeletionRequest.status === 'approved' ||
                    (pendingDeletionRequest.status === 'pending' && new Date(pendingDeletionRequest.grace_period_ends_at) <= new Date())) && (
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting} className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Proceed with Account Deletion'}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    As an administrator, you can request to delete the account you manage. The account owner will be notified and given a grace period to respond.
                  </p>
                  <Button variant="destructive" onClick={() => setShowDeletionRequestDialog(true)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" /> Request Account Deletion
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={isContributor ? handleAdminDeleteAccount : handleDeleteAccount}
        title={isContributor ? "Delete Managed Account" : "Delete Account"}
        description="Are you sure? This action cannot be undone. All data will be permanently removed."
      />

      <AccountDeletedDialog
        isOpen={showAccountDeletedDialog}
        onClose={() => { setShowAccountDeletedDialog(false); navigate('/'); }}
      />

      <Dialog open={showDeletionRequestDialog} onOpenChange={setShowDeletionRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Account Deletion</DialogTitle>
            <DialogDescription>Submit a request to delete the account you manage. The account owner will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Deletion (Optional)</Label>
              <Textarea value={deletionReason} onChange={(e) => setDeletionReason(e.target.value)} placeholder="Please provide a reason..." />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>The account owner will have 14 days to respond before you can proceed.</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletionRequestDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSubmitDeletionRequest} disabled={isSubmittingRequest}>
              {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTab;
