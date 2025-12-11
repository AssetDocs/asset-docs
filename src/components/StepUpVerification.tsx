import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Phone, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StepUpVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionDescription?: string;
}

const StepUpVerification: React.FC<StepUpVerificationProps> = ({
  isOpen,
  onClose,
  onVerified,
  actionDescription = "access this feature"
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [existingPhone, setExistingPhone] = useState<string | null>(null);

  // Check if user already has a verified phone
  useEffect(() => {
    const checkPhoneStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, phone_verified')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.phone_verified && profile?.phone) {
        setPhoneVerified(true);
        setExistingPhone(profile.phone);
        setPhoneNumber(profile.phone);
        // Auto-advance to OTP step if phone is already verified
        setStep('otp');
      } else if (profile?.phone) {
        setPhoneNumber(profile.phone);
      }
    };

    if (isOpen) {
      checkPhoneStatus();
    }
  }, [user, isOpen]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0];
      if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
      return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
    }
    return value;
  };

  // Convert to E.164 format for Twilio
  const getE164Phone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
  };

  const handleSendOTP = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const e164Phone = getE164Phone(phoneNumber);
      
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
        
        // Save phone number to profile if not already saved
        if (!existingPhone) {
          await supabase
            .from('profiles')
            .update({ phone: e164Phone })
            .eq('user_id', user?.id);
        }
      } else {
        throw new Error(data?.error || 'Failed to send code');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const e164Phone = getE164Phone(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: e164Phone, code: otpCode }
      });

      if (error) throw error;

      if (data?.valid) {
        // Mark phone as verified in profile
        await supabase
          .from('profiles')
          .update({ 
            phone_verified: true, 
            phone_verified_at: new Date().toISOString() 
          })
          .eq('user_id', user?.id);

        toast({
          title: "Verified",
          description: "Your identity has been confirmed.",
        });
        
        onVerified();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    handleSendOTP();
  };

  const handleClose = () => {
    setStep(phoneVerified ? 'otp' : 'phone');
    setOtpCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Verification
          </DialogTitle>
          <DialogDescription>
            For your security, we need to verify your identity to {actionDescription}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'phone' && !phoneVerified ? (
            <>
              <Alert className="bg-primary/5 border-primary/20">
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  We'll send a 6-digit code to your phone to verify your identity.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendOTP} 
                disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <Alert className="bg-primary/5 border-primary/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {phoneVerified 
                    ? `Enter the code sent to ${existingPhone || phoneNumber}`
                    : `Enter the 6-digit code sent to your phone.`
                  }
                </AlertDescription>
              </Alert>

              {/* Auto-send OTP for verified phones */}
              {phoneVerified && step === 'otp' && resendCooldown === 0 && (
                <Button 
                  onClick={handleSendOTP} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4 mr-2" />
                  )}
                  Send Verification Code
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button 
                onClick={handleVerifyOTP} 
                disabled={loading || otpCode.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Verify & Continue
              </Button>

              {resendCooldown > 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Resend code in {resendCooldown}s
                </p>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full"
                >
                  Resend Code
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepUpVerification;
