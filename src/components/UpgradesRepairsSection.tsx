import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PropertySelector from '@/components/PropertySelector';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { StorageService, FileType } from '@/services/StorageService';
import { PropertyService } from '@/services/PropertyService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  X,
  Upload,
  Camera,
  FileText,
  Loader2,
  DollarSign,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Mail,
  User
} from 'lucide-react';

interface Vendor {
  id?: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
}

interface UpgradeRepair {
  id: string;
  property_id: string;
  title: string;
  description: string;
  date_completed: string;
  location: string;
  repair_type: string;
  item_cost: number;
  labor_cost: number;
  total_cost: number;
  notes: string;
  created_at: string;
  vendors?: Vendor[];
}

const REPAIR_TYPES = [
  'Renovation',
  'Repair',
  'Upgrade',
  'Maintenance',
  'Addition',
  'Replacement',
  'Installation',
  'Other'
];

const defaultFormData = {
  property_id: '',
  title: '',
  description: '',
  date_completed: '',
  location: '',
  repair_type: '',
  item_cost: 0,
  labor_cost: 0,
  total_cost: 0,
  notes: ''
};

const defaultVendor: Vendor = {
  company_name: '',
  contact_name: '',
  phone: '',
  email: ''
};

const UpgradesRepairsSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [records, setRecords] = useState<UpgradeRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(defaultFormData);
  const [vendors, setVendors] = useState<Vendor[]>([{ ...defaultVendor }]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('upgrade_repairs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch vendors for each record
      const recordsWithVendors = await Promise.all(
        (data || []).map(async (record) => {
          const { data: vendorData } = await supabase
            .from('upgrade_repair_vendors')
            .select('*')
            .eq('upgrade_repair_id', record.id);
          return { ...record, vendors: vendorData || [] };
        })
      );

      setRecords(recordsWithVendors);
    } catch (error) {
      console.error('Error fetching upgrade/repair records:', error);
      toast({
        title: "Error",
        description: "Failed to load records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate total
      if (field === 'item_cost' || field === 'labor_cost') {
        updated.total_cost = Number(updated.item_cost || 0) + Number(updated.labor_cost || 0);
      }
      return updated;
    });
  };

  const updateVendor = (index: number, field: keyof Vendor, value: string) => {
    setVendors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVendor = () => {
    setVendors(prev => [...prev, { ...defaultVendor }]);
  };

  const removeVendor = (index: number) => {
    if (vendors.length > 1) {
      setVendors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    if (e.target) e.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please log in", variant: "destructive" });
      return;
    }

    if (!formData.property_id) {
      toast({ title: "Error", description: "Please select a property", variant: "destructive" });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        user_id: user.id,
        property_id: formData.property_id,
        title: formData.title,
        description: formData.description || null,
        date_completed: formData.date_completed || null,
        location: formData.location || null,
        repair_type: formData.repair_type || null,
        item_cost: formData.item_cost || 0,
        labor_cost: formData.labor_cost || 0,
        total_cost: formData.total_cost || 0,
        notes: formData.notes || null
      };

      let recordId = isEditing;

      if (isEditing) {
        const { error } = await supabase
          .from('upgrade_repairs')
          .update(recordData)
          .eq('id', isEditing);
        if (error) throw error;

        // Delete existing vendors and re-insert
        await supabase.from('upgrade_repair_vendors').delete().eq('upgrade_repair_id', isEditing);
      } else {
        const { data, error } = await supabase
          .from('upgrade_repairs')
          .insert(recordData)
          .select('id')
          .single();
        if (error) throw error;
        recordId = data.id;
      }

      // Insert vendors
      const validVendors = vendors.filter(v => v.company_name.trim());
      if (validVendors.length > 0 && recordId) {
        const vendorInserts = validVendors.map(v => ({
          upgrade_repair_id: recordId,
          company_name: v.company_name,
          contact_name: v.contact_name || null,
          phone: v.phone || null,
          email: v.email || null
        }));
        await supabase.from('upgrade_repair_vendors').insert(vendorInserts);
      }

      // Upload files if any
      if (selectedFiles.length > 0 && recordId) {
        setUploading(true);
        for (const file of selectedFiles) {
          try {
            const isVideo = file.type.startsWith('video/');
            const isDocument = file.type.includes('pdf') || file.type.includes('document');
            const bucketName: FileType = isVideo ? 'videos' : isDocument ? 'documents' : 'photos';
            const fileType: 'photo' | 'video' | 'document' = isVideo ? 'video' : isDocument ? 'document' : 'photo';

            console.log('[UpgradesRepairs] Uploading file:', {
              fileName: file.name,
              fileType,
              bucketName,
              fileSize: file.size
            });

            const uploadResult = await StorageService.uploadFileWithValidation(
              file,
              bucketName,
              user.id,
              subscriptionTier,
              `${formData.property_id}/${Date.now()}-${file.name}`
            );

            console.log('[UpgradesRepairs] Upload successful:', uploadResult.path);

            await PropertyService.addPropertyFile({
              property_id: formData.property_id,
              file_name: `${formData.title} - ${file.name}`,
              file_path: uploadResult.path,
              file_url: uploadResult.url,
              file_type: fileType,
              file_size: file.size,
              bucket_name: bucketName,
              source: 'upgrade_repair'
            });

            console.log('[UpgradesRepairs] File record saved to database');
          } catch (fileError) {
            console.error('[UpgradesRepairs] File upload failed:', fileError);
            toast({
              title: "File Upload Error",
              description: `Failed to upload ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
              variant: "destructive"
            });
          }
        }
      }

      toast({
        title: "Success",
        description: isEditing ? "Record updated successfully" : "Record saved successfully"
      });

      // Reset form
      setFormData(defaultFormData);
      setVendors([{ ...defaultVendor }]);
      setSelectedFiles([]);
      setIsAdding(false);
      setIsEditing(null);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (record: UpgradeRepair) => {
    setFormData({
      property_id: record.property_id,
      title: record.title,
      description: record.description || '',
      date_completed: record.date_completed || '',
      location: record.location || '',
      repair_type: record.repair_type || '',
      item_cost: record.item_cost || 0,
      labor_cost: record.labor_cost || 0,
      total_cost: record.total_cost || 0,
      notes: record.notes || ''
    });
    setVendors(record.vendors?.length ? record.vendors : [{ ...defaultVendor }]);
    setIsEditing(record.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      const { error } = await supabase
        .from('upgrade_repairs')
        .delete()
        .eq('id', recordToDelete);

      if (error) throw error;

      toast({ title: "Success", description: "Record deleted successfully" });
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    setVendors([{ ...defaultVendor }]);
    setSelectedFiles([]);
    setIsAdding(false);
    setIsEditing(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Loading records...</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!isAdding && records.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Upgrades or Repairs Yet</h3>
          <p className="text-muted-foreground mb-6">
            Document your property upgrades and repairs to track improvements and costs.
          </p>
          <Button onClick={() => setIsAdding(true)} className="bg-brand-green hover:bg-brand-green/90">
            <Plus className="h-4 w-4 mr-2" />
            Add an Upgrade or Repair
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      {!isAdding && (
        <div>
          <h2 className="text-xl font-semibold">Upgrades & Repairs</h2>
          <p className="text-muted-foreground text-sm mb-3">{records.length} record(s)</p>
          <Button onClick={() => setIsAdding(true)} className="w-full bg-brand-blue hover:bg-brand-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      )}

      {/* Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              {isEditing ? 'Edit Upgrade/Repair' : 'Add Upgrade or Repair'}
            </CardTitle>
            <CardDescription>Document property improvements, repairs, or upgrades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Property *
              </Label>
              <PropertySelector
                value={formData.property_id}
                onChange={(value) => updateFormField('property_id', value)}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title/Name *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  placeholder="e.g., Kitchen Renovation"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.repair_type} onValueChange={(v) => updateFormField('repair_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAIR_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date Completed
                </Label>
                <Input
                  type="date"
                  value={formData.date_completed}
                  onChange={(e) => updateFormField('date_completed', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </Label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                  placeholder="e.g., Kitchen, Master Bathroom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Describe the work done..."
                rows={3}
              />
            </div>

            {/* Costs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Materials Cost
                </Label>
                <Input
                  type="number"
                  value={formData.item_cost || ''}
                  onChange={(e) => updateFormField('item_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Labor Cost
                </Label>
                <Input
                  type="number"
                  value={formData.labor_cost || ''}
                  onChange={(e) => updateFormField('labor_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-4 w-4" /> Total Cost
                </Label>
                <Input
                  type="number"
                  value={formData.total_cost || ''}
                  onChange={(e) => updateFormField('total_cost', parseFloat(e.target.value) || 0)}
                  className="font-semibold"
                />
              </div>
            </div>

            {/* Vendors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Vendors/Contractors</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVendor}>
                  <Plus className="h-4 w-4 mr-1" /> Add Vendor
                </Button>
              </div>
              
              {vendors.map((vendor, index) => (
                <Card key={index} className="p-4 bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Vendor {index + 1}</span>
                      {vendors.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeVendor(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Company Name
                        </Label>
                        <Input
                          value={vendor.company_name}
                          onChange={(e) => updateVendor(index, 'company_name', e.target.value)}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <User className="h-3 w-3" /> Contact Name
                        </Label>
                        <Input
                          value={vendor.contact_name}
                          onChange={(e) => updateVendor(index, 'contact_name', e.target.value)}
                          placeholder="Contact person"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </Label>
                        <Input
                          value={vendor.phone}
                          onChange={(e) => updateVendor(index, 'phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </Label>
                        <Input
                          value={vendor.email}
                          onChange={(e) => updateVendor(index, 'email', e.target.value)}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* File Uploads */}
            <div className="space-y-3">
              <Label>Attachments (Photos, Videos, Receipts)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Upload Files
                </Button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeSelectedFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateFormField('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving || uploading} className="bg-brand-green hover:bg-brand-green/90">
                {saving || uploading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Record</>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records List */}
      {!isAdding && records.length > 0 && (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{record.title}</h3>
                      {record.repair_type && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{record.repair_type}</span>
                      )}
                    </div>
                    {record.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {record.location}
                      </p>
                    )}
                    {record.date_completed && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(record.date_completed).toLocaleDateString()}
                      </p>
                    )}
                    {record.description && (
                      <p className="text-sm text-muted-foreground mt-2">{record.description}</p>
                    )}
                    {record.vendors && record.vendors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Vendors:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {record.vendors.map((v, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {v.company_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatCurrency(record.total_cost)}</p>
                    <div className="flex gap-1 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setRecordToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Record"
        description="Are you sure you want to delete this upgrade/repair record? This action cannot be undone."
      />
    </div>
  );
};

export default UpgradesRepairsSection;
