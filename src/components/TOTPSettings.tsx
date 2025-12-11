import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Trash2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTOTP } from '@/hooks/useTOTP';
import { useToast } from '@/hooks/use-toast';
import TOTPSetup from './TOTPSetup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TOTPSettings: React.FC = () => {
  const { toast } = useToast();
  const { factors, isEnrolled, isLoading, unenroll, refetch } = useTOTP();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const verifiedFactor = factors.find(f => f.status === 'verified');

  const handleDisable = async () => {
    if (!verifiedFactor) return;
    
    setDisabling(true);
    try {
      await unenroll(verifiedFactor.id);
      toast({
        title: "Two-Factor Disabled",
        description: "Authenticator has been removed from your account.",
      });
      setShowDisableConfirm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable two-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setDisabling(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using an authenticator app
              </CardDescription>
            </div>
            {isEnrolled && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEnrolled ? (
            <>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your account is protected with two-factor authentication. 
                  You'll be asked for a code when accessing sensitive features like the Secure Vault.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Authenticator App</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                {verifiedFactor && (
                  <p className="text-sm text-muted-foreground">
                    Added on {new Date(verifiedFactor.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowDisableConfirm(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Authenticator
              </Button>
            </>
          ) : (
            <>
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Two-factor authentication is not enabled. We strongly recommend enabling it to protect your sensitive data.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Why enable two-factor authentication?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Protects access to your Secure Vault (passwords & Legacy Locker)</li>
                  <li>Required for billing changes and sensitive profile updates</li>
                  <li>Works offline with authenticator apps</li>
                  <li>More secure than SMS-based verification</li>
                </ul>
              </div>

              <Button onClick={() => setShowSetup(true)} className="w-full sm:w-auto">
                <Key className="h-4 w-4 mr-2" />
                Set Up Authenticator
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <TOTPSetup
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        onSetupComplete={handleSetupComplete}
      />

      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Disable Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the authenticator from your account. You'll need to set it up again 
              to access sensitive features like the Secure Vault, billing, and profile changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={disabling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {disabling ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TOTPSettings;
