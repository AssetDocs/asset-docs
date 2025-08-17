import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Trash2, Plus } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';

interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  category: string;
  description: string;
  propertyId: string;
  tags: string;
}

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');

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
      tags: ''
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
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Upload Documents</h1>
            <p className="text-gray-600">Upload important documents like insurance policies, warranties, and contracts</p>
          </div>

          {/* Default Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Default Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <Label htmlFor="default-property" className="text-sm font-medium">
                  Default Property (optional)
                </Label>
                <PropertySelector
                  value={defaultPropertyId}
                  onChange={setDefaultPropertyId}
                  placeholder="Select a default property"
                />
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
                              <SelectContent>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="warranty">Warranty</SelectItem>
                                <SelectItem value="legal">Legal</SelectItem>
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