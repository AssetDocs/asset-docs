// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  CalendarDays,
  Edit,
  ExternalLink,
  FileText,
  HeartPulse,
  Info,
  Pill,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { buildFamilyArchivePath, StorageService } from '@/services/StorageService';

type MedicationEntry = {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string | null;
  frequency_instructions: string | null;
  reason: string | null;
  prescribing_doctor: string | null;
  pharmacy_name: string | null;
  pharmacy_phone: string | null;
  start_date: string | null;
  end_date: string | null;
  currently_taking: boolean;
  refill_number: string | null;
  prescription_number: string | null;
  medication_category: string | null;
  caregiver_notes: string | null;
  notes: string | null;
  file_name: string | null;
  file_path: string | null;
  file_url: string | null;
  bucket_name: string | null;
  created_at: string;
  updated_at: string;
};

const EMPTY_FORM = {
  medication_name: '',
  dosage: '',
  frequency_instructions: '',
  reason: '',
  prescribing_doctor: '',
  pharmacy_name: '',
  pharmacy_phone: '',
  start_date: '',
  end_date: '',
  currently_taking: true,
  refill_number: '',
  prescription_number: '',
  medication_category: '',
  caregiver_notes: '',
  notes: '',
};

const CATEGORIES = [
  'Daily medication',
  'As needed',
  'Supplement',
  'Emergency medication',
  'Short-term medication',
  'Other',
];

interface FamilyMedicationsProps {
  onNavigate?: (tab: string) => void;
}

const clean = (value: string) => value.trim() || null;

