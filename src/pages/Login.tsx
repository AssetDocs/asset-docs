
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [giftCode, setGiftCode] = useState('');

  useEffect(() => {
    // Pre-fill gift code from URL parameter
    const codeFromUrl = searchParams.get('giftCode');
    if (codeFromUrl) {
      setGiftCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic would go here
    console.log('Login form submitted');
    if (giftCode) {
      console.log('Gift code entered:', giftCode);
    }
    // Redirect to account dashboard after successful login
    navigate('/account');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Welcome Back</h1>
            <p className="text-gray-600">
              Sign in to access your secure documentation
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" className="input-field" required />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-brand-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="•••••••••" className="input-field" required />
            </div>
            
            <div>
              <Label htmlFor="giftCode">Gift Code (Optional)</Label>
              <Input 
                id="giftCode" 
                type="text" 
                placeholder="GIFT-XXXXXXXXXXXX" 
                className="input-field" 
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
              />
              {giftCode && (
                <p className="text-sm text-green-600 mt-1">
                  🎁 Gift code will be applied after login
                </p>
              )}
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
            
            <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-blue hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
