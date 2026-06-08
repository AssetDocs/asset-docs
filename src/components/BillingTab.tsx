
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import PaymentHistory from '@/components/PaymentHistory';
import { useOpenCustomerPortal } from '@/hooks/useOpenCustomerPortal';

const BillingTab: React.FC = () => {
  const { open: handleManageBilling, loading: isLoading } = useOpenCustomerPortal({ newTab: true });


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
