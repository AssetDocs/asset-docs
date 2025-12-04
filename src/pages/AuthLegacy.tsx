import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormData {
  email: string;
  password: string;
  giftCode?: string;
  remember?: boolean;
}

const Auth: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [isContributorMode, setIsContributorMode] = useState(false);
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorFirstName, setContributorFirstName] = useState('');
  const [contributorLastName, setContributorLastName] = useState('');
  const [contributorPassword, setContributorPassword] = useState('');
  const [contributorConfirmPassword, setContributorConfirmPassword] = useState('');

  const signInForm = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
      giftCode: '',
      remember: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  // Pre-fill gift code from URL parameter and check for contributor mode
  useEffect(() => {
    const codeFromUrl = searchParams.get('giftCode');
    const mode = searchParams.get('mode');
    const email = searchParams.get('email');
    
    if (codeFromUrl) {
      setGiftCode(codeFromUrl);
      signInForm.setValue('giftCode', codeFromUrl);
    }
    
    if (mode === 'contributor' && email) {
      setIsContributorMode(true);
      setContributorEmail(email);
    }
  }, [searchParams, signInForm]);

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
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
          navigate('/email-verification');
        } else {
          throw error;
        }
      } else {
        // If this is a contributor login, accept pending invitations
        if (isContributorMode) {
          try {
            const { data: session } = await supabase.auth.getSession();
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

    setIsLoading(true);
    try {
      const { error } = await signUp(contributorEmail, contributorPassword, contributorFirstName.trim(), contributorLastName.trim());
      
      if (error) {
        throw error;
      }

      // Wait for session to be established before accepting invitation
      const waitForSession = async (maxAttempts = 5) => {
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          const { data: session } = await supabase.auth.getSession();
          
          if (session?.session?.access_token) {
            console.log('Session established, accepting invitation...');
            return session.session.access_token;
          }
          console.log(`Waiting for session... attempt ${i + 1}/${maxAttempts}`);
        }
        return null;
      };

      // After successful signup, wait for session and accept the contributor invitation
      try {
        const accessToken = await waitForSession();
        
        if (accessToken) {
          const { data: invitationData, error: inviteError } = await supabase.functions.invoke(
            'accept-contributor-invitation',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          
          if (inviteError) {
            console.error('Invitation acceptance error:', inviteError);
            throw inviteError;
          }
          
          if (invitationData?.invitations?.length > 0) {
            toast({
              title: "Account Created!",
              description: `Your contributor account has been created. You now have access to ${invitationData.invitations.length} account(s).`,
            });
          } else {
            toast({
              title: "Account Created!",
              description: "Your contributor account has been created. You now have access to the dashboard.",
            });
          }
        } else {
          console.error('Failed to establish session after signup');
          toast({
            title: "Account Created",
            description: "Please sign in again to complete the process.",
          });
          setIsContributorMode(false);
          return;
        }
      } catch (inviteError) {
        console.error('Error accepting contributor invitation:', inviteError);
        toast({
          title: "Setup Incomplete",
          description: "Your account was created, but there was an issue setting up access. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      navigate('/account');
    } catch (error: any) {
      console.error('Contributor signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Contributor password creation form
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
                You've been invited as a contributor. Create your password to access the dashboard.
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

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account & Access Dashboard"}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-brand-blue hover:text-brand-blue/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
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
                   name="giftCode"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Gift Code (Optional)</FormLabel>
                       <FormControl>
                         <Input 
                           type="text"
                           placeholder="GIFT-XXXXXXXXXXXX"
                           value={giftCode}
                           onChange={(e) => {
                             const value = e.target.value.toUpperCase();
                             setGiftCode(value);
                             field.onChange(value);
                           }}
                         />
                       </FormControl>
                       {giftCode && (
                         <p className="text-sm text-green-600 mt-1">
                           🎁 Gift code will be applied after login
                         </p>
                       )}
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
                     <Link to="/signup" className="text-brand-blue hover:underline font-medium">
                       Create one here
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