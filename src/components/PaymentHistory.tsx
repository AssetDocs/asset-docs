import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Receipt, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  type: string;
  last4: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  created: number;
  paymentMethod: PaymentMethod | null;
  subscriptionType: string;
  status: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { toast } = useToast();

  const handleViewFullHistory = async () => {
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('payment-history');
      
      if (error) {
        throw error;
      }

      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPaymentMethod = (paymentMethod: PaymentMethod | null) => {
    if (!paymentMethod) return 'Unknown';
    return `${paymentMethod.type} •••• •••• •••• ${paymentMethod.last4}`;
  };

  const getSubscriptionBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium':
        return 'default';
      case 'standard':
        return 'secondary';
      case 'basic':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Loading payment history...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          View your recent subscription payments and billing details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment history found</p>
            <p className="text-sm mb-4">Payments will appear here once you subscribe</p>
            <Button
              variant="outline"
              onClick={handleViewFullHistory}
              disabled={isPortalLoading}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isPortalLoading ? 'Loading...' : 'View Full Billing History in Stripe'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </span>
                      <Badge variant={getSubscriptionBadgeVariant(payment.subscriptionType)}>
                        {payment.subscriptionType.charAt(0).toUpperCase() + payment.subscriptionType.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPaymentMethod(payment.paymentMethod)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatDate(payment.created)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {payment.status === 'succeeded' ? 'Completed' : payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {payments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleViewFullHistory}
              disabled={isPortalLoading}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isPortalLoading ? 'Loading...' : 'View Full Billing History in Stripe'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;