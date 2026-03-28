import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormData {
  email: string;
  password: string;
  remember?: boolean;
}

const Auth: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [isContributorMode, setIsContributorMode] = useState(false);
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorToken, setContributorToken] = useState('');
  const [contributorFirstName, setContributorFirstName] = useState('');
  const [contributorLastName, setContributorLastName] = useState('');
  const [contributorPassword, setContributorPassword] = useState('');
  const [contributorConfirmPassword, setContributorConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const signInForm = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  // Handle hash-based auth tokens from Supabase email verification
  useEffect(() => {
    const handleHashAuth = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('Detected hash-based auth tokens, processing...');
        
        try {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session from hash:', error);
              toast({
                title: "Authentication Error",
                description: error.message || "Email link is invalid or expired",
                variant: "destructive",
              });
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
            
            if (data.session) {
              console.log('Session set successfully from hash tokens');
              toast({
                title: "Email Verified!",
                description: "Your email has been verified successfully.",
              });
              
              window.history.replaceState(null, '', window.location.pathname);
              
              if (type === 'signup' || type === 'email') {
                navigate('/pricing', { replace: true });
              } else {
                navigate('/account', { replace: true });
              }
            }
          }
        } catch (error: any) {
          console.error('Error processing hash auth:', error);
          toast({
            title: "Authentication Error", 
            description: error.message || "Failed to verify email",
            variant: "destructive",
          });
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };
    
    handleHashAuth();
  }, [navigate, toast]);

  // Check for contributor mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (mode === 'contributor' && email) {
      setIsContributorMode(true);
      setContributorEmail(email);
      if (token) {
        setContributorToken(token);
      }
    }
  }, [searchParams]);

  // If user is already logged in and NOT in contributor mode, redirect
  useEffect(() => {
    if (user && !isContributorMode) {
      navigate('/account');
    }
  }, [user, navigate, isContributorMode]);

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { data: deletedAccount } = await supabase
        .from('deleted_accounts')
        .select('email')
        .eq('email', data.email.toLowerCase())
        .maybeSingle();
      
      if (deletedAccount) {
        toast({
          title: "Account Not Found",
          description: "There is no account attached to this email. Please try again with a valid email, or sign up for a new account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "The email or password you entered is incorrect. Please try again.",
            variant: "destructive",
          });
        } else if (error.message === 'email_not_verified') {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        const { data: session } = await supabase.auth.getSession();
        
        if (isContributorMode) {
          try {
            if (session?.session?.access_token) {
              const { data: invitationData } = await supabase.functions.invoke(
                'accept-contributor-invitation',
                {
                  headers: {
                    Authorization: `Bearer ${session.session.access_token}`
                  }
                }
              );
              
              if (invitationData?.invitations?.length > 0) {
                toast({
                  title: "Welcome Back!",
                  description: `You've accepted ${invitationData.invitations.length} invitation(s) and now have access to the dashboard.`,
                });
              } else {
                toast({
                  title: "Welcome Back!",
                  description: "You have successfully signed in.",
                });
              }
            }
          } catch (inviteError) {
            console.error('Error accepting contributor invitation:', inviteError);
            toast({
              title: "Welcome Back!",
              description: "You have successfully signed in.",
            });
          }
        } else {
          toast({
            title: "Welcome Back!",
            description: "You have successfully signed in.",
          });
        }
        navigate('/account');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContributorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contributorFirstName.trim() || !contributorLastName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return;
    }
    
    if (contributorPassword !== contributorConfirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (contributorPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!contributorToken) {
      toast({
        title: "Invalid Invitation",
        description: "This invitation link is missing a token. Please ask the account holder to resend your invitation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call complete-contributor-signup edge function (no auth required)
      const { data: signupResult, error: signupError } = await supabase.functions.invoke(
        'complete-contributor-signup',
        {
          body: {
            email: contributorEmail,
            password: contributorPassword,
            first_name: contributorFirstName.trim(),
            last_name: contributorLastName.trim(),
            invite_token: contributorToken,
          },
        }
      );

      if (signupError) {
        throw new Error(signupError.message || 'Failed to complete account setup');
      }

      if (!signupResult?.success) {
        throw new Error(signupResult?.error || 'Failed to complete account setup');
      }

      // Now sign in with the new password
      const { error: signInError } = await signIn(contributorEmail, contributorPassword);

      if (signInError) {
        // Account was created but sign-in failed — tell user to sign in manually
        toast({
          title: "Account Created!",
          description: "Your account has been set up. Please sign in with your new password.",
        });
        setIsContributorMode(false);
        signInForm.setValue('email', contributorEmail);
        return;
      }

      toast({
        title: "Welcome to Asset Safe!",
        description: "Your account is ready. You now have access to the dashboard.",
      });
      navigate('/account');

    } catch (error: any) {
      console.error('Contributor signup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Contributor account creation form
  if (isContributorMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-brand-blue hover:text-brand-blue/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                You've been invited as an authorized user. Set up your account to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContributorSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contributor-first-name" className="text-sm font-medium">First Name</label>
                    <Input
                      id="contributor-first-name"
                      type="text"
                      placeholder="First name"
                      value={contributorFirstName}
                      onChange={(e) => setContributorFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contributor-last-name" className="text-sm font-medium">Last Name</label>
                    <Input
                      id="contributor-last-name"
                      type="text"
                      placeholder="Last name"
                      value={contributorLastName}
                      onChange={(e) => setContributorLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contributor-email" className="text-sm font-medium">Email</label>
                  <Input
                    id="contributor-email"
                    type="email"
                    value={contributorEmail}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contributor-password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      id="contributor-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={contributorPassword}
                      onChange={(e) => setContributorPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contributor-confirm-password" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="contributor-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={contributorConfirmPassword}
                    onChange={(e) => setContributorConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-brand-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" target="_blank" className="text-brand-blue hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !termsAccepted}
                >
                  {isLoading ? "Setting up your account..." : "Create Account & Access Dashboard"}
                </Button>
                
                <div className="text-center mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Already have an account?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsContributorMode(false)}
                  >
                    Sign In Instead
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/login-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-brand-blue/80 via-brand-blue/60 to-brand-blue/40" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/images/asset-safe-logo.png" 
                alt="Asset Safe Logo" 
                className="h-14 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-brand-blue">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Asset Safe account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  rules={{ 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signInForm.control}
                  name="password"
                  rules={{ required: "Password is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                   )}
                 />


                 <FormField
                   control={signInForm.control}
                   name="remember"
                   render={({ field }) => (
                     <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                       <FormControl>
                         <input
                           type="checkbox"
                           className="h-4 w-4 text-brand-orange border-gray-300 rounded"
                           checked={field.value}
                           onChange={field.onChange}
                         />
                       </FormControl>
                       <FormLabel className="text-sm text-gray-600">
                         Remember me for 30 days
                       </FormLabel>
                     </FormItem>
                   )}
                 />
                 
                 <Button 
                   type="submit" 
                   className="w-full bg-brand-blue hover:bg-brand-blue/90"
                   disabled={isLoading}
                 >
                   {isLoading ? 'Signing In...' : 'Sign In'}
                 </Button>

                 <div className="text-center mt-4">
                   <p className="text-sm text-muted-foreground">
                     Don't have an account?{' '}
                     <Link to="/pricing" className="text-brand-blue hover:underline font-medium">
                       Get started today
                     </Link>
                   </p>
                 </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
