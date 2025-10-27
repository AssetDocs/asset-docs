import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RateLimiter from '@/utils/rateLimiter';
import SecureStorage from '@/utils/secureStorage';

interface AdminPasswordGateProps {
  onPasswordCorrect: () => void;
}

const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = 'admin_password';
    if (RateLimiter.isRateLimited(rateLimitKey, 'verify', 5, 15)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 15 minutes before trying again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-password', {
        body: { password }
      });

      if (error) throw error;

      if (data.valid) {
        // Clear rate limit on success
        RateLimiter.clearRateLimit(rateLimitKey, 'verify');
        
        // Set temporary admin access (expires in 24 hours)
        await SecureStorage.setItem('admin_access', 'granted', 24);
        
        toast({
          title: "Access granted",
          description: "Welcome to the admin panel.",
        });
        
        onPasswordCorrect();
      } else {
        // Record failed attempt
        RateLimiter.recordAttempt(rateLimitKey, 'verify', 5, 15);
        
        toast({
          title: "Access denied",
          description: "Invalid password. Please try again.",
          variant: "destructive",
        });
        setPassword('');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            This area is password protected. Please enter the admin password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPasswordGate;
