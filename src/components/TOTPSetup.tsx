import React, { useState } from 'react';
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
import { Shield, Smartphone, RefreshCw, CheckCircle, Copy, Key, Download, ExternalLink } from 'lucide-react';
import { useTOTP } from '@/hooks/useTOTP';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface TOTPSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

const TOTPSetup: React.FC<TOTPSetupProps> = ({
  isOpen,
  onClose,
  onSetupComplete,
}) => {
  const { toast } = useToast();
  const { startEnrollment, verifyEnrollment, enrollmentData } = useTOTP();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [otpauthUri, setOtpauthUri] = useState<string>('');

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await startEnrollment();
      if (data) {
        setFactorId(data.id);
        setSecret(data.totp.secret);
        setOtpauthUri(data.totp.uri);
        setStep('qr');
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Could not start authenticator setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || !factorId) return;

    setLoading(true);
    try {
      await verifyEnrollment(factorId, code);
      toast({
        title: "Authenticator Enabled",
        description: "Two-factor authentication is now active on your account.",
      });
      onSetupComplete();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Secret Copied",
      description: "You can paste this into your authenticator app manually.",
    });
  };

  const openInAuthenticatorApp = () => {
    if (otpauthUri) {
      window.location.href = otpauthUri;
    }
  };

  const handleClose = () => {
    setStep('intro');
    setCode('');
    setFactorId(null);
    setSecret('');
    setOtpauthUri('');
    onClose();
  };

  const authenticatorApps = [
    { 
      name: 'Google Authenticator', 
      ios: 'https://apps.apple.com/app/google-authenticator/id388497605',
      android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
    },
    { 
      name: 'Authy', 
      ios: 'https://apps.apple.com/app/authy/id494168017',
      android: 'https://play.google.com/store/apps/details?id=com.authy.authy'
    },
    { 
      name: 'Microsoft Authenticator', 
      ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
      android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator'
    },
  ];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Set Up Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Protect your account with an authenticator app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'intro' && (
            <>
              <Alert className="bg-primary/5 border-primary/20">
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  You'll need an authenticator app on your phone to generate secure codes.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Don't have an authenticator app?</p>
                <p className="text-xs">Download one of these free apps:</p>
                <div className="space-y-2">
                  {authenticatorApps.map((app) => (
                    <a
                      key={app.name}
                      href={isIOS ? app.ios : app.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-foreground text-sm">{app.name}</span>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
                <p className="font-medium text-foreground">How it works:</p>
                <p>
                  Your authenticator app generates a new 6-digit code every 30 seconds. 
                  It's more secure than SMS and works offline.
                </p>
              </div>

              <Button onClick={handleStartSetup} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                I Have an Authenticator App
              </Button>
            </>
          )}

          {step === 'qr' && enrollmentData && (
            <>
              {isMobile ? (
                <>
                  <Alert className="bg-primary/5 border-primary/20">
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Tap the button below to open your authenticator app and add Asset Safe.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={openInAuthenticatorApp} className="w-full" size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Authenticator App
                  </Button>

                  <div className="text-center border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Or enter this code manually in your app:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-xs font-mono break-all max-w-[200px]">
                        {secret}
                      </code>
                      <Button variant="ghost" size="icon" onClick={copySecret}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Alert className="bg-primary/5 border-primary/20">
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Open your authenticator app and scan this QR code with your phone's camera.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={enrollmentData.totp.qr_code} 
                      alt="TOTP QR Code" 
                      className="w-48 h-48"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Can't scan? Enter this code manually:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-muted px-3 py-1 rounded text-sm font-mono break-all">
                        {secret}
                      </code>
                      <Button variant="ghost" size="icon" onClick={copySecret}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={() => setStep('verify')} className="w-full">
                I've Added Asset Safe to My App
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Enter the 6-digit code from your authenticator app to complete setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Enable Two-Factor Authentication
              </Button>

              <Button variant="ghost" onClick={() => setStep('qr')} className="w-full">
                Back
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TOTPSetup;