const FamilyMedications: React.FC<FamilyMedicationsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { ownerUserId, canEdit, showReadOnlyRestriction } = useAccount();
  const { subscriptionTier, storageQuotaGb } = useSubscription();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationEntry | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const targetUserId = ownerUserId || user?.id || null;

  useEffect(() => {
    fetchMedications();
  }, [targetUserId]);

  const fetchMedications = async () => {
    if (!targetUserId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_medications' as any)
        .select('*')
        .eq('user_id', targetUserId)
        .order('currently_taking', { ascending: false })
        .order('medication_name', { ascending: true });
      if (error) throw error;
      setMedications((data || []) as MedicationEntry[]);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast({
        title: 'Could not load medication list',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return medications.filter((entry) => {
      if (statusFilter === 'current' && !entry.currently_taking) return false;
      if (statusFilter === 'past' && entry.currently_taking) return false;
      if (!query) return true;
      return [
        entry.medication_name,
        entry.dosage,
        entry.frequency_instructions,
        entry.reason,
        entry.prescribing_doctor,
        entry.pharmacy_name,
        entry.medication_category,
        entry.notes,
        entry.caregiver_notes,
        entry.file_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [medications, searchTerm, statusFilter]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setEditingMedication(null);
  };

  const updateForm = (field: keyof typeof EMPTY_FORM, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openEdit = (entry: MedicationEntry) => {
    setEditingMedication(entry);
    setForm({
      medication_name: entry.medication_name || '',
      dosage: entry.dosage || '',
      frequency_instructions: entry.frequency_instructions || '',
      reason: entry.reason || '',
      prescribing_doctor: entry.prescribing_doctor || '',
      pharmacy_name: entry.pharmacy_name || '',
      pharmacy_phone: entry.pharmacy_phone || '',
      start_date: entry.start_date || '',
      end_date: entry.end_date || '',
      currently_taking: entry.currently_taking ?? true,
      refill_number: entry.refill_number || '',
      prescription_number: entry.prescription_number || '',
      medication_category: entry.medication_category || '',
      caregiver_notes: entry.caregiver_notes || '',
      notes: entry.notes || '',
    });
    setSelectedFile(null);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }
    if (!targetUserId || !form.medication_name.trim()) {
      toast({ title: 'Medication name is required.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    let uploadedPath: string | null = null;
    try {
      let fileData: Record<string, unknown> = {};
      if (selectedFile) {
        const quotaCheck = await StorageService.canUploadFile(
          targetUserId,
          selectedFile.size,
          subscriptionTier,
          storageQuotaGb,
        );
        if (!quotaCheck.canUpload) throw new Error(quotaCheck.reason || 'Storage quota exceeded');

        const fullPath = buildFamilyArchivePath({
          userId: targetUserId,
          section: 'medication-list',
          file: selectedFile,
        });
        const uploadResult = await StorageService.uploadFileToPath(
          selectedFile,
          'documents',
          fullPath,
          targetUserId,
        );
        uploadedPath = uploadResult.path;
        fileData = {
          file_path: uploadResult.path,
          file_url: uploadResult.url,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          bucket_name: 'documents',
        };
      }

      if (editingMedication?.file_path && selectedFile) {
        const { data, error } = await supabase.functions.invoke('secure-delete-file', {
          body: { resource: 'family_medication_attachment', id: editingMedication.id },
        });
        if (error || (data as any)?.error) {
          if (uploadedPath) await StorageService.tryCleanupObject('documents', uploadedPath);
          throw new Error('Could not replace the existing attachment. Please try again.');
        }
      }

      const payload = {
        user_id: targetUserId,
        medication_name: form.medication_name.trim(),
        dosage: clean(form.dosage),
        frequency_instructions: clean(form.frequency_instructions),
        reason: clean(form.reason),
        prescribing_doctor: clean(form.prescribing_doctor),
        pharmacy_name: clean(form.pharmacy_name),
        pharmacy_phone: clean(form.pharmacy_phone),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        currently_taking: form.currently_taking,
        refill_number: clean(form.refill_number),
        prescription_number: clean(form.prescription_number),
        medication_category: clean(form.medication_category),
        caregiver_notes: clean(form.caregiver_notes),
        notes: clean(form.notes),
        ...fileData,
      };

      const { error } = editingMedication
        ? await supabase.from('family_medications' as any).update(payload).eq('id', editingMedication.id)
        : await supabase.from('family_medications' as any).insert(payload);

      if (error) throw error;
      uploadedPath = null;
      toast({
        title: editingMedication ? 'Medication updated' : 'Medication added',
        description: 'Your family reference list has been updated.',
      });
      resetForm();
      setIsOpen(false);
      fetchMedications();
    } catch (error: any) {
      console.error('Error saving medication:', error);
      if (uploadedPath) await StorageService.tryCleanupObject('documents', uploadedPath);
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save this medication entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: MedicationEntry) => {
    if (!canEdit) {
      showReadOnlyRestriction();
      return;
    }

    try {
      if (entry.file_path) {
        const { data, error } = await supabase.functions.invoke('secure-delete-file', {
          body: { resource: 'family_medication_attachment', id: entry.id },
        });
        if (error || (data as any)?.error) {
          toast({
            title: 'Attachment cleanup failed',
            description: 'The medication entry was not deleted. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }
      const { error } = await supabase.from('family_medications' as any).delete().eq('id', entry.id);
      if (error) throw error;
      setMedications((current) => current.filter((item) => item.id !== entry.id));
      toast({ title: 'Deleted', description: 'Medication entry removed.' });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({ title: 'Delete failed', description: 'Could not delete this entry.', variant: 'destructive' });
    }
  };

  const handleViewAttachment = async (entry: MedicationEntry) => {
    if (!entry.file_path) return;
    try {
      const { data, error } = await supabase.storage
        .from(entry.bucket_name || 'documents')
        .createSignedUrl(entry.file_path, 3600);
      if (error) throw error;
      window.open(data?.signedUrl || entry.file_url, '_blank');
    } catch (error) {
      console.error('Attachment open failed:', error);
      toast({ title: 'Attachment unavailable', description: 'Could not open this file.', variant: 'destructive' });
    }
  };

  const canManage = canEdit;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-brand-blue" />
            Medication List
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Keep a simple family-reference list of medications, pharmacies, and related notes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              For personal and family reference only. This does not provide medical advice, reminders, or dosage guidance.
              Always confirm medication details with a qualified medical professional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate?.('service-pros')}
              className="justify-center"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Open Trusted Professionals
            </Button>
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-brand-blue hover:bg-brand-blue/90 sm:ml-auto"
                  onClick={(event) => {
                    if (!canManage) {
                      event.preventDefault();
                      showReadOnlyRestriction();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medication-name">Medication Name *</Label>
                      <Input
                        id="medication-name"
                        value={form.medication_name}
                        onChange={(event) => updateForm('medication_name', event.target.value)}
                        placeholder="e.g. Medication name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medication-category">Category</Label>
                      <Select
                        value={form.medication_category || undefined}
                        onValueChange={(value) => updateForm('medication_category', value)}
                      >
                        <SelectTrigger id="medication-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={form.dosage}
                        onChange={(event) => updateForm('dosage', event.target.value)}
                        placeholder="As written on the prescription label"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency / Instructions</Label>
                      <Input
                        id="frequency"
                        value={form.frequency_instructions}
                        onChange={(event) => updateForm('frequency_instructions', event.target.value)}
                        placeholder="e.g. Morning, evening, as needed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason / Context</Label>
                      <Input
                        id="reason"
                        value={form.reason}
                        onChange={(event) => updateForm('reason', event.target.value)}
                        placeholder="Optional family-reference context"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Prescribing Doctor</Label>
                      <Input
                        id="doctor"
                        value={form.prescribing_doctor}
                        onChange={(event) => updateForm('prescribing_doctor', event.target.value)}
                        placeholder="Doctor or clinic name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy">Pharmacy</Label>
                      <Input
                        id="pharmacy"
                        value={form.pharmacy_name}
                        onChange={(event) => updateForm('pharmacy_name', event.target.value)}
                        placeholder="Pharmacy name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy-phone">Pharmacy Phone</Label>
                      <Input
                        id="pharmacy-phone"
                        value={form.pharmacy_phone}
                        onChange={(event) => updateForm('pharmacy_phone', event.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={form.start_date}
                        onChange={(event) => updateForm('start_date', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={form.end_date}
                        onChange={(event) => updateForm('end_date', event.target.value)}
                        disabled={form.currently_taking}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refill-number">Refill Number</Label>
                      <Input
                        id="refill-number"
                        value={form.refill_number}
                        onChange={(event) => updateForm('refill_number', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prescription-number">Prescription Number</Label>
                      <Input
                        id="prescription-number"
                        value={form.prescription_number}
                        onChange={(event) => updateForm('prescription_number', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="currently-taking"
                      checked={form.currently_taking}
                      onCheckedChange={(checked) => updateForm('currently_taking', checked === true)}
                    />
                    <Label htmlFor="currently-taking" className="cursor-pointer">Currently taking</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiver-notes">Caregiver Notes</Label>
                    <Textarea
                      id="caregiver-notes"
                      value={form.caregiver_notes}
                      onChange={(event) => updateForm('caregiver_notes', event.target.value)}
                      placeholder="Helpful context for family or caregivers."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(event) => updateForm('notes', event.target.value)}
                      placeholder="Optional notes or reference details."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Optional File Attachment</Label>
                    {selectedFile ? (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-1" />
                        Choose File
                      </Button>
                    )}
                    {editingMedication?.file_name && !selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Current attachment: {editingMedication.file_name}
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                    />
                  </div>

                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? 'Saving...' : editingMedication ? 'Update Medication' : 'Save Medication'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find Medication Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search medication, pharmacy, doctor, category, or notes..."
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All records</SelectItem>
                <SelectItem value="current">Currently taking</SelectItem>
                <SelectItem value="past">Past / ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredMedications.length} medication record{filteredMedications.length === 1 ? '' : 's'}
            {searchTerm ? ` for "${searchTerm}"` : ''}.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading medication list...</div>
      ) : filteredMedications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Pill className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-medium">No medication records found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a medication record or adjust your search/filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMedications.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-brand-blue" />
                      {entry.medication_name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={entry.currently_taking ? 'default' : 'secondary'}>
                        {entry.currently_taking ? 'Current' : 'Past'}
                      </Badge>
                      {entry.medication_category && <Badge variant="outline">{entry.medication_category}</Badge>}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(entry)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Medication Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete "{entry.medication_name}" from this family reference list? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entry)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {entry.dosage && <p><span className="font-medium">Dosage:</span> {entry.dosage}</p>}
                {entry.frequency_instructions && <p><span className="font-medium">Instructions:</span> {entry.frequency_instructions}</p>}
                {entry.reason && <p><span className="font-medium">Reason:</span> {entry.reason}</p>}
                {entry.prescribing_doctor && <p><span className="font-medium">Doctor:</span> {entry.prescribing_doctor}</p>}
                {(entry.pharmacy_name || entry.pharmacy_phone) && (
                  <p><span className="font-medium">Pharmacy:</span> {[entry.pharmacy_name, entry.pharmacy_phone].filter(Boolean).join(' - ')}</p>
                )}
                {(entry.start_date || entry.end_date) && (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {[entry.start_date, entry.end_date].filter(Boolean).join(' to ')}
                  </p>
                )}
                {entry.caregiver_notes && <p className="line-clamp-3"><span className="font-medium">Caregiver notes:</span> {entry.caregiver_notes}</p>}
                {entry.notes && <p className="line-clamp-3"><span className="font-medium">Notes:</span> {entry.notes}</p>}
                {entry.file_name && (
                  <Button type="button" variant="outline" size="sm" onClick={() => handleViewAttachment(entry)}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Attachment
                  </Button>
                )}
                <p className="text-xs text-muted-foreground pt-2">
                  Last updated {new Date(entry.updated_at || entry.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyMedications;
