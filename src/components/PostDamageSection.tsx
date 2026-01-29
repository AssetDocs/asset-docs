import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import PropertySelector from '@/components/PropertySelector';
import ManualDamageEntry from '@/components/ManualDamageEntry';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import SavedDamageReports from '@/components/SavedDamageReports';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { StorageService } from '@/services/StorageService';
import { supabase } from '@/integrations/supabase/client';
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
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
  SkipForward,
  Droplets,
  Wind,
  Flame,
  Zap,
  Construction,
  CircleAlert,
  HelpCircle,
  Home,
  Package,
  Car,
  Sofa,
  Tv,
  Smartphone,
  ShoppingBag,
  Wrench,
  Phone
} from 'lucide-react';

// Incident type options with icons
const INCIDENT_TYPES = [
  { id: 'water', label: 'Water / Flood', icon: Droplets, color: 'text-blue-500' },
  { id: 'storm', label: 'Storm / Wind / Hail', icon: Wind, color: 'text-gray-600' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-orange-500' },
  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-yellow-500' },
  { id: 'accidental', label: 'Accidental', icon: Construction, color: 'text-amber-600' },
  { id: 'theft', label: 'Theft / Vandalism', icon: CircleAlert, color: 'text-red-500' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'text-gray-400' },
];

// Area chips
const AREA_OPTIONS = [
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'living_room', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'garage', label: 'Garage' },
  { id: 'basement', label: 'Basement' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'roof', label: 'Roof' },
  { id: 'other', label: 'Other' },
];

// Impact buckets
const IMPACT_BUCKETS = [
  { id: 'structure', label: 'Structure', icon: Home, description: 'Walls, floors, roof, foundation' },
  { id: 'belongings', label: 'Belongings', icon: Package, description: 'Personal items & furniture' },
  { id: 'vehicle', label: 'Vehicle', icon: Car, description: 'Car, boat, RV, etc.' },
];

// Belongings sub-items
const BELONGINGS_ITEMS = [
  { id: 'furniture', label: 'Furniture', icon: Sofa },
  { id: 'appliances', label: 'Appliances', icon: Wrench },
  { id: 'electronics', label: 'Electronics', icon: Tv },
  { id: 'personal', label: 'Personal items', icon: ShoppingBag },
  { id: 'other', label: 'Other', icon: Package },
];

// Simplified visible damage options
const VISIBLE_DAMAGE = [
  { id: 'water_visible', label: 'Water visible' },
  { id: 'smoke_soot', label: 'Smoke or soot' },
  { id: 'broken_missing', label: 'Broken or missing items' },
  { id: 'staining', label: 'Staining or discoloration' },
  { id: 'not_working', label: "Something isn't working anymore" },
  { id: 'not_sure', label: 'Not sure' },
];

// Safety concerns with icons
const SAFETY_CONCERNS = [
  { id: 'wiring', label: 'Exposed wiring', icon: '⚠️' },
  { id: 'water', label: 'Standing water', icon: '💧' },
  { id: 'structural', label: 'Structural concerns', icon: '🧱' },
  { id: 'odors', label: 'Strong odors', icon: '👃' },
  { id: 'none', label: 'No immediate safety concerns', icon: '✅' },
];

// Actions taken - timeline language
const ACTIONS_TAKEN = [
  { id: 'water_off', label: 'Turned off water' },
  { id: 'cleaned', label: 'Cleaned up temporarily' },
  { id: 'covered', label: 'Covered area' },
  { id: 'power_off', label: 'Turned off power' },
  { id: 'none', label: 'No action yet' },
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
  id?: string;
  dateOfDamage: string;
  approximateTime: string;
  incidentTypes: string[];
  otherIncidentType: string;
  propertyId: string;
  areasAffected: string[];
  otherArea: string;
  impactBuckets: string[];
  belongingsItems: string[];
  otherBelongings: string;
  visibleDamage: string[];
  damageOngoing: string;
  safetyConcerns: string[];
  actionsTaken: string[];
  estimatedCost: string;
  contactedSomeone: string;
  professionalsContacted: string[];
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
  areasAffected: [],
  otherArea: '',
  impactBuckets: [],
  belongingsItems: [],
  otherBelongings: '',
  visibleDamage: [],
  damageOngoing: '',
  safetyConcerns: [],
  actionsTaken: [],
  estimatedCost: '',
  contactedSomeone: '',
  professionalsContacted: [],
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
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Step states - all sections can be opened/closed independently
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Incident details form state
  const [incidentDetails, setIncidentDetails] = useState<IncidentDetails>(defaultIncidentDetails);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Real data from database
  const [damagePhotos, setDamagePhotos] = useState<PropertyFile[]>([]);
  const [damageVideos, setDamageVideos] = useState<PropertyFile[]>([]);
  
  // Video upload refs
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Calculate progress
  const totalSteps = 6;
  const progressPercent = (completedSteps.length / totalSteps) * 100;

  // Load existing damage report when property changes
  useEffect(() => {
    if (incidentDetails.propertyId && user) {
      loadExistingReport(incidentDetails.propertyId);
    }
  }, [incidentDetails.propertyId, user]);

  // Fetch files when property is selected for viewing
  useEffect(() => {
    if (selectedPropertyId && user) {
      fetchPropertyFiles();
    } else {
      setDamagePhotos([]);
      setDamageVideos([]);
    }
  }, [selectedPropertyId, user]);

  const loadExistingReport = async (propertyId: string) => {
    if (!user) return;
    
    setLoadingReport(true);
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIncidentDetails({
          id: data.id,
          dateOfDamage: data.date_of_damage || '',
          approximateTime: data.approximate_time || '',
          incidentTypes: data.incident_types || [],
          otherIncidentType: data.other_incident_type || '',
          propertyId: data.property_id,
          areasAffected: data.areas_affected || [],
          otherArea: data.other_area || '',
          impactBuckets: data.impact_buckets || [],
          belongingsItems: data.belongings_items || [],
          otherBelongings: data.other_belongings || '',
          visibleDamage: data.visible_damage || [],
          damageOngoing: data.damage_ongoing || '',
          safetyConcerns: data.safety_concerns || [],
          actionsTaken: data.actions_taken || [],
          estimatedCost: data.estimated_cost || '',
          contactedSomeone: data.contacted_someone || '',
          professionalsContacted: data.professionals_contacted || [],
          claimNumber: data.claim_number || '',
          companyNames: data.company_names || '',
          additionalObservations: data.additional_observations || '',
        });
        
        // Set completed steps based on data
        const completed: number[] = [];
        if (data.incident_types?.length > 0 || data.date_of_damage) completed.push(2);
        if (data.areas_affected?.length > 0 || data.impact_buckets?.length > 0) completed.push(3);
        if (data.visible_damage?.length > 0) completed.push(4);
        if (data.safety_concerns?.length > 0 || data.actions_taken?.length > 0) completed.push(5);
        if (data.contacted_someone) completed.push(6);
        setCompletedSteps(completed);
      }
    } catch (error) {
      console.error('Error loading damage report:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  // Load specific report by ID for editing
  const loadReportById = async (reportId: string) => {
    if (!user) return;
    
    setLoadingReport(true);
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setIncidentDetails({
          id: data.id,
          dateOfDamage: data.date_of_damage || '',
          approximateTime: data.approximate_time || '',
          incidentTypes: data.incident_types || [],
          otherIncidentType: data.other_incident_type || '',
          propertyId: data.property_id,
          areasAffected: data.areas_affected || [],
          otherArea: data.other_area || '',
          impactBuckets: data.impact_buckets || [],
          belongingsItems: data.belongings_items || [],
          otherBelongings: data.other_belongings || '',
          visibleDamage: data.visible_damage || [],
          damageOngoing: data.damage_ongoing || '',
          safetyConcerns: data.safety_concerns || [],
          actionsTaken: data.actions_taken || [],
          estimatedCost: data.estimated_cost || '',
          contactedSomeone: data.contacted_someone || '',
          professionalsContacted: data.professionals_contacted || [],
          claimNumber: data.claim_number || '',
          companyNames: data.company_names || '',
          additionalObservations: data.additional_observations || '',
        });
        
        // Set completed steps based on data
        const completed: number[] = [];
        if (data.incident_types?.length > 0 || data.date_of_damage) completed.push(2);
        if (data.areas_affected?.length > 0 || data.impact_buckets?.length > 0) completed.push(3);
        if (data.visible_damage?.length > 0) completed.push(4);
        if (data.safety_concerns?.length > 0 || data.actions_taken?.length > 0) completed.push(5);
        if (data.contacted_someone) completed.push(6);
        setCompletedSteps(completed);
        
        // Also set the selected property for the files view
        setSelectedPropertyId(data.property_id);
        
        // Open step 1 for editing
        setOpenSteps({ 1: true, 2: false, 3: false, 4: false, 5: false, 6: false });
        
        toast({
          title: "Report Loaded",
          description: "You can now edit this damage report.",
        });
      }
    } catch (error) {
      console.error('Error loading damage report:', error);
      toast({
        title: "Error",
        description: "Failed to load the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  // Handler for editing a report from the SavedDamageReports component
  const handleEditReport = (reportId: string, propertyId: string) => {
    loadReportById(reportId);
    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Video upload handler
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedPropertyId || !user) return;
    
    setUploadingVideo(true);
    try {
      for (const file of files) {
        const result = await StorageService.uploadFileWithValidation(file, 'videos', user.id, 'standard');
        await PropertyService.addPropertyFile({
          property_id: selectedPropertyId,
          file_name: file.name,
          file_path: result.path,
          file_url: result.url,
          file_type: 'video',
          bucket_name: 'property-videos',
          file_size: file.size,
        });
      }
      await fetchPropertyFiles();
      toast({
        title: "Videos Uploaded",
        description: `${files.length} video(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  // Toggle step open/close - allows reopening any step
  const toggleStep = (step: number) => {
    setOpenSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    // Close current step and open next step
    if (step < 6) {
      setOpenSteps(prev => ({ ...prev, [step]: false, [step + 1]: true }));
    } else {
      // Last step - just close it
      setOpenSteps(prev => ({ ...prev, [step]: false }));
    }
  };

  const skipStep = (step: number) => {
    setOpenSteps(prev => ({ ...prev, [step]: false, [step + 1]: true }));
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

      // Save or update damage report
      const reportData = {
        user_id: user.id,
        property_id: incidentDetails.propertyId,
        date_of_damage: incidentDetails.dateOfDamage || null,
        approximate_time: incidentDetails.approximateTime || null,
        incident_types: incidentDetails.incidentTypes,
        other_incident_type: incidentDetails.otherIncidentType || null,
        areas_affected: incidentDetails.areasAffected,
        other_area: incidentDetails.otherArea || null,
        impact_buckets: incidentDetails.impactBuckets,
        belongings_items: incidentDetails.belongingsItems,
        other_belongings: incidentDetails.otherBelongings || null,
        visible_damage: incidentDetails.visibleDamage,
        damage_ongoing: incidentDetails.damageOngoing || null,
        safety_concerns: incidentDetails.safetyConcerns,
        actions_taken: incidentDetails.actionsTaken,
        estimated_cost: incidentDetails.estimatedCost || null,
        contacted_someone: incidentDetails.contactedSomeone || null,
        professionals_contacted: incidentDetails.professionalsContacted,
        claim_number: incidentDetails.claimNumber || null,
        company_names: incidentDetails.companyNames || null,
        additional_observations: incidentDetails.additionalObservations || null,
      };

      if (incidentDetails.id) {
        // Update existing report
        const { error } = await supabase
          .from('damage_reports')
          .update(reportData)
          .eq('id', incidentDetails.id);
        
        if (error) throw error;
      } else {
        // Insert new report
        const { data, error } = await supabase
          .from('damage_reports')
          .insert(reportData)
          .select('id')
          .single();
        
        if (error) throw error;
        if (data) {
          setIncidentDetails(prev => ({ ...prev, id: data.id }));
        }
      }

      toast({
        title: "You've captured what matters",
        description: "Your documentation has been saved. You can add to this anytime.",
      });

      // Clear selected files only
      setSelectedFiles([]);
      
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

  // Step header component - clicking always toggles (allows reopening)
  const StepHeader = ({ step, title, isOpen, isComplete }: { step: number; title: string; isOpen: boolean; isComplete: boolean }) => (
    <CollapsibleTrigger 
      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      onClick={() => toggleStep(step)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          isComplete ? 'bg-green-500 text-white' : isOpen ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {isComplete ? <Check className="h-4 w-4" /> : step}
        </div>
        <span className={`font-medium ${isOpen ? 'text-gray-900' : 'text-gray-600'}`}>{title}</span>
      </div>
      {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
    </CollapsibleTrigger>
  );

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <AlertTriangle className="h-6 w-6 mr-2 text-amber-500" />
          Document What Happened
        </CardTitle>
        <CardDescription className="text-base">
          Take your time. We'll guide you through it.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-24 md:pb-6">
        {/* Reassurance Message */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-amber-800 text-sm leading-relaxed">
            <span className="font-medium">You don't need to complete everything today.</span>
            <br />
            Even partial documentation is valuable. You can always come back and add more.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Your progress</span>
            <span>{completedSteps.length} of {totalSteps} sections</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Steps Container */}
        <div className="space-y-3">
          
          {/* Step 1: Upload Evidence (Made Primary) */}
          <Collapsible open={openSteps[1]} onOpenChange={() => toggleStep(1)}>
            <Card className={`transition-all ${openSteps[1] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={1} title="Upload Photos & Videos" isOpen={openSteps[1]} isComplete={completedSteps.includes(1)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      <p className="font-medium mb-1">📸 Quick tips:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600">
                        <li>Wide shot of the room</li>
                        <li>Close-ups of damage</li>
                        <li>Serial numbers if visible</li>
                      </ul>
                    </div>

                    {/* Property Selection */}
                    <div className="space-y-2">
                      <Label>Property</Label>
                      <PropertySelector
                        value={incidentDetails.propertyId}
                        onChange={(value) => updateIncidentDetails('propertyId', value)}
                        placeholder="Select property"
                      />
                      {loadingReport && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Loading existing report...
                        </p>
                      )}
                    </div>
                    
                    {/* File Upload */}
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => cameraInputRef.current?.click()}
                          className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-brand-green hover:bg-green-50"
                          disabled={uploading}
                        >
                          <Camera className="h-6 w-6 text-brand-green" />
                          <span className="text-sm">Take Photo</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-brand-green hover:bg-green-50"
                          disabled={uploading}
                        >
                          <Upload className="h-6 w-6 text-brand-green" />
                          <span className="text-sm">Upload Files</span>
                        </Button>
                      </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-green-700">✓ {selectedFiles.length} file(s) ready</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative bg-gray-100 rounded-lg p-2 pr-6 text-xs">
                              <button
                                onClick={() => removeSelectedFile(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <p className="truncate max-w-[120px]">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 text-center">
                      You can add more photos or notes later.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => skipStep(1)}
                        className="flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for now
                      </Button>
                      <Button 
                        onClick={() => markStepComplete(1)}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90"
                        disabled={!incidentDetails.propertyId}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Step 2: What Happened */}
          <Collapsible open={openSteps[2]} onOpenChange={() => toggleStep(2)}>
            <Card className={`transition-all ${openSteps[2] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={2} title="What Happened?" isOpen={openSteps[2]} isComplete={completedSteps.includes(2)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>When did it happen?</Label>
                        <Input
                          type="date"
                          value={incidentDetails.dateOfDamage}
                          onChange={(e) => updateIncidentDetails('dateOfDamage', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Approximate time <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Input
                          type="time"
                          value={incidentDetails.approximateTime}
                          onChange={(e) => updateIncidentDetails('approximateTime', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Type of incident <span className="text-gray-400 font-normal">(select all that apply)</span></Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {INCIDENT_TYPES.map((type) => {
                          const IconComponent = type.icon;
                          const isSelected = incidentDetails.incidentTypes.includes(type.id);
                          return (
                            <button
                              key={type.id}
                              onClick={() => toggleArrayField('incidentTypes', type.id)}
                              className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                                isSelected 
                                  ? 'border-brand-green bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <IconComponent className={`h-5 w-5 ${type.color}`} />
                              <span className="text-xs text-center">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {incidentDetails.incidentTypes.includes('other') && (
                        <Input
                          placeholder="Please describe..."
                          value={incidentDetails.otherIncidentType}
                          onChange={(e) => updateIncidentDetails('otherIncidentType', e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => skipStep(2)}
                        className="flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for now
                      </Button>
                      <Button 
                        onClick={() => markStepComplete(2)}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Step 3: Where It Happened & What Was Affected */}
          <Collapsible open={openSteps[3]} onOpenChange={() => toggleStep(3)}>
            <Card className={`transition-all ${openSteps[3] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={3} title="Where It Happened & What Was Affected" isOpen={openSteps[3]} isComplete={completedSteps.includes(3)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Area affected</Label>
                      <div className="flex flex-wrap gap-2">
                        {AREA_OPTIONS.map((area) => {
                          const isSelected = incidentDetails.areasAffected.includes(area.id);
                          return (
                            <button
                              key={area.id}
                              onClick={() => toggleArrayField('areasAffected', area.id)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                isSelected 
                                  ? 'bg-brand-green text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {area.label}
                            </button>
                          );
                        })}
                      </div>
                      {incidentDetails.areasAffected.includes('other') && (
                        <Input
                          placeholder="Describe the area..."
                          value={incidentDetails.otherArea}
                          onChange={(e) => updateIncidentDetails('otherArea', e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>What was impacted?</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {IMPACT_BUCKETS.map((bucket) => {
                          const IconComponent = bucket.icon;
                          const isSelected = incidentDetails.impactBuckets.includes(bucket.id);
                          return (
                            <button
                              key={bucket.id}
                              onClick={() => toggleArrayField('impactBuckets', bucket.id)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                isSelected 
                                  ? 'border-brand-green bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <IconComponent className={`h-8 w-8 ${isSelected ? 'text-brand-green' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">{bucket.label}</span>
                              <span className="text-xs text-gray-500 text-center">{bucket.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Belongings sub-items */}
                    {incidentDetails.impactBuckets.includes('belongings') && (
                      <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                        <Label className="text-sm">What belongings were affected?</Label>
                        <div className="flex flex-wrap gap-2">
                          {BELONGINGS_ITEMS.map((item) => {
                            const isSelected = incidentDetails.belongingsItems.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => toggleArrayField('belongingsItems', item.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                                  isSelected 
                                    ? 'bg-brand-green text-white' 
                                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                                }`}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                        {incidentDetails.belongingsItems.includes('other') && (
                          <Input
                            placeholder="Describe other items..."
                            value={incidentDetails.otherBelongings}
                            onChange={(e) => updateIncidentDetails('otherBelongings', e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => skipStep(3)}
                        className="flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for now
                      </Button>
                      <Button 
                        onClick={() => markStepComplete(3)}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Step 4: What You Can See */}
          <Collapsible open={openSteps[4]} onOpenChange={() => toggleStep(4)}>
            <Card className={`transition-all ${openSteps[4] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={4} title="What You Can See" isOpen={openSteps[4]} isComplete={completedSteps.includes(4)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                      Just describe what you can see. No technical assessment needed.
                    </p>

                    <div className="space-y-2">
                      <Label>Visible damage observed</Label>
                      <div className="space-y-2">
                        {VISIBLE_DAMAGE.map((damage) => {
                          const isSelected = incidentDetails.visibleDamage.includes(damage.id);
                          return (
                            <button
                              key={damage.id}
                              onClick={() => toggleArrayField('visibleDamage', damage.id)}
                              className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all text-left ${
                                isSelected 
                                  ? 'border-brand-green bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-sm">{damage.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Is the damage ongoing?</Label>
                      <RadioGroup
                        value={incidentDetails.damageOngoing}
                        onValueChange={(value) => updateIncidentDetails('damageOngoing', value)}
                        className="flex flex-wrap gap-3"
                      >
                        {['yes', 'no', 'not_sure'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`ongoing-${option}`} />
                            <Label htmlFor={`ongoing-${option}`} className="font-normal cursor-pointer capitalize">
                              {option === 'not_sure' ? 'Not sure' : option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => skipStep(4)}
                        className="flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for now
                      </Button>
                      <Button 
                        onClick={() => markStepComplete(4)}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Step 5: Safety & Immediate Actions */}
          <Collapsible open={openSteps[5]} onOpenChange={() => toggleStep(5)}>
            <Card className={`transition-all ${openSteps[5] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={5} title="Safety & Immediate Actions" isOpen={openSteps[5]} isComplete={completedSteps.includes(5)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">This section is optional. Fill in what applies.</p>

                    <div className="space-y-2">
                      <Label>Any safety concerns?</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SAFETY_CONCERNS.map((concern) => {
                          const isSelected = incidentDetails.safetyConcerns.includes(concern.id);
                          return (
                            <button
                              key={concern.id}
                              onClick={() => toggleArrayField('safetyConcerns', concern.id)}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                                isSelected 
                                  ? concern.id === 'none' 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-amber-500 bg-amber-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-lg">{concern.icon}</span>
                              <span className="text-sm">{concern.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>What have you done so far?</Label>
                      <div className="flex flex-wrap gap-2">
                        {ACTIONS_TAKEN.map((action) => {
                          const isSelected = incidentDetails.actionsTaken.includes(action.id);
                          return (
                            <button
                              key={action.id}
                              onClick={() => toggleArrayField('actionsTaken', action.id)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                isSelected 
                                  ? 'bg-brand-green text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>If you have a rough idea of cost <span className="text-gray-400 font-normal">(optional)</span></Label>
                      <div className="flex flex-wrap gap-2">
                        {COST_ESTIMATES.map((cost) => {
                          const isSelected = incidentDetails.estimatedCost === cost.id;
                          return (
                            <button
                              key={cost.id}
                              onClick={() => updateIncidentDetails('estimatedCost', cost.id)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                isSelected 
                                  ? 'bg-brand-green text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {cost.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => skipStep(5)}
                        className="flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip for now
                      </Button>
                      <Button 
                        onClick={() => markStepComplete(5)}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Step 6: Who You've Talked To */}
          <Collapsible open={openSteps[6]} onOpenChange={() => toggleStep(6)}>
            <Card className={`transition-all ${openSteps[6] ? 'ring-2 ring-brand-green shadow-md' : ''}`}>
              <StepHeader step={6} title="Who You've Talked To (Optional)" isOpen={openSteps[6]} isComplete={completedSteps.includes(6)} />
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Have you already contacted anyone?</Label>
                      <RadioGroup
                        value={incidentDetails.contactedSomeone}
                        onValueChange={(value) => updateIncidentDetails('contactedSomeone', value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="contacted-yes" />
                          <Label htmlFor="contacted-yes" className="font-normal cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="contacted-no" />
                          <Label htmlFor="contacted-no" className="font-normal cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {incidentDetails.contactedSomeone === 'yes' && (
                      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          <Label>Who have you contacted?</Label>
                          <div className="flex flex-wrap gap-2">
                            {['Insurance', 'Contractor', 'Restoration company', 'Other'].map((pro) => {
                              const id = pro.toLowerCase().replace(' ', '_');
                              const isSelected = incidentDetails.professionalsContacted.includes(id);
                              return (
                                <button
                                  key={id}
                                  onClick={() => toggleArrayField('professionalsContacted', id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                                    isSelected 
                                      ? 'bg-brand-green text-white' 
                                      : 'bg-white text-gray-700 border hover:bg-gray-50'
                                  }`}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {pro}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Insurance reference <span className="text-gray-400 font-normal">(if you have one)</span></Label>
                            <Input
                              placeholder="Claim or reference number"
                              value={incidentDetails.claimNumber}
                              onChange={(e) => updateIncidentDetails('claimNumber', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Company name(s)</Label>
                            <Input
                              placeholder="Who you've talked to"
                              value={incidentDetails.companyNames}
                              onChange={(e) => updateIncidentDetails('companyNames', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Anything else you noticed? <span className="text-gray-400 font-normal">(optional)</span></Label>
                      <Textarea
                        placeholder="Add any additional observations..."
                        value={incidentDetails.additionalObservations}
                        onChange={(e) => updateIncidentDetails('additionalObservations', e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Changed from button to completion message */}
                    {completedSteps.length === totalSteps ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-green-700 text-sm flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />
                          All sections complete! You can save your documentation below.
                        </p>
                      </div>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => markStepComplete(6)}
                        className="w-full"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Save Button - Regular placement for desktop */}
        <div className="mt-6 hidden md:block">
          <Button 
            onClick={handleUploadAndSave}
            className="w-full bg-brand-green hover:bg-brand-green/90 h-14 text-lg rounded-xl"
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
                Save Documentation
              </>
            )}
          </Button>
          
          {!incidentDetails.propertyId && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Select a property in Step 1 to save
            </p>
          )}
        </div>

        {/* Sticky Save Button for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
          <Button 
            onClick={handleUploadAndSave}
            className="w-full bg-brand-green hover:bg-brand-green/90 h-12 text-base rounded-xl"
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
                Save Documentation
              </>
            )}
          </Button>
        </div>

        {/* Footer Disclaimer */}
        <div className="bg-gray-50 rounded-xl p-4 mt-6">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
            Asset Safe records user-provided documentation and observations. Damage assessments, valuations, coverage determinations, and claim decisions are made by independent third parties.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* View Existing Documentation */}
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-3">
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
          <Tabs defaultValue="photos" className="w-full mt-4">
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
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 z-10"
                          onClick={() => handleDeleteFile(photo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <img 
                          src={photo.file_url} 
                          alt={photo.file_name}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <p className="text-sm font-medium truncate">{photo.file_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(photo.created_at)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              {/* Video Upload Buttons */}
              <div className="mb-4">
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoFileSelect}
                  className="hidden"
                />
                <input
                  ref={videoCameraInputRef}
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoFileSelect}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => videoCameraInputRef.current?.click()}
                    className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed hover:border-brand-green hover:bg-green-50"
                    disabled={uploadingVideo}
                  >
                    <Camera className="h-5 w-5 text-brand-green" />
                    <span className="text-xs">Record Video</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed hover:border-brand-green hover:bg-green-50"
                    disabled={uploadingVideo}
                  >
                    <Upload className="h-5 w-5 text-brand-green" />
                    <span className="text-xs">Upload Video</span>
                  </Button>
                </div>
                {uploadingVideo && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading video...
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : damageVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No damage videos yet</h3>
                  <p className="text-gray-500 mb-4">Use the buttons above to record or upload videos</p>
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
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 z-10"
                          onClick={() => handleDeleteFile(video)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <video 
                          src={video.file_url} 
                          className="w-full h-48 object-cover"
                          controls
                        />
                        <CardContent className="p-4">
                          <p className="text-sm font-medium truncate">{video.file_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(video.created_at)}
                          </p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generate Damage Report</CardTitle>
                  <CardDescription>
                    Create a PDF report of all damage documentation for this property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Total Photos: {damagePhotos.length}</p>
                        <p className="font-medium">Total Videos: {damageVideos.length}</p>
                      </div>
                      <Button 
                        onClick={generateDamageReport}
                        className="bg-brand-green hover:bg-brand-green/90"
                        disabled={damagePhotos.length === 0 && damageVideos.length === 0}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate PDF Report
                      </Button>
                    </div>
                    {damagePhotos.length === 0 && damageVideos.length === 0 && (
                      <p className="text-sm text-gray-500 text-center">
                        Upload some damage photos or videos first to generate a report
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Saved Damage Reports Section */}
        <SavedDamageReports onEditReport={handleEditReport} />
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteFile}
        title="Delete Damage Documentation"
        description={`Are you sure you want to permanently delete "${fileToDelete?.file_name}"? This action cannot be undone and will remove the file from both the database and storage.`}
      />
    </Card>
  );
};

export default PostDamageSection;
