import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import PropertySelector from '@/components/PropertySelector';
import ManualDamageEntry from '@/components/ManualDamageEntry';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { StorageService } from '@/services/StorageService';
import { 
  AlertTriangle, 
  Camera, 
  Video, 
  Upload, 
  Eye, 
  Calendar,
  FileText,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  Clock,
  MapPin,
  Shield,
  DollarSign,
  Users,
  FileUp
} from 'lucide-react';

// Incident type options
const INCIDENT_TYPES = [
  { id: 'fire', label: 'Fire' },
  { id: 'water', label: 'Water / Flood' },
  { id: 'storm', label: 'Storm / Wind / Hail' },
  { id: 'theft', label: 'Theft / Vandalism' },
  { id: 'accidental', label: 'Accidental damage' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'other', label: 'Other' },
];

// Items/areas affected options
const ITEMS_AFFECTED = [
  { id: 'structure', label: 'Structure' },
  { id: 'personal_property', label: 'Personal property' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'other', label: 'Other' },
];

// Visible damage options
const VISIBLE_DAMAGE = [
  { id: 'cracks', label: 'Cracks or breaks' },
  { id: 'water_intrusion', label: 'Water intrusion or staining' },
  { id: 'smoke', label: 'Smoke, soot, or charring' },
  { id: 'missing', label: 'Missing or displaced items' },
  { id: 'broken', label: 'Broken or non-functioning components' },
  { id: 'other', label: 'Other' },
];

// Safety concerns options
const SAFETY_CONCERNS = [
  { id: 'wiring', label: 'Exposed wiring' },
  { id: 'water', label: 'Standing water' },
  { id: 'structural', label: 'Structural instability' },
  { id: 'odor', label: 'Strong odor (smoke, mold, chemicals)' },
  { id: 'none', label: 'None observed' },
  { id: 'other', label: 'Other' },
];

// Mitigation options
const MITIGATION_OPTIONS = [
  { id: 'water_shutoff', label: 'Water shutoff' },
  { id: 'boardup', label: 'Board-up or tarping' },
  { id: 'power', label: 'Power disconnected' },
  { id: 'cleanup', label: 'Temporary cleanup' },
  { id: 'none', label: 'None' },
  { id: 'other', label: 'Other' },
];

// Professional contacts options
const PROFESSIONALS = [
  { id: 'insurance', label: 'Insurance carrier' },
  { id: 'restoration', label: 'Restoration company' },
  { id: 'contractor', label: 'Contractor' },
  { id: 'law_enforcement', label: 'Law enforcement' },
  { id: 'other', label: 'Other' },
];

// Cost estimate options
const COST_ESTIMATES = [
  { id: 'under_500', label: 'Under $500' },
  { id: '500_1000', label: '$500 – $1,000' },
  { id: '1000_5000', label: '$1,000 – $5,000' },
  { id: 'over_5000', label: '$5,000+' },
  { id: 'not_sure', label: 'Not sure' },
];

interface IncidentDetails {
  dateOfDamage: string;
  approximateTime: string;
  incidentTypes: string[];
  otherIncidentType: string;
  propertyId: string;
  areaAffected: string;
  itemsAffected: string[];
  otherItemAffected: string;
  visibleDamage: string[];
  otherVisibleDamage: string;
  damageOngoing: string;
  safetyConcerns: string[];
  otherSafetyConcern: string;
  estimatedCost: string;
  dateNoticed: string;
  mitigationActions: string[];
  otherMitigation: string;
  repairsStatus: string;
  otherRepairsStatus: string;
  professionalsContacted: string[];
  otherProfessional: string;
  claimNumber: string;
  companyNames: string;
  additionalObservations: string;
}

const defaultIncidentDetails: IncidentDetails = {
  dateOfDamage: '',
  approximateTime: '',
  incidentTypes: [],
  otherIncidentType: '',
  propertyId: '',
  areaAffected: '',
  itemsAffected: [],
  otherItemAffected: '',
  visibleDamage: [],
  otherVisibleDamage: '',
  damageOngoing: '',
  safetyConcerns: [],
  otherSafetyConcern: '',
  estimatedCost: '',
  dateNoticed: '',
  mitigationActions: [],
  otherMitigation: '',
  repairsStatus: '',
  otherRepairsStatus: '',
  professionalsContacted: [],
  otherProfessional: '',
  claimNumber: '',
  companyNames: '',
  additionalObservations: '',
};

const PostDamageSection: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PropertyFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Incident details form state
  const [incidentDetails, setIncidentDetails] = useState<IncidentDetails>(defaultIncidentDetails);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real data from database
  const [damagePhotos, setDamagePhotos] = useState<PropertyFile[]>([]);
  const [damageVideos, setDamageVideos] = useState<PropertyFile[]>([]);

  // Fetch files when property is selected
  useEffect(() => {
    if (selectedPropertyId && user) {
      fetchPropertyFiles();
    } else {
      setDamagePhotos([]);
      setDamageVideos([]);
    }
  }, [selectedPropertyId, user]);

  const fetchPropertyFiles = async () => {
    if (!selectedPropertyId) return;
    
    setLoading(true);
    try {
      const photos = await PropertyService.getPropertyFiles(selectedPropertyId, 'photo');
      const videos = await PropertyService.getPropertyFiles(selectedPropertyId, 'video');
      setDamagePhotos(photos);
      setDamageVideos(videos);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load damage documentation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteFile = (file: PropertyFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      const success = await PropertyService.deletePropertyFile(
        fileToDelete.id, 
        fileToDelete.file_path, 
        fileToDelete.bucket_name
      );
      
      if (success) {
        if (fileToDelete.file_type === 'photo') {
          setDamagePhotos(photos => photos.filter(p => p.id !== fileToDelete.id));
        } else {
          setDamageVideos(videos => videos.filter(v => v.id !== fileToDelete.id));
        }
        toast({
          title: "File Deleted",
          description: "Damage documentation has been permanently removed.",
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
    
    setShowDeleteDialog(false);
    setFileToDelete(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateIncidentDetails = (field: keyof IncidentDetails, value: any) => {
    setIncidentDetails(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof IncidentDetails, value: string) => {
    setIncidentDetails(prev => {
      const currentArray = prev[field] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleUploadAndSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save damage documentation.",
        variant: "destructive",
      });
      return;
    }

    if (!incidentDetails.propertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property for this damage documentation.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setSaving(true);
    
    try {
      // Upload files if any selected
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const isVideo = file.type.startsWith('video/');
          const bucketName = isVideo ? 'videos' : 'photos';
          const fileType = isVideo ? 'video' : 'photo';
          
          // Upload to storage
          const uploadResult = await StorageService.uploadFile(file, bucketName, user.id);
          const filePath = typeof uploadResult === 'string' ? uploadResult : uploadResult.path;
          const fileUrl = uploadResult.url;

          // Build file name with incident info
          const incidentTypeLabels = incidentDetails.incidentTypes.map(id => 
            INCIDENT_TYPES.find(t => t.id === id)?.label || id
          ).join(', ');
          const fileName = incidentTypeLabels ? `${incidentTypeLabels} - ${file.name}` : file.name;

          // Save to database
          await PropertyService.addPropertyFile({
            property_id: incidentDetails.propertyId,
            file_name: fileName,
            file_path: filePath,
            file_url: fileUrl,
            file_type: fileType,
            file_size: file.size,
            bucket_name: bucketName,
          });
        }
      }

      toast({
        title: "Entry Saved",
        description: `Damage documentation saved successfully${selectedFiles.length > 0 ? ` with ${selectedFiles.length} file(s)` : ''}.`,
      });

      // Reset form
      setSelectedFiles([]);
      setIncidentDetails(defaultIncidentDetails);
      
      // Refresh files if viewing the same property
      if (incidentDetails.propertyId === selectedPropertyId) {
        fetchPropertyFiles();
      }
      
      // Update the main property selector
      if (!selectedPropertyId) {
        setSelectedPropertyId(incidentDetails.propertyId);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save damage documentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const generateDamageReport = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property before generating a damage report.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Property Damage Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`Property ID: ${selectedPropertyId}`, 20, 40);
      
      let yPosition = 60;
      
      // Damage Photos Section
      if (damagePhotos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Photos', 20, yPosition);
        yPosition += 10;
        
        damagePhotos.forEach((photo, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${photo.file_name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(photo.created_at)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Damage Videos Section
      if (damageVideos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Videos', 20, yPosition);
        yPosition += 10;
        
        damageVideos.forEach((video, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${video.file_name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(video.created_at)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Summary
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Summary', 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Total Damage Photos: ${damagePhotos.length}`, 30, 35);
      pdf.text(`Total Damage Videos: ${damageVideos.length}`, 30, 45);
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 30, 55);
      
      pdf.save(`Damage_Report_${selectedPropertyId}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Damage report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate damage report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
          Post Damage Documentation
        </CardTitle>
        <CardDescription>
          Document property damage with photos, videos, and detailed incident information for insurance claims and repairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload & Incident Details Section */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Upload className="h-5 w-5 mr-2 text-red-600" />
                Document Damage Incident
              </CardTitle>
              <CardDescription>
                Upload files and fill in incident details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* 🔹 Incident Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Incident Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date of damage */}
                  <div className="space-y-2">
                    <Label>Date of damage *</Label>
                    <Input
                      type="date"
                      value={incidentDetails.dateOfDamage}
                      onChange={(e) => updateIncidentDetails('dateOfDamage', e.target.value)}
                    />
                  </div>
                  
                  {/* Approximate time */}
                  <div className="space-y-2">
                    <Label>Approximate time (if known) <span className="text-gray-500 text-sm">· Optional</span></Label>
                    <Input
                      type="time"
                      value={incidentDetails.approximateTime}
                      onChange={(e) => updateIncidentDetails('approximateTime', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Type of incident */}
                <div className="space-y-2">
                  <Label>Type of incident</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {INCIDENT_TYPES.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`incident-${type.id}`}
                          checked={incidentDetails.incidentTypes.includes(type.id)}
                          onCheckedChange={() => toggleArrayField('incidentTypes', type.id)}
                        />
                        <Label htmlFor={`incident-${type.id}`} className="text-sm font-normal cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.incidentTypes.includes('other') && (
                    <Input
                      placeholder="Describe other incident type..."
                      value={incidentDetails.otherIncidentType}
                      onChange={(e) => updateIncidentDetails('otherIncidentType', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                
                {/* Property / Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property *</Label>
                    <PropertySelector
                      value={incidentDetails.propertyId}
                      onChange={(value) => updateIncidentDetails('propertyId', value)}
                      placeholder="Select property"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Area affected</Label>
                    <Input
                      placeholder="e.g., Kitchen, Garage, Roof"
                      value={incidentDetails.areaAffected}
                      onChange={(e) => updateIncidentDetails('areaAffected', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* 🔹 Items or Areas Affected */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Items or Areas Affected
                </h3>
                
                <div className="space-y-2">
                  <Label>What was impacted? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ITEMS_AFFECTED.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={incidentDetails.itemsAffected.includes(item.id)}
                          onCheckedChange={() => toggleArrayField('itemsAffected', item.id)}
                        />
                        <Label htmlFor={`item-${item.id}`} className="text-sm font-normal cursor-pointer">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.itemsAffected.includes('other') && (
                    <Input
                      placeholder="Describe other items affected..."
                      value={incidentDetails.otherItemAffected}
                      onChange={(e) => updateIncidentDetails('otherItemAffected', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              
              {/* 🔹 Observed Condition */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Observed Condition
                </h3>
                <p className="text-sm text-gray-600">Describe what you can see — no technical assessment needed.</p>
                
                <div className="space-y-2">
                  <Label>Visible damage observed (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {VISIBLE_DAMAGE.map((damage) => (
                      <div key={damage.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`damage-${damage.id}`}
                          checked={incidentDetails.visibleDamage.includes(damage.id)}
                          onCheckedChange={() => toggleArrayField('visibleDamage', damage.id)}
                        />
                        <Label htmlFor={`damage-${damage.id}`} className="text-sm font-normal cursor-pointer">
                          {damage.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.visibleDamage.includes('other') && (
                    <Input
                      placeholder="Describe other visible damage..."
                      value={incidentDetails.otherVisibleDamage}
                      onChange={(e) => updateIncidentDetails('otherVisibleDamage', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Is the damage ongoing?</Label>
                  <RadioGroup
                    value={incidentDetails.damageOngoing}
                    onValueChange={(value) => updateIncidentDetails('damageOngoing', value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="ongoing-yes" />
                      <Label htmlFor="ongoing-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="ongoing-no" />
                      <Label htmlFor="ongoing-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_sure" id="ongoing-unsure" />
                      <Label htmlFor="ongoing-unsure" className="font-normal cursor-pointer">Not sure</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Any safety concerns observed?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SAFETY_CONCERNS.map((concern) => (
                      <div key={concern.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`safety-${concern.id}`}
                          checked={incidentDetails.safetyConcerns.includes(concern.id)}
                          onCheckedChange={() => toggleArrayField('safetyConcerns', concern.id)}
                        />
                        <Label htmlFor={`safety-${concern.id}`} className="text-sm font-normal cursor-pointer">
                          {concern.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.safetyConcerns.includes('other') && (
                    <Input
                      placeholder="Describe other safety concerns..."
                      value={incidentDetails.otherSafetyConcern}
                      onChange={(e) => updateIncidentDetails('otherSafetyConcern', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              
              {/* 🔹 Estimated Impact */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Estimated Impact
                </h3>
                <p className="text-sm text-gray-600">(User-provided estimates only)</p>
                
                <div className="space-y-2">
                  <Label>Estimated replacement cost (if known)</Label>
                  <RadioGroup
                    value={incidentDetails.estimatedCost}
                    onValueChange={(value) => updateIncidentDetails('estimatedCost', value)}
                    className="space-y-2"
                  >
                    {COST_ESTIMATES.map((cost) => (
                      <div key={cost.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={cost.id} id={`cost-${cost.id}`} />
                        <Label htmlFor={`cost-${cost.id}`} className="font-normal cursor-pointer">
                          {cost.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              
              {/* 🔹 Timeline & Actions Taken */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Timeline & Actions Taken
                </h3>
                
                <div className="space-y-2">
                  <Label>When did you first notice the damage?</Label>
                  <Input
                    type="date"
                    value={incidentDetails.dateNoticed}
                    onChange={(e) => updateIncidentDetails('dateNoticed', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Any temporary mitigation performed? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MITIGATION_OPTIONS.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mitigation-${option.id}`}
                          checked={incidentDetails.mitigationActions.includes(option.id)}
                          onCheckedChange={() => toggleArrayField('mitigationActions', option.id)}
                        />
                        <Label htmlFor={`mitigation-${option.id}`} className="text-sm font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.mitigationActions.includes('other') && (
                    <Input
                      placeholder="Describe other mitigation actions..."
                      value={incidentDetails.otherMitigation}
                      onChange={(e) => updateIncidentDetails('otherMitigation', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Have repairs begun?</Label>
                  <RadioGroup
                    value={incidentDetails.repairsStatus}
                    onValueChange={(value) => updateIncidentDetails('repairsStatus', value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="repairs-no" />
                      <Label htmlFor="repairs-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="temporary" id="repairs-temp" />
                      <Label htmlFor="repairs-temp" className="font-normal cursor-pointer">Temporary only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="permanent" id="repairs-perm" />
                      <Label htmlFor="repairs-perm" className="font-normal cursor-pointer">Permanent repairs started</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="repairs-other" />
                      <Label htmlFor="repairs-other" className="font-normal cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                  {incidentDetails.repairsStatus === 'other' && (
                    <Input
                      placeholder="Describe repair status..."
                      value={incidentDetails.otherRepairsStatus}
                      onChange={(e) => updateIncidentDetails('otherRepairsStatus', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              
              {/* 🔹 Third-Party Involvement */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Third-Party Involvement <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                </h3>
                
                <div className="space-y-2">
                  <Label>Have any professionals been contacted?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PROFESSIONALS.map((pro) => (
                      <div key={pro.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pro-${pro.id}`}
                          checked={incidentDetails.professionalsContacted.includes(pro.id)}
                          onCheckedChange={() => toggleArrayField('professionalsContacted', pro.id)}
                        />
                        <Label htmlFor={`pro-${pro.id}`} className="text-sm font-normal cursor-pointer">
                          {pro.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {incidentDetails.professionalsContacted.includes('other') && (
                    <Input
                      placeholder="Describe other professionals..."
                      value={incidentDetails.otherProfessional}
                      onChange={(e) => updateIncidentDetails('otherProfessional', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Claim number (if available)</Label>
                    <Input
                      placeholder="Enter claim number..."
                      value={incidentDetails.claimNumber}
                      onChange={(e) => updateIncidentDetails('claimNumber', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company name(s)</Label>
                    <Input
                      placeholder="Enter company names..."
                      value={incidentDetails.companyNames}
                      onChange={(e) => updateIncidentDetails('companyNames', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* 🔹 Additional Observations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Additional Observations <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                </h3>
                
                <div className="space-y-2">
                  <Label>Anything else you noticed or want to document?</Label>
                  <Textarea
                    placeholder="Enter any additional observations..."
                    value={incidentDetails.additionalObservations}
                    onChange={(e) => updateIncidentDetails('additionalObservations', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              
              {/* File Upload Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  🔹 Upload Files
                </h3>
                <p className="text-sm text-gray-600">
                  Upload photos, videos, documents, or voice notes documenting the damage. You can select multiple files at once.
                </p>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 bg-red-600 hover:bg-red-700"
                    disabled={uploading}
                  >
                    <div className="flex flex-col items-center">
                      <FileUp className="h-6 w-6 mb-1" />
                      <span>Select Files (Photos, Videos, Documents, Voice Notes)</span>
                    </div>
                  </Button>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-2 text-xs">
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="truncate">{file.name}</p>
                          <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Save Button */}
              <Button 
                onClick={handleUploadAndSave}
                className="w-full bg-brand-green hover:bg-brand-green/90 h-12 text-lg"
                disabled={uploading || saving || !incidentDetails.propertyId}
              >
                {(uploading || saving) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    ✅ Save Entry
                  </>
                )}
              </Button>
              
              {/* Footer Disclaimer */}
              <div className="bg-gray-100 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Asset Safe records user-provided documentation and observations. Damage assessments, valuations, coverage determinations, and claim decisions are made by independent third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* View Existing Documentation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                View Existing Documentation
              </CardTitle>
              <CardDescription>
                Select a property to view and manage existing damage documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertySelector
                value={selectedPropertyId}
                onChange={setSelectedPropertyId}
                placeholder="Select property to view damage documentation"
              />
              {selectedPropertyId && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Property selected - viewing damage documentation
                </p>
              )}
            </CardContent>
          </Card>

          {/* Damage Documentation Tabs */}
          {selectedPropertyId && (
            <Tabs defaultValue="photos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
                <TabsTrigger value="photos" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Camera className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Photos ({damagePhotos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Video className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Videos ({damageVideos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Reports</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photos" className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : damagePhotos.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No damage photos yet</h3>
                    <p className="text-gray-500 mb-4">Start documenting property damage by uploading photos above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Damage photos for this property</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {damagePhotos.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteFile(photo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                            {photo.file_url ? (
                              <img 
                                src={photo.file_url} 
                                alt={photo.file_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-2 truncate">{photo.file_name}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(photo.created_at)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : damageVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No damage videos yet</h3>
                    <p className="text-gray-500 mb-4">Create video walkthroughs of property damage using the upload section above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Damage videos for this property</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {damageVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteFile(video)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-2 truncate">{video.file_name}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(video.created_at)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <ManualDamageEntry />
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Damage Reports</h3>
                  <p className="text-gray-500 mb-4">Generate comprehensive damage reports for insurance claims</p>
                  <Button 
                    onClick={() => {
                      const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                      if (isOnSampleDashboard) {
                        alert('AssetSafe.net says\n\nDemo: This would generate comprehensive damage reports for insurance claims with photos, videos, and details.');
                        return;
                      }
                      generateDamageReport();
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Damage Report
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!selectedPropertyId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Select a property above to view existing damage documentation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDeleteFile}
        title="Delete Damage Documentation"
        description="Are you sure you want to permanently delete this file? This cannot be undone."
      />
    </Card>
  );
};

export default PostDamageSection;
