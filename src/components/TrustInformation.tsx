import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, X, Save, FileText, Users, DollarSign, MapPin, Upload, 
  AlertCircle, CheckCircle, Building, Briefcase, Shield, Scale
} from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';
import { encryptPassword, decryptPassword } from '@/utils/encryption';

interface Grantor {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

interface Trustee {
  name: string;
  contact: string;
  authority_notes: string;
}

interface Beneficiary {
  name: string;
  contact: string;
  relationship: string;
  type: 'primary' | 'contingent';
  notes: string;
  allocation_percent: number | null;
}

interface TrustAsset {
  asset_id: string;
  category: string;
  ownership_type: 'full' | 'partial';
  description: string;
}

interface TrustDocument {
  file_name: string;
  file_path: string;
  doc_type: string;
  description: string;
  upload_date: string;
}

interface TrustData {
  id?: string;
  trust_name: string;
  trust_type: string;
  effective_date: string;
  amendment_count: number;
  trust_purpose: string;
  grantors: Grantor[];
  current_trustees: Trustee[];
  successor_trustees: Trustee[];
  attorney_name: string;
  attorney_firm: string;
  attorney_phone: string;
  attorney_email: string;
  cpa_name: string;
  cpa_firm: string;
  cpa_phone: string;
  cpa_email: string;
  beneficiaries: Beneficiary[];
  trust_assets: TrustAsset[];
  originals_location: string;
  physical_access_instructions: string;
  keyholder_name: string;
  keyholder_contact: string;
  trust_documents: TrustDocument[];
  is_encrypted: boolean;
}

interface TrustInformationProps {
  isUnlockedFromParent?: boolean;
  sessionMasterPasswordFromParent?: string | null;
}

const initialTrustData: TrustData = {
  trust_name: '',
  trust_type: '',
  effective_date: '',
  amendment_count: 0,
  trust_purpose: '',
  grantors: [],
  current_trustees: [],
  successor_trustees: [],
  attorney_name: '',
  attorney_firm: '',
  attorney_phone: '',
  attorney_email: '',
  cpa_name: '',
  cpa_firm: '',
  cpa_phone: '',
  cpa_email: '',
  beneficiaries: [],
  trust_assets: [],
  originals_location: '',
  physical_access_instructions: '',
  keyholder_name: '',
  keyholder_contact: '',
  trust_documents: [],
  is_encrypted: false,
};

const TrustInformation: React.FC<TrustInformationProps> = ({
  isUnlockedFromParent,
  sessionMasterPasswordFromParent,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrustData>(initialTrustData);
  const [existingData, setExistingData] = useState<TrustData | null>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    fetchTrustInformation();
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('items')
        .select('id, name, category, estimated_value')
        .eq('user_id', user.id);

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const fetchTrustInformation = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trust_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const loadedData: TrustData = {
          id: data.id,
          trust_name: data.trust_name || '',
          trust_type: data.trust_type || '',
          effective_date: data.effective_date || '',
          amendment_count: data.amendment_count || 0,
          trust_purpose: data.trust_purpose || '',
          grantors: (data.grantors as unknown as Grantor[]) || [],
          current_trustees: (data.current_trustees as unknown as Trustee[]) || [],
          successor_trustees: (data.successor_trustees as unknown as Trustee[]) || [],
          attorney_name: data.attorney_name || '',
          attorney_firm: data.attorney_firm || '',
          attorney_phone: data.attorney_phone || '',
          attorney_email: data.attorney_email || '',
          cpa_name: data.cpa_name || '',
          cpa_firm: data.cpa_firm || '',
          cpa_phone: data.cpa_phone || '',
          cpa_email: data.cpa_email || '',
          beneficiaries: (data.beneficiaries as unknown as Beneficiary[]) || [],
          trust_assets: (data.trust_assets as unknown as TrustAsset[]) || [],
          originals_location: data.originals_location || '',
          physical_access_instructions: data.physical_access_instructions || '',
          keyholder_name: data.keyholder_name || '',
          keyholder_contact: data.keyholder_contact || '',
          trust_documents: (data.trust_documents as unknown as TrustDocument[]) || [],
          is_encrypted: data.is_encrypted || false,
        };
        setExistingData(loadedData);
        setFormData(loadedData);
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        trust_name: formData.trust_name,
        trust_type: formData.trust_type,
        effective_date: formData.effective_date || null,
        amendment_count: formData.amendment_count,
        trust_purpose: formData.trust_purpose,
        grantors: formData.grantors as unknown as Json,
        current_trustees: formData.current_trustees as unknown as Json,
        successor_trustees: formData.successor_trustees as unknown as Json,
        attorney_name: formData.attorney_name,
        attorney_firm: formData.attorney_firm,
        attorney_phone: formData.attorney_phone,
        attorney_email: formData.attorney_email,
        cpa_name: formData.cpa_name,
        cpa_firm: formData.cpa_firm,
        cpa_phone: formData.cpa_phone,
        cpa_email: formData.cpa_email,
        beneficiaries: formData.beneficiaries as unknown as Json,
        trust_assets: formData.trust_assets as unknown as Json,
        originals_location: formData.originals_location,
        physical_access_instructions: formData.physical_access_instructions,
        keyholder_name: formData.keyholder_name,
        keyholder_contact: formData.keyholder_contact,
        trust_documents: formData.trust_documents as unknown as Json,
        is_encrypted: formData.is_encrypted,
      };

      if (existingData?.id) {
        const { error } = await supabase
          .from('trust_information')
          .update(payload)
          .eq('id', existingData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trust_information')
          .insert([payload]);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Trust information saved successfully',
      });
      fetchTrustInformation();
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

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let completed = 0;
    let total = 10;

    if (formData.trust_name) completed++;
    if (formData.trust_type) completed++;
    if (formData.current_trustees.length > 0) completed++;
    if (formData.beneficiaries.filter(b => b.type === 'primary').length > 0) completed++;
    if (formData.attorney_name || formData.cpa_name) completed++;
    if (formData.originals_location) completed++;
    if (formData.trust_documents.length > 0) completed++;
    if (formData.grantors.length > 0) completed++;
    if (formData.trust_purpose) completed++;
    if (formData.effective_date) completed++;

    return Math.round((completed / total) * 100);
  };

