import React, { useState } from 'react';
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
import { ArrowLeft, Upload, FileText, Trash2, Plus, Folder, Shield, FileWarning, FileCheck, Receipt, ClipboardCheck, Home, Files } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DocumentType } from '@/components/DocumentTypeSelector';

interface DocumentFolder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  category: string;
  description: string;
  propertyId: string;
  tags: string;
  folderId: string;
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

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentType = (searchParams.get('type') as DocumentType) || 'other';
  const typeInfo = documentTypeLabels[documentType] || documentTypeLabels.other;
  const TypeIcon = typeInfo.icon;

  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const NO_FOLDER_VALUE = '__none__';
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folders, setFolders] = useState<DocumentFolder[]>([]);

  React.useEffect(() => {
    console.log('DocumentUpload mounted, user:', user?.id);
  }, [user]);

  React.useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const processDocuments = () => {
    const newDocuments: UploadedDocument[] = selectedFiles.map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      file,
      name: file.name.split('.')[0],
      category: 'general',
      description: '',
      propertyId: defaultPropertyId,
      tags: '',
      folderId: selectedFolderId
    }));

    setUploadedDocuments([...uploadedDocuments, ...newDocuments]);
    setSelectedFiles([]);
  };

  const updateDocumentValue = (id: string, field: string, value: string) => {
    setUploadedDocuments(docs =>
      docs.map(doc =>
        doc.id === id ? { ...doc, [field]: value } : doc
      )
    );
  };

  const removeDocument = (id: string) => {
    setUploadedDocuments(docs => docs.filter(doc => doc.id !== id));
  };

  const saveDocuments = () => {
    console.log('Saving documents:', uploadedDocuments);
    // Here you would save to your backend/database
    navigate('/account/documents');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/account/documents')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              Upload Document
              <Badge className={typeInfo.color} variant="secondary">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
            </h1>
            <p className="text-gray-600">Upload your {typeInfo.label.toLowerCase()} document with optional notes</p>
          </div>

          {/* Default Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Default Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-property" className="text-sm font-medium">
                    Default Property (optional)
                  </Label>
                  <PropertySelector
                    value={defaultPropertyId}
                    onChange={setDefaultPropertyId}
                    placeholder="Select a default property"
                  />
                </div>
                <div>
                  <Label htmlFor="default-folder" className="text-sm font-medium">
                    Default Folder (optional)
                  </Label>
                  <Select
                    value={selectedFolderId || NO_FOLDER_VALUE}
                    onValueChange={(v) => setSelectedFolderId(v === NO_FOLDER_VALUE ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a folder" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value={NO_FOLDER_VALUE}>None</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${folder.gradient_color}`} />
                            {folder.folder_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFileSelect}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{file.name}</span>
                            </div>
                            <span className="text-gray-500">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={processDocuments} className="w-full mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Process Documents
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedDocuments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload documents to add details here
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {uploadedDocuments.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{document.file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(document.file.size)}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDocument(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Document Name</Label>
                            <Input
                              value={document.name}
                              onChange={(e) => updateDocumentValue(document.id, 'name', e.target.value)}
                              placeholder="Enter document name"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Category</Label>
                            <Select value={document.category} onValueChange={(value) => updateDocumentValue(document.id, 'category', value)}>
                              <SelectTrigger>
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

                          <div>
                            <Label className="text-xs">Property</Label>
                            <PropertySelector
                              value={document.propertyId}
                              onChange={(value) => updateDocumentValue(document.id, 'propertyId', value)}
                              placeholder="Select property"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Tags (comma separated)</Label>
                            <Input
                              value={document.tags}
                              onChange={(e) => updateDocumentValue(document.id, 'tags', e.target.value)}
                              placeholder="e.g. policy, home, 2024"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={document.description}
                              onChange={(e) => updateDocumentValue(document.id, 'description', e.target.value)}
                              placeholder="Enter document description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadedDocuments.length > 0 && (
                  <Button 
                    onClick={saveDocuments} 
                    className="w-full mt-4 bg-brand-blue hover:bg-brand-lightBlue"
                  >
                    Save All Documents ({uploadedDocuments.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocumentUpload;