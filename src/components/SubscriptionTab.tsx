
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ExternalLink, CreditCard, Shield, Star, Zap, Trash2, Clock, AlertTriangle, X, Check, HardDrive, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import AccountDeletedDialog from '@/components/AccountDeletedDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Plan configurations with monthly and yearly pricing
const planConfigs = {
  standard: {
    title: "Standard (Homeowner Plan)", 
    monthlyPrice: "$12.99",
    yearlyPrice: "$129",
    yearlySavings: "Save when you pay yearly",
    description: "For individuals documenting and protecting their home.",
    features: [
      "Unlimited properties",
      "25GB secure cloud storage",
      "Guided home inventory system",
      "Secure Vault (owner-only access)",
      "Password Catalog (personal use)",
      "Claim-ready documentation exports",
      "Simple, ongoing protection for your home"
    ],
    icon: <Zap className="h-6 w-6 text-orange-600" />,
    popular: false
  },
  premium: {
    title: "Premium (Legacy & Business Protection)",
    monthlyPrice: "$18.99",
    yearlyPrice: "$189",
    yearlySavings: "Save when you pay yearly",
    description: "For families, business owners, and anyone who wants shared protection and continuity.",
    features: [
      "Unlimited properties",
      "100GB secure cloud storage",
      "⭐ Shared access with authorized users",
      "⭐ Legacy Locker (family continuity & instructions)",
      "⭐ Emergency Access Sharing",
      "⭐ Protection that extends beyond you"
    ],
    icon: <Star className="h-6 w-6 text-purple-600" />,
    popular: true
  }
};

const commonFeatures = [
  "Photo, video, and document uploads",
  "Room-by-room inventory organization",
  "Voice notes and item details",
  "Secure Vault & Password Catalog",
  "Claim-ready documentation exports (available anytime)",
  "Multi-factor authentication",
  "Full web platform access",
  "Post-damage documentation reports",
  "Manual Entries",
  "Upgrades & Repairs Record",
  "Paint Code Reference",
  "Source Websites",
  "Service Pros Directory"
];

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

