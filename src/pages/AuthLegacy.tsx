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
  const [contributorFirstName, setContributorFirstName] = useState('');
  const [contributorLastName, setContributorLastName] = useState('');
  const [contributorPassword, setContributorPassword] = useState('');
  const [contributorConfirmPassword, setContributorConfirmPassword] = useState('');

  const signInForm = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  // Check for contributor mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    const email = searchParams.get('email');
    
    if (mode === 'contributor' && email) {
      setIsContributorMode(true);
      setContributorEmail(email);
    }
  }, [searchParams]);

  // Redirect if already logged in (but not if in contributor mode with different email)
  useEffect(() => {
    if (user && !isContributorMode) {
      navigate('/account');
    }
    // If logged in user's email matches contributor email, redirect to account
    if (user && isContributorMode && user.email?.toLowerCase() === contributorEmail.toLowerCase()) {
      navigate('/account');
    }
  }, [user, navigate, isContributorMode, contributorEmail]);

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
        // Get current session for API calls
        const { data: session } = await supabase.auth.getSession();
        
        // If this is a contributor login, accept pending invitations
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

    setIsLoading(true);
    try {
      // For contributors, we sign up directly without email verification redirect
      // since they were already invited via email (email is pre-validated)
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: contributorEmail,
        password: contributorPassword,
        options: {
          data: {
            first_name: contributorFirstName.trim(),
            last_name: contributorLastName.trim()
          }
        }
      });
      
      if (error) {
        // Check if user already exists
        if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setIsContributorMode(false);
          signInForm.setValue('email', contributorEmail);
          return;
        }
        throw error;
      }

      // If signup created a session directly (email confirmation disabled), use it
      if (signUpData?.session?.access_token) {
        console.log('Session created directly after signup, accepting invitation...');
        
        const { data: invitationData, error: inviteError } = await supabase.functions.invoke(
          'accept-contributor-invitation',
          {
            headers: {
              Authorization: `Bearer ${signUpData.session.access_token}`
            }
          }
        );
        
        if (inviteError) {
          console.error('Invitation acceptance error:', inviteError);
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
        
        navigate('/account');
        return;
      }
      
      // If email confirmation is required, user will need to verify first
      // But since contributor was invited via email, we can try signing in directly
      // This handles the case where Supabase's "Confirm email" is disabled
      
      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to sign in with the credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: contributorEmail,
        password: contributorPassword
      });
      
      if (signInError) {
        // If email confirmation is required, inform user
        if (signInError.message?.includes('Email not confirmed')) {
          toast({
            title: "Please Verify Your Email",
            description: "A verification email has been sent. Please verify your email and then sign in.",
          });
          setIsContributorMode(false);
          signInForm.setValue('email', contributorEmail);
          return;
        }
        throw signInError;
      }
      
      if (signInData?.session?.access_token) {
        console.log('Signed in after signup, accepting invitation...');
        
        const { data: invitationData, error: inviteError } = await supabase.functions.invoke(
          'accept-contributor-invitation',
          {
            headers: {
              Authorization: `Bearer ${signInData.session.access_token}`
            }
          }
        );
        
        if (inviteError) {
          console.error('Invitation acceptance error:', inviteError);
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
        
        navigate('/account');
      } else {
        toast({
          title: "Account Created",
          description: "Please sign in to complete the process.",
        });
        setIsContributorMode(false);
        signInForm.setValue('email', contributorEmail);
      }
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background image with blur and gradient overlay */}
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
      {/* Blue gradient overlay similar to hero section */}
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
                src="/lovable-uploads/390b9c27-b850-4840-b6dd-ac89f59276df.png" 
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