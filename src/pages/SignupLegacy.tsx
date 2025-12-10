import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp } = useAuth();

  const signUpForm = useForm<SignUpFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const onSignUp = async (data: SignUpFormData) => {
    setEmailExistsError(false);
    
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.firstName, data.lastName);

      if (error) {
        // Check for various Supabase "user already exists" error variations
        const errorMsg = error.message?.toLowerCase() || '';
        if (
          errorMsg.includes('user already registered') || 
          errorMsg.includes('already been registered') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('email already') ||
          error.message?.includes('duplicate key') ||
          error.message?.includes('unique constraint')
        ) {
          setEmailExistsError(true);
        } else {
          throw error;
        }
      } else {
        // Redirect to welcome page with email verification notice
        navigate('/welcome');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold text-brand-blue">Create Your Account</CardTitle>
            <CardDescription>
              Join Asset Docs to protect your property documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailExistsError && (
              <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">
                  An Asset Safe account already exists with this email
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
                  To protect your information, we don't create duplicate accounts.
                  Please sign in or reset your password to regain access.
                </AlertDescription>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button asChild variant="default" className="bg-brand-blue hover:bg-brand-blue/90">
                    <Link to="/login">Sign In Instead</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/forgot-password">Reset Password</Link>
                  </Button>
                </div>
              </Alert>
            )}
            
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="firstName"
                    rules={{ required: "First name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signUpForm.control}
                    name="lastName"
                    rules={{ required: "Last name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={signUpForm.control}
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
                  control={signUpForm.control}
                  name="password"
                  rules={{ 
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    },
                    validate: {
                      hasUppercase: (value) => /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                      hasLowercase: (value) => /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                      hasSpecialChar: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
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
                      <div className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters with uppercase, lowercase, and special character
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  rules={{ required: "Please confirm your password" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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
                  control={signUpForm.control}
                  name="acceptTerms"
                  rules={{ required: "You must accept the terms and conditions" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          By clicking continue, you agree to the Asset Safe{' '}
                          <Link to="/terms" className="text-brand-blue hover:underline">
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/legal" className="text-brand-blue hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit" 
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>


                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-blue hover:underline font-medium">
                      Sign in here
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

export default Signup;