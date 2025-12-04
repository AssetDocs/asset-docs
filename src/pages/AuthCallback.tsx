import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

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

        // Check for pending contributor invitations or existing contributor status
        let isContributor = false;
        if (data.session?.access_token) {
          try {
            const { data: invitationData } = await supabase.functions.invoke(
              'accept-contributor-invitation',
              {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`
                }
              }
            );
            
            // Check if user is a contributor (either just accepted or already was)
            isContributor = invitationData?.isContributor === true;
            
            if (invitationData?.invitations?.length > 0) {
              console.log('Accepted contributor invitations:', invitationData.invitations);
              toast({
                title: "Invitation Accepted!",
                description: `You now have access to ${invitationData.invitations.length} account(s).`,
              });
            } else if (isContributor) {
              console.log('User is already a contributor:', invitationData.contributorRelationships);
            }
          } catch (inviteError) {
            console.error('Error checking contributor invitations:', inviteError);
            // Don't block the flow if invitation check fails
          }
        }

        // Show success message based on the type
        if (type === 'signup' || type === 'email_change_confirm_new') {
          // If user is a contributor, skip subscription flow and go directly to dashboard
          if (isContributor) {
            toast({
              title: "Welcome to Asset Safe!",
              description: "Your contributor account is ready. Redirecting to dashboard...",
            });
            navigate('/account', { replace: true });
            return;
          }
          // Show welcome screen for signup (non-contributors)
          setShowWelcome(true);
          setLoading(false);
        } else {
          // For other types, show toast and redirect
          switch (type) {
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

          // Redirect for non-signup types
          if (redirect_to) {
            window.location.href = redirect_to;
          } else {
            navigate('/account', { replace: true });
          }
        }

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

  const handleContinue = () => {
    const planType = sessionStorage.getItem('selectedPlanType') || 'standard';
    sessionStorage.removeItem('selectedPlanType');
    navigate(`/subscription-success?plan=${planType}`, { replace: true });
  };

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

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Asset Safe!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your email has been successfully verified. Thank you for taking proactive steps to protect your assets and minimize your risks.
            </p>
            <p className="text-lg font-medium text-primary">
              You've made an excellent decision for your future security.
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={handleContinue}
            className="text-lg px-8 py-6"
          >
            Continue to Subscription
          </Button>

          <p className="text-sm text-muted-foreground">
            We'll help you choose the perfect plan for your needs
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;