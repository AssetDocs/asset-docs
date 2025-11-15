import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Plus,
  FolderPlus,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Type,
  Grid3X3,
  List,
  Eye,
  Download,
  Move,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import DocumentFolders from '@/components/DocumentFolders';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
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
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  const [documents, setDocuments] = useState<PropertyFile[]>([]);
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

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const files = await PropertyService.getAllUserFiles('document');
      setDocuments(files);
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
    name: doc.file_name,
    url: doc.file_url,
    uploadDate: doc.created_at,
    size: formatFileSize(doc.file_size),
    propertyName: getPropertyName(doc.property_id),
    type: doc.file_name.split('.').pop()?.toUpperCase() || 'FILE'
  }));

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Documents'
    : 'All Documents';

  const filteredDocuments = transformedDocuments.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  const handleMoveDocuments = (targetFolderId: number | null) => {
    // TODO: Implement folder functionality
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
        // Delete multiple documents
        const deletePromises = selectedDocuments.map(documentId => {
          const document = documents.find(d => d.id === documentId);
          if (document) {
            return PropertyService.deletePropertyFile(document.id, document.file_path, document.bucket_name);
          }
          return Promise.resolve(false);
        });
        
        await Promise.all(deletePromises);
        toast({
          title: "Success",
          description: `${selectedDocuments.length} document(s) deleted successfully`
        });
      } else if (documentToDelete) {
        // Delete single document
        const document = documents.find(d => d.id === documentToDelete);
        if (document) {
          const success = await PropertyService.deletePropertyFile(document.id, document.file_path, document.bucket_name);
          if (success) {
            toast({
              title: "Success",
              description: "Document deleted successfully"
            });
          }
        }
      }
      
      await fetchDocuments(); // Refresh the list
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
      // First, update all documents in this folder to remove folder_id
      const { error: updateError } = await supabase
        .from('property_files')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete);

      if (updateError) throw updateError;

      // Then delete the folder
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-brand-blue" />
                  {currentFolderName}
                </h1>
                <p className="text-sm text-gray-500">
                  {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} 
                  {selectedDocuments.length > 0 && ` • ${selectedDocuments.length} selected`}
                </p>
              </div>
            </div>

            <Button asChild size="sm">
              <a href="/account/documents/upload">
                <Plus className="h-4 w-4 mr-1" />
                Upload Documents
              </a>
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              {selectedDocuments.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllDocuments}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={unselectAllDocuments}
                  >
                    Unselect All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedDocuments.length})
                  </Button>
                </>
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
            </div>
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
              />
            </div>

            {/* Documents Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedFolder 
                      ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Documents'
                      : 'All Documents'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">Loading documents...</p>
                    </div>
                  ) : (
                    <MediaGalleryGrid
                      files={sortedDocuments}
                      viewMode={viewMode}
                      selectedFiles={selectedDocuments}
                      onFileSelect={toggleDocumentSelection}
                      onDeleteFile={handleDeleteDocument}
                      mediaType="document"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
      
      <Footer />
    </div>
  );
};

export default Documents;