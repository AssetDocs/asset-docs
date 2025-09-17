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
  const { user, signIn } = useAuth();

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

  // Pre-fill gift code from URL parameter
  useEffect(() => {
    const codeFromUrl = searchParams.get('giftCode');
    if (codeFromUrl) {
      setGiftCode(codeFromUrl);
      signInForm.setValue('giftCode', codeFromUrl);
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
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
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
              Sign in to your Asset Docs account
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