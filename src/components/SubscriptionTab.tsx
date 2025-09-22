
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ExternalLink, CreditCard, Shield, Star, Zap, Trash2 } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

// Plan configurations
const planConfigs = {
  basic: {
    title: "Basic",
    price: "$8.99",
    description: "Perfect for individuals with basic documentation needs",
    features: [
      "1 property",
      "10GB secure cloud storage", 
      "Photo uploads",
      "Web platform access",
      "Email support",
      "30-day free trial"
    ],
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    recommended: false
  },
  standard: {
    title: "Standard", 
    price: "$12.99",
    description: "Our most popular plan for comprehensive home documentation",
    features: [
      "Up to 3 properties",
      "25GB secure cloud storage",
      "Photo and video uploads", 
      "Export detailed reports",
      "Priority email support",
      "Share with 2 trusted contacts",
      "30-day free trial"
    ],
    icon: <Zap className="h-6 w-6 text-orange-600" />,
    recommended: true
  },
  premium: {
    title: "Premium",
    price: "$18.99", 
    description: "Best suited for estate managers, multiple-property owners, or businesses",
    features: [
      "Up to 10 properties",
      "100GB secure cloud storage",
      "Priority email and phone support",
      "Share with 5 trusted contacts",
      "30-day free trial"
    ],
    icon: <Star className="h-6 w-6 text-purple-600" />,
    recommended: false
  }
};

const SubscriptionTab: React.FC = () => {
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof planConfigs>('standard');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  }>({ subscribed: false });

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
    }
  }, [user]);

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
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User information not found. Please try logging out and back in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: selectedPlan,
          firstName: profile.first_name || user.user_metadata?.first_name || '',
          lastName: profile.last_name || user.user_metadata?.last_name || '',
          email: user.email,
          phone: user.user_metadata?.phone || '',
          heardAbout: 'existing-user'
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
      // Delete user's data first
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        throw deleteError;
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
                    } ${plan.recommended ? 'border-2 border-brand-orange' : ''}`}
                    onClick={() => setSelectedPlan(key as keyof typeof planConfigs)}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-medium">
                          Recommended
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      {plan.icon}
                      <h3 className="font-semibold">{plan.title}</h3>
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, index) => (
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
      </div>
    );
  }

  // If user is subscribed, show subscription management
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-green-700">
                    {subscriptionStatus.subscription_tier} Plan
                  </h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <p className="text-gray-600">
                  {subscriptionStatus.subscription_tier === 'basic' && '$8.99/month'}
                  {subscriptionStatus.subscription_tier === 'standard' && '$12.99/month'}
                  {subscriptionStatus.subscription_tier === 'premium' && '$18.99/month'}
                </p>
                {subscriptionStatus.subscription_end && (
                  <p className="text-sm text-gray-500">
                    Next billing: {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Manage'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {subscriptionStatus.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Manage your billing and subscription settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Open Billing Portal'}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Update payment methods, view invoices, and manage your subscription
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Section */}
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
              Once you delete your account, there is no going back. This action cannot be undone.
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? You will no longer be able to login and access your dashboard or its contents. All your data will be permanently removed and this action cannot be undone."
      />
    </div>
  );
};

export default SubscriptionTab;
