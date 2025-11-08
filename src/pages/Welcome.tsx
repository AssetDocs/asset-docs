
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Video, BookOpen, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

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

  // Check email verification status
  const checkEmailStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Only redirect if user exists AND email is confirmed
    // This prevents redirecting before the user has verified
    if (user?.email_confirmed_at) {
      navigate('/subscription-success');
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkEmailStatus();
    
    // Then check every 3 seconds
    const interval = setInterval(checkEmailStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

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
              Welcome to Asset Docs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Thank you for taking proactive steps to protect your assets and minimize your risks. 
              You've made an excellent decision for your future security.
            </p>
            <p className="text-lg font-medium text-primary max-w-2xl mx-auto">
              Please check your email to confirm your account and complete the registration process.
            </p>
          </div>

          {/* Email Verification Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6 mb-6">
            <p className="text-center text-yellow-900 dark:text-yellow-100 font-medium">
              ⏳ Checking email verification status...
            </p>
            <p className="text-center text-sm text-yellow-800 dark:text-yellow-200 mt-2">
              Once you verify your email, you'll be automatically redirected to complete your subscription.
            </p>
          </div>

          {/* Resources Info (read-only) */}
          <div className="grid md:grid-cols-2 gap-6 opacity-60">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Video Help Center
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Watch step-by-step tutorials to make the most of Asset Docs features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Resources & Guides
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore our comprehensive library of guides and reference materials.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              📧 <strong>Next Step:</strong> Check your email inbox and click the verification link to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
