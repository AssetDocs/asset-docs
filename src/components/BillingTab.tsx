
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentHistory from '@/components/PaymentHistory';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethodInfo {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

const BillingTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('payment-history');
      
      if (error) throw error;

      // Use payment methods from Stripe API
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleManageBilling = async () => {
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
        description: "Failed to open billing management. Please try again.",
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
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Your saved payment methods for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMethods ? (
            <div className="space-y-3">
              <div className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium capitalize">
                        {method.brand} •••• •••• •••• {method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires {method.exp_month}/{method.exp_year}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    disabled={isLoading}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isLoading}
                className="w-full mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Add or Update Payment Method'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No payment methods on file</p>
              <Button
                onClick={handleManageBilling}
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : 'Add Payment Method'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentHistory />
    </div>
  );
};

export default BillingTab;
