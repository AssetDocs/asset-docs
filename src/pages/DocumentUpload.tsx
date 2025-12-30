import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Trash2, Folder, Shield, FileWarning, FileCheck, Receipt, ClipboardCheck, Home, Files, Loader2 } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DocumentType } from '@/components/DocumentTypeSelector';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentFolder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

const documentTypeLabels: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  insurance_policy: { label: 'Insurance Policy', icon: Shield, color: 'bg-yellow text-yellow-foreground' },
  insurance_claim: { label: 'Insurance Claim', icon: FileWarning, color: 'bg-yellow text-yellow-foreground' },
  warranty: { label: 'Warranty', icon: FileCheck, color: 'bg-yellow text-yellow-foreground' },
  receipt: { label: 'Receipt', icon: Receipt, color: 'bg-yellow text-yellow-foreground' },
  inspection_report: { label: 'Inspection Report', icon: ClipboardCheck, color: 'bg-yellow text-yellow-foreground' },
  appraisal: { label: 'Appraisal', icon: FileText, color: 'bg-yellow text-yellow-foreground' },
  title_deed: { label: 'Title / Deed', icon: Home, color: 'bg-yellow text-yellow-foreground' },
  other: { label: 'Other', icon: Files, color: 'bg-yellow text-yellow-foreground' }
};

const NO_FOLDER_VALUE = '__none__';

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentType = (searchParams.get('type') as DocumentType) || 'other';
  const typeInfo = documentTypeLabels[documentType] || documentTypeLabels.other;
  const TypeIcon = typeInfo.icon;

  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Default settings
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const [defaultFolderId, setDefaultFolderId] = useState('');

  const { uploadSingleFile, isUploading } = useFileUpload({
    bucket: 'documents',
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  // Apply defaults when file is selected
  useEffect(() => {
    if (selectedFile && !selectedPropertyId && defaultPropertyId) {
      setSelectedPropertyId(defaultPropertyId);
    }
    if (selectedFile && !selectedFolderId && defaultFolderId) {
      setSelectedFolderId(defaultFolderId);
    }
  }, [selectedFile, defaultPropertyId, defaultFolderId]);

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Set default document name from file name (without extension)
      setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDocumentName('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const saveDocument = async () => {
    if (!user || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Upload file to storage
      const uploadResult = await uploadSingleFile(selectedFile);
      
      if (!uploadResult) {
        throw new Error('Failed to upload file');
      }

      // 2. Save document metadata to database
      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_path: uploadResult.path,
          file_url: uploadResult.url,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          document_type: documentType,
          category: category,
          document_name: documentName || selectedFile.name.replace(/\.[^/.]+$/, ''),
          description: description || null,
          tags: tags || null,
          property_id: selectedPropertyId || null,
          folder_id: selectedFolderId || null
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save document metadata');
      }

      toast({
        title: "Document saved",
        description: "Your document has been uploaded successfully.",
      });

      navigate('/account/documents');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save document.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUploading || isSaving;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/account/documents')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-orange mb-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              Upload Document
              <Badge className={typeInfo.color} variant="secondary">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
            </h1>
          </div>

          {/* Default Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium">Default Property (optional)</Label>
              <div className="mt-1">
                <PropertySelector
                  value={defaultPropertyId}
                  onChange={setDefaultPropertyId}
                  placeholder="Select a property"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Default Folder (optional)</Label>
              <Select
                value={defaultFolderId || NO_FOLDER_VALUE}
                onValueChange={(v) => setDefaultFolderId(v === NO_FOLDER_VALUE ? '' : v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value={NO_FOLDER_VALUE}>None</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded bg-gradient-to-r ${folder.gradient_color}`}></div>
                        {folder.folder_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                  </p>
                </div>

                {selectedFile && (
                  <div className="mt-4 border rounded-lg p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Selected Files (1)</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Panel - Document Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Upload documents to add details here
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {/* File Info */}
                    <div className="border rounded-lg p-3 bg-muted/50 flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium break-all">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={removeFile}
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Document Name */}
                    <div>
                      <Label htmlFor="document-name" className="text-sm font-medium">
                        Document Name
                      </Label>
                      <Input
                        id="document-name"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Enter document name"
                        className="mt-1"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="warranty">Warranty</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="taxes">Taxes</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Property Selection */}
                    <div>
                      <Label className="text-sm font-medium">Property</Label>
                      <div className="mt-1">
                        <PropertySelector
                          value={selectedPropertyId}
                          onChange={setSelectedPropertyId}
                          placeholder="Select a property"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium">
                        Tags (comma separated)
                      </Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. policy, home, 2024"
                        className="mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter document description"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <Button 
              onClick={saveDocument} 
              className="w-full bg-brand-blue hover:bg-brand-lightBlue"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                `Save All Documents (${selectedFile ? 1 : 0})`
              )}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocumentUpload;
