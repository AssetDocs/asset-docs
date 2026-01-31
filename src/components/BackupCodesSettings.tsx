import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, RefreshCw, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useBackupCodes } from '@/hooks/useBackupCodes';
import { useTOTP } from '@/hooks/useTOTP';
import { useToast } from '@/hooks/use-toast';
import BackupCodesDisplay from './BackupCodesDisplay';
import { logActivity } from '@/hooks/useActivityLog';
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

const BackupCodesSettings: React.FC = () => {
  const { toast } = useToast();
  const { status, isLoading, fetchStatus, generateCodes } = useBackupCodes();
  const { isEnrolled: hasTOTP, isLoading: totpLoading } = useTOTP();
  const [showCodesDialog, setShowCodesDialog] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (hasTOTP) {
      fetchStatus();
    }
  }, [hasTOTP, fetchStatus]);

  const handleGenerateCodes = async () => {
    setGenerating(true);
    try {
      const codes = await generateCodes();
      if (codes) {
        setGeneratedCodes(codes);
        setShowCodesDialog(true);
        toast({
          title: "Backup Codes Generated",
          description: "Your new backup recovery codes are ready.",
        });
        
        // Log activity
        logActivity({
          action_type: 'backup_codes_generated',
          action_category: 'security',
          resource_type: 'backup_codes',
          resource_name: 'MFA Backup Codes',
          details: { codes_count: codes.length }
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate backup codes.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setShowRegenerateConfirm(false);
    }
  };

  if (totpLoading || isLoading) {
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

  // Don't show if 2FA isn't enabled
  if (!hasTOTP) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Backup Recovery Codes
          </CardTitle>
          <CardDescription>
            One-time codes to access your account if you lose your authenticator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Enable Multi-Factor Authentication (MFA) first to generate backup codes.
            </AlertDescription>
          </Alert>
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
                <Key className="h-5 w-5" />
                Backup Recovery Codes
              </CardTitle>
              <CardDescription>
                One-time codes to access your account if you lose your authenticator
              </CardDescription>
            </div>
            {status?.hasBackupCodes && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                {status.remainingCodes} remaining
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.hasBackupCodes ? (
            <>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  You have {status.remainingCodes} backup codes remaining. 
                  Each code can only be used once.
                </AlertDescription>
              </Alert>

              {status.remainingCodes <= 3 && (
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-300">
                    You're running low on backup codes. Consider generating new ones.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={generating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Codes
              </Button>
            </>
          ) : (
            <>
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  You haven't generated backup codes yet. These codes let you recover your account 
                  if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Why generate backup codes?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access your account if you lose your phone</li>
                  <li>Recover from authenticator app issues</li>
                  <li>Each code can be used once</li>
                  <li>Store them in a secure location</li>
                </ul>
              </div>

              <Button onClick={handleGenerateCodes} disabled={generating}>
                {generating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generate Backup Codes
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <BackupCodesDisplay
        isOpen={showCodesDialog}
        onClose={() => setShowCodesDialog(false)}
        codes={generatedCodes}
      />

      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Generate New Backup Codes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate all your existing backup codes. You'll receive 10 new codes 
              that you'll need to save securely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={generating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateCodes} disabled={generating}>
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Generate New Codes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackupCodesSettings;
