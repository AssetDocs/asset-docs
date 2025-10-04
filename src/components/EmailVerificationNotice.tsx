import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignInFormData {
  email: string;
  password: string;
}

const EmailVerificationNotice: React.FC = () => {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show the notice if user exists but email is not verified
  if (!user || user.email_confirmed_at) {
    return null;
  }

  console.log('EmailVerificationNotice: User exists but email not verified', { user, email_confirmed_at: user.email_confirmed_at });

  const signInForm = useForm<SignInFormData>({
    defaultValues: {
      email: user.email || '',
      password: '',
    },
  });

  const onSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid Credentials",
            description: "The password you entered is incorrect. Please try again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome Back!",
          description: "Please complete your subscription to continue.",
        });
        navigate('/complete-pricing');
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 sm:p-8 z-50 backdrop-blur-sm">
      <Card className="w-full max-w-5xl h-auto max-h-[95vh] overflow-y-auto bg-white shadow-2xl border-4 border-orange-500">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Mail className="h-12 w-12 text-orange-500" />
            <CheckCircle className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-orange-800 mb-2">
            Verify Your Email & Complete Setup
          </CardTitle>
          <p className="text-lg text-orange-600 mt-2">
            Action Required to Continue
          </p>
        </CardHeader>
        <CardContent className="space-y-8 px-6 sm:px-8 pb-8">
          {/* Email Verification Notice */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-orange-800 mb-4">
              📧 Check your inbox to verify your email address
            </h3>
            <p className="text-orange-700 text-base sm:text-lg mb-3">
              Once verified, sign in below to complete your subscription. 
              Please check your email and click the verification link first.
            </p>
            <p className="text-orange-600 text-sm sm:text-base font-medium">
              ⚠️ Don't see the email? Check your spam folder or contact support.
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border-2 border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-6">
              After verifying your email, sign in to continue:
            </h4>
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          disabled
                          className="bg-gray-50"
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In & Complete Subscription'}
                  </Button>
               </form>
             </Form>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationNotice;