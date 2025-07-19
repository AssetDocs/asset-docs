
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CheckIcon, ExternalLink } from 'lucide-react';

const SubscriptionTab: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
          {subscriptionStatus.subscribed ? (
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
                    {subscriptionStatus.subscription_tier === 'Basic' && '$8.99/month'}
                    {subscriptionStatus.subscription_tier === 'Standard' && '$8.99/month (Introductory pricing)'}
                    {subscriptionStatus.subscription_tier === 'Premium' && '$18.99/month'}
                  </p>
                  {subscriptionStatus.subscription_end && (
                    <p className="text-sm text-gray-500">
                      Next billing: {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                  {subscriptionStatus.subscription_tier === 'Standard' && (
                    <p className="text-xs text-orange-600 font-medium">
                      Regular price $12.99/month after 6 months
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
          ) : (
            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700">No Active Subscription</h3>
                  <p className="text-gray-600">Subscribe to unlock premium features</p>
                </div>
                <Link to="/pricing">
                  <Button>
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Features</CardTitle>
          <CardDescription>
            {subscriptionStatus.subscribed 
              ? `Features included in your ${subscriptionStatus.subscription_tier} plan`
              : 'See what you get with each subscription plan'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Basic Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Up to 5 properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Basic photo storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Property value estimates
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Mobile app access
                </li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Standard Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Up to 20 properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Enhanced storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Premium Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  Unlimited properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  AI-powered insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  24/7 support
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  API access
                </li>
              </ul>
            </div>
          </div>
          
          {!subscriptionStatus.subscribed && (
            <div className="mt-6 text-center">
              <Link to="/pricing">
                <Button size="lg">
                  Choose Your Plan
                </Button>
              </Link>
            </div>
          )}
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
    </div>
  );
};

export default SubscriptionTab;
