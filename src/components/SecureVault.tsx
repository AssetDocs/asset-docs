import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Unlock, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordModal from './MasterPasswordModal';
import { createPasswordVerificationHash, verifyMasterPassword } from '@/utils/encryption';
import { MASTER_PASSWORD_HASH_KEY } from './PasswordCatalog';
import PasswordCatalog from './PasswordCatalog';
import LegacyLocker from './LegacyLocker';
import { RecoveryDelegateSelector } from './RecoveryDelegateSelector';
import { RecoveryRequestAlert } from './RecoveryRequestAlert';

const SecureVault: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionMasterPassword, setSessionMasterPassword] = useState<string | null>(null);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Recovery delegate state
  const [contributors, setContributors] = useState<any[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
  const [gracePeriodDays, setGracePeriodDays] = useState(14);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [legacyLockerId, setLegacyLockerId] = useState<string | null>(null);
  const [isDelegate, setIsDelegate] = useState(false);
  const [isContributor, setIsContributor] = useState(false);
  const [existingEncrypted, setExistingEncrypted] = useState(false);

  useEffect(() => {
    fetchVaultStatus();
    fetchContributors();
    checkContributorStatus();
  }, [user]);

  const checkContributorStatus = async () => {
    if (!user) return;
    try {
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('role, account_owner_id')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        setIsContributor(true);
      }
    } catch (error) {
      console.error('Error checking contributor status:', error);
    }
  };

  const fetchContributors = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contributors')
        .select('*')
        .eq('account_owner_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setContributors(data || []);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const fetchVaultStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legacy_locker')
        .select('id, is_encrypted, delegate_user_id, recovery_grace_period_days, recovery_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLegacyLockerId(data.id);
        setIsEncrypted(data.is_encrypted);
        setExistingEncrypted(data.is_encrypted);
        setSelectedDelegateId(data.delegate_user_id);
        setGracePeriodDays(data.recovery_grace_period_days || 14);
        setHasPendingRequest(data.recovery_status === 'pending');
        setIsDelegate(data.delegate_user_id === user.id);
      }
    } catch (error) {
      console.error('Error fetching vault status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);
    setIsSetupMode(!storedHash);
    setShowMasterPasswordModal(true);
  };

  const handleMasterPasswordSubmit = async (password: string) => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);

    if (isSetupMode) {
      const hash = await createPasswordVerificationHash(password);
      localStorage.setItem(MASTER_PASSWORD_HASH_KEY, hash);
      setSessionMasterPassword(password);
      setIsUnlocked(true);
      setIsEncrypted(true);
      setShowMasterPasswordModal(false);
      toast({
        title: "Secure Vault Encrypted",
        description: "Your Password Catalog and Legacy Locker are now protected with end-to-end encryption.",
      });
    } else {
      if (storedHash && await verifyMasterPassword(password, storedHash)) {
        setSessionMasterPassword(password);
        setIsUnlocked(true);
        setShowMasterPasswordModal(false);
      } else {
        throw new Error('Incorrect master password');
      }
    }
  };

  const handleEncryptionToggle = (checked: boolean) => {
    if (checked && !sessionMasterPassword) {
      handleUnlockClick();
    }
    setIsEncrypted(checked);
  };

  if (loading) {
    return (
      <Card className="w-full border-4 border-yellow-400 shadow-lg">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading Secure Vault...</div>
        </CardContent>
      </Card>
    );
  }

  // Locked state - show unlock prompt
  if (isEncrypted && !isUnlocked) {
    return (
      <>
        <Card className="w-full border-4 border-yellow-400 shadow-lg">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-6 w-6 text-yellow-600" />
                  Secure Vault (Locked)
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Password Catalog & Legacy Locker - Protected with End-to-End Encryption
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
              <h3 className="text-xl font-semibold mb-3">Secure Vault Locked</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your Password Catalog and Legacy Locker are encrypted with the same master password.
                Enter your master password to access both sections.
              </p>
              <Button onClick={handleUnlockClick} size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Unlock className="h-5 w-5 mr-2" />
                Unlock Secure Vault
              </Button>
            </div>
          </CardContent>
        </Card>
        <MasterPasswordModal
          isOpen={showMasterPasswordModal}
          isSetup={isSetupMode}
          onSubmit={handleMasterPasswordSubmit}
          onCancel={() => setShowMasterPasswordModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <Card className="w-full border-4 border-yellow-400 shadow-lg">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-400">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-7 w-7 text-yellow-600" />
                Secure Vault {isUnlocked ? '(Unlocked)' : ''}
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300 text-base mt-1">
                Password Catalog & Legacy Locker — Your Most Sensitive Information
              </CardDescription>
            </div>
            
            {/* Encryption Toggle - Highlighted Box */}
            <div className="bg-yellow-100 dark:bg-yellow-800/30 border-2 border-yellow-500 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Label 
                  htmlFor="vault-encryption-toggle" 
                  className={`font-semibold ${existingEncrypted ? "text-muted-foreground" : "text-yellow-700 dark:text-yellow-300"}`}
                >
                  {existingEncrypted ? "🔒 Encrypted" : "🔓 Encrypt"}
                </Label>
                <Switch
                  id="vault-encryption-toggle"
                  checked={isEncrypted}
                  onCheckedChange={handleEncryptionToggle}
                  disabled={existingEncrypted}
                />
              </div>
            </div>
          </div>
          
          {/* Info Alert */}
          <Alert className="mt-4 bg-yellow-100/50 border-yellow-400">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Both sections share the same encryption:</strong> Your Password Catalog and Legacy Locker are protected with the same master password. 
              Your designated Recovery Delegate can request access to both sections in case of emergency.
            </AlertDescription>
          </Alert>
        </CardHeader>
        
        <CardContent className="p-4 space-y-8">
          {/* Recovery Request Alert for owners */}
          {legacyLockerId && hasPendingRequest && !isDelegate && (
            <RecoveryRequestAlert
              legacyLockerId={legacyLockerId}
              onRequestResolved={() => {
                setHasPendingRequest(false);
                fetchVaultStatus();
              }}
            />
          )}

          {/* Recovery Delegate Selector - only show for owners when encrypted */}
          {isEncrypted && !isDelegate && !isContributor && (
            <RecoveryDelegateSelector
              contributors={contributors}
              selectedDelegateId={selectedDelegateId}
              gracePeriodDays={gracePeriodDays}
              onDelegateChange={setSelectedDelegateId}
              onGracePeriodChange={setGracePeriodDays}
            />
          )}

          {/* Section 1: Password Catalog */}
          <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-900/10">
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center gap-2">
              <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Password Catalog
            </h3>
            <PasswordCatalog 
              isUnlockedFromParent={isUnlocked}
              sessionMasterPasswordFromParent={sessionMasterPassword}
            />
          </div>
          
          {/* Section 2: Legacy Locker */}
          <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50/30 dark:bg-yellow-900/10">
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center gap-2">
              <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Legacy Locker
            </h3>
            <LegacyLocker 
              isUnlockedFromParent={isUnlocked}
              sessionMasterPasswordFromParent={sessionMasterPassword}
              hideEncryptionControls={true}
            />
          </div>
        </CardContent>
      </Card>
      
      <MasterPasswordModal
        isOpen={showMasterPasswordModal}
        isSetup={isSetupMode}
        onSubmit={handleMasterPasswordSubmit}
        onCancel={() => setShowMasterPasswordModal(false)}
      />
    </>
  );
};

export default SecureVault;
