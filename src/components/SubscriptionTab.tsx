
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
import { CheckIcon, ExternalLink, CreditCard, Shield, Star, Zap, Trash2, Clock, AlertTriangle, X, Check } from 'lucide-react';
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
  "30-day free trial",
  "Photo and video uploads",
  "Full web platform access",
  "Voice notes for item details",
  "Post damage documentation",
  "Export detailed reports",
  "Email support",
  "Share with 3 trusted contacts"
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

  // If user is not subscribed, show checkout form
  if (!subscriptionStatus.subscribed) {
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
                  <p className="text-primary font-semibold text-sm">🎉 Start with a 30-day free trial</p>
                  <p className="text-xs text-muted-foreground">No charges until after your trial ends. Cancel anytime.</p>
                </div>
                <Button 
                  onClick={handleStartSubscription}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Start Free Trial & Enter Payment Info'}
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
                      {subscriptionStatus.subscription_tier} Plan
                    </h3>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-600 text-white border-green-700 px-4 py-2 text-sm">Active</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Monthly Price</Label>
                  <p className="text-xl font-bold text-gray-900">
                    {subscriptionStatus.subscription_tier?.toLowerCase() === 'standard' && '$12.99/mo'}
                    {subscriptionStatus.subscription_tier?.toLowerCase() === 'premium' && '$18.99/mo'}
                  </p>
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

            {/* Available Plans */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Available Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(planConfigs).map(([key, plan]) => {
                  const isCurrentPlan = subscriptionStatus.subscription_tier?.toLowerCase() === key;
                  return (
                    <Card key={key} className={isCurrentPlan ? 'border-2 border-green-500 shadow-lg' : 'border-2'}>
                      <CardContent className="pt-6">
                        {isCurrentPlan && (
                          <div className="mb-4">
                            <Badge className="bg-green-600 text-white text-sm px-3 py-1">Current Plan</Badge>
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
