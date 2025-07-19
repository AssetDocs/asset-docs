import React, { useState } from 'react';
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

// Mock data for demonstration
const mockDocuments = [
  {
    id: 1,
    name: "Home Insurance Policy",
    filename: "home-insurance-2024.pdf",
    type: "PDF",
    url: "/placeholder.svg",
    uploadDate: "2024-06-15",
    size: "1.2 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: null,
    tags: ["insurance", "policy"]
  },
  {
    id: 2,
    name: "Property Deed",
    filename: "property-deed.pdf", 
    type: "PDF",
    url: "/placeholder.svg",
    uploadDate: "2024-06-14",
    size: "850 KB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["legal", "deed"]
  },
  {
    id: 3,
    name: "Appliance Warranty",
    filename: "refrigerator-warranty.pdf",
    type: "PDF",
    url: "/placeholder.svg",
    uploadDate: "2024-06-13",
    size: "520 KB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 2,
    tags: ["warranty", "appliance"]
  }
];

const mockFolders = [
  {
    id: 1,
    name: "Legal Documents",
    documentCount: 5,
    color: "blue"
  },
  {
    id: 2,
    name: "Warranties", 
    documentCount: 8,
    color: "green"
  },
  {
    id: 3,
    name: "Insurance",
    documentCount: 3,
    color: "red"
  }
];

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
type ViewMode = 'grid' | 'list';

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(mockDocuments);
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null);
    } else {
      navigate('/account');
    }
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name || 'Documents'
    : 'All Documents';

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
      case 'size-desc':
        return parseFloat(b.size) - parseFloat(a.size);
      case 'size-asc':
        return parseFloat(a.size) - parseFloat(b.size);
      default:
        return 0;
    }
  });

  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleMoveDocuments = (targetFolderId: number | null) => {
    setDocuments(prev => prev.map(document => 
      selectedDocuments.includes(document.id) 
        ? { ...document, folderId: targetFolderId }
        : document
    ));
    setSelectedDocuments([]);
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder = {
      id: folders.length + 1,
      name,
      documentCount: 0,
      color
    };
    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolder(false);
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

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowCreateFolder(true)}
                variant="outline"
                size="sm"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
              <Button asChild size="sm">
                <a href="/account/documents/upload">
                  <Plus className="h-4 w-4 mr-1" />
                  Upload Documents
                </a>
              </Button>
            </div>
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
            {/* Folders Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Folders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={selectedFolder === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(null)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      All Documents
                      <Badge variant="secondary" className="ml-auto">
                        {documents.length}
                      </Badge>
                    </Button>
                    
                    {folders.map((folder) => (
                      <Button
                        key={folder.id}
                        variant={selectedFolder === folder.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 bg-${folder.color}-500`} />
                        {folder.name}
                        <Badge variant="secondary" className="ml-auto">
                          {documents.filter(d => d.folderId === folder.id).length}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents Grid */}
            <div className="lg:col-span-3">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-red-600" />
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={() => toggleDocumentSelection(document.id)}
                            className="h-4 w-4"
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{document.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {document.type} • {document.size}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          {formatDate(document.uploadDate)}
                        </p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(document.id)}
                              onChange={() => toggleDocumentSelection(document.id)}
                              className="h-4 w-4 mr-3"
                            />
                            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{document.name}</h3>
                              <p className="text-sm text-gray-500">
                                {document.type} • {document.size} • {formatDate(document.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />
      
      <Footer />
    </div>
  );
};

export default Documents;