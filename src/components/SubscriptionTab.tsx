
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
import { Switch } from '@/components/ui/switch';
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

const storageAddOns = [
  { size: 25, price: "$4.99", priceInCents: 499, functionName: 'add-storage-25gb' },
  { size: 50, price: "$9.99", priceInCents: 999, functionName: 'add-storage' }
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
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isContributor, setIsContributor] = useState(false);
  const [contributorInfo, setContributorInfo] = useState<ContributorInfo | null>(null);
  const [pendingDeletionRequest, setPendingDeletionRequest] = useState<DeletionRequest | null>(null);
  const [incomingDeletionRequests, setIncomingDeletionRequests] = useState<DeletionRequest[]>([]);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [changePlanTarget, setChangePlanTarget] = useState<'standard' | 'premium'>('standard');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
    plan_status?: string;
    property_limit?: number;
    storage_quota_gb?: number;
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

      if (error) {
        console.error('Error checking contributor status:', error);
        return;
      }

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

      if (error) {
        console.error('Error checking deletion requests:', error);
        return;
      }

      setIncomingDeletionRequests((data || []) as DeletionRequest[]);
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
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('storage_added') === 'true') {
        toast({
          title: "Storage Added Successfully!",
          description: "Your additional storage has been activated.",
        });
        window.history.replaceState({}, '', window.location.pathname + '?tab=subscription');
      }
    }
  }, [user, toast]);

  const handleSubmitDeletionRequest = async () => {
    if (!user || !contributorInfo) return;
    
    setIsSubmittingRequest(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('submit-deletion-request', {
        body: {
          account_owner_id: contributorInfo.account_owner_id,
          reason: deletionReason,
          grace_period_days: 14
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Deletion Request Submitted",
        description: "The account owner has been notified and has 14 days to respond.",
      });
      
      setPendingDeletionRequest(data.request);
      setShowDeletionRequestDialog(false);
      setDeletionReason('');
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleRespondDeletionRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('respond-deletion-request', {
        body: { request_id: requestId, action },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: action === 'approve' ? "Request Approved" : "Request Rejected",
        description: action === 'approve' 
          ? "The administrator can now proceed with account deletion."
          : "The deletion request has been rejected.",
      });
      
      checkIncomingDeletionRequests();
    } catch (error: any) {
      console.error('Error responding to deletion request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdminDeleteAccount = async () => {
    if (!user || !contributorInfo) return;

    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { target_account_id: contributorInfo.account_owner_id },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });
      
      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "The account has been permanently deleted.",
      });
      
      await signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!user) return;
    setIsChangingPlan(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('change-plan', {
        body: { targetPlan: changePlanTarget },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });
      if (error) throw error;
      
      toast({
        title: "Plan Changed Successfully",
        description: `You've been switched to the ${changePlanTarget === 'premium' ? 'Premium' : 'Standard'} plan. Your billing has been prorated.`,
      });
      
      setShowChangePlanDialog(false);
      await checkSubscription();
    } catch (error: any) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleStartSubscription = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User information not found. Please try logging out and back in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: selectedPlan,
          billingInterval: billingInterval
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      
      if (error) {
        throw error;
      }

      await signOut();
      setShowDeleteDialog(false);
      setShowAccountDeletedDialog(true);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support for assistance.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAccountDeletedClose = () => {
    setShowAccountDeletedDialog(false);
    navigate('/');
  };

  const handleAddStorage = async (functionName: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User information not found. Please try logging out and back in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error adding storage:', error);
      toast({
        title: "Error",
        description: "Failed to start storage upgrade process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (shouldCancel: boolean) => {
    if (!user) return;

    setIsCanceling(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          action: shouldCancel ? 'cancel' : 'reactivate'
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: shouldCancel ? "Subscription Canceled" : "Subscription Reactivated",
        description: shouldCancel 
          ? "Your subscription will remain active until the end of your billing period."
          : "Your subscription has been reactivated successfully.",
      });
      
      await checkSubscription();
      setShowCancelConfirmation(false);
      setCancelConfirmed(false);
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const hasActivePlan = subscriptionStatus.plan_status === 'active' || subscriptionStatus.plan_status === 'canceling' || subscriptionStatus.subscribed;
  
  // Storage notation component
  const StorageNotation = () => (
    <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
      <p>25GB ≈ ~1,500 photos + documents</p>
      <p>100GB ≈ ~6,000 photos or extensive video</p>
    </div>
  );

  if (!hasActivePlan) {
    const currentPlan = planConfigs[selectedPlan];
    const displayPrice = billingInterval === 'year' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice;
    const priceLabel = billingInterval === 'year' ? '/year' : '/month';
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>
              Choose your plan and enter your payment information to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Interval Toggle */}
            <div className="flex justify-center">
              <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as 'month' | 'year')}>
                <TabsList className="grid w-full max-w-xs grid-cols-2">
                  <TabsTrigger value="month">Monthly</TabsTrigger>
                  <TabsTrigger value="year">
                    Yearly
                    <Badge variant="secondary" className="ml-2 text-xs bg-brand-green/10 text-brand-green font-semibold">Save</Badge>
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
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Basic Protection
                        </span>
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
                        selectedPlan === key
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'mt-2' : ''}`}
                      onClick={() => setSelectedPlan(key as keyof typeof planConfigs)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {plan.icon}
                        <h3 className="font-semibold">{plan.title}</h3>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {billingInterval === 'year' ? plan.yearlyPrice : plan.monthlyPrice}
                        <span className="text-sm font-normal text-muted-foreground">
                          {billingInterval === 'year' ? '/year' : '/month'}
                        </span>
                      </div>
                      {billingInterval === 'year' && (
                        <p className="text-sm text-green-600 font-medium mb-2">{plan.yearlySavings}</p>
                      )}
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
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Billed monthly. No long-term contract. Cancel anytime.
                </p>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  All plans include full access to your data and complete exports anytime.
                </p>
                <p className="text-xs font-medium text-center mb-4">
                  Everything you need to fully document and protect your home:
                </p>
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

            {/* Storage Add-ons */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-base font-semibold text-foreground mb-3">Need more space?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {storageAddOns.map((addon) => (
                  <div key={addon.size} className="flex items-center justify-between bg-background/60 rounded-lg p-3">
                    <div>
                      <p className="font-medium">+{addon.size}GB Storage</p>
                      <p className="text-sm text-muted-foreground">{addon.price}/month</p>
                    </div>
                    <Button
                      onClick={() => handleAddStorage(addon.functionName)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* User Information Display */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">
                    {profile?.first_name || user?.user_metadata?.first_name || ''} {profile?.last_name || user?.user_metadata?.last_name || ''}
                  </p>
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
                {billingInterval === 'year' && (
                  <p className="text-sm text-green-600 font-medium mb-2">{currentPlan.yearlySavings}</p>
                )}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">No long-term contract. Cancel anytime.</p>
                </div>
                <Button 
                  onClick={handleStartSubscription}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Delete Account Section - Only show for account owners */}
        {!isContributor && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you wish to delete your account, make sure you securely back up or export your dashboard files. Once you delete your account, there is no going back. This action cannot be undone.
              </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
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

  // Determine the active tier from subscription status
  const rawTier = subscriptionStatus.subscription_tier?.toLowerCase() || '';
  const activeTier = rawTier.includes('premium') ? 'premium' : 'standard';
  const activeStorageGb = subscriptionStatus.storage_quota_gb || 25;
  const activePropertyLimit = subscriptionStatus.property_limit || 3;
  
  // Calculate base storage and add-on storage
  const baseStorageGb = activeTier === 'premium' ? 100 : 25;
  const addOnStorageGb = activeStorageGb > baseStorageGb ? activeStorageGb - baseStorageGb : 0;
  const hasStorageAddOn = addOnStorageGb > 0;

  // If user is subscribed, show subscription management
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Subscription</CardTitle>
          <CardDescription>
            Upgrade, downgrade, or manage your subscription plan
          </CardDescription>
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
                <Badge variant="secondary" className="bg-green-600 text-white border-green-700 px-4 py-2 text-sm">Active</Badge>
              </div>
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
                  <p className="text-xl font-bold text-gray-900">{activeStorageGb} GB</p>
                  {hasStorageAddOn && (
                    <p className="text-xs text-muted-foreground">({baseStorageGb} GB base + {addOnStorageGb} GB add-on)</p>
                  )}
                </div>
                {subscriptionStatus.subscription_end && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Next Billing Date</Label>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
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
                      <p className="font-medium text-blue-900">Storage Add-on - {addOnStorageGb} GB</p>
                      <p className="text-sm text-blue-700">Additional cloud storage</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-900">
                      {addOnStorageGb === 25 ? '$4.99/mo' : addOnStorageGb === 50 ? '$9.99/mo' : `$${(addOnStorageGb / 50 * 9.99).toFixed(2)}/mo`}
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Active</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Available Plans - Only show plans different from current */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Change Plan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(planConfigs)
                  .filter(([key]) => key !== activeTier)
                  .map(([key, plan]) => (
                    <Card key={key} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          {plan.icon}
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {plan.monthlyPrice}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                        <div className="text-lg font-semibold text-green-600 mb-2">
                          or {plan.yearlyPrice}
                          <span className="text-sm font-normal">/year</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          onClick={() => {
                            setChangePlanTarget(key as 'standard' | 'premium');
                            setShowChangePlanDialog(true);
                          }}
                          disabled={isLoading || isChangingPlan}
                          variant={key === 'premium' ? 'default' : 'outline'}
                          className="w-full"
                        >
                          {isChangingPlan ? 'Processing...' : `Switch to ${key === 'premium' ? 'Premium' : 'Standard'}`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Storage Add-ons */}
            <div className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-base font-semibold text-foreground mb-3">Need more space?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {storageAddOns.map((addon) => (
                  <div key={addon.size} className="flex items-center justify-between bg-background/60 rounded-lg p-3">
                    <div>
                      <p className="font-medium">+{addon.size}GB Storage</p>
                      <p className="text-sm text-muted-foreground">{addon.price}/month</p>
                    </div>
                    <Button
                      onClick={() => handleAddStorage(addon.functionName)}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? 'Processing...' : 'Add Storage'}
                    </Button>
                  </div>
                ))}
              </div>
              <StorageNotation />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Deletion Requests Alert - Show to account owners */}
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
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRespondDeletionRequest(request.id, 'reject')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject Deletion
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRespondDeletionRequest(request.id, 'approve')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve Deletion
                    </Button>
                  </div>
                </div>
              );
            })}
          </AlertDescription>
        </Alert>
      )}

      {/* Cancel Subscription Section - Only show for account owners with active subscription */}
      {!isContributor && hasActivePlan && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Cancel Subscription
            </CardTitle>
            <CardDescription>
              Cancel your subscription to stop future billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionStatus.plan_status === 'canceling' ? (
                <>
                  <Alert className="border-orange-400 bg-orange-100">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-700">Subscription Canceling</AlertTitle>
                    <AlertDescription className="text-orange-600">
                      Your subscription is set to cancel at the end of your billing period.
                      {subscriptionStatus.subscription_end && (
                        <div className="mt-2 font-semibold text-orange-800">
                          Final access date: {new Date(subscriptionStatus.subscription_end).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                      <span className="block mt-1">You can reactivate anytime before then.</span>
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-foreground">Subscription Status</p>
                      <p className="text-sm text-muted-foreground">Toggle to reactivate your subscription</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-orange-600 font-medium">Canceling</span>
                      <Switch
                        checked={false}
                        onCheckedChange={() => handleCancelSubscription(false)}
                        disabled={isCanceling}
                      />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCancelSubscription(false)}
                    disabled={isCanceling}
                    className="w-full border-green-500 text-green-700 hover:bg-green-50"
                  >
                    {isCanceling ? 'Processing...' : 'Reactivate My Subscription'}
                  </Button>
                </>
              ) : (
                <>
                  {!showCancelConfirmation ? (
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-foreground">Subscription Status</p>
                        <p className="text-sm text-muted-foreground">Toggle to cancel your subscription</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Cancel</span>
                        <Switch
                          checked={true}
                          onCheckedChange={() => setShowCancelConfirmation(true)}
                          disabled={isCanceling}
                        />
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 bg-orange-100 rounded-lg border border-orange-300">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="space-y-3">
                          <p className="font-medium text-orange-800">Are you sure you want to cancel?</p>
                          <p className="text-sm text-orange-700">
                            You can reactivate your account any time before your subscription expires on{' '}
                            {subscriptionStatus.subscription_end 
                              ? new Date(subscriptionStatus.subscription_end).toLocaleDateString()
                              : 'the end of your billing period'
                            }.
                          </p>
                          <div className="text-sm text-orange-700">
                            <p className="mb-1">If you choose to cancel:</p>
                            <ul className="list-disc list-inside space-y-1 ml-1">
                              <li>Your data will remain securely stored for a limited time in case you return</li>
                              <li>Your account will remain active until the end of your billing period</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="confirm-cancel" 
                          checked={cancelConfirmed}
                          onCheckedChange={(checked) => setCancelConfirmed(checked === true)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="confirm-cancel"
                          className="text-sm text-orange-800 leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I understand that I will lose access to account features at the end of my billing period
                        </label>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCancelConfirmation(false);
                            setCancelConfirmed(false);
                          }}
                          className="flex-1"
                        >
                          Keep My Subscription
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelSubscription(true)}
                          disabled={!cancelConfirmed || isCanceling}
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                          {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Section - Only show for account owners */}
      {!isContributor && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you wish to delete your account, make sure you securely back up or export your dashboard files. Once you delete your account, there is no going back. This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Contributor Deletion Request Section */}
      {isContributor && contributorInfo?.role === 'administrator' && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account Deletion</CardTitle>
            <CardDescription>
              Request deletion of the account you manage
            </CardDescription>
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
                          
                          if (daysRemaining > 0) {
                            return `Waiting for account owner response. ${daysRemaining} day(s) remaining before you can proceed.`;
                          }
                          return 'The grace period has expired. You can now proceed with deletion.';
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
                      <AlertDescription>
                        The account owner has rejected your deletion request. You cannot delete this account.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {(pendingDeletionRequest.status === 'approved' || 
                    (pendingDeletionRequest.status === 'pending' && 
                      new Date(pendingDeletionRequest.grace_period_ends_at) <= new Date())) && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting Account...' : 'Proceed with Account Deletion'}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    As an administrator, you can request to delete this account. The account owner will be notified and will have 14 days to approve or reject the request.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeletionRequestDialog(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Request Account Deletion
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog for Account Owners */}
      {!isContributor && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          description="Are you sure you want to delete your account? You will no longer be able to login and access your dashboard or its contents. This will end your subscription. All your data will be permanently removed, and this action cannot be undone."
        />
      )}

      {/* Delete Confirmation Dialog for Admin Contributors */}
      {isContributor && contributorInfo?.role === 'administrator' && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleAdminDeleteAccount}
          title="Delete Account"
          description="Are you sure you want to delete this account? All data will be permanently removed, and this action cannot be undone. The account owner has been notified of this action."
        />
      )}

      {/* Deletion Request Dialog for Admin Contributors */}
      {showDeletionRequestDialog && (
        <DeleteConfirmationDialog
          isOpen={showDeletionRequestDialog}
          onClose={() => {
            setShowDeletionRequestDialog(false);
            setDeletionReason('');
          }}
          onConfirm={handleSubmitDeletionRequest}
          title="Request Account Deletion"
          description={
            <div className="space-y-4">
              <p>
                You are requesting to delete this account. The account owner will be notified and will have 14 days to respond.
              </p>
              <div>
                <Label htmlFor="deletion-reason">Reason for deletion (optional)</Label>
                <Textarea
                  id="deletion-reason"
                  placeholder="Enter a reason for the deletion request..."
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          }
          confirmText={isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
        />
      )}

      {/* Account Deleted Farewell Dialog */}
      <AccountDeletedDialog
        isOpen={showAccountDeletedDialog}
        onClose={handleAccountDeletedClose}
      />

      {/* Change Plan Confirmation Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              You are switching from <strong>{activeTier === 'standard' ? 'Standard' : 'Premium'}</strong> to <strong>{changePlanTarget === 'standard' ? 'Standard' : 'Premium'}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              {planConfigs[changePlanTarget]?.icon}
              <span className="font-medium">{planConfigs[changePlanTarget]?.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your billing will be prorated — you'll receive credit for unused time on your current plan.
            </p>
            <p className="text-sm text-muted-foreground">
              The change takes effect immediately.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)} disabled={isChangingPlan}>
              Cancel
            </Button>
            <Button onClick={handleChangePlan} disabled={isChangingPlan}>
              {isChangingPlan ? 'Processing...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionTab;
