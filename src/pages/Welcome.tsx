import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Video, BookOpen, CheckCircle2, RefreshCw, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  
  // Get gift code from URL if present
  const giftCode = searchParams.get('giftCode');

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    };

    window.history.pushState(null, '', window.location.pathname + window.location.search);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Validate lifetime gift code and activate subscription
  const validateGiftCode = async (userId: string) => {
    if (!giftCode) return false;
    
    setIsValidatingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-lifetime-code', {
        body: { code: giftCode, user_id: userId }
      });

      if (error) {
        console.error('Gift code validation error:', error);
        return false;
      }

      if (data?.success) {
        toast({
          title: "🎁 Gift Code Applied!",
          description: "You now have lifetime access to Asset Safe. Welcome!",
        });
        return true;
      } else {
        // Code was invalid, but don't show error - just proceed to pricing
        console.log('Gift code invalid or expired:', data?.error);
        return false;
      }
    } catch (err) {
      console.error('Error validating gift code:', err);
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Check email verification status
  const checkEmailStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Only redirect if user exists AND email is confirmed
    if (user?.email_confirmed_at) {
      // If gift code present, validate it first
      if (giftCode) {
        const isValid = await validateGiftCode(user.id);
        if (isValid) {
          // Gift code valid - redirect to dashboard directly
          navigate('/account');
          return;
        }
      }
      // Redirect to pricing to choose a plan
      navigate('/pricing');
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkEmailStatus();
    
    // Then check every 3 seconds
    const interval = setInterval(checkEmailStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate, giftCode]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: "Error",
          description: "Could not find your email address. Please try signing up again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&redirect_to=/welcome${giftCode ? `?giftCode=${encodeURIComponent(giftCode)}` : ''}`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the new verification link.",
      });
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Could not resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-4xl w-full">
          {/* Welcome Hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to Asset Safe
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Thank you for taking proactive steps to protect your assets and minimize your risks. 
              You've made an excellent decision for your future security.
            </p>
            <p className="text-lg font-medium text-primary max-w-2xl mx-auto">
              Please check your email to confirm your account and complete the registration process.
            </p>
          </div>

          {/* Gift Code Notice */}
          {giftCode && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-900 dark:text-green-100 font-medium">
                <Gift className="w-5 h-5" />
                <span>Gift Code: {giftCode}</span>
              </div>
              <p className="text-center text-sm text-green-800 dark:text-green-200 mt-2">
                {isValidatingCode 
                  ? "Validating your gift code..." 
                  : "Your gift code will be applied after email verification."}
              </p>
            </div>
          )}

          {/* Email Verification Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6 mb-6">
            <p className="text-center text-yellow-900 dark:text-yellow-100 font-medium">
              ⏳ Checking email verification status...
            </p>
            <p className="text-center text-sm text-yellow-800 dark:text-yellow-200 mt-2">
              {giftCode 
                ? "Once you verify your email, your gift code will be applied and you'll have instant access."
                : "Once you verify your email, you'll be automatically redirected to complete your subscription."}
            </p>
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className="border-yellow-500 text-yellow-800 hover:bg-yellow-100 dark:text-yellow-200 dark:hover:bg-yellow-800/30"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;
