
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Plan configurations
const planConfigs = {
  standard: {
    title: "Standard (Homeowner Plan)", 
    price: "$12.99",
    description: "Our most popular plan for comprehensive home documentation",
    features: [
      "Up to 3 properties",
      "25GB secure cloud storage"
    ],
    icon: <Zap className="h-6 w-6 text-orange-600" />
  },
  premium: {
    title: "Premium (Professional Plan)",
    price: "$18.99", 
    description: "Best suited for estate managers, multiple-property owners, or businesses",
    features: [
      "Unlimited properties",
      "100GB secure cloud storage"
    ],
    icon: <Star className="h-6 w-6 text-purple-600" />
  }
};

const commonFeatures = [
  "Photo and video uploads",
  "Full web platform access",
  "Voice notes for item details",
  "Post damage documentation",
  "Export detailed reports",
  "Email support",
  "Share with 3 trusted contacts",
  "Legacy Locker"
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      // Check if user is a contributor to someone else's account
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
        
        // If admin contributor, check for their pending deletion request
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
      
      // Check for storage add-on success
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('storage_added') === 'true') {
        toast({
          title: "Storage Added Successfully!",
          description: "Your additional 50GB storage has been activated.",
        });
        // Clear the URL parameter
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
      
      // Refresh the incoming requests
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
      
      // Sign out and redirect
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
      
      // Open Stripe customer portal in a new tab
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
      // Get the current session to pass the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: selectedPlan
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
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
      // Call the delete-account edge function
      const { data, error } = await supabase.functions.invoke('delete-account');
      
      if (error) {
        throw error;
      }

      // Sign out the user
      await signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support for assistance.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAddStorage = async () => {
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
      
      const { data, error } = await supabase.functions.invoke('add-storage', {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
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
      
      // Refresh subscription status
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

  // If user is not subscribed AND plan_status is not 'active', show checkout form
  // This handles cases where webhook might have set plan_status but not synced subscribers table
  const hasActivePlan = subscriptionStatus.plan_status === 'active' || subscriptionStatus.plan_status === 'canceling' || subscriptionStatus.subscribed;
  
  if (!hasActivePlan) {
    const currentPlan = planConfigs[selectedPlan];
    
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
            {/* Plan Selection */}
            <div>
              <Label htmlFor="plan-select" className="text-base font-semibold">Select Your Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {Object.entries(planConfigs).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(key as keyof typeof planConfigs)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {plan.icon}
                      <h3 className="font-semibold">{plan.title}</h3>
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
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
                ))}
              </div>
            </div>

            {/* Common Features */}
            <div className="mt-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h4 className="font-semibold text-center mb-4">Included in Both Plans</h4>
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
              </div>
            </div>

            {/* Storage Add-on */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground mb-1">
                    Need more space? Add 50 GB for just $9.99/month.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expand your storage capacity for more photos, videos, and documents.
                  </p>
                </div>
                <Button
                  onClick={handleAddStorage}
                  disabled={isLoading}
                  className="ml-4"
                >
                  {isLoading ? 'Processing...' : 'Add Storage'}
                </Button>
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
                    <h4 className="font-semibold">{currentPlan.title} Plan</h4>
                    <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-4">
                  {currentPlan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
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
  const activeTier = subscriptionStatus.subscription_tier?.toLowerCase().includes('premium') ? 'premium' 
    : subscriptionStatus.subscription_tier?.toLowerCase().includes('standard') ? 'standard'
    : subscriptionStatus.subscription_tier?.toLowerCase() || 'standard';
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
                    <h3 className="text-2xl font-bold text-green-900 capitalize">
                      {activeTier} Plan
                    </h3>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-600 text-white border-green-700 px-4 py-2 text-sm">Active</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Monthly Price</Label>
                  <p className="text-xl font-bold text-gray-900">
                    {activeTier === 'standard' && '$12.99/mo'}
                    {activeTier === 'premium' && '$18.99/mo'}
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
                    <p className="font-semibold text-blue-900">$9.99/mo</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Active</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Available Plans */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Available Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(planConfigs).map(([key, plan]) => {
                  const isCurrentPlan = activeTier === key;
                  return (
                    <Card key={key} className={isCurrentPlan ? 'border-2 border-green-500 shadow-lg' : 'border-2'}>
                      <CardContent className="pt-6">
                        {isCurrentPlan && (
                          <div className="mb-4">
                            <Badge className="bg-green-600 text-white text-sm px-3 py-1">Your Current Plan</Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          {plan.icon}
                          <h3 className="font-semibold text-lg">{plan.title}</h3>
                        </div>
                        <div className="text-3xl font-bold mb-2">
                          {plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
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
                        {!isCurrentPlan && (
                          <Button 
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            variant={key === 'premium' ? 'default' : 'outline'}
                            className="w-full"
                          >
                            {isLoading ? 'Loading...' : 'Change to This Plan'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Click "Change to This Plan" to modify your subscription through Stripe
              </p>
            </div>

            {/* Storage Add-on */}
            <div className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground mb-1">
                    Need more space? Add 50 GB for just $9.99/month.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expand your storage capacity for more photos, videos, and documents.
                  </p>
                </div>
                <Button
                  onClick={handleAddStorage}
                  disabled={isLoading}
                  className="ml-4"
                >
                  {isLoading ? 'Processing...' : 'Add Storage'}
                </Button>
              </div>
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
              {subscriptionStatus.plan_status === 'canceling' 
                ? "Your subscription is scheduled to cancel at the end of your billing period"
                : "Cancel your subscription - you'll have access until the end of your billing period"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionStatus.plan_status === 'canceling' ? (
                <>
                  <Alert className="border-orange-300 bg-orange-100">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800">Subscription Ending Soon</AlertTitle>
                    <AlertDescription className="text-orange-700">
                      Your subscription is set to cancel. You'll retain access until{' '}
                      {subscriptionStatus.subscription_end 
                        ? new Date(subscriptionStatus.subscription_end).toLocaleDateString()
                        : 'the end of your billing period'
                      }.
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
                  <p className="text-sm text-muted-foreground">
                    Once you cancel, you'll have access to your account until the end of your current billing period. 
                    You can reactivate anytime before your subscription expires.
                  </p>
                  
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
                        <div>
                          <p className="font-medium text-orange-800">Are you sure you want to cancel?</p>
                          <p className="text-sm text-orange-700 mt-1">
                            You can reactivate your account anytime before your subscription expires on{' '}
                            {subscriptionStatus.subscription_end 
                              ? new Date(subscriptionStatus.subscription_end).toLocaleDateString()
                              : 'the end of your billing period'
                            }.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="confirm-cancel" 
                          checked={cancelConfirmed}
                          onCheckedChange={(checked) => setCancelConfirmed(checked === true)}
                        />
                        <label
                          htmlFor="confirm-cancel"
                          className="text-sm text-orange-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I understand I will lose access at the end of my billing period
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
                  
                  {/* Show delete button if approved OR if pending and grace period expired */}
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
    </div>
  );
};

export default SubscriptionTab;
