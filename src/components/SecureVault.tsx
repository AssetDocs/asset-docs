import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Unlock, Info, ChevronDown, ChevronRight, AlertTriangle, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useContributor } from '@/contexts/ContributorContext';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordModal from './MasterPasswordModal';
import { createPasswordVerificationHash, verifyMasterPassword } from '@/utils/encryption';
import { MASTER_PASSWORD_HASH_KEY } from './PasswordCatalog';
import PasswordCatalog from './PasswordCatalog';
import LegacyLocker from './LegacyLocker';
import { RecoveryDelegateSelector } from './RecoveryDelegateSelector';
import { RecoveryRequestAlert } from './RecoveryRequestAlert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TOTPChallenge from './TOTPChallenge';
import { logActivity } from '@/hooks/useActivityLog';

interface SecureVaultProps {
  initialTab?: 'passwords' | 'legacy';
}

const SecureVault: React.FC<SecureVaultProps> = ({ initialTab }) => {
  const { user } = useAuth();
  const { isContributor, canAccessEncryptedVault, isViewer, isContributorRole, contributorRole, isAdministrator } = useContributor();
  const { toast } = useToast();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionMasterPassword, setSessionMasterPassword] = useState<string | null>(null);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // TOTP verification state
  const [showTOTPChallenge, setShowTOTPChallenge] = useState(false);
  const [totpVerified, setTotpVerified] = useState(false);
  
  // Recovery delegate state
  const [contributorsList, setContributorsList] = useState<any[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
  const [gracePeriodDays, setGracePeriodDays] = useState(14);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [legacyLockerId, setLegacyLockerId] = useState<string | null>(null);
  const [isDelegate, setIsDelegate] = useState(false);
  const [existingEncrypted, setExistingEncrypted] = useState(false);
  const [passwordCatalogOpen, setPasswordCatalogOpen] = useState(initialTab === 'passwords' || false);
  const [legacyLockerOpen, setLegacyLockerOpen] = useState(initialTab === 'legacy' || false);
  
  // Track original values for change detection
  const [originalDelegateId, setOriginalDelegateId] = useState<string | null>(null);
  const [originalGracePeriodDays, setOriginalGracePeriodDays] = useState(14);
  const [isSavingDelegate, setIsSavingDelegate] = useState(false);
  
  // Admin access control
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [isSavingAdminAccess, setIsSavingAdminAccess] = useState(false);
  
  const hasDelegateChanges = selectedDelegateId !== originalDelegateId || gracePeriodDays !== originalGracePeriodDays;

  useEffect(() => {
    fetchVaultStatus();
    fetchContributorsList();
  }, [user]);

  const fetchContributorsList = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contributors')
        .select('*')
        .eq('account_owner_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setContributorsList(data || []);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const fetchVaultStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First check if user is an admin contributor
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('account_owner_id, role')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();
      
      // If admin contributor, fetch owner's vault settings
      if (contributorData && contributorData.role === 'administrator') {
        const { data: ownerVaultData, error: ownerError } = await supabase
          .from('legacy_locker')
          .select('id, is_encrypted, allow_admin_access')
          .eq('user_id', contributorData.account_owner_id)
          .maybeSingle();

        if (!ownerError && ownerVaultData) {
          setLegacyLockerId(ownerVaultData.id);
          setIsEncrypted(ownerVaultData.is_encrypted);
          setExistingEncrypted(ownerVaultData.is_encrypted);
          setAllowAdminAccess(ownerVaultData.allow_admin_access ?? true);
        }
        setLoading(false);
        return;
      }
      
      // For account owners, fetch their own vault
      const { data, error } = await supabase
        .from('legacy_locker')
        .select('id, is_encrypted, delegate_user_id, recovery_grace_period_days, recovery_status, allow_admin_access')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLegacyLockerId(data.id);
        setIsEncrypted(data.is_encrypted);
        setExistingEncrypted(data.is_encrypted);
        setSelectedDelegateId(data.delegate_user_id);
        setOriginalDelegateId(data.delegate_user_id);
        setGracePeriodDays(data.recovery_grace_period_days || 14);
        setOriginalGracePeriodDays(data.recovery_grace_period_days || 14);
        setHasPendingRequest(data.recovery_status === 'pending');
        setIsDelegate(data.delegate_user_id === user.id);
        setAllowAdminAccess(data.allow_admin_access ?? true);
      }
    } catch (error) {
      console.error('Error fetching vault status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    // Require TOTP verification first
    if (!totpVerified) {
      setShowTOTPChallenge(true);
      return;
    }
    
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);
    setIsSetupMode(!storedHash);
    setShowMasterPasswordModal(true);
  };

  const handleTOTPVerified = () => {
    setTotpVerified(true);
    setShowTOTPChallenge(false);
    
    // Now proceed to master password modal
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);
    setIsSetupMode(!storedHash);
    setShowMasterPasswordModal(true);
  };

  const handleMasterPasswordSubmit = async (password: string) => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);

    if (isSetupMode) {
      // Create and store the password hash locally
      const hash = await createPasswordVerificationHash(password);
      localStorage.setItem(MASTER_PASSWORD_HASH_KEY, hash);
      
      // Update the database to mark vault as encrypted
      if (user) {
        try {
          // First check if legacy_locker record exists
          const { data: existingRecord } = await supabase
            .from('legacy_locker')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (existingRecord) {
            // Update existing record
            await supabase
              .from('legacy_locker')
              .update({ 
                is_encrypted: true,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
          } else {
            // Create new record with encryption enabled
            await supabase
              .from('legacy_locker')
              .insert({ 
                user_id: user.id,
                is_encrypted: true
              });
          }
          
          setExistingEncrypted(true);
        } catch (dbError) {
          console.error('Error updating encryption status in database:', dbError);
        }
      }
      
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
        
        // Log vault access
        logActivity({
          action_type: 'access_vault',
          action_category: 'vault',
          resource_type: 'vault',
          resource_name: 'Secure Vault',
          details: { encrypted: true }
        });
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

  const handleSaveDelegate = async () => {
    if (!user || !legacyLockerId) return;
    
    setIsSavingDelegate(true);
    try {
      // Update the legacy locker with the delegate settings
      const updateData: any = {
        delegate_user_id: selectedDelegateId,
        recovery_grace_period_days: gracePeriodDays,
        updated_at: new Date().toISOString()
      };

      // If setting a new delegate, start the grace period countdown
      if (selectedDelegateId && selectedDelegateId !== originalDelegateId) {
        updateData.recovery_requested_at = new Date().toISOString();
        updateData.recovery_status = 'grace_period_active';
      } else if (!selectedDelegateId) {
        // If removing delegate, clear recovery status
        updateData.recovery_requested_at = null;
        updateData.recovery_status = 'none';
      }

      const { error } = await supabase
        .from('legacy_locker')
        .update(updateData)
        .eq('id', legacyLockerId);

      if (error) throw error;

      // Update original values to reflect saved state
      setOriginalDelegateId(selectedDelegateId);
      setOriginalGracePeriodDays(gracePeriodDays);

      if (selectedDelegateId && selectedDelegateId !== originalDelegateId) {
        toast({
          title: "Recovery Delegate Saved",
          description: `Grace period countdown of ${gracePeriodDays} days has started. After expiration, your delegate will receive access notification.`,
        });
      } else if (!selectedDelegateId && originalDelegateId) {
        toast({
          title: "Recovery Delegate Removed",
          description: "Your recovery delegate has been removed.",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your recovery delegate settings have been updated.",
        });
      }
    } catch (error: any) {
      console.error('Error saving delegate:', error);
      toast({
        title: "Error",
        description: "Failed to save recovery delegate settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDelegate(false);
    }
  };

  const handleAdminAccessToggle = async (checked: boolean) => {
    if (!user || !legacyLockerId) return;
    
    setIsSavingAdminAccess(true);
    try {
      const { error } = await supabase
        .from('legacy_locker')
        .update({ 
          allow_admin_access: checked,
          updated_at: new Date().toISOString()
        })
        .eq('id', legacyLockerId);

      if (error) throw error;

      setAllowAdminAccess(checked);
      toast({
        title: checked ? "Admin Access Enabled" : "Admin Access Disabled",
        description: checked 
          ? "Administrators (authorized user) can now access the Secure Vault."
          : "Administrators (authorized user) are now restricted from the Secure Vault.",
      });
    } catch (error: any) {
      console.error('Error updating admin access:', error);
      toast({
        title: "Error",
        description: "Failed to update admin access settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAdminAccess(false);
    }
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

  // Check if admin is blocked from vault access
  const isAdminBlockedFromVault = isAdministrator && !allowAdminAccess;

  // Contributor restriction - show access denied for encrypted vault or blocked admin
  if ((isEncrypted && !canAccessEncryptedVault) || isAdminBlockedFromVault) {
    // Different messaging for admin blocked vs other contributor restrictions
    const isManualAdminRestriction = isAdminBlockedFromVault;
    
    return (
      <Card className="w-full border-4 border-yellow-400 shadow-lg">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-6 w-6 text-yellow-600" />
                Secure Vault (Advanced Protection) - Restricted
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Password Catalog & Legacy Locker - Protected with End-to-End Encryption
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center">
            <UserX className="h-20 w-20 mx-auto mb-6 text-amber-500" />
            <h3 className="text-xl font-semibold mb-3">Access Restricted</h3>
            {isManualAdminRestriction ? (
              <>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  The account owner has manually restricted access to the Password Catalog and Legacy Locker for all administrators.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  If you believe this to be an error, please contact the account owner directly to request access.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Contributors with {contributorRole === 'viewer' ? 'viewer' : 'limited'} access cannot access encrypted vaults.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Please contact the account owner if you need access to this information.
                </p>
              </>
            )}
          </div>
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
                Secure Vault (Advanced Protection) - Locked
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
        <TOTPChallenge
          isOpen={showTOTPChallenge}
          onClose={() => setShowTOTPChallenge(false)}
          onVerified={handleTOTPVerified}
          actionDescription="access your Secure Vault"
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
                Secure Vault (Advanced Protection) {isUnlocked ? '- Unlocked' : ''}
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
              contributors={contributorsList}
              selectedDelegateId={selectedDelegateId}
              gracePeriodDays={gracePeriodDays}
              onDelegateChange={setSelectedDelegateId}
              onGracePeriodChange={setGracePeriodDays}
              onSave={handleSaveDelegate}
              isSaving={isSavingDelegate}
              hasChanges={hasDelegateChanges}
            />
          )}

          {/* Admin Access Control - only show for owners */}
          {!isContributor && legacyLockerId && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <UserX className="h-6 w-6 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Admin Access Control</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                      {allowAdminAccess 
                        ? "Administrators (authorized user) can currently access the Secure Vault."
                        : "Administrators (authorized user) are currently restricted from the Secure Vault."
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Viewers and limited-access contributors never have access to the Secure Vault.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-orange-100 dark:bg-orange-800/30 border border-orange-400 rounded-lg px-4 py-3">
                  <Label 
                    htmlFor="admin-access-toggle" 
                    className="font-semibold text-orange-700 dark:text-orange-300 whitespace-nowrap"
                  >
                    {allowAdminAccess ? "Allowed" : "Restricted"}
                  </Label>
                  <Switch
                    id="admin-access-toggle"
                    checked={allowAdminAccess}
                    onCheckedChange={handleAdminAccessToggle}
                    disabled={isSavingAdminAccess}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Password Catalog */}
          <Collapsible open={passwordCatalogOpen} onOpenChange={setPasswordCatalogOpen}>
            <div className="border-2 border-yellow-300 rounded-lg bg-yellow-50/30 dark:bg-yellow-900/10">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-yellow-100/50 dark:hover:bg-yellow-800/20 transition-colors rounded-t-lg">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                    <span className="relative bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      1
                      {existingEncrypted && (
                        <Lock className="h-3 w-3 text-destructive absolute -top-1 -right-1 drop-shadow-sm" />
                      )}
                    </span>
                    Password Catalog
                  </h3>
                  {passwordCatalogOpen ? (
                    <ChevronDown className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-yellow-600" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0">
                  <PasswordCatalog 
                    isUnlockedFromParent={!isEncrypted || isUnlocked}
                    sessionMasterPasswordFromParent={sessionMasterPassword}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
          
          {/* Section 2: Legacy Locker */}
          <Collapsible open={legacyLockerOpen} onOpenChange={setLegacyLockerOpen}>
            <div className="border-2 border-yellow-300 rounded-lg bg-yellow-50/30 dark:bg-yellow-900/10">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-yellow-100/50 dark:hover:bg-yellow-800/20 transition-colors rounded-t-lg">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                    <span className="relative bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      2
                      {existingEncrypted && (
                        <Lock className="h-3 w-3 text-destructive absolute -top-1 -right-1 drop-shadow-sm" />
                      )}
                    </span>
                    Legacy Locker
                  </h3>
                  {legacyLockerOpen ? (
                    <ChevronDown className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-yellow-600" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0">
                  <LegacyLocker 
                    isUnlockedFromParent={!isEncrypted || isUnlocked}
                    sessionMasterPasswordFromParent={sessionMasterPassword}
                    hideEncryptionControls={true}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </CardContent>
      </Card>
      
      <MasterPasswordModal
        isOpen={showMasterPasswordModal}
        isSetup={isSetupMode}
        onSubmit={handleMasterPasswordSubmit}
        onCancel={() => setShowMasterPasswordModal(false)}
      />
      <TOTPChallenge
        isOpen={showTOTPChallenge}
        onClose={() => setShowTOTPChallenge(false)}
        onVerified={handleTOTPVerified}
        actionDescription="access your Secure Vault"
      />
    </>
  );
};

export default SecureVault;
