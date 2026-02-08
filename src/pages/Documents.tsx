import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Plus,
  FolderPlus,
  SortAsc,
  Calendar,
  Type,
  Grid3X3,
  List,
  Eye,
  Trash2,
  Shield,
  CheckSquare,
  Square,
  Loader2,
  Upload,
  Pencil
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import EditFolderModal from '@/components/EditFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import DocumentFolders from '@/components/DocumentFolders';
import DocumentTypeSelector, { DocumentType } from '@/components/DocumentTypeSelector';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { InsuranceService, InsurancePolicy } from '@/services/InsuranceService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';

interface Folder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  // Document type selector
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  
  // Insurance state
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [insuranceLoading, setInsuranceLoading] = useState(true);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [showInsuranceDeleteDialog, setShowInsuranceDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);
  const [insuranceBulkDeleteMode, setInsuranceBulkDeleteMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Support deep-linking directly into the "Add Document" modal
    if (searchParams.get('add') === '1') {
      setShowTypeSelector(true);
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
      fetchFolders();
      loadPolicies();
    }
  }, [user]);

  const loadPolicies = async () => {
    if (!user?.id) return;
    
    setInsuranceLoading(true);
    try {
      const data = await InsuranceService.getUserPolicies(user.id);
      setPolicies(data);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load insurance policies',
        variant: 'destructive',
      });
    } finally {
      setInsuranceLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null);
    } else {
      navigate('/account');
    }
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const transformedDocuments = documents.map(doc => ({
    id: doc.id,
    name: doc.document_name || doc.file_name,
    url: doc.file_url,
    filePath: doc.file_path,
    bucket: 'documents',
    uploadDate: doc.created_at,
    size: formatFileSize(doc.file_size),
    propertyName: doc.property_id ? getPropertyName(doc.property_id) : 'No Property',
    type: doc.file_name?.split('.').pop()?.toUpperCase() || 'FILE',
    tags: doc.tags,
    description: doc.description,
    category: doc.category,
    documentType: doc.document_type,
    folderId: doc.folder_id
  }));

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Documents'
    : 'All Documents';

  const filteredDocuments = transformedDocuments.filter(document => {
    const matchesSearch = document.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder ? document.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'date-asc':
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Filter and sort policies
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.insurance_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policy_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name-asc':
        return (a.insurance_company || '').localeCompare(b.insurance_company || '');
      case 'name-desc':
        return (b.insurance_company || '').localeCompare(a.insurance_company || '');
      default:
        return 0;
    }
  });

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(sortedDocuments.map(doc => doc.id));
  };

  const unselectAllDocuments = () => {
    setSelectedDocuments([]);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    try {
      if (bulkDeleteMode) {
        const deletePromises = selectedDocuments.map(async (documentId) => {
          const document = documents.find(d => d.id === documentId);
          if (document) {
            // Delete from storage first
            if (document.file_path) {
              await supabase.storage.from('documents').remove([document.file_path]);
            }
            // Delete from user_documents table
            await supabase.from('user_documents').delete().eq('id', documentId);
          }
        });
        
        await Promise.all(deletePromises);
        toast({
          title: "Success",
          description: `${selectedDocuments.length} document(s) deleted successfully`
        });
      } else if (documentToDelete) {
        const document = documents.find(d => d.id === documentToDelete);
        if (document) {
          // Delete from storage first
          if (document.file_path) {
            await supabase.storage.from('documents').remove([document.file_path]);
          }
          // Delete from user_documents table
          const { error } = await supabase.from('user_documents').delete().eq('id', documentToDelete);
          if (!error) {
            toast({
              title: "Success",
              description: "Document deleted successfully"
            });
          }
        }
      }
      
      await fetchDocuments();
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error deleting document(s):', error);
      toast({
        title: "Error",
        description: "Failed to delete document(s)",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
    setBulkDeleteMode(false);
  };

  const handleCreateFolder = async (name: string, description: string, gradientColor: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .insert({
          user_id: user.id,
          folder_name: name,
          description: description || null,
          gradient_color: gradientColor
        })
        .select()
        .single();

      if (error) throw error;
      
      setFolders([data, ...folders]);
      setShowCreateFolder(false);
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteFolderDialog(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      const { error: updateError } = await supabase
        .from('property_files')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', folderToDelete);

      if (deleteError) throw deleteError;
      
      setFolders(folders.filter(f => f.id !== folderToDelete));
      if (selectedFolder === folderToDelete) {
        setSelectedFolder(null);
      }
      
      await fetchDocuments();
      setShowDeleteFolderDialog(false);
      setFolderToDelete(null);
      
      toast({
        title: "Success",
        description: "Folder deleted successfully. Files remain in general storage."
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setFolderToEdit(folder);
    setShowEditFolder(true);
  };

  const handleSaveFolder = async (id: string, name: string, description: string, color: string) => {
    try {
      const { error } = await supabase
        .from('document_folders')
        .update({
          folder_name: name,
          description: description || null,
          gradient_color: color
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchFolders();
      setShowEditFolder(false);
      setFolderToEdit(null);
      toast({ title: "Success", description: "Folder updated successfully" });
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({ title: "Error", description: "Failed to update folder", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Insurance helper functions
  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleDeletePolicy = (policyId: string) => {
    setPolicyToDelete(policyId);
    setInsuranceBulkDeleteMode(false);
    setShowInsuranceDeleteDialog(true);
  };

  const handleInsuranceBulkDelete = () => {
    setInsuranceBulkDeleteMode(true);
    setShowInsuranceDeleteDialog(true);
  };

  const confirmInsuranceDelete = async () => {
    setIsDeleting(true);
    try {
      if (insuranceBulkDeleteMode) {
        for (const policyId of selectedPolicies) {
          await InsuranceService.deletePolicy(policyId);
        }
        setPolicies(prev => prev.filter(policy => !selectedPolicies.includes(policy.id)));
        toast({
          title: 'Policies deleted',
          description: `${selectedPolicies.length} policy(ies) have been deleted.`,
        });
        setSelectedPolicies([]);
      } else if (policyToDelete) {
        await InsuranceService.deletePolicy(policyToDelete);
        setPolicies(prev => prev.filter(policy => policy.id !== policyToDelete));
        setSelectedPolicies(prev => prev.filter(id => id !== policyToDelete));
        toast({
          title: 'Policy deleted',
          description: 'The insurance policy has been deleted.',
        });
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete policy',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowInsuranceDeleteDialog(false);
      setPolicyToDelete(null);
      setInsuranceBulkDeleteMode(false);
    }
  };

  const cancelInsuranceDelete = () => {
    setShowInsuranceDeleteDialog(false);
    setPolicyToDelete(null);
    setInsuranceBulkDeleteMode(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  // Handle document type selection
  const handleDocumentTypeSelect = (type: DocumentType) => {
    setShowTypeSelector(false);
    
    if (type === 'insurance_policy') {
      navigate('/account/insurance/new');
    } else {
      // Navigate to document upload with the selected type as a query param
      navigate(`/account/documents/upload?type=${type}`);
    }
  };

  const totalRecords = sortedDocuments.length + sortedPolicies.length;
  const totalSelected = selectedDocuments.length + selectedPolicies.length;

  const handleReorderFolders = (reorderedFolders: Folder[]) => {
    setFolders(reorderedFolders);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb parentRoute="/account?tab=asset-documentation" parentLabel="Back to Asset Documentation" hidePageName />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-brand-blue" />
                Documents & Records
              </h1>
              <p className="text-sm text-gray-500">
                Store policies, receipts, warranties, titles, licenses, and other critical records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button onClick={() => setShowTypeSelector(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Folders */}
            <div className="lg:col-span-1">
              <DocumentFolders
                folders={folders}
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                documentCount={documents.length}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={() => setShowCreateFolder(true)}
                onReorderFolders={(reorderedFolders) => setFolders(reorderedFolders)}
                onEditFolder={handleEditFolder}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Insurance Policies Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Insurance Policies
                      <Badge variant="secondary" className="ml-2">{sortedPolicies.length}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insuranceLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-blue mx-auto" />
                      <p className="text-muted-foreground mt-2 text-sm">Loading policies...</p>
                    </div>
                  ) : sortedPolicies.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-base font-semibold mb-1">No insurance policies yet</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Add your first insurance policy to keep track of your coverage.
                      </p>
                      <Button size="sm" onClick={() => navigate('/account/insurance/new')}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Policy
                      </Button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedPolicies.map((policy) => (
                        <div key={policy.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center mr-3">
                                <Shield className="h-5 w-5 text-yellow-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{policy.insurance_company}</h3>
                                <p className="text-xs text-gray-500 capitalize">{policy.policy_type}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedPolicies.includes(policy.id)}
                              onChange={() => togglePolicySelection(policy.id)}
                              className="h-4 w-4"
                            />
                          </div>
                          
                          <div className="space-y-1 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Policy #:</span>
                              <span className="font-medium">{policy.policy_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage:</span>
                              <span className="font-medium">{formatCurrency(policy.coverage_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Status:</span>
                              <Badge className={getStatusColor(policy.status)} variant="secondary">
                                {policy.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate(`/account/insurance/${policy.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/account/insurance/${policy.id}/edit`)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedPolicies.map((policy) => (
                        <div key={policy.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedPolicies.includes(policy.id)}
                                onChange={() => togglePolicySelection(policy.id)}
                                className="h-4 w-4 mr-3"
                              />
                              <div className="w-8 h-8 bg-yellow rounded flex items-center justify-center mr-3">
                                <Shield className="h-4 w-4 text-yellow-foreground" />
                              </div>
                              <div>
                                <h3 className="font-medium">{policy.insurance_company}</h3>
                                <p className="text-sm text-gray-500">
                                  {policy.policy_type} • {policy.policy_number}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(policy.status)} variant="secondary">
                                {policy.status}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/account/insurance/${policy.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/account/insurance/${policy.id}/edit`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeletePolicy(policy.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedFolder 
                        ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Documents'
                        : 'All Documents'
                      }
                      <Badge variant="secondary" className="ml-2">{sortedDocuments.length}</Badge>
                    </CardTitle>
                    
                    {/* Controls moved inside the card */}
                    <div className="flex flex-wrap items-center gap-2">
                      {(selectedDocuments.length > 0 || selectedPolicies.length > 0) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (selectedDocuments.length > 0) handleBulkDelete();
                            if (selectedPolicies.length > 0) handleInsuranceBulkDelete();
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete ({totalSelected})
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <SortAsc className="h-4 w-4 mr-1" />
                            Sort
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Newest First
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Oldest First
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                            <Type className="h-4 w-4 mr-2" />
                            Name A-Z
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                            <Type className="h-4 w-4 mr-2" />
                            Name Z-A
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="rounded-none"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="rounded-none"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {selectedDocuments.length > 0 && (
                        <Button variant="outline" size="sm" onClick={unselectAllDocuments}>
                          Deselect ({selectedDocuments.length})
                        </Button>
                      )}
                      {selectedDocuments.length === 0 && sortedDocuments.length > 0 && (
                        <Button variant="outline" size="sm" onClick={selectAllDocuments}>
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-blue mx-auto" />
                      <p className="text-muted-foreground mt-2 text-sm">Loading documents...</p>
                    </div>
                  ) : (
                    <MediaGalleryGrid
                      files={sortedDocuments}
                      viewMode={viewMode}
                      selectedFiles={selectedDocuments}
                      onFileSelect={toggleDocumentSelection}
                      onDeleteFile={handleDeleteDocument}
                      onEditFile={(docId) => navigate(`/account/documents/${docId}/edit`)}
                      mediaType="document"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleDocumentTypeSelect}
      />

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? "Delete Documents" : "Delete Document"}
        itemCount={bulkDeleteMode ? selectedDocuments.length : 1}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteFolderDialog}
        onClose={() => {
          setShowDeleteFolderDialog(false);
          setFolderToDelete(null);
        }}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? This folder and all of its contents will be removed from the folder, but the uploaded files can still be found in general storage."
      />

      <DeleteConfirmationDialog
        isOpen={showInsuranceDeleteDialog}
        onClose={cancelInsuranceDelete}
        onConfirm={confirmInsuranceDelete}
        title={insuranceBulkDeleteMode ? "Delete Policies" : "Delete Policy"}
        itemCount={insuranceBulkDeleteMode ? selectedPolicies.length : 1}
      />

      <EditFolderModal
        isOpen={showEditFolder}
        onClose={() => { setShowEditFolder(false); setFolderToEdit(null); }}
        onSave={handleSaveFolder}
        folder={folderToEdit}
        isRoomBased={false}
      />
      
      <Footer />
    </div>
  );
};

export default Documents;
