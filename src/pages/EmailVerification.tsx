import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/account`
          }
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Verification Email Resent",
          description: "Please check your email for the verification link.",
        });
      } else {
        throw new Error("No user session found");
      }
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/auth" 
            className="inline-flex items-center text-brand-blue hover:text-brand-blue/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-brand-blue" />
            </div>
            <CardTitle className="text-2xl font-bold text-brand-blue">Check Your Email</CardTitle>
            <CardDescription>
              We've sent you a verification link to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">
                  A verification email has been sent to your email address. 
                  Click the link in the email to verify your account and start using Asset Docs.
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Next Steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the "Verify Your Email" button in the email</li>
                  <li>You'll be redirected back to Asset Docs</li>
                  <li>Start documenting your valuable assets!</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> If you don't see the email, check your spam or junk folder. 
                  The verification link expires in 24 hours.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Having trouble? Contact us at{' '}
                <a 
                  href="mailto:info@assetdocs.net" 
                  className="text-brand-blue hover:underline"
                >
                  info@assetdocs.net
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;