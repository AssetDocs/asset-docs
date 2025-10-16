import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, PlayCircle, ArrowRight, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

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
      
      // Check if user email is confirmed
      if (user.email_confirmed_at) {
        setEmailVerified(true);
        setShowNextSteps(true);
      }
    }
  }, [user]);

  const handleEmailVerificationComplete = () => {
    setEmailVerified(true);
    setShowNextSteps(true);
  };

  const handleGoToDashboard = () => {
    navigate('/account');
  };

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
                
                {/* Email Verification Step */}
                {!emailVerified && user && !user.email_confirmed_at && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Mail className="h-4 w-4" />
                    <AlertDescription className="text-left">
                      <div className="space-y-3">
                        <div>
                          <strong className="text-blue-800">Important: Check Your Email</strong>
                          <p className="text-blue-700 mt-1">
                            We've sent a verification email to <strong>{user.email}</strong>. 
                            Please check your inbox and click the verification link to complete your account setup.
                          </p>
                        </div>
                        <div className="text-sm text-blue-600">
                          <p>• Check your spam/junk folder if you don't see the email</p>
                          <p>• The verification link will activate your full account access</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleEmailVerificationComplete}
                          className="mt-2"
                        >
                          I've Verified My Email
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Next Steps - Show after email verification or if already verified */}
                {(emailVerified || (user && user.email_confirmed_at) || showNextSteps) && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Welcome to Asset Docs! Here's what to do next:
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Step 1: Dashboard */}
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                              <LayoutDashboard className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-800">Step 1: Access Your Dashboard</h4>
                              <p className="text-sm text-green-700 mt-1">
                                Start by exploring your personal dashboard where you can manage properties, upload photos, and track your assets.
                              </p>
                              <Button 
                                onClick={handleGoToDashboard}
                                className="mt-2 bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Step 2: Video Help */}
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                              <PlayCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-800">Step 2: Watch Video Tutorials</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Get familiar with Asset Docs by watching our comprehensive video guides. Learn how to set up your account, upload photos, and use advanced features.
                              </p>
                              <Link to="/video-help">
                                <Button 
                                  variant="outline" 
                                  className="mt-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                                  size="sm"
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Watch Video Help
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link to="/account">
                        <Button variant="outline" size="lg" className="w-full">
                          Manage Subscription
                        </Button>
                      </Link>
                      <Link to="/photo-upload">
                        <Button variant="outline" size="lg" className="w-full">
                          Start Uploading Photos
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <Link to="/" className="text-primary hover:underline">
                    Return to Home
                  </Link>
                </div>
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