import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock, Save, FileText, Users, Home, DollarSign, Heart, Shield, Upload, Mic, Contact, X, Plus, Scale, ChevronDown, ChevronLeft, Check, Circle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { encryptPassword, decryptPassword } from '@/utils/encryption';
import MasterPasswordModal from './MasterPasswordModal';
import { MASTER_PASSWORD_HASH_KEY } from './PasswordCatalog';
import LegacyLockerUploads from './LegacyLockerUploads';
import VoiceNotesSection from './VoiceNotesSection';
import TrustInformation from './TrustInformation';
import { RecoveryDelegateSelector } from './RecoveryDelegateSelector';
import { RecoveryRequestDialog } from './RecoveryRequestDialog';
import { RecoveryRequestAlert } from './RecoveryRequestAlert';
import { PremiumFeatureGate } from './PremiumFeatureGate';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface LegacyLockerData {
  id?: string;
  full_legal_name?: string;
  address?: string;
  executor_name?: string;
  executor_relationship?: string;
  executor_contact?: string;
  backup_executor_name?: string;
  backup_executor_contact?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_contact?: string;
  backup_guardian_name?: string;
  backup_guardian_contact?: string;
  spouse_name?: string;
  spouse_contact?: string;
  attorney_name?: string;
  attorney_firm?: string;
  attorney_contact?: string;
  business_partner_name?: string;
  business_partner_company?: string;
  business_partner_contact?: string;
  investment_firm_name?: string;
  investment_advisor_name?: string;
  investment_firm_contact?: string;
  financial_advisor_name?: string;
  financial_advisor_firm?: string;
  financial_advisor_contact?: string;
  residuary_estate?: string;
  digital_assets?: string;
  real_estate_instructions?: string;
  debts_expenses?: string;
  funeral_wishes?: string;
  burial_or_cremation?: string;
  ceremony_preferences?: string;
  organ_donation?: boolean;
  no_contest_clause?: boolean;
  letters_to_loved_ones?: string;
  pet_care_instructions?: string;
  business_succession_plan?: string;
  ethical_will?: string;
  is_encrypted?: boolean;
  delegate_user_id?: string | null;
  recovery_grace_period_days?: number;
  recovery_status?: string;
}

interface LegacyLockerProps {
  isUnlockedFromParent?: boolean;
  sessionMasterPasswordFromParent?: string | null;
  hideEncryptionControls?: boolean;
}

