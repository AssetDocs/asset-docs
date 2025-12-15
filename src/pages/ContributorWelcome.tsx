import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ContributorWelcome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');
  const [contributorRole, setContributorRole] = useState<string>('');

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fetch contributor info
  useEffect(() => {
    const fetchContributorInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get contributor relationship
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, role')
        .eq('contributor_email', user.email)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        setContributorRole(contributorData.role);
        
        // Get owner's name
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', contributorData.account_owner_id)
          .single();

        if (ownerProfile) {
          setOwnerName(`${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim());
        }
      }
    };

    fetchContributorInfo();
  }, []);

  // Check email verification status
  const checkEmailStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Only redirect if user exists AND email is confirmed
    if (user?.email_confirmed_at) {
      toast({
        title: "Email Verified!",
        description: "Redirecting to your dashboard...",
      });
      // Redirect to dashboard for contributors
      navigate('/account');
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkEmailStatus();
    
    // Then check every 3 seconds
    const interval = setInterval(checkEmailStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

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
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&redirect_to=/contributor-welcome`,
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
        <div className="max-w-2xl w-full">
          {/* Welcome Hero */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Account Created Successfully!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Welcome to Asset Safe as a Contributor
              {contributorRole && (
                <span className="block mt-2 text-purple-600 font-medium">
                  Role: {contributorRole.charAt(0).toUpperCase() + contributorRole.slice(1)}
                </span>
              )}
              {ownerName && (
                <span className="block text-sm text-muted-foreground mt-1">
                  on {ownerName}'s account
                </span>
              )}
            </p>
          </div>

          {/* Email Verification Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                Please Verify Your Email
              </span>
            </div>
            <p className="text-center text-yellow-800 dark:text-yellow-200 mb-4">
              We've sent a verification link to your email address. 
              Click the link to verify your email and access your dashboard.
            </p>
            <p className="text-center text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              ⏳ Waiting for email verification...
            </p>
            <div className="flex justify-center">
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

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              📧 Check your inbox (and spam folder) for the verification email.
            </p>
            <p className="mt-2">
              Once verified, you'll be automatically redirected to the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorWelcome;
