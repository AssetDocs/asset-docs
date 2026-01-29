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
import { Shield, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { useTOTP } from '@/hooks/useTOTP';
import { useToast } from '@/hooks/use-toast';
import TOTPSetup from './TOTPSetup';

interface TOTPChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionDescription?: string;
}

const TOTPChallenge: React.FC<TOTPChallengeProps> = ({
  isOpen,
  onClose,
  onVerified,
  actionDescription = "access this feature"
}) => {
  const { toast } = useToast();
  const { isEnrolled, isLoading: factorsLoading, createChallenge, verifyChallenge, refetch } = useTOTP();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeData, setChallengeData] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Create challenge when dialog opens
  useEffect(() => {
    const initChallenge = async () => {
      if (isOpen && isEnrolled && !challengeData) {
        try {
          const data = await createChallenge();
          setChallengeData(data);
        } catch (error) {
          console.error('Error creating challenge:', error);
        }
      }
    };
    
    initChallenge();
  }, [isOpen, isEnrolled, challengeData, createChallenge]);

  const handleVerify = async () => {
    if (code.length !== 6 || !challengeData) return;

    setLoading(true);
    try {
      await verifyChallenge(
        challengeData.factorId,
        challengeData.challengeId,
        code
      );
      
      toast({
        title: "Verified",
        description: "Your identity has been confirmed.",
      });
      
      onVerified();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
      
      // Create a new challenge after failed attempt
      try {
        const newChallenge = await createChallenge();
        setChallengeData(newChallenge);
      } catch (e) {
        console.error('Error creating new challenge:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    setShowSetup(false);
    await refetch();
    // After setup, user needs to verify to continue
    try {
      const data = await createChallenge();
      setChallengeData(data);
    } catch (error) {
      console.error('Error creating challenge after setup:', error);
    }
  };

  const handleClose = () => {
    setCode('');
    setChallengeData(null);
    onClose();
  };

  // Show loading state
  if (factorsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show setup flow if not enrolled
  if (!isEnrolled) {
    return (
      <>
        <Dialog open={isOpen && !showSetup} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Two-Factor Authentication Required
              </DialogTitle>
              <DialogDescription>
                You need to set up two-factor authentication to {actionDescription}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  For your security, sensitive features require two-factor authentication. 
                  This protects your account even if your password is compromised.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>You'll need an authenticator app like:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Google Authenticator</li>
                  <li>Authy</li>
                  <li>1Password</li>
                  <li>Microsoft Authenticator</li>
                </ul>
              </div>

              <Button onClick={() => setShowSetup(true)} className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Set Up Authenticator
              </Button>

              <Button 
                variant="outline" 
                onClick={async () => {
                  setIsRefetching(true);
                  try {
                    await refetch();
                    // Small delay to ensure state updates
                    setTimeout(() => {
                      setIsRefetching(false);
                      // Check if still not enrolled and show feedback
                      if (!isEnrolled) {
                        toast({
                          title: "No 2FA Found",
                          description: "You haven't set up two-factor authentication for Asset Safe yet. Please tap 'Set Up Authenticator' to connect your app.",
                          variant: "destructive",
                        });
                      }
                    }, 500);
                  } catch (error) {
                    setIsRefetching(false);
                    toast({
                      title: "Error",
                      description: "Could not check your 2FA status. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={isRefetching}
                className="w-full"
              >
                {isRefetching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {isRefetching ? "Checking..." : "I've Already Set Up 2FA"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Only use this if you've previously connected an authenticator app to Asset Safe
              </p>

              <Button variant="ghost" onClick={handleClose} className="w-full">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <TOTPSetup
          isOpen={showSetup}
          onClose={() => setShowSetup(false)}
          onSetupComplete={handleSetupComplete}
        />
      </>
    );
  }

  // Show verification challenge
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Verification
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to {actionDescription}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Key className="h-4 w-4" />
            <AlertDescription>
              Open your authenticator app and enter the current code for Asset Safe.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="totp-verify">Verification Code</Label>
            <Input
              id="totp-verify"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6 || !challengeData}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Verify & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TOTPChallenge;
