
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  // Get redirect URL from params (e.g., for gift code users)
  const redirectTo = searchParams.get('redirect') || '/account';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setLoginError(true);
      } else {
        // Check for pending contributor invitations
        const isContributorInvite = searchParams.get('contributor_invite') === 'true';
        
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
                title: "Welcome!",
                description: `You now have access to ${invitationData.invitations.length} account(s).`,
              });
            } else if (!isContributorInvite) {
              toast({
                title: "Login Successful",
                description: "Welcome back!",
              });
            }
          }
        } catch (inviteError) {
          console.error('Error checking contributor invitations:', inviteError);
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
        }
        
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Welcome</h1>
            <p className="text-gray-600">
              Create an account to access your dashboard
            </p>
          </div>
          
          {loginError && (
            <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">
                Unable to Sign In
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
                We couldn't sign you in with those credentials. Double-check your email and password, or reset your password if you've forgotten it.
              </AlertDescription>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/forgot-password">Reset Password</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                className="input-field" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-brand-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="•••••••••" 
                  className="input-field pr-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-brand-orange border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me for 30 days
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
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
          
          {/* Subscription Promotion Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Ready for Full Access?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you ready to access all of the features Asset Safe has to offer? 
                Click here to subscribe and activate your account.
              </p>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/pricing">View Subscription Plans</Link>
              </Button>
            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
