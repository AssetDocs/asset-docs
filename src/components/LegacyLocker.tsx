import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock, Save, FileText, Users, Home, DollarSign, Heart, Shield } from 'lucide-react';
import { encryptPassword, decryptPassword } from '@/utils/encryption';
import MasterPasswordModal from './MasterPasswordModal';
import { MASTER_PASSWORD_HASH_KEY } from './PasswordCatalog';

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
}

const LegacyLocker = () => {
  const { toast } = useToast();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [sessionMasterPassword, setSessionMasterPassword] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<LegacyLockerData | null>(null);
  
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

  useEffect(() => {
    fetchLegacyLocker();
  }, []);

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
        };
        
        setExistingData(convertedData);
        
        if (!data.is_encrypted) {
          setFormData(convertedData);
          setIsUnlocked(true);
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
      setSessionMasterPassword(password);
      setIsUnlocked(true);
      
      if (existingData && existingData.is_encrypted) {
        // Decrypt all text fields
        const decryptedData: any = { ...existingData };
        
        const textFields: Array<keyof LegacyLockerData> = [
          'full_legal_name', 'address', 'executor_name', 'executor_relationship',
          'executor_contact', 'backup_executor_name', 'backup_executor_contact',
          'guardian_name', 'guardian_relationship', 'guardian_contact',
          'backup_guardian_name', 'backup_guardian_contact', 'residuary_estate',
          'digital_assets', 'real_estate_instructions', 'debts_expenses',
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
          'backup_guardian_name', 'backup_guardian_contact', 'residuary_estate',
          'digital_assets', 'real_estate_instructions', 'debts_expenses',
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

  if (isEncrypted && !isUnlocked) {
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
                This Legacy Locker is encrypted. Enter your master password to unlock and view.
              </AlertDescription>
            </Alert>
            <Button onClick={handleUnlockClick} className="w-full">
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Legacy Locker
            </Button>
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
              Your informal Last Will & Testament
            </CardDescription>
          </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="encryption-toggle">Encrypt</Label>
              <Switch
                id="encryption-toggle"
                checked={isEncrypted}
                onCheckedChange={(checked) => {
                  setIsEncrypted(checked);
                  if (checked && !sessionMasterPassword) {
                    handleUnlockClick();
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> The Legacy Locker is not a legal digital will or electronic will (e-will).
              Instead, it serves as an auxiliary evidence vault—a secure place to organize additional information that supports your wishes and helps executors, family members, and trusted contacts understand your intentions.
              <br /><br />
              Your Legacy Locker may include photo and video documentation of your assets, personal notes or explanations of your wishes, access information for personal websites, financial and investment account details, passwords and logins, and supporting documents for estate planning.
              <br /><br />
              This feature does not replace a legally executed will or e-will, but it provides valuable context, clarity, and verification to accompany your official estate documents.
            </AlertDescription>
          </Alert>

          <Alert className="mb-4">
            <AlertDescription>
              {isEncrypted 
                ? 'This information is encrypted and only accessible with your master password. Contributors will not be able to view encrypted data.'
                : 'This information is not encrypted. Contributors with access can view this data.'}
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="personal">
                <FileText className="h-4 w-4 mr-1" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="executor">
                <Users className="h-4 w-4 mr-1" />
                Executor
              </TabsTrigger>
              <TabsTrigger value="guardians">
                <Shield className="h-4 w-4 mr-1" />
                Guardians
              </TabsTrigger>
              <TabsTrigger value="assets">
                <DollarSign className="h-4 w-4 mr-1" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="property">
                <Home className="h-4 w-4 mr-1" />
                Property
              </TabsTrigger>
              <TabsTrigger value="wishes">
                <Heart className="h-4 w-4 mr-1" />
                Wishes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="executor" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="guardians" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  For minor children only. Specify who should care for them if you pass away.
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
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="property" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="wishes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="funeral_wishes">Funeral Wishes</Label>
                <Textarea
                  id="funeral_wishes"
                  value={formData.funeral_wishes}
                  onChange={(e) => handleInputChange('funeral_wishes', e.target.value)}
                  placeholder="Type of ceremony, desired location, etc."
                  rows={3}
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
            </TabsContent>
          </Tabs>

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