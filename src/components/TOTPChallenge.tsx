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
import { useBackupCodes } from '@/hooks/useBackupCodes';
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
  const { status: backupStatus, verifyCode: verifyBackupCode, fetchStatus } = useBackupCodes();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeData, setChallengeData] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Create challenge when dialog opens
  useEffect(() => {
    const initChallenge = async () => {
      if (isOpen && isEnrolled && !challengeData) {
        try {
          const data = await createChallenge();
          setChallengeData(data);
          // Also fetch backup codes status
          fetchStatus();
        } catch (error) {
          console.error('Error creating challenge:', error);
        }
      }
    };
    
    initChallenge();
  }, [isOpen, isEnrolled, challengeData, createChallenge, fetchStatus]);

  const handleVerify = async () => {
    if (!useBackupCode && (code.length !== 6 || !challengeData)) return;
    if (useBackupCode && code.length < 8) return;

    setLoading(true);
    try {
      if (useBackupCode) {
        // Verify using backup code
        const success = await verifyBackupCode(code);
        if (!success) {
          throw new Error('Invalid backup code');
        }
        toast({
          title: "Verified",
          description: "Backup code accepted. Your identity has been confirmed.",
        });
      } else {
        // Verify using TOTP
        await verifyChallenge(
          challengeData!.factorId,
          challengeData!.challengeId,
          code
        );
        toast({
          title: "Verified",
          description: "Your identity has been confirmed.",
        });
      }
      
      onVerified();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: useBackupCode 
          ? "Invalid or already used backup code. Please try again."
          : "Invalid code. Please try again.",
        variant: "destructive",
      });
      
      // Create a new challenge after failed attempt (for TOTP)
      if (!useBackupCode) {
        try {
          const newChallenge = await createChallenge();
          setChallengeData(newChallenge);
        } catch (e) {
          console.error('Error creating new challenge:', e);
        }
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
    setUseBackupCode(false);
    onClose();
  };

  const toggleBackupCode = () => {
    setCode('');
    setUseBackupCode(!useBackupCode);
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
            {useBackupCode 
              ? `Enter a backup recovery code to ${actionDescription}.`
              : `Enter the 6-digit code from your authenticator app to ${actionDescription}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Key className="h-4 w-4" />
            <AlertDescription>
              {useBackupCode 
                ? "Enter one of your backup recovery codes. Each code can only be used once."
                : "Open your authenticator app and enter the current code for Asset Safe."
              }
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="totp-verify">
              {useBackupCode ? "Backup Code" : "Verification Code"}
            </Label>
            <Input
              id="totp-verify"
              type="text"
              placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
              maxLength={useBackupCode ? 9 : 6}
              value={code}
              onChange={(e) => {
                if (useBackupCode) {
                  // Allow alphanumeric and dash for backup codes
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
                } else {
                  // Only digits for TOTP
                  setCode(e.target.value.replace(/\D/g, ''));
                }
              }}
              className="text-center text-2xl tracking-widest font-mono"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || (useBackupCode ? code.length < 8 : (code.length !== 6 || !challengeData))}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Verify & Continue
          </Button>

          {/* Toggle backup code option */}
          {backupStatus?.hasBackupCodes && (
            <Button 
              variant="ghost" 
              onClick={toggleBackupCode}
              className="w-full text-sm"
            >
              {useBackupCode 
                ? "Use authenticator app instead" 
                : "Lost access? Use a backup code"
              }
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TOTPChallenge;
