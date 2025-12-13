import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, AlertCircle } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const email = searchParams.get('email');
  const planType = searchParams.get('plan');
  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  const phone = searchParams.get('phone');
  const heardAbout = searchParams.get('heardAbout');

  useEffect(() => {
    // Simulate email verification process
    const verifyEmail = async () => {
      try {
        // In a real implementation, you would verify a token here
        // For now, we'll just simulate a successful verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsVerified(true);
        setIsVerifying(false);
      } catch (error) {
        setError('Failed to verify email. Please try again.');
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, []);

  const proceedToPayment = () => {
    // Redirect to account settings subscription tab
    navigate('/account/settings?tab=subscription', { replace: true });
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait while we verify your email address.</p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/pricing')}>
                Back to Pricing
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
            <p className="text-muted-foreground mb-8">
              Great! Your email has been verified. Now let's complete your subscription.
            </p>
            
            <Button
              onClick={proceedToPayment}
              size="lg"
              className="w-full max-w-sm"
            >
              Choose Your Plan
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              No long-term contract. Cancel anytime.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyEmail;