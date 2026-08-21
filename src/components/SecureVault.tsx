// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, Unlock, Info, ChevronDown, ChevronRight, AlertTriangle, UserX, Loader2, Key, ShieldAlert } from 'lucide-react';
import { RecoveryRequestDialog } from './RecoveryRequestDialog';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
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
import { decryptPassword } from '@/utils/encryption';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';
import MasterPasswordModal from './MasterPasswordModal';
import { unlockOrUpgradeVault, setVaultKey, clearVaultKey } from '@/lib/vaultKey';
import { issuePendingDelegateGrants } from '@/lib/delegateGrants';

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
  const { isContributor, canAccessEncryptedVault, isViewer, isContributorRole, contributorRole, isAdministrator } = useAccount();
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
  const [delegateForLockerId, setDelegateForLockerId] = useState<string | null>(null);
  const [delegateRecoveryStatus, setDelegateRecoveryStatus] = useState<string | null>(null);
  const [showRecoveryRequestDialog, setShowRecoveryRequestDialog] = useState(false);
  const [existingEncrypted, setExistingEncrypted] = useState(false);
  const [wrappedVaultKey, setWrappedVaultKey] = useState<string | null>(null);
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

  // Track whether the initial load already happened so background refreshes
  // (e.g. Supabase TOKEN_REFRESHED when the tab regains focus) don't swap the
  // vault out for a loading screen and unmount in-progress forms.
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    fetchVaultStatus();
    fetchContributorsList();
  }, [user?.id]);


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
      // Only block the UI on the very first load.
      if (!hasLoadedRef.current) setLoading(true);

      
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
          .select('id, is_encrypted, allow_admin_access, encryption_key_encrypted_for_user')
          .eq('user_id', contributorData.account_owner_id)
          .maybeSingle();

        if (!ownerError && ownerVaultData) {
          setLegacyLockerId(ownerVaultData.id);
          setIsEncrypted(ownerVaultData.is_encrypted);
          setExistingEncrypted(ownerVaultData.is_encrypted);
          setAllowAdminAccess(ownerVaultData.allow_admin_access ?? true);
          setWrappedVaultKey(ownerVaultData.encryption_key_encrypted_for_user ?? null);
        }
        setLoading(false);
        return;
      }
      
      // For account owners, fetch their own vault
      const [{ data, error }, { data: delegateRow }] = await Promise.all([
        supabase
          .from('legacy_locker')
          .select('id, is_encrypted, delegate_user_id, recovery_grace_period_days, recovery_status, allow_admin_access, encryption_key_encrypted_for_user')
          .eq('user_id', user.id)
          .maybeSingle(),
        // Check if the current user is a designated delegate for someone else's vault
        supabase
          .from('legacy_locker')
          .select('id, recovery_grace_period_days, recovery_status, is_encrypted')
          .eq('delegate_user_id', user.id)
          .maybeSingle(),
      ]);

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
        setAllowAdminAccess(data.allow_admin_access ?? true);
        setWrappedVaultKey((data as any).encryption_key_encrypted_for_user ?? null);
      }

      // Detect if this user is a recovery delegate for another user's vault
      if (delegateRow) {
        setIsDelegate(true);
        setDelegateForLockerId(delegateRow.id);
        setDelegateRecoveryStatus(delegateRow.recovery_status);
        // If we have no own vault but there is a delegate vault, show its encryption state
        if (!data) {
          setIsEncrypted(delegateRow.is_encrypted);
          setExistingEncrypted(delegateRow.is_encrypted);
        }
      }
    } catch (error) {
      console.error('Error fetching vault status:', error);
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  };


  // Determines whether the unlock modal should run in setup or unlock mode.
  // Setup mode = we have no wrapped vault key AND no legacy localStorage hash.
  const computeSetupMode = (): boolean => {
    if (wrappedVaultKey) return false;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(MASTER_PASSWORD_HASH_KEY)) {
      return false;
    }
    return true;
  };

  const handleUnlockClick = () => {
    if (!totpVerified) {
      setShowTOTPChallenge(true);
      return;
    }
    setIsSetupMode(computeSetupMode());
    setShowMasterPasswordModal(true);
  };

  const handleTOTPVerified = () => {
    setTotpVerified(true);
    setShowTOTPChallenge(false);
    setIsSetupMode(computeSetupMode());
    setShowMasterPasswordModal(true);
  };

  // Legacy Locker text columns that hold sensitive free-text values.
  const LOCKER_TEXT_FIELDS = [
    'full_legal_name', 'address', 'executor_name', 'executor_relationship',
    'executor_contact', 'backup_executor_name', 'backup_executor_contact',
    'guardian_name', 'guardian_relationship', 'guardian_contact',
    'backup_guardian_name', 'backup_guardian_contact',
    'spouse_name', 'spouse_contact', 'attorney_name', 'attorney_firm', 'attorney_contact',
    'business_partner_name', 'business_partner_company', 'business_partner_contact',
    'investment_firm_name', 'investment_advisor_name', 'investment_firm_contact',
    'financial_advisor_name', 'financial_advisor_firm', 'financial_advisor_contact',
    'residuary_estate', 'digital_assets', 'real_estate_instructions', 'debts_expenses',
    'funeral_wishes', 'burial_or_cremation', 'ceremony_preferences',
    'letters_to_loved_ones', 'pet_care_instructions', 'business_succession_plan',
    'ethical_will',
    'life_overview', 'digital_identity', 'personal_philosophies', 'medical_preferences',
    'executor_instructions', 'subscriptions', 'household_operations', 'financial_crypto',
    'parenting_preferences', 'emotional_behavioral', 'developmental_goals', 'letters_to_children',
    'photo_video_documentation', 'physical_documents', 'sentimental_items', 'crypto_passwords',
    'property_walkthrough', 'home_maintenance', 'neighborhood_contacts', 'rental_property',
    'sentimental_distribution', 'legacy_messages', 'charitable_giving',
  ];

  // Encrypt a value unless it already decrypts with this passphrase (which
  // means a previous, interrupted migration already handled it). This keeps the
  // upgrade idempotent and safely resumable after a mid-way failure.
  // NOTE: never log the value itself — only field/row identifiers.
  const encryptIfPlaintext = async (value: string, passphrase: string): Promise<string> => {
    try {
      await decryptPassword(value, passphrase);
      return value; // already encrypted with this passphrase
    } catch {
      return await encryptPassword(value, passphrase);
    }
  };

  /**
   * First-time vault protection: encrypt any pre-existing plaintext Digital
   * Access, financial account and Legacy Locker values so nothing sensitive is
   * left readable once the vault is locked. Throws on failure so the caller can
   * abort the setup (leaving is_encrypted false and the upgrade resumable).
   */
  const encryptExistingPlaintext = async (passphrase: string) => {
    if (!user) throw new Error('Not authenticated');

    // 1. Digital Access passwords
    const { data: passwords, error: pwError } = await supabase
      .from('password_catalog')
      .select('id, password')
      .eq('user_id', user.id);
    if (pwError) throw pwError;

    for (const entry of passwords || []) {
      if (!entry.password) continue;
      const next = await encryptIfPlaintext(entry.password, passphrase);
      if (next !== entry.password) {
        const { error } = await supabase
          .from('password_catalog')
          .update({ password: next })
          .eq('id', entry.id);
        if (error) {
          console.error('Vault upgrade: failed to store password_catalog row', entry.id);
          throw error;
        }
      }
    }

    // 2. Financial accounts
    const { data: accounts, error: acctError } = await supabase
      .from('financial_accounts')
      .select('id, account_number, routing_number, notes')
      .eq('user_id', user.id);
    if (acctError) throw acctError;

    for (const acct of accounts || []) {
      const updates: any = {};
      for (const field of ['account_number', 'routing_number', 'notes']) {
        const value = (acct as any)[field];
        if (value && typeof value === 'string') {
          const next = await encryptIfPlaintext(value, passphrase);
          if (next !== value) updates[field] = next;
        }
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('financial_accounts').update(updates).eq('id', acct.id);
        if (error) {
          console.error('Vault upgrade: failed to store financial_accounts row', acct.id);
          throw error;
        }
      }
    }

    // 3. Legacy Locker free-text fields
    const { data: locker, error: lockerError } = await supabase
      .from('legacy_locker')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (lockerError) throw lockerError;

    if (locker) {
      const updates: any = {};
      for (const field of LOCKER_TEXT_FIELDS) {
        const value = (locker as any)[field];
        if (value && typeof value === 'string') {
          const next = await encryptIfPlaintext(value, passphrase);
          if (next !== value) updates[field] = next;
        }
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('legacy_locker')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        if (error) {
          console.error('Vault upgrade: failed to store legacy_locker fields', Object.keys(updates));
          throw error;
        }
      }
    }
  };

  const handleMasterPasswordSubmit = async (password: string) => {

    if (!user) throw new Error('Not authenticated');

    const outcome = await unlockOrUpgradeVault({
      passphrase: password,
      wrappedKey: wrappedVaultKey,
      setup: isSetupMode,
      legacyLocalStorageKey: MASTER_PASSWORD_HASH_KEY,
    });

    // Persist the wrapped vault key on setup/upgrade. Field encryption itself
    // is still keyed by `password` for legacy v1 ciphertext compatibility —
    // ASV2-encrypted reads/writes added in later items use the vault key.
    if (outcome.mode === 'setup' || outcome.mode === 'upgrade') {
      // Encrypt any pre-existing plaintext values FIRST. If this fails we abort
      // before flipping is_encrypted, so the vault stays in its previous state
      // and the upgrade can be retried (already-encrypted rows are skipped).
      if (!existingEncrypted) {
        try {
          await encryptExistingPlaintext(password);
        } catch (migrationError) {
          console.error('Vault plaintext upgrade failed:', (migrationError as any)?.message || 'unknown error');
          throw new Error(
            'Could not finish securing your existing vault data. Nothing was changed — please try again.',
          );
        }
      }

      try {

        const { data: existingRecord } = await supabase
          .from('legacy_locker')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const payload: any = {
          encryption_key_encrypted_for_user: outcome.wrappedKey,
          is_encrypted: true,
          updated_at: new Date().toISOString(),
        };

        if (existingRecord) {
          await supabase.from('legacy_locker').update(payload).eq('user_id', user.id);
        } else {
          await supabase.from('legacy_locker').insert({ user_id: user.id, ...payload });
        }

        setWrappedVaultKey(outcome.wrappedKey);
        setExistingEncrypted(true);
        setIsEncrypted(true);

        // Upgrade complete: drop the legacy localStorage verifier permanently.
        try {
          localStorage.removeItem(MASTER_PASSWORD_HASH_KEY);
        } catch {
          /* ignore */
        }
      } catch (dbError) {
        console.error('Error persisting wrapped vault key:', dbError);
        throw new Error('Could not save vault encryption settings.');
      }
    }

    // Cache the vault key in memory for this session.
    setVaultKey(user.id, outcome.vaultKey);

    // Fire-and-forget: issue delegate vault grants for any acknowledged
    // recovery requests that don't yet have an active grant. Also ensures
    // the owner's own delegate keypair is on file.
    issuePendingDelegateGrants(user.id, outcome.vaultKey).catch((e) =>
      console.error('issuePendingDelegateGrants failed:', e),
    );



    setSessionMasterPassword(password);
    setIsUnlocked(true);
    setShowMasterPasswordModal(false);

    if (outcome.mode === 'setup') {
      toast({
        title: 'Secure Vault Encrypted',
        description: 'Your Digital Access and Legacy Locker are now protected with end-to-end encryption.',
      });
    } else if (outcome.mode === 'upgrade') {
      toast({
        title: 'Vault Upgraded',
        description: 'Your vault is now protected with the new key model.',
      });
    } else {
      logActivity({
        action_type: 'access_vault',
        action_category: 'vault',
        resource_type: 'vault',
        resource_name: 'Secure Vault',
        details: { encrypted: true },
      });
    }
  };

  // Vault protection is mandatory — encryption can no longer be removed.



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

  // Mandatory gate: the account owner must always unlock (or first set up) the
  // vault before Digital Access or Legacy Locker can mount. Contributors and
  // recovery delegates keep the previous behaviour (gated only when encrypted)
  // and never see the setup flow — only the owner can create the passphrase.
  const isOwnerView = !isContributor && !isDelegate;
  const needsVaultSetup = isOwnerView && !existingEncrypted && computeSetupMode();
  const vaultLocked = isOwnerView ? !isUnlocked : (isEncrypted && !isUnlocked);
  const childUnlocked = isOwnerView ? isUnlocked : (!isEncrypted || isUnlocked);


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
                Digital Access & Legacy Locker - Protected with End-to-End Encryption
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
                  The account owner has manually restricted access to Digital Access and Legacy Locker for all administrators.
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

  // Locked state - show unlock prompt (or delegate panel if user is a recovery delegate)
  if (isEncrypted && !isUnlocked) {
    // Delegate view: show appropriate panel based on recovery status
    if (isDelegate && delegateForLockerId) {
      const isPendingOrAwaiting = delegateRecoveryStatus === 'pending' || delegateRecoveryStatus === 'awaiting_acknowledgment';
      const isAcknowledged = delegateRecoveryStatus === 'delegate_acknowledged';

      return (
        <>
          <Card className="w-full border-4 border-blue-400 shadow-lg">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-400">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
                Secure Vault — Recovery Delegate Access
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                You have been designated as the Recovery Delegate for this Secure Vault.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center">
                {isAcknowledged ? (
                  <>
                    <ShieldAlert className="h-20 w-20 mx-auto mb-6 text-blue-500" />
                    <h3 className="text-xl font-semibold mb-3">Access Granted</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Your emergency access has been acknowledged. You may now unlock and view the vault contents.
                    </p>
                    <Button onClick={handleUnlockClick} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Unlock className="h-5 w-5 mr-2" />
                      Unlock Vault as Delegate
                    </Button>
                  </>
                ) : isPendingOrAwaiting ? (
                  <>
                    <Lock className="h-20 w-20 mx-auto mb-6 text-amber-500" />
                    <h3 className="text-xl font-semibold mb-3">Access Request Pending</h3>
                    <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                      {delegateRecoveryStatus === 'awaiting_acknowledgment'
                        ? 'The grace period has elapsed. Check your email for an acknowledgment link to activate your access.'
                        : 'Your emergency access request has been submitted and is awaiting approval from the vault owner.'}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You will receive an email notification once the owner responds.
                    </p>
                  </>
                ) : (
                  <>
                    <Key className="h-20 w-20 mx-auto mb-6 text-blue-500" />
                    <h3 className="text-xl font-semibold mb-3">Emergency Access Request</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You are the designated Recovery Delegate for this vault. In case of emergency, you may submit an access request. The vault owner will be notified and can approve or deny your request.
                    </p>
                    <Button
                      onClick={() => setShowRecoveryRequestDialog(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ShieldAlert className="h-5 w-5 mr-2" />
                      Request Emergency Access
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          {showRecoveryRequestDialog && (
            <RecoveryRequestDialog
              legacyLockerId={delegateForLockerId!}
              gracePeriodDays={gracePeriodDays}
              isOpen={showRecoveryRequestDialog}
              onClose={() => setShowRecoveryRequestDialog(false)}
              onRequestSubmitted={() => {
                setShowRecoveryRequestDialog(false);
                setDelegateRecoveryStatus('pending');
              }}
            />
          )}
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
            actionDescription="access the Secure Vault as Recovery Delegate"
          />
        </>
      );
    }

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
                  Digital Access & Legacy Locker - Protected with End-to-End Encryption
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
              <h3 className="text-xl font-semibold mb-3">Secure Vault Locked</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your Digital Access and Legacy Locker are encrypted with the same vault passphrase.
                Enter your vault passphrase to access both sections.
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
                Digital Access & Legacy Locker — Your Most Sensitive Information
              </CardDescription>
            </div>
            
            {/* Encryption Toggle - Highlighted Box */}
            <div className="bg-yellow-100 dark:bg-yellow-800/30 border-2 border-yellow-500 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Label 
                  htmlFor="vault-encryption-toggle" 
                  className="font-semibold text-yellow-700 dark:text-yellow-300"
                >
                  {existingEncrypted ? "🔒 Encrypted" : "🔓 Encrypt"}
                </Label>
                <Switch
                  id="vault-encryption-toggle"
                  checked={isEncrypted}
                  onCheckedChange={handleEncryptionToggle}
                  disabled={false}
                />
              </div>
            </div>
          </div>
          
          {/* Info Alert */}
          <Alert className="mt-4 bg-yellow-100/50 border-yellow-400">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Both sections share the same encryption:</strong> Your Digital Access and Legacy Locker are protected with the same vault passphrase. 
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
                    Digital Access
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
                    isVaultEncrypted={isEncrypted && existingEncrypted}
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

      {/* Remove Encryption Confirmation Dialog */}
      <AlertDialog open={showRemoveEncryptionDialog} onOpenChange={(open) => {
        if (!open && !isRemovingEncryption) {
          setShowRemoveEncryptionDialog(false);
          setRemoveEncryptionPassword('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Vault Encryption?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will <strong>permanently remove encryption</strong> from your Secure Vault. All passwords, financial accounts, and Legacy Locker data will be stored without encryption.
                </p>
                <p className="text-destructive font-medium">
                  This is a security downgrade. Only proceed if you understand the risks.
                </p>
                {!sessionMasterPassword && (
                  <div className="pt-2">
                    <Label htmlFor="remove-encryption-pw" className="text-sm font-medium">
                      Enter your vault passphrase to confirm:
                    </Label>
                    <Input
                      id="remove-encryption-pw"
                      type="password"
                      value={removeEncryptionPassword}
                      onChange={(e) => setRemoveEncryptionPassword(e.target.value)}
                      placeholder="Master password"
                      className="mt-1"
                      disabled={isRemovingEncryption}
                    />
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingEncryption}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleRemoveEncryption}
              disabled={isRemovingEncryption || (!sessionMasterPassword && !removeEncryptionPassword)}
            >
              {isRemovingEncryption ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing Encryption...
                </>
              ) : (
                'Yes, Remove Encryption'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SecureVault;
