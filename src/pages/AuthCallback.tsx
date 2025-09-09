import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const redirect_to = searchParams.get('redirect_to');

        if (!token_hash || !type) {
          throw new Error('Invalid callback parameters');
        }

        console.log('Processing auth callback:', { type, redirect_to });

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          console.error('Auth callback error:', error);
          throw error;
        }

        console.log('Auth callback successful:', data);

        // Show success message based on the type
        switch (type) {
          case 'signup':
          case 'email_change_confirm_new':
            toast({
              title: "Email Verified!",
              description: "Your email has been successfully verified. Welcome to Asset Docs!",
            });
            break;
          case 'recovery':
            toast({
              title: "Password Reset",
              description: "You can now set a new password for your account.",
            });
            break;
          case 'magiclink':
            toast({
              title: "Signed In!",
              description: "You've been successfully signed in with your magic link.",
            });
            break;
        }

        // Redirect to the specified URL or default to account
        const redirectUrl = redirect_to || '/account';
        navigate(redirectUrl, { replace: true });

      } catch (error: any) {
        console.error('Auth callback failed:', error);
        
        toast({
          title: "Authentication Error",
          description: error.message || "There was an error processing your request.",
          variant: "destructive",
        });

        // Redirect to auth page on error
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-foreground">Processing Authentication...</h2>
          <p className="text-muted-foreground">Please wait while we verify your request.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;