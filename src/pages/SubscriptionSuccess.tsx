import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();

  // Refresh subscription status when user lands on this page
  useEffect(() => {
    if (user) {
      const refreshSubscription = async () => {
        try {
          await supabase.functions.invoke('check-subscription');
        } catch (error) {
          console.error('Error refreshing subscription:', error);
        }
      };
      
      // Small delay to ensure Stripe has processed the subscription
      setTimeout(refreshSubscription, 2000);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 bg-secondary/5 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-700">Subscription Successful!</CardTitle>
              <CardDescription className="text-lg">
                Welcome to your new subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your subscription has been successfully activated. You now have access to all the premium features included in your plan.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                  <ul className="text-sm text-green-700 space-y-1 text-left">
                    <li>• Access your account settings to manage your subscription</li>
                    <li>• Start uploading and managing your property photos</li>
                    <li>• Explore the premium features now available to you</li>
                    <li>• Check your email for a confirmation receipt</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/account">
                  <Button size="lg">
                    Manage Subscription
                  </Button>
                </Link>
                <Link to="/photo-upload">
                  <Button variant="outline" size="lg">
                    Start Uploading Photos
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <Link to="/" className="text-primary hover:underline">
                  Return to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubscriptionSuccess;