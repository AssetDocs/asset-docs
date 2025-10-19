
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentHistory from '@/components/PaymentHistory';
import { supabase } from '@/integrations/supabase/client';

const BillingTab: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
          <CardTitle>Billing & Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods, billing address, and view invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Manage Through Stripe</h4>
            <p className="text-sm text-blue-800 mb-4">
              Update your payment methods, billing address, and view your payment history through our secure Stripe billing portal.
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Update credit card information
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Change billing address
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Download invoices and receipts
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                View complete payment history
              </li>
            </ul>
            <Button 
              onClick={handleManageBilling}
              disabled={isLoading}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Open Billing Portal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PaymentHistory />
    </div>
  );
};

export default BillingTab;
