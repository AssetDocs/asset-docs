import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Phone, Lock, CheckCircle, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const VerifyPhone: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user already has verified phone
  useEffect(() => {
    const checkPhoneVerification = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_verified, phone')
        .eq('user_id', user.id)
        .single();

      if (profile?.phone_verified) {
        setIsVerified(true);
        if (profile?.phone) setPhone(profile.phone);
      } else if (profile?.phone) {
        setPhone(profile.phone);
      }
    };

    checkPhoneVerification();
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const getE164Phone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return `+${digits}`;
  };

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const e164Phone = getE164Phone(phone);
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: e164Phone }
      });

      if (error) throw error;

      if (data?.success) {
        setStep('otp');
        setResendCooldown(60);
        toast({
          title: "Code Sent",
          description: "A verification code has been sent to your phone.",
        });
      } else {
        throw new Error(data?.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code sent to your phone.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const e164Phone = getE164Phone(phone);
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: e164Phone, code: otp }
      });

      if (error) throw error;

      if (data?.valid) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            phone: e164Phone,
            phone_verified: true,
            phone_verified_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) throw updateError;

        setIsVerified(true);
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been verified successfully.",
        });
      } else {
        throw new Error('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                {isVerified ? 'Phone Verified' : 'Set Up Phone Verification'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isVerified 
                  ? 'Your phone is verified for secure vault access'
                  : 'Optional: Add your phone for faster access to sensitive features'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isVerified ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <p className="text-green-700 font-medium">
                    Phone number verified: {phone}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    You can now access the Secure Vault and other sensitive features with SMS verification.
                  </p>
                  <Button onClick={() => navigate('/account')} className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800 ml-2">
                      <strong>This step is optional.</strong>
                      <p className="mt-1 text-sm">
                        Phone verification is only required when accessing sensitive features like the Secure Vault, Legacy Locker, or changing billing information.
                      </p>
                    </AlertDescription>
                  </Alert>

                  {step === 'phone' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Mobile Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                            className="pl-10 text-lg"
                            maxLength={14}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll send a 6-digit verification code via SMS
                        </p>
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                        disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                      >
                        {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => navigate('/account')}
                        className="w-full"
                      >
                        Skip for Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Code sent to <strong>{phone}</strong>
                        </p>
                        <button
                          onClick={() => setStep('phone')}
                          className="text-sm text-primary hover:underline mt-1"
                        >
                          Change number
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Enter Verification Code
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="pl-10 text-lg text-center tracking-widest font-mono"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleVerifyOTP}
                        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? 'Verifying...' : 'Verify Phone'}
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={handleSendOTP}
                          disabled={resendCooldown > 0 || isLoading}
                          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                        >
                          {resendCooldown > 0 
                            ? `Resend code in ${resendCooldown}s` 
                            : "Didn't receive a code? Resend"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Trust Badges */}
              <div className="flex justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>GDPR Compliant</span>
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

export default VerifyPhone;
