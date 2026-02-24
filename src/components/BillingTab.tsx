
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
          <Button
            onClick={handleManageBilling}
            disabled={isLoading}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoading ? 'Opening...' : 'Manage Payment Methods'}
          </Button>
        </CardContent>
      </Card>

      <PaymentHistory />
    </div>
  );
};

export default BillingTab;
