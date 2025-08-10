import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Video,
  FileText,
  FileImage,
  Shield,
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
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import PropertyVideos from '@/components/PropertyVideos';
import PropertyDocuments from '@/components/PropertyDocuments';

import CreateFolderModal from '@/components/CreateFolderModal';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

// Mock data for demonstration
const mockVideos = [
  {
    id: 1,
    name: "Property Walkthrough",
    duration: "5:23",
    uploadDate: "2024-06-15"
  },
  {
    id: 2,
    name: "Kitchen Tour",
    duration: "2:45",
    uploadDate: "2024-06-12"
  },
  {
    id: 3,
    name: "Exterior Overview",
    duration: "3:18",
    uploadDate: "2024-06-10"
  }
];

const mockDocuments = [
  {
    id: 1,
    name: "Property Deed",
    type: "PDF",
    uploadDate: "2024-06-15"
  },
  {
    id: 2,
    name: "Insurance Policy",
    type: "PDF",
    uploadDate: "2024-06-12"
  },
  {
    id: 3,
    name: "Property Tax Records",
    type: "PDF",
    uploadDate: "2024-06-10"
  },
  {
    id: 4,
    name: "Maintenance Records",
    type: "Excel",
    uploadDate: "2024-06-08"
  }
];


const mockInsuranceInfo = [
  {
    id: 1,
    name: "Homeowner's Insurance Policy",
    type: "PDF",
    uploadDate: "2024-06-15",
    policyNumber: "HO-123456789",
    provider: "State Farm",
    expiryDate: "2025-06-15"
  },
  {
    id: 2,
    name: "Flood Insurance Certificate",
    type: "PDF",
    uploadDate: "2024-06-12",
    policyNumber: "FL-987654321",
    provider: "FEMA",
    expiryDate: "2025-06-12"
  },
  {
    id: 3,
    name: "Property Appraisal Report",
    type: "PDF",
    uploadDate: "2024-06-10",
    policyNumber: "AP-456123789",
    provider: "ABC Appraisals",
    expiryDate: "2025-06-10"
  }
];

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';

const MediaManagement: React.FC = () => {
  const navigate = useNavigate();
  const [videos] = useState(mockVideos);
  const [documents] = useState(mockDocuments);
  
  const [insuranceInfo] = useState(mockInsuranceInfo);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');

  const handleBack = () => {
    navigate('/account');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const InsuranceInfoSection = () => (
    <div className="mt-6 space-y-4">
      {insuranceInfo.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.provider} • Policy: {item.policyNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {formatDate(item.uploadDate)} • Expires {formatDate(item.expiryDate)}
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
  );

  const getTabCounts = () => ({
    videos: videos.length,
    documents: documents.length,
    insurance: insuranceInfo.length
  });

  const tabCounts = getTabCounts();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
                  <p className="text-gray-600 mt-1">
                    Manage your videos, documents, and insurance information
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortBy === 'date-desc' && <><Calendar className="h-4 w-4 mr-1" /><SortDesc className="h-4 w-4" /></>}
                      {sortBy === 'date-asc' && <><Calendar className="h-4 w-4 mr-1" /><SortAsc className="h-4 w-4" /></>}
                      {sortBy === 'name-asc' && <><Type className="h-4 w-4 mr-1" /><SortAsc className="h-4 w-4" /></>}
                      {sortBy === 'name-desc' && <><Type className="h-4 w-4 mr-1" /><SortDesc className="h-4 w-4" /></>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Date (Newest)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Date (Oldest)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                      <Type className="h-4 w-4 mr-2" />
                      Name (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                      <Type className="h-4 w-4 mr-2" />
                      Name (Z-A)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex border rounded-lg">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={() => setShowCreateFolder(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="videos" className="flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    Videos ({tabCounts.videos})
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Documents ({tabCounts.documents})
                  </TabsTrigger>
                  <TabsTrigger value="insurance" className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Insurance ({tabCounts.insurance})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="videos">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Video Documentation</h3>
                    <p className="text-muted-foreground text-sm">
                      Manage your property video walkthroughs and documentation
                    </p>
                  </div>
                  <PropertyVideos videos={videos} />
                </TabsContent>

                <TabsContent value="documents">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Document Storage</h3>
                    <p className="text-muted-foreground text-sm">
                      Store and organize important property documents and records
                    </p>
                  </div>
                  <PropertyDocuments documents={documents} />
                </TabsContent>


                <TabsContent value="insurance">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Insurance Information</h3>
                    <p className="text-muted-foreground text-sm">
                      Manage insurance policies, certificates, and related documentation
                    </p>
                  </div>
                  <InsuranceInfoSection />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={(name, description, color) => {
          // Handle folder creation for current tab
          setShowCreateFolder(false);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default MediaManagement;