const LegacyLocker: React.FC<LegacyLockerProps> = ({ 
  isUnlockedFromParent, 
  sessionMasterPasswordFromParent,
  hideEncryptionControls = false
}) => {
  const { toast } = useToast();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [existingData, setExistingData] = useState<LegacyLockerData | null>(null);
  const [contributorRole, setContributorRole] = useState<'administrator' | 'contributor' | 'viewer' | null>(null);
  const [isContributor, setIsContributor] = useState(false);
  const [contributorCheckDone, setContributorCheckDone] = useState(false);
  const [contributors, setContributors] = useState<any[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
  const [gracePeriodDays, setGracePeriodDays] = useState(14);
  const [showRecoveryRequestDialog, setShowRecoveryRequestDialog] = useState(false);
  const [isDelegate, setIsDelegate] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  // Use parent state if provided, otherwise manage locally
  const [localSessionMasterPassword, setLocalSessionMasterPassword] = useState<string | null>(null);
  const [localIsUnlocked, setLocalIsUnlocked] = useState(false);
  
  const sessionMasterPassword = sessionMasterPasswordFromParent ?? localSessionMasterPassword;
  const isUnlocked = isUnlockedFromParent ?? localIsUnlocked;
  const isControlledByParent = isUnlockedFromParent !== undefined;

  // Determine if user has access to Legacy Locker
  const hasLegacyLockerAccess = isPremium || isContributor || subscriptionLoading || !contributorCheckDone;


  
  // Persist activeSection to localStorage
  const [activeSection, setActiveSection] = useState<string>(() => {
    const saved = localStorage.getItem('legacyLocker_activeSection');
    return saved || 'personal';
  });

  // Persist activeSection changes
  useEffect(() => {
    localStorage.setItem('legacyLocker_activeSection', activeSection);
  }, [activeSection]);

  // Reference for scrolling to content
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Auto-save draft to localStorage to prevent data loss
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<LegacyLockerData>({
    full_legal_name: '',
    address: '',
    executor_name: '',
    executor_relationship: '',
    executor_contact: '',
    backup_executor_name: '',
    backup_executor_contact: '',
    guardian_name: '',
    guardian_relationship: '',
    guardian_contact: '',
    backup_guardian_name: '',
    backup_guardian_contact: '',
    spouse_name: '',
    spouse_contact: '',
    attorney_name: '',
    attorney_firm: '',
    attorney_contact: '',
    business_partner_name: '',
    business_partner_company: '',
    business_partner_contact: '',
    investment_firm_name: '',
    investment_advisor_name: '',
    investment_firm_contact: '',
    financial_advisor_name: '',
    financial_advisor_firm: '',
    financial_advisor_contact: '',
    residuary_estate: '',
    digital_assets: '',
    real_estate_instructions: '',
    debts_expenses: '',
    funeral_wishes: '',
    burial_or_cremation: '',
    ceremony_preferences: '',
    organ_donation: false,
    no_contest_clause: true,
    letters_to_loved_ones: '',
    pet_care_instructions: '',
    business_succession_plan: '',
    ethical_will: '',
  });
  
  // Save form data to localStorage as draft
  const saveDraftToLocalStorage = useCallback((data: LegacyLockerData) => {
    try {
      localStorage.setItem('legacyLocker_formDraft', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, []);

  // Clear draft from localStorage (called after successful save)
  const clearDraftFromLocalStorage = useCallback(() => {
    localStorage.removeItem('legacyLocker_formDraft');
  }, []);

  // Load draft from localStorage on mount (only if no existing data from DB)
  useEffect(() => {
    const savedDraft = localStorage.getItem('legacyLocker_formDraft');
    if (savedDraft && !existingData) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, [existingData]);

  // Auto-save draft with debounce when formData changes
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (isUnlocked || !isEncrypted) {
        saveDraftToLocalStorage(formData);
      }
    }, 1000); // Save after 1 second of inactivity
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, isUnlocked, isEncrypted, saveDraftToLocalStorage]);

  // Scroll to top of content when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // On desktop, scroll to content smoothly
    if (contentRef.current && window.innerWidth >= 768) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Completion status calculation for each section
  const getSectionStatus = (section: string): 'completed' | 'in_progress' | 'not_started' => {
    switch (section) {
      case 'personal':
        const personalFields = [formData.full_legal_name, formData.address];
        const personalFilled = personalFields.filter(f => f && f.trim()).length;
        if (personalFilled === personalFields.length) return 'completed';
        if (personalFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'voicenotes':
        // Voice notes have their own component - we'll check if any exist via existingData
        return 'not_started'; // Will be updated when VoiceNotesSection provides data
      
      case 'contacts':
        try {
          const contacts = JSON.parse(formData.digital_assets || '[]');
          if (Array.isArray(contacts) && contacts.length > 0) {
            const hasComplete = contacts.some((c: any) => c.name && c.contact);
            if (hasComplete) return 'completed';
            return 'in_progress';
          }
        } catch {}
        return 'not_started';
      
      case 'executor':
        const executorFields = [formData.executor_name, formData.executor_contact];
        const executorFilled = executorFields.filter(f => f && f.trim()).length;
        if (executorFilled === executorFields.length) return 'completed';
        if (executorFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'guardians':
        const guardianFields = [formData.guardian_name, formData.guardian_contact];
        const guardianFilled = guardianFields.filter(f => f && f.trim()).length;
        if (guardianFilled === guardianFields.length) return 'completed';
        if (guardianFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'assets':
        const assetFields = [formData.residuary_estate, formData.debts_expenses];
        const assetFilled = assetFields.filter(f => f && f.trim()).length;
        if (assetFilled === assetFields.length) return 'completed';
        if (assetFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'property':
        const propertyFields = [formData.real_estate_instructions];
        const propertyFilled = propertyFields.filter(f => f && f.trim()).length;
        if (propertyFilled === propertyFields.length) return 'completed';
        if (propertyFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'trust':
        // Trust info managed by TrustInformation component
        return 'not_started';
      
      case 'wishes':
        const wishesFields = [formData.funeral_wishes, formData.burial_or_cremation, formData.letters_to_loved_ones];
        const wishesFilled = wishesFields.filter(f => f && f.trim()).length;
        if (wishesFilled >= 2) return 'completed';
        if (wishesFilled > 0) return 'in_progress';
        return 'not_started';
      
      case 'uploads':
        // Uploads managed by LegacyLockerUploads component
        return 'not_started';
      
      default:
        return 'not_started';
    }
  };


  const StatusIndicator = ({ status }: { status: 'completed' | 'in_progress' | 'not_started' }) => {
    if (status === 'completed') {
      return <Check className="h-4 w-4 text-green-500 ml-auto" />;
    }
    if (status === 'in_progress') {
      return <Circle className="h-3 w-3 fill-amber-500 text-amber-500 ml-auto" />;
    }
    return <Circle className="h-3 w-3 text-muted-foreground ml-auto" />;
  };

  useEffect(() => {
    checkContributorStatus();
    fetchLegacyLocker();
    fetchContributors();
  }, []);

  const checkContributorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setContributorCheckDone(true);
        return;
      }

      // Check if this user is a contributor to someone else's account
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('role, account_owner_id')
        .eq('contributor_user_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (contributorData) {
        setIsContributor(true);
        setContributorRole(contributorData.role);
      }
      setContributorCheckDone(true);
    } catch (error) {
      console.error('Error checking contributor status:', error);
      setContributorCheckDone(true);
    }
  };

  const fetchContributors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  const fetchLegacyLocker = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('legacy_locker')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsEncrypted(data.is_encrypted);
        setSelectedDelegateId(data.delegate_user_id);
        setGracePeriodDays(data.recovery_grace_period_days || 14);
        setHasPendingRequest(data.recovery_status === 'pending');
        
        // Check if current user is the delegate
        setIsDelegate(data.delegate_user_id === user.id);
        
        // Convert database data to form data format
        const convertedData: LegacyLockerData = {
          id: data.id,
          full_legal_name: data.full_legal_name || '',
          address: data.address || '',
          executor_name: data.executor_name || '',
          executor_relationship: data.executor_relationship || '',
          executor_contact: data.executor_contact || '',
          backup_executor_name: data.backup_executor_name || '',
          backup_executor_contact: data.backup_executor_contact || '',
          guardian_name: data.guardian_name || '',
          guardian_relationship: data.guardian_relationship || '',
          guardian_contact: data.guardian_contact || '',
          backup_guardian_name: data.backup_guardian_name || '',
          backup_guardian_contact: data.backup_guardian_contact || '',
          spouse_name: (data as any).spouse_name || '',
          spouse_contact: (data as any).spouse_contact || '',
          attorney_name: (data as any).attorney_name || '',
          attorney_firm: (data as any).attorney_firm || '',
          attorney_contact: (data as any).attorney_contact || '',
          business_partner_name: (data as any).business_partner_name || '',
          business_partner_company: (data as any).business_partner_company || '',
          business_partner_contact: (data as any).business_partner_contact || '',
          investment_firm_name: (data as any).investment_firm_name || '',
          investment_advisor_name: (data as any).investment_advisor_name || '',
          investment_firm_contact: (data as any).investment_firm_contact || '',
          financial_advisor_name: (data as any).financial_advisor_name || '',
          financial_advisor_firm: (data as any).financial_advisor_firm || '',
          financial_advisor_contact: (data as any).financial_advisor_contact || '',
          residuary_estate: data.residuary_estate || '',
          digital_assets: typeof data.digital_assets === 'string' ? data.digital_assets : JSON.stringify(data.digital_assets || ''),
          real_estate_instructions: data.real_estate_instructions || '',
          debts_expenses: data.debts_expenses || '',
          funeral_wishes: data.funeral_wishes || '',
          burial_or_cremation: data.burial_or_cremation || '',
          ceremony_preferences: data.ceremony_preferences || '',
          organ_donation: data.organ_donation || false,
          no_contest_clause: data.no_contest_clause ?? true,
          letters_to_loved_ones: data.letters_to_loved_ones || '',
          pet_care_instructions: data.pet_care_instructions || '',
          business_succession_plan: data.business_succession_plan || '',
          ethical_will: data.ethical_will || '',
          is_encrypted: data.is_encrypted,
          delegate_user_id: data.delegate_user_id,
          recovery_grace_period_days: data.recovery_grace_period_days,
          recovery_status: data.recovery_status,
        };
        
        setExistingData(convertedData);
        
        if (!data.is_encrypted) {
          setFormData(convertedData);
          setLocalIsUnlocked(true);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockClick = () => {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_HASH_KEY);
    if (!storedHash) {
      setShowMasterPasswordModal(true);
    } else {
      setShowMasterPasswordModal(true);
    }
  };

  const handleMasterPasswordSubmit = async (password: string) => {
    try {
      setLocalSessionMasterPassword(password);
      setLocalIsUnlocked(true);
      
      if (existingData && existingData.is_encrypted) {
        // Decrypt all text fields
        const decryptedData: any = { ...existingData };
        
        const textFields: Array<keyof LegacyLockerData> = [
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
          'ethical_will'
        ];

        for (const field of textFields) {
          const value = decryptedData[field];
          if (value && typeof value === 'string') {
            try {
              decryptedData[field] = await decryptPassword(value, password);
            } catch (err) {
              console.error(`Failed to decrypt ${field}`);
            }
          }
        }
        
        setFormData(decryptedData as LegacyLockerData);
      }
      
      setShowMasterPasswordModal(false);
      toast({
        title: 'Success',
        description: 'Legacy Locker unlocked',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to unlock Legacy Locker',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let dataToSave = { ...formData };

      if (isEncrypted) {
        if (!sessionMasterPassword) {
          toast({
            title: 'Error',
            description: 'Master password required for encryption',
            variant: 'destructive',
          });
          return;
        }

        // Encrypt all text fields
        const textFields: Array<keyof LegacyLockerData> = [
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
          'ethical_will'
        ];

        const encryptedData: any = { ...dataToSave };
        for (const field of textFields) {
          const value = encryptedData[field];
          if (value && typeof value === 'string') {
            encryptedData[field] = await encryptPassword(value, sessionMasterPassword);
          }
        }
        dataToSave = encryptedData;
      }

      const payload = {
        user_id: user.id,
        is_encrypted: isEncrypted,
        delegate_user_id: selectedDelegateId,
        recovery_grace_period_days: gracePeriodDays,
        ...dataToSave,
      };

      if (existingData?.id) {
        const { error } = await supabase
          .from('legacy_locker')
          .update(payload)
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('legacy_locker')
          .insert([payload]);
        
        if (error) throw error;
      }

      // Clear the local draft since we saved successfully
      clearDraftFromLocalStorage();
      
      toast({
        title: 'Success',
        description: 'Legacy Locker saved successfully',
      });
      
      fetchLegacyLocker();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LegacyLockerData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if user is a non-administrator contributor
  if (isContributor && contributorRole !== 'administrator') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legacy Locker
          </CardTitle>
          <CardDescription>
            High-Value Information Beyond a Traditional Will
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <Lock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Access Restricted</strong>
              <br />
              The Legacy Locker section is only accessible to users with Administrator permissions. 
              Your current role ({contributorRole}) does not include access to this sensitive information.
              <br /><br />
              Please contact the account owner if you need access to this section.
            </AlertDescription>
          </Alert>
          <div className="bg-muted/50 rounded-lg p-8 text-center space-y-4">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Legacy Locker content is hidden to protect sensitive personal and estate information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If controlled by parent but not unlocked, return null (parent handles unlock UI)
  if (isControlledByParent && isEncrypted && !isUnlocked) {
    return null;
  }

  // Standalone mode - show locked state
  if (!isControlledByParent && isEncrypted && !isUnlocked) {
    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legacy Locker
            </CardTitle>
            <CardDescription>
              Your Last Will & Testament - Encrypted for your security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This Legacy Locker is encrypted. {isDelegate ? 'As a designated recovery delegate, you can request access if needed.' : 'Enter your master password to unlock and view.'}
              </AlertDescription>
            </Alert>
            
            {isDelegate ? (
              <>
                <Button onClick={() => setShowRecoveryRequestDialog(true)} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Request Access to Encrypted Vault
                </Button>
                
                {existingData?.id && (
                  <RecoveryRequestDialog
                    isOpen={showRecoveryRequestDialog}
                    onClose={() => setShowRecoveryRequestDialog(false)}
                    legacyLockerId={existingData.id}
                    gracePeriodDays={gracePeriodDays}
                    onRequestSubmitted={() => {
                      fetchLegacyLocker();
                      setShowRecoveryRequestDialog(false);
                    }}
                  />
                )}
              </>
            ) : (
              <Button onClick={handleUnlockClick} className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Legacy Locker
              </Button>
            )}
          </CardContent>
        </Card>
        
        <MasterPasswordModal
          isOpen={showMasterPasswordModal}
          isSetup={!localStorage.getItem(MASTER_PASSWORD_HASH_KEY)}
          onSubmit={handleMasterPasswordSubmit}
          onCancel={() => setShowMasterPasswordModal(false)}
        />
      </>
    );
  }

  // Premium gate - show upgrade prompt for non-premium users who aren't contributors
  if (!hasLegacyLockerAccess) {
    return (
      <PremiumFeatureGate 
        featureKey="legacy_locker"
        title="Legacy Locker"
        description="Secure your family's future with Legacy Locker. Store important documents, executor information, and estate planning details for trusted family access."
      >
        <div />
      </PremiumFeatureGate>
    );
  }

  return (
    <>
      <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legacy Locker
            </CardTitle>
            <CardDescription>
              High-Value Information Beyond a Traditional Will
            </CardDescription>
          </div>
          {/* Only show encryption toggle when not controlled by parent */}
          {!hideEncryptionControls && (
            <div className="flex items-center gap-2">
              <Label htmlFor="encryption-toggle" className={isEncrypted && existingData?.is_encrypted ? "text-muted-foreground" : ""}>
                {isEncrypted && existingData?.is_encrypted ? "Encrypted" : "Encrypt"}
              </Label>
              <Switch
                id="encryption-toggle"
                checked={isEncrypted}
                onCheckedChange={(checked) => {
                  setIsEncrypted(checked);
                  if (checked && !sessionMasterPassword) {
                    handleUnlockClick();
                  }
                }}
                disabled={loading || (isEncrypted && existingData?.is_encrypted)}
              />
            </div>
          )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Show pending recovery request alert for owners - only when not controlled by parent */}
          {!hideEncryptionControls && existingData?.id && hasPendingRequest && !isDelegate && (
            <RecoveryRequestAlert
              legacyLockerId={existingData.id}
              onRequestResolved={() => {
                setHasPendingRequest(false);
                fetchLegacyLocker();
              }}
            />
          )}

          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> The Legacy Locker is not a legal will. It's a secure vault for photos, videos, notes, account access, and other details that help clarify your wishes.
              <br /><br />
              It doesn't replace an official will, but it adds valuable context and support for your estate plans.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground mb-4 italic">
            Most people complete this in short sessions over time. You don't need to finish everything today.
          </p>

          {/* Only show encryption status alert when not controlled by parent */}
          {!hideEncryptionControls && (
            <Alert className="mb-4">
              <AlertDescription>
                {isEncrypted 
                  ? 'This information is encrypted and only accessible with your master password. Contributors will not be able to view encrypted data.'
                  : 'This information is not encrypted. Contributors with access can view this data.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Recovery delegate selector - only show for owners when encryption is enabled and not controlled by parent */}
          {!hideEncryptionControls && isEncrypted && !isDelegate && !isContributor && (
            <RecoveryDelegateSelector
              contributors={contributors}
              selectedDelegateId={selectedDelegateId}
              gracePeriodDays={gracePeriodDays}
              onDelegateChange={setSelectedDelegateId}
              onGracePeriodChange={setGracePeriodDays}
            />
          )}

          {/* Category Navigation Dropdown */}
          <div className="flex items-center gap-3 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  {activeSection === 'personal' && <><FileText className="h-4 w-4 mr-2" />Personal</>}
                  {activeSection === 'voicenotes' && <><Mic className="h-4 w-4 mr-2" />Voice</>}
                  {activeSection === 'contacts' && <><Contact className="h-4 w-4 mr-2" />Contacts</>}
                  {activeSection === 'executor' && <><Users className="h-4 w-4 mr-2" />Executor</>}
                  {activeSection === 'guardians' && <><Shield className="h-4 w-4 mr-2" />Guardians</>}
                  {activeSection === 'assets' && <><DollarSign className="h-4 w-4 mr-2" />Assets</>}
                  {activeSection === 'property' && <><Home className="h-4 w-4 mr-2" />Property</>}
                  {activeSection === 'trust' && <><Scale className="h-4 w-4 mr-2" />Trust</>}
                  {activeSection === 'wishes' && <><Heart className="h-4 w-4 mr-2" />Wishes</>}
                  {activeSection === 'uploads' && <><Upload className="h-4 w-4 mr-2" />Uploads</>}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border shadow-lg z-50">
                <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-semibold">
                  About You
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSectionChange('personal')} className="cursor-pointer flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Personal
                  <StatusIndicator status={getSectionStatus('personal')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('voicenotes')} className="cursor-pointer flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                  <StatusIndicator status={getSectionStatus('voicenotes')} />
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-semibold">
                  People You Trust
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSectionChange('contacts')} className="cursor-pointer flex items-center">
                  <Contact className="h-4 w-4 mr-2" />
                  Contacts
                  <StatusIndicator status={getSectionStatus('contacts')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('executor')} className="cursor-pointer flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Executor
                  <StatusIndicator status={getSectionStatus('executor')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('guardians')} className="cursor-pointer flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Guardians
                  <StatusIndicator status={getSectionStatus('guardians')} />
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-semibold">
                  Assets & Ownership
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSectionChange('assets')} className="cursor-pointer flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Assets
                  <StatusIndicator status={getSectionStatus('assets')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('property')} className="cursor-pointer flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Property
                  <StatusIndicator status={getSectionStatus('property')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('trust')} className="cursor-pointer flex items-center">
                  <Scale className="h-4 w-4 mr-2" />
                  Trust
                  <StatusIndicator status={getSectionStatus('trust')} />
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-semibold">
                  Your Wishes
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSectionChange('wishes')} className="cursor-pointer flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishes
                  <StatusIndicator status={getSectionStatus('wishes')} />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSectionChange('uploads')} className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Uploads
                  <StatusIndicator status={getSectionStatus('uploads')} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Section Content */}
          <div ref={contentRef} className="w-full scroll-mt-4">
            {activeSection === 'personal' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Human meaning + clarity = fewer misunderstandings after death.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="full_legal_name">Full Legal Name</Label>
                  <Input
                    id="full_legal_name"
                    value={formData.full_legal_name}
                    onChange={(e) => handleInputChange('full_legal_name', e.target.value)}
                    placeholder="Your full legal name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Your full address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="life_overview">Life overview / personal background</Label>
                  <Textarea
                    id="life_overview"
                    placeholder="A short narrative for family: upbringing, values, principles."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digital_identity">Digital identity preferences</Label>
                  <Textarea
                    id="digital_identity"
                    placeholder="How they want social media handled, memorialized, or deleted."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_philosophies">Personal philosophies or reminders for loved ones</Label>
                  <Textarea
                    id="personal_philosophies"
                    placeholder="Example: Always take the family trip. Don't wait."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical_preferences">Medical or ethical preferences not covered by legal docs</Label>
                  <Textarea
                    id="medical_preferences"
                    placeholder="Example: organ donation rationale, cultural preferences, music they'd want at a memorial."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeSection === 'contacts' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Essential VIP contacts your loved ones may need to reach immediately.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {(JSON.parse(formData.digital_assets || '[]') as any[]).map((contact: any, index: number) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg bg-muted/30 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const contacts = JSON.parse(formData.digital_assets || '[]');
                          contacts.splice(index, 1);
                          handleInputChange('digital_assets', JSON.stringify(contacts));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={contact.name || ''}
                          onChange={(e) => {
                            const contacts = JSON.parse(formData.digital_assets || '[]');
                            contacts[index] = { ...contacts[index], name: e.target.value };
                            handleInputChange('digital_assets', JSON.stringify(contacts));
                          }}
                          placeholder="Enter contact name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Relationship / Title / Business</Label>
                        <Input
                          value={contact.relationship || ''}
                          onChange={(e) => {
                            const contacts = JSON.parse(formData.digital_assets || '[]');
                            contacts[index] = { ...contacts[index], relationship: e.target.value };
                            handleInputChange('digital_assets', JSON.stringify(contacts));
                          }}
                          placeholder="e.g., Spouse, Attorney, Business Partner, Financial Advisor"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Contact Information</Label>
                        <Textarea
                          value={contact.contact || ''}
                          onChange={(e) => {
                            const contacts = JSON.parse(formData.digital_assets || '[]');
                            contacts[index] = { ...contacts[index], contact: e.target.value };
                            handleInputChange('digital_assets', JSON.stringify(contacts));
                          }}
                          placeholder="Phone, email, address, or any other contact details"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const contacts = JSON.parse(formData.digital_assets || '[]');
                      contacts.push({ name: '', relationship: '', contact: '' });
                      handleInputChange('digital_assets', JSON.stringify(contacts));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'executor' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Executors are often overwhelmed. Giving them a roadmap is huge.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Primary Executor</h3>
                  <div className="space-y-2">
                    <Label htmlFor="executor_name">Name</Label>
                    <Input
                      id="executor_name"
                      value={formData.executor_name}
                      onChange={(e) => handleInputChange('executor_name', e.target.value)}
                      placeholder="Executor's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="executor_relationship">Relationship</Label>
                    <Input
                      id="executor_relationship"
                      value={formData.executor_relationship}
                      onChange={(e) => handleInputChange('executor_relationship', e.target.value)}
                      placeholder="e.g., Spouse, Sibling, Friend"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="executor_contact">Contact Information</Label>
                    <Input
                      id="executor_contact"
                      value={formData.executor_contact}
                      onChange={(e) => handleInputChange('executor_contact', e.target.value)}
                      placeholder="Phone and/or email"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Backup Executor</h3>
                  <div className="space-y-2">
                    <Label htmlFor="backup_executor_name">Name</Label>
                    <Input
                      id="backup_executor_name"
                      value={formData.backup_executor_name}
                      onChange={(e) => handleInputChange('backup_executor_name', e.target.value)}
                      placeholder="Backup executor's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup_executor_contact">Contact Information</Label>
                    <Input
                      id="backup_executor_contact"
                      value={formData.backup_executor_contact}
                      onChange={(e) => handleInputChange('backup_executor_contact', e.target.value)}
                      placeholder="Phone and/or email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="executor_instructions">Step-by-step instructions for your specific situation</Label>
                  <Textarea
                    id="executor_instructions"
                    placeholder='Ex: "Contact my financial advisor, then my CPA. Here are their numbers."'
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptions">List of recurring subscriptions and services to cancel</Label>
                  <Textarea
                    id="subscriptions"
                    placeholder="Netflix, Amazon, insurance policies, memberships."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="household_operations">Household operations guide</Label>
                  <Textarea
                    id="household_operations"
                    placeholder="Alarm codes, how the sprinkler system works, who services the HVAC."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial_crypto">Financial/crypto explanation in plain English</Label>
                  <Textarea
                    id="financial_crypto"
                    placeholder="Legal wills often state 'I have crypto,' but don't explain how to access it."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeSection === 'guardians' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> A will names a guardian; Legacy Locker teaches them how to parent the way you would.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Primary Guardian</h3>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_name">Name</Label>
                    <Input
                      id="guardian_name"
                      value={formData.guardian_name}
                      onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                      placeholder="Guardian's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_relationship">Relationship</Label>
                    <Input
                      id="guardian_relationship"
                      value={formData.guardian_relationship}
                      onChange={(e) => handleInputChange('guardian_relationship', e.target.value)}
                      placeholder="e.g., Grandparent, Aunt, Uncle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_contact">Contact Information</Label>
                    <Input
                      id="guardian_contact"
                      value={formData.guardian_contact}
                      onChange={(e) => handleInputChange('guardian_contact', e.target.value)}
                      placeholder="Phone and/or email"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">Backup Guardian</h3>
                  <div className="space-y-2">
                    <Label htmlFor="backup_guardian_name">Name</Label>
                    <Input
                      id="backup_guardian_name"
                      value={formData.backup_guardian_name}
                      onChange={(e) => handleInputChange('backup_guardian_name', e.target.value)}
                      placeholder="Backup guardian's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup_guardian_contact">Contact Information</Label>
                    <Input
                      id="backup_guardian_contact"
                      value={formData.backup_guardian_contact}
                      onChange={(e) => handleInputChange('backup_guardian_contact', e.target.value)}
                      placeholder="Phone and/or email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parenting_preferences">Parenting preferences</Label>
                  <Textarea
                    id="parenting_preferences"
                    placeholder="Routines, bedtimes, diets, schooling preferences."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emotional_behavioral">Emotional/behavioral notes</Label>
                  <Textarea
                    id="emotional_behavioral"
                    placeholder="Fears, allergies, quirks, triggers, strengths."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developmental_goals">Developmental goals</Label>
                  <Textarea
                    id="developmental_goals"
                    placeholder="Faith, character, education, extracurriculars."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="letters_to_children">Letters to children at key ages</Label>
                  <Textarea
                    id="letters_to_children"
                    placeholder="10, 16, 18, wedding day, etc."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeSection === 'assets' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Evidence + clarity reduces disputes and attorney fees dramatically.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="residuary_estate">Residuary Estate Instructions</Label>
                  <Textarea
                    id="residuary_estate"
                    value={formData.residuary_estate}
                    onChange={(e) => handleInputChange('residuary_estate', e.target.value)}
                    placeholder="Who receives what's left after debts, taxes, and specific gifts? (e.g., spouse, children, charity)"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="digital_assets">Digital Assets & Online Accounts</Label>
                  <Textarea
                    id="digital_assets"
                    value={formData.digital_assets}
                    onChange={(e) => handleInputChange('digital_assets', e.target.value)}
                    placeholder="Social media, cryptocurrency, cloud storage, email accounts, digital business properties. Who gets access? What should be deleted or preserved?"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debts_expenses">Debts & Expenses Instructions</Label>
                  <Textarea
                    id="debts_expenses"
                    value={formData.debts_expenses}
                    onChange={(e) => handleInputChange('debts_expenses', e.target.value)}
                    placeholder="Outstanding loans, funeral expenses, taxes, legal fees"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo_video_documentation">Photo/video documentation of every major item</Label>
                  <Textarea
                    id="photo_video_documentation"
                    placeholder="This solves disputes, reduces fraud, accelerates probate."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physical_documents">Where to find physical documents</Label>
                  <Textarea
                    id="physical_documents"
                    placeholder="Deeds, titles, receipts, service histories."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sentimental_items">Plain-language explanation of sentimental items</Label>
                  <Textarea
                    id="sentimental_items"
                    placeholder="Why something matters (wills don't capture value beyond $$)."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crypto_passwords">Crypto wallets, passwords, digital accounts</Label>
                  <Textarea
                    id="crypto_passwords"
                    placeholder="Not included in normal wills."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {activeSection === 'property' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Property transitions are expensive and confusing — this minimizes friction.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="real_estate_instructions">Real Estate Instructions</Label>
                  <Textarea
                    id="real_estate_instructions"
                    value={formData.real_estate_instructions}
                    onChange={(e) => handleInputChange('real_estate_instructions', e.target.value)}
                    placeholder="Who inherits your home or investment properties? Should any property be sold? Any conditions?"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_walkthrough">Property walk-through videos</Label>
                  <Textarea
                    id="property_walkthrough"
                    placeholder="Explaining what's valuable, what to donate, what to toss."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home_maintenance">Home maintenance list</Label>
                  <Textarea
                    id="home_maintenance"
                    placeholder="Water shutoff, HVAC filters, annual tasks."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood_contacts">Neighborhood or tenant contacts</Label>
                  <Textarea
                    id="neighborhood_contacts"
                    placeholder="Important contacts for property management."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rental_property">Rental property instructions</Label>
                  <Textarea
                    id="rental_property"
                    placeholder="Lease locations, key contacts, payout preferences."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {activeSection === 'trust' && (
              <div className="space-y-4 mt-6">
                <TrustInformation 
                  isUnlockedFromParent={isUnlocked}
                  sessionMasterPasswordFromParent={sessionMasterPassword}
                />
              </div>
            )}

            {activeSection === 'wishes' && (
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="funeral_wishes">Funeral/memorial preferences (with reasoning)</Label>
                  <Textarea
                    id="funeral_wishes"
                    value={formData.funeral_wishes}
                    onChange={(e) => handleInputChange('funeral_wishes', e.target.value)}
                    placeholder="Songs, colors, location, faith elements."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burial_or_cremation">Burial or Cremation</Label>
                  <Input
                    id="burial_or_cremation"
                    value={formData.burial_or_cremation}
                    onChange={(e) => handleInputChange('burial_or_cremation', e.target.value)}
                    placeholder="Burial, Cremation, or Other"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ceremony_preferences">Ceremony Preferences</Label>
                  <Textarea
                    id="ceremony_preferences"
                    value={formData.ceremony_preferences}
                    onChange={(e) => handleInputChange('ceremony_preferences', e.target.value)}
                    placeholder="Any specific wishes for the ceremony"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="organ_donation"
                    checked={formData.organ_donation}
                    onCheckedChange={(checked) => handleInputChange('organ_donation', checked)}
                  />
                  <Label htmlFor="organ_donation">Organ Donation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="no_contest_clause"
                    checked={formData.no_contest_clause}
                    onCheckedChange={(checked) => handleInputChange('no_contest_clause', checked)}
                  />
                  <Label htmlFor="no_contest_clause">Include No-Contest Clause</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sentimental_distribution">How to distribute sentimental items</Label>
                  <Textarea
                    id="sentimental_distribution"
                    placeholder="Often the #1 cause of family arguments."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legacy_messages">Legacy messages</Label>
                  <Textarea
                    id="legacy_messages"
                    placeholder="What you hope your children carry forward."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charitable_giving">Charitable giving rationale</Label>
                  <Textarea
                    id="charitable_giving"
                    placeholder="Why certain donations matter."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="letters_to_loved_ones">Letters to Loved Ones</Label>
                  <Textarea
                    id="letters_to_loved_ones"
                    value={formData.letters_to_loved_ones}
                    onChange={(e) => handleInputChange('letters_to_loved_ones', e.target.value)}
                    placeholder="Personal messages to family and friends"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet_care_instructions">Pet Care Instructions</Label>
                  <Textarea
                    id="pet_care_instructions"
                    value={formData.pet_care_instructions}
                    onChange={(e) => handleInputChange('pet_care_instructions', e.target.value)}
                    placeholder="Who will care for your pets? Include guardian name and any specific instructions or funding"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_succession_plan">Business Succession Plan</Label>
                  <Textarea
                    id="business_succession_plan"
                    value={formData.business_succession_plan}
                    onChange={(e) => handleInputChange('business_succession_plan', e.target.value)}
                    placeholder="Plans for family businesses"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethical_will">Ethical Will / Legacy Message</Label>
                  <Textarea
                    id="ethical_will"
                    value={formData.ethical_will}
                    onChange={(e) => handleInputChange('ethical_will', e.target.value)}
                    placeholder="Your values, life lessons, and what you want to be remembered for"
                    rows={6}
                  />
                </div>
              </div>
            )}

            {activeSection === 'voicenotes' && (
              <div className="space-y-4 mt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Why this matters:</strong> Video/audio preserves emotion, not just text.
                    <br /><br />
                    <strong>Examples of high-value recordings:</strong>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Messages to children, spouse, parents.</li>
                      <li>"If something happens to me" guidance.</li>
                      <li>Why certain inheritance decisions were made.</li>
                      <li>Encouragement for difficult life moments.</li>
                      <li>Oral instructions for asset access (but not legal directives).</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <VoiceNotesSection />
              </div>
            )}

            {activeSection === 'uploads' && (
              <div className="space-y-4 mt-6">
                <LegacyLockerUploads />
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Legacy Locker'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MasterPasswordModal
        isOpen={showMasterPasswordModal}
        isSetup={!localStorage.getItem(MASTER_PASSWORD_HASH_KEY)}
        onSubmit={handleMasterPasswordSubmit}
        onCancel={() => setShowMasterPasswordModal(false)}
      />
    </>
  );
};

export default LegacyLocker;