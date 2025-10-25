import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

export const StripeTestPanel = () => {
  const { user } = useAuth();
  const { subscriptionStatus, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runStripeTests = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run Stripe tests",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResults([]);
    const results: any[] = [];

    // Test 1: Check subscription status
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      results.push({
        test: 'Subscription Status Check',
        status: error ? 'failed' : 'passed',
        data: data || error,
        details: error ? `Error: ${error.message}` : `Subscription: ${data?.subscribed ? 'Active' : 'Inactive'}`
      });
    } catch (error) {
      results.push({
        test: 'Subscription Status Check',
        status: 'failed',
        data: null,
        details: `Error: ${error.message}`
      });
    }

    // Test 2: Customer portal access
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      results.push({
        test: 'Customer Portal Access',
        status: error ? 'failed' : 'passed',
        data: data || error,
        details: error ? `Error: ${error.message}` : 'Portal URL generated successfully'
      });
    } catch (error) {
      results.push({
        test: 'Customer Portal Access',
        status: 'failed',
        data: null,
        details: `Error: ${error.message}`
      });
    }

    // Test 3: Payment history retrieval
    try {
      const { data, error } = await supabase.functions.invoke('payment-history');
      results.push({
        test: 'Payment History Retrieval',
        status: error ? 'failed' : 'passed',
        data: data || error,
        details: error ? `Error: ${error.message}` : `Found ${data?.length || 0} payment records`
      });
    } catch (error) {
      results.push({
        test: 'Payment History Retrieval',
        status: 'failed',
        data: null,
        details: `Error: ${error.message}`
      });
    }

    // Test 4: Standard checkout session creation (without completing payment)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType: 'standard' }
      });
      results.push({
        test: 'Checkout Session Creation',
        status: error ? 'failed' : 'passed',
        data: data || error,
        details: error ? `Error: ${error.message}` : 'Checkout session created successfully'
      });
    } catch (error) {
      results.push({
        test: 'Checkout Session Creation',
        status: 'failed',
        data: null,
        details: `Error: ${error.message}`
      });
    }

    setTestResults(results);
    setTesting(false);

    // Refresh subscription after tests
    await refreshSubscription();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="secondary" className="bg-success/10 text-success">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Stripe Integration Test Panel</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">User:</span> {user?.email || 'Not logged in'}
          </div>
          <div>
            <span className="font-medium">Subscription:</span> {subscriptionStatus.subscribed ? 'Active' : 'Inactive'}
          </div>
          <div>
            <span className="font-medium">Tier:</span> {subscriptionStatus.subscription_tier || 'None'}
          </div>
          <div>
            <span className="font-medium">Trial:</span> {subscriptionStatus.is_trial ? 'Yes' : 'No'}
          </div>
        </div>

        <Button 
          onClick={runStripeTests} 
          disabled={testing || !user}
          className="w-full"
        >
          {testing ? 'Running Tests...' : 'Run Stripe Integration Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.details}</p>
                  {result.data && result.status === 'failed' && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="mb-2">Test checklist:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>✓ Subscription status checking</li>
            <li>✓ Customer portal URL generation</li>
            <li>✓ Payment history retrieval</li>
            <li>✓ Checkout session creation</li>
            <li>• Webhook processing (requires actual Stripe events)</li>
            <li>• End-to-end payment flow (manual test with test cards)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};