const SubscriptionTab: React.FC = () => {
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof planConfigs>('standard');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const checkIfContributor = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contributors')
        .select('account_owner_id, role, status')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .neq('account_owner_id', user.id);

      if (error) return;

      if (data && data.length > 0) {
        setIsContributor(true);
        setContributorInfo(data[0] as ContributorInfo);
        
        if (data[0].role === 'administrator') {
          const { data: requestData } = await supabase
            .from('account_deletion_requests')
            .select('*')
            .eq('account_owner_id', data[0].account_owner_id)
            .eq('requester_user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (requestData && requestData.length > 0) {
            setPendingDeletionRequest(requestData[0] as DeletionRequest);
          }
        }
      } else {
        setIsContributor(false);
        setContributorInfo(null);
      }
    } catch (error) {
      console.error('Error checking contributor status:', error);
    }
  };

  const checkIncomingDeletionRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('account_owner_id', user.id)
        .eq('status', 'pending');

      if (!error) {
        setIncomingDeletionRequests((data || []) as DeletionRequest[]);
      }
    } catch (error) {
      console.error('Error checking deletion requests:', error);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
      checkIfContributor();
      checkIncomingDeletionRequests();
      
      // Post-redirect refresh: check if returning from Stripe
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('storage_added') === 'true' || urlParams.get('payment_success') === 'true') {
        // First call check-subscription, only sync if stale
        checkSubscription().then(() => {
          if (!subscriptionStatus.subscribed) {
            // Entitlements appear stale, sync
            supabase.functions.invoke('sync-subscription').then(() => checkSubscription());
          }
        });
        toast({
          title: "Billing Updated",
          description: "Your subscription changes have been applied.",
        });
        window.history.replaceState({}, '', window.location.pathname + '?tab=subscription');
      }
    }
  }, [user]);

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
        description: action === 'approve' ? "The administrator can now proceed with account deletion." : "The deletion request has been rejected.",
      });
      checkIncomingDeletionRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to respond to request.", variant: "destructive" });
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

  // Open Stripe Customer Portal for all billing management
  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      window.location.href = data.url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to open billing management. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSubscription = async () => {
    if (!user) {
      toast({ title: "Error", description: "User information not found. Please try logging out and back in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      // Build lookup key from selected plan + billing interval
      const lookupKey = `${selectedPlan}_${billingInterval === 'year' ? 'yearly' : 'monthly'}`;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planLookupKey: lookupKey },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });
      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to start subscription process. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await signOut();
      setShowDeleteDialog(false);
      setShowAccountDeletedDialog(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete account. Please contact support for assistance.", variant: "destructive" });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAccountDeletedClose = () => {
    setShowAccountDeletedDialog(false);
    navigate('/');
  };

  const hasActivePlan = subscriptionStatus.plan_status === 'active' || subscriptionStatus.plan_status === 'canceling' || subscriptionStatus.subscribed;
  
  const StorageNotation = () => (
    <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
      <p>25GB ≈ ~1,500 photos + documents</p>
      <p>100GB ≈ ~6,000 photos or extensive video</p>
    </div>
  );

  // ===== NOT SUBSCRIBED VIEW =====
  if (!hasActivePlan) {
    const currentPlan = planConfigs[selectedPlan];
    const displayPrice = billingInterval === 'year' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
    const priceLabel = billingInterval === 'year' ? '/year' : '/month';
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>Choose your plan and enter your payment information to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Interval Toggle */}
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

            {/* Plan Selection */}
            <div>
              <Label htmlFor="plan-select" className="text-base font-semibold">Select Your Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {Object.entries(planConfigs).map(([key, plan]) => (
                  <div key={key} className="relative">
                    {!plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Basic Protection</span>
                      </div>
                    )}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <Star className="h-3 w-3" /> Most Popular for Families and Businesses
                        </span>
                      </div>
                    )}
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all h-full ${
                        selectedPlan === key ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'mt-2' : ''}`}
                      onClick={() => setSelectedPlan(key as keyof typeof planConfigs)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {plan.icon}
                        <h3 className="font-semibold">{plan.title}</h3>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {billingInterval === 'year' ? plan.yearlyPrice : plan.monthlyPrice}
                        <span className="text-sm font-normal text-muted-foreground">{billingInterval === 'year' ? '/year' : '/month'}</span>
                      </div>
                      {billingInterval === 'year' && <p className="text-sm text-green-600 font-medium mb-2">{plan.yearlySavings}</p>}
                      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Features */}
            <div className="mt-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h4 className="font-semibold text-center mb-3">Included in Both Plans</h4>
                <p className="text-xs text-muted-foreground text-center mb-3">Billed monthly. No long-term contract. Cancel anytime.</p>
                <p className="text-xs text-muted-foreground text-center mb-4">All plans include full access to your data and complete exports anytime.</p>
                <p className="text-xs font-medium text-center mb-4">Everything you need to fully document and protect your home:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  {commonFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="h-2.5 w-2.5 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <StorageNotation />
              </div>
            </div>

            {/* Storage Add-on Info */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-base font-semibold text-foreground mb-1">Your life evolves — your storage can too</p>
              <p className="text-sm text-muted-foreground mb-3">Flexible storage you can adjust anytime.</p>
              <div className="bg-background/60 rounded-lg p-3 mb-3">
                <p className="font-medium text-center"><span className="font-bold">+25GB</span> for <span className="text-brand-orange font-bold">$4.99 / month</span></p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Add multiple increments as needed
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Upgrade or remove storage anytime
                </li>
              </ul>
            </div>

            {/* Account Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{profile?.first_name || user?.user_metadata?.first_name || ''} {profile?.last_name || user?.user_metadata?.last_name || ''}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Selected Plan Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {currentPlan.icon}
                  <div>
                    <h4 className="font-semibold">{currentPlan.title}</h4>
                    <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {displayPrice}
                  <span className="text-lg font-normal text-muted-foreground">{priceLabel}</span>
                </div>
                {billingInterval === 'year' && <p className="text-sm text-green-600 font-medium mb-2">{currentPlan.yearlySavings}</p>}
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

        {/* Delete Account Section */}
        {!isContributor && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you wish to delete your account, make sure you securely back up or export your dashboard files. Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          description="Are you sure you want to delete your account? You will no longer be able to login and access your dashboard or its contents. This will end your subscription. All your data will be permanently removed, and this action cannot be undone."
        />
      </div>
    );
  }

  // ===== SUBSCRIBED VIEW =====
  const rawTier = subscriptionStatus.subscription_tier?.toLowerCase() || '';
  const activeTier = rawTier.includes('premium') ? 'premium' : 'standard';
  const totalStorageGb = subscriptionStatus.total_storage_gb || subscriptionStatus.storage_quota_gb || 0;
  const baseStorageGb = subscriptionStatus.base_storage_gb || (activeTier === 'premium' ? 100 : 25);
  const addOnBlocks = subscriptionStatus.storage_addon_blocks_qty || 0;
  const addOnStorageGb = addOnBlocks * 25;
  const hasStorageAddOn = addOnStorageGb > 0;
  const isCancelAtPeriodEnd = subscriptionStatus.cancel_at_period_end || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Subscription</CardTitle>
          <CardDescription>View your plan details and manage billing through Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Plan Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                    <CheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <h3 className="text-2xl font-bold text-green-900">
                      {planConfigs[activeTier as keyof typeof planConfigs]?.title || 'Standard Plan'}
                    </h3>
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
                  <Label className="text-sm text-muted-foreground">Price</Label>
                  <p className="text-xl font-bold text-gray-900">
                    {activeTier === 'standard' && '$12.99/mo or $129/yr'}
                    {activeTier === 'premium' && '$18.99/mo or $189/yr'}
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
              <Button onClick={handleManageBilling} disabled={isLoading} variant="outline" className="mt-4">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Opening...' : 'Upgrade or Change Plan'}
              </Button>
            </div>

            {/* Active Add-ons Section */}
            {hasStorageAddOn && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Active Add-ons
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

            {/* Storage Add-on Info */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-base font-semibold text-foreground mb-1">Your life evolves — your storage can too</p>
              <p className="text-sm text-muted-foreground mb-3">Flexible storage you can adjust anytime.</p>
              <div className="bg-background/60 rounded-lg p-3 mb-3">
                <p className="font-medium text-center"><span className="font-bold">+25GB</span> for <span className="text-brand-orange font-bold">$4.99 / month</span></p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Add multiple increments as needed
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Upgrade or remove storage anytime
                </li>
              </ul>
              <Button onClick={handleManageBilling} disabled={isLoading} variant="outline" className="w-full mt-3">
                <HardDrive className="h-4 w-4 mr-2" />
                {isLoading ? 'Opening...' : 'Add or Adjust Storage'}
              </Button>
              <StorageNotation />
            </div>

            {/* Manage Billing - Single entry point via Stripe Customer Portal */}
            <div className="border-2 border-primary/30 rounded-lg p-6 text-center space-y-3">
              <h4 className="font-semibold text-lg">Manage Your Billing</h4>
              <p className="text-sm text-muted-foreground">
                Change your plan, adjust storage, update payment method, or cancel — all in one place.
              </p>
              <Button onClick={handleManageBilling} disabled={isLoading} size="lg" className="w-full max-w-sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Opening...' : 'Manage Billing'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Deletion Requests Alert */}
      {!isContributor && incomingDeletionRequests.length > 0 && (
        <Alert variant="destructive" className="mb-6">
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
                      ? `You have ${daysRemaining} day(s) to respond before the administrator can proceed with deletion.`
                      : 'The grace period has expired. The administrator can now proceed with deletion.'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleRespondDeletionRequest(request.id, 'reject')}>
                      <X className="h-4 w-4 mr-1" /> Reject Deletion
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRespondDeletionRequest(request.id, 'approve')}>
                      <Check className="h-4 w-4 mr-1" /> Approve Deletion
                    </Button>
                  </div>
                </div>
              );
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Account Section */}
      {!isContributor && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete your account and all associated data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you wish to delete your account, make sure you securely back up or export your dashboard files. Once you delete your account, there is no going back. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Contributor Deletion Section */}
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
                      <AlertDescription className="text-green-600">
                        The account owner has approved your deletion request. You can now proceed.
                      </AlertDescription>
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
        onClose={handleAccountDeletedClose}
      />

      <Dialog open={showDeletionRequestDialog} onOpenChange={setShowDeletionRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Account Deletion</DialogTitle>
            <DialogDescription>
              Submit a request to delete the account you manage. The account owner will be notified.
            </DialogDescription>
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

export default SubscriptionTab;