  const getCompletionBadges = (): { label: string; status: 'success' | 'warning' | 'error' }[] => {
    const badges: { label: string; status: 'success' | 'warning' | 'error' }[] = [];
    
    if (formData.trust_name && formData.trust_type && formData.effective_date) {
      badges.push({ label: 'Essentials Complete', status: 'success' });
    }
    if (formData.current_trustees.length === 0) {
      badges.push({ label: 'Trustee Missing', status: 'error' });
    }
    if (formData.trust_documents.length === 0) {
      badges.push({ label: 'No Legal Docs Uploaded', status: 'warning' });
    }
    if (formData.beneficiaries.filter(b => b.type === 'primary').length === 0) {
      badges.push({ label: 'Primary Beneficiaries Unassigned', status: 'error' });
    }

    return badges;
  };

  const totalAllocation = formData.beneficiaries.reduce(
    (sum, b) => sum + (b.allocation_percent || 0), 0
  );

  // Add/Remove helpers
  const addGrantor = () => {
    setFormData(prev => ({
      ...prev,
      grantors: [...prev.grantors, { name: '', email: '', phone: '', relationship: '' }]
    }));
  };

  const removeGrantor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      grantors: prev.grantors.filter((_, i) => i !== index)
    }));
  };

  const addTrustee = (type: 'current' | 'successor') => {
    const key = type === 'current' ? 'current_trustees' : 'successor_trustees';
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], { name: '', contact: '', authority_notes: '' }]
    }));
  };

  const removeTrustee = (type: 'current' | 'successor', index: number) => {
    const key = type === 'current' ? 'current_trustees' : 'successor_trustees';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const addBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { 
        name: '', contact: '', relationship: '', type: 'primary', notes: '', allocation_percent: null 
      }]
    }));
  };

  const removeBeneficiary = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }));
  };

  const addTrustAsset = () => {
    setFormData(prev => ({
      ...prev,
      trust_assets: [...prev.trust_assets, { asset_id: '', category: '', ownership_type: 'full', description: '' }]
    }));
  };

  const removeTrustAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trust_assets: prev.trust_assets.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trust Section Completion</span>
              <span className="text-sm text-muted-foreground">{calculateCompletion()}%</span>
            </div>
            <Progress value={calculateCompletion()} className="h-2" />
            <div className="flex flex-wrap gap-2 mt-2">
              {getCompletionBadges().map((badge, i) => (
                <Badge 
                  key={i} 
                  variant={badge.status === 'success' ? 'default' : badge.status === 'warning' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {badge.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {badge.status !== 'success' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 h-auto p-2">
          <TabsTrigger value="basics" className="text-xs px-2 py-2">
            <Scale className="h-3 w-3 mr-1 hidden sm:inline" />
            Basics
          </TabsTrigger>
          <TabsTrigger value="people" className="text-xs px-2 py-2">
            <Users className="h-3 w-3 mr-1 hidden sm:inline" />
            People
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="text-xs px-2 py-2">
            <Shield className="h-3 w-3 mr-1 hidden sm:inline" />
            Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-xs px-2 py-2">
            <DollarSign className="h-3 w-3 mr-1 hidden sm:inline" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-xs px-2 py-2">
            <MapPin className="h-3 w-3 mr-1 hidden sm:inline" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs px-2 py-2">
            <FileText className="h-3 w-3 mr-1 hidden sm:inline" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Trust Basics Tab */}
        <TabsContent value="basics" className="space-y-4 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Basic trust information helps your family and trustees quickly understand the structure of your estate plan.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trust_name">Trust Name *</Label>
              <Input
                id="trust_name"
                value={formData.trust_name}
                onChange={(e) => setFormData(prev => ({ ...prev, trust_name: e.target.value }))}
                placeholder="e.g., The Smith Family Trust"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trust_type">Type of Trust</Label>
              <Select
                value={formData.trust_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, trust_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trust type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revocable_living">Revocable Living Trust</SelectItem>
                  <SelectItem value="irrevocable">Irrevocable Trust</SelectItem>
                  <SelectItem value="testamentary">Testamentary Trust</SelectItem>
                  <SelectItem value="special_needs">Special Needs Trust</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amendment_count">Amendment Count</Label>
              <Input
                id="amendment_count"
                type="number"
                min="0"
                value={formData.amendment_count}
                onChange={(e) => setFormData(prev => ({ ...prev, amendment_count: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trust_purpose">Notes / Purpose of Trust</Label>
            <Textarea
              id="trust_purpose"
              value={formData.trust_purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, trust_purpose: e.target.value }))}
              placeholder="Describe the main purpose and goals of this trust..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Trust Basics'}
          </Button>
        </TabsContent>

        {/* Key People Tab */}
        <TabsContent value="people" className="space-y-6 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Identifying key people ensures your trustees and beneficiaries know who to contact for legal, financial, and administrative matters.
            </AlertDescription>
          </Alert>

          {/* Grantors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Grantor(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.grantors.map((grantor, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeGrantor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={grantor.name}
                      onChange={(e) => {
                        const updated = [...formData.grantors];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setFormData(prev => ({ ...prev, grantors: updated }));
                      }}
                      placeholder="Full Name"
                    />
                    <Input
                      value={grantor.email}
                      onChange={(e) => {
                        const updated = [...formData.grantors];
                        updated[index] = { ...updated[index], email: e.target.value };
                        setFormData(prev => ({ ...prev, grantors: updated }));
                      }}
                      placeholder="Email"
                    />
                    <Input
                      value={grantor.phone}
                      onChange={(e) => {
                        const updated = [...formData.grantors];
                        updated[index] = { ...updated[index], phone: e.target.value };
                        setFormData(prev => ({ ...prev, grantors: updated }));
                      }}
                      placeholder="Phone"
                    />
                    <Input
                      value={grantor.relationship}
                      onChange={(e) => {
                        const updated = [...formData.grantors];
                        updated[index] = { ...updated[index], relationship: e.target.value };
                        setFormData(prev => ({ ...prev, grantors: updated }));
                      }}
                      placeholder="Relationship"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addGrantor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Grantor
              </Button>
            </CardContent>
          </Card>

          {/* Current Trustees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Current Trustee(s)
                {formData.current_trustees.length === 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">Missing</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.current_trustees.map((trustee, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeTrustee('current', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    value={trustee.name}
                    onChange={(e) => {
                      const updated = [...formData.current_trustees];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setFormData(prev => ({ ...prev, current_trustees: updated }));
                    }}
                    placeholder="Full Name"
                  />
                  <Input
                    value={trustee.contact}
                    onChange={(e) => {
                      const updated = [...formData.current_trustees];
                      updated[index] = { ...updated[index], contact: e.target.value };
                      setFormData(prev => ({ ...prev, current_trustees: updated }));
                    }}
                    placeholder="Contact Details (phone, email)"
                  />
                  <Textarea
                    value={trustee.authority_notes}
                    onChange={(e) => {
                      const updated = [...formData.current_trustees];
                      updated[index] = { ...updated[index], authority_notes: e.target.value };
                      setFormData(prev => ({ ...prev, current_trustees: updated }));
                    }}
                    placeholder="Authority notes / responsibilities"
                    rows={2}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={() => addTrustee('current')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Current Trustee
              </Button>
            </CardContent>
          </Card>

          {/* Successor Trustees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Successor Trustee(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.successor_trustees.map((trustee, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeTrustee('successor', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    value={trustee.name}
                    onChange={(e) => {
                      const updated = [...formData.successor_trustees];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setFormData(prev => ({ ...prev, successor_trustees: updated }));
                    }}
                    placeholder="Full Name"
                  />
                  <Input
                    value={trustee.contact}
                    onChange={(e) => {
                      const updated = [...formData.successor_trustees];
                      updated[index] = { ...updated[index], contact: e.target.value };
                      setFormData(prev => ({ ...prev, successor_trustees: updated }));
                    }}
                    placeholder="Contact Details"
                  />
                  <Textarea
                    value={trustee.authority_notes}
                    onChange={(e) => {
                      const updated = [...formData.successor_trustees];
                      updated[index] = { ...updated[index], authority_notes: e.target.value };
                      setFormData(prev => ({ ...prev, successor_trustees: updated }));
                    }}
                    placeholder="Authority notes"
                    rows={2}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={() => addTrustee('successor')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Successor Trustee
              </Button>
            </CardContent>
          </Card>

          {/* Attorney & CPA */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Attorney / Legal Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={formData.attorney_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, attorney_name: e.target.value }))}
                  placeholder="Attorney Name"
                />
                <Input
                  value={formData.attorney_firm}
                  onChange={(e) => setFormData(prev => ({ ...prev, attorney_firm: e.target.value }))}
                  placeholder="Law Firm"
                />
                <Input
                  value={formData.attorney_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, attorney_phone: e.target.value }))}
                  placeholder="Phone"
                />
                <Input
                  value={formData.attorney_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, attorney_email: e.target.value }))}
                  placeholder="Email"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  CPA / Financial Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={formData.cpa_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpa_name: e.target.value }))}
                  placeholder="CPA Name"
                />
                <Input
                  value={formData.cpa_firm}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpa_firm: e.target.value }))}
                  placeholder="Firm"
                />
                <Input
                  value={formData.cpa_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpa_phone: e.target.value }))}
                  placeholder="Phone"
                />
                <Input
                  value={formData.cpa_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpa_email: e.target.value }))}
                  placeholder="Email"
                />
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Key People'}
          </Button>
        </TabsContent>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries" className="space-y-4 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Clearly documenting beneficiaries and their allocations prevents disputes and ensures your wishes are honored.
            </AlertDescription>
          </Alert>

          {/* Allocation Warning */}
          {totalAllocation > 0 && totalAllocation !== 100 && (
            <Alert variant={totalAllocation > 100 ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Total allocation is {totalAllocation}%. {totalAllocation !== 100 && 'Consider adjusting to total 100%.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Primary Beneficiaries */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              Primary Beneficiaries
              {formData.beneficiaries.filter(b => b.type === 'primary').length === 0 && (
                <Badge variant="destructive" className="text-xs">Missing</Badge>
              )}
            </h3>
            {formData.beneficiaries.filter(b => b.type === 'primary').map((beneficiary, index) => {
              const actualIndex = formData.beneficiaries.findIndex((b, i) => 
                b === beneficiary && formData.beneficiaries.slice(0, i + 1).filter(x => x.type === 'primary').length === index + 1
              );
              return (
                <div key={actualIndex} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeBeneficiary(actualIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={beneficiary.name}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], name: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Beneficiary Name"
                    />
                    <Input
                      value={beneficiary.contact}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], contact: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Contact Info"
                    />
                    <Input
                      value={beneficiary.relationship}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], relationship: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Relationship"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={beneficiary.allocation_percent || ''}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], allocation_percent: parseFloat(e.target.value) || null };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="% Allocation"
                    />
                  </div>
                  <Textarea
                    value={beneficiary.notes}
                    onChange={(e) => {
                      const updated = [...formData.beneficiaries];
                      updated[actualIndex] = { ...updated[actualIndex], notes: e.target.value };
                      setFormData(prev => ({ ...prev, beneficiaries: updated }));
                    }}
                    placeholder="Notes/Conditions (e.g., age requirements, education)"
                    rows={2}
                  />
                </div>
              );
            })}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  beneficiaries: [...prev.beneficiaries, { 
                    name: '', contact: '', relationship: '', type: 'primary', notes: '', allocation_percent: null 
                  }]
                }));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Primary Beneficiary
            </Button>
          </div>

          {/* Contingent Beneficiaries */}
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Contingent Beneficiaries</h3>
            {formData.beneficiaries.filter(b => b.type === 'contingent').map((beneficiary, index) => {
              const actualIndex = formData.beneficiaries.findIndex((b, i) => 
                b === beneficiary && formData.beneficiaries.slice(0, i + 1).filter(x => x.type === 'contingent').length === index + 1
              );
              return (
                <div key={actualIndex} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeBeneficiary(actualIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={beneficiary.name}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], name: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Beneficiary Name"
                    />
                    <Input
                      value={beneficiary.contact}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], contact: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Contact Info"
                    />
                    <Input
                      value={beneficiary.relationship}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], relationship: e.target.value };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="Relationship"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={beneficiary.allocation_percent || ''}
                      onChange={(e) => {
                        const updated = [...formData.beneficiaries];
                        updated[actualIndex] = { ...updated[actualIndex], allocation_percent: parseFloat(e.target.value) || null };
                        setFormData(prev => ({ ...prev, beneficiaries: updated }));
                      }}
                      placeholder="% Allocation"
                    />
                  </div>
                  <Textarea
                    value={beneficiary.notes}
                    onChange={(e) => {
                      const updated = [...formData.beneficiaries];
                      updated[actualIndex] = { ...updated[actualIndex], notes: e.target.value };
                      setFormData(prev => ({ ...prev, beneficiaries: updated }));
                    }}
                    placeholder="Notes/Conditions"
                    rows={2}
                  />
                </div>
              );
            })}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  beneficiaries: [...prev.beneficiaries, { 
                    name: '', contact: '', relationship: '', type: 'contingent', notes: '', allocation_percent: null 
                  }]
                }));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contingent Beneficiary
            </Button>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Beneficiaries'}
          </Button>
        </TabsContent>

        {/* Trust Assets Tab */}
        <TabsContent value="assets" className="space-y-4 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Linking assets to your trust ensures proper ownership documentation and smooth transfers.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {formData.trust_assets.map((asset, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30 relative space-y-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeTrustAsset(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    value={asset.category}
                    onValueChange={(value) => {
                      const updated = [...formData.trust_assets];
                      updated[index] = { ...updated[index], category: value };
                      setFormData(prev => ({ ...prev, trust_assets: updated }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Asset Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="financial">Financial Accounts</SelectItem>
                      <SelectItem value="business">Business Interests</SelectItem>
                      <SelectItem value="tangible">Tangible Property</SelectItem>
                      <SelectItem value="insurance">Insurance & Policies</SelectItem>
                      <SelectItem value="digital">Digital Assets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={asset.ownership_type}
                    onValueChange={(value: 'full' | 'partial') => {
                      const updated = [...formData.trust_assets];
                      updated[index] = { ...updated[index], ownership_type: value };
                      setFormData(prev => ({ ...prev, trust_assets: updated }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ownership Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Fully Owned by Trust</SelectItem>
                      <SelectItem value="partial">Partially Owned by Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={asset.description}
                  onChange={(e) => {
                    const updated = [...formData.trust_assets];
                    updated[index] = { ...updated[index], description: e.target.value };
                    setFormData(prev => ({ ...prev, trust_assets: updated }));
                  }}
                  placeholder="Asset description (address, account info, etc.)"
                  rows={2}
                />
                <Badge variant={asset.ownership_type === 'full' ? 'default' : 'secondary'}>
                  {asset.ownership_type === 'full' ? 'Owned by Trust' : 'Assigned After Death'}
                </Badge>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={addTrustAsset}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trust Asset
            </Button>
          </div>

          {inventoryItems.length > 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                You have {inventoryItems.length} items in your Asset Safe inventory that could be linked to this trust.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Trust Assets'}
          </Button>
        </TabsContent>

        {/* Document Storage Tab */}
        <TabsContent value="storage" className="space-y-4 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Knowing where original documents are stored is critical for executors and trustees to access them quickly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Location of Original Documents</Label>
              <Select
                value={formData.originals_location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, originals_location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe_deposit">Safe Deposit Box</SelectItem>
                  <SelectItem value="home_safe">Home Safe</SelectItem>
                  <SelectItem value="attorney">Attorney's Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physical_access">Physical Access Instructions</Label>
              <Textarea
                id="physical_access"
                value={formData.physical_access_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, physical_access_instructions: e.target.value }))}
                placeholder="How to access the location (bank name, box number, combination, etc.)"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="keyholder_name">Keyholder / Authorized Access Person</Label>
                <Input
                  id="keyholder_name"
                  value={formData.keyholder_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyholder_name: e.target.value }))}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyholder_contact">Contact Information</Label>
                <Input
                  id="keyholder_contact"
                  value={formData.keyholder_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyholder_contact: e.target.value }))}
                  placeholder="Phone / Email"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Storage Information'}
          </Button>
        </TabsContent>

        {/* Documents Upload Tab */}
        <TabsContent value="documents" className="space-y-4 mt-6">
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Why this matters:</strong> Having digital copies of all trust documents ensures backup access and easy sharing with trustees and advisors.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid gap-2">
              <h4 className="font-medium">Required Documents</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Signed Trust Document</p>
                <p>• Amendments (if any)</p>
                <p>• Certification of Trust</p>
                <p>• Real property assignments or deeds</p>
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="font-medium">Optional Documents</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Letters of intent</p>
                <p>• Trustee instruction sheets</p>
              </div>
            </div>

            {formData.trust_documents.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No documents uploaded yet. Use the Uploads tab in Legacy Locker to upload trust-related documents.
                </AlertDescription>
              </Alert>
            )}

            {formData.trust_documents.length > 0 && (
              <div className="space-y-2">
                {formData.trust_documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.file_name}</span>
                      <Badge variant="secondary" className="text-xs">{doc.doc_type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{doc.upload_date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Document Info'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrustInformation;
