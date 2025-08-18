import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Shield,
  Plus,
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
  Trash2,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';


// Mock data for demonstration
const mockInsurancePolicies = [
  {
    id: 1,
    name: "Home Insurance Policy 2024",
    policyNumber: "HI-2024-001234",
    provider: "State Farm",
    type: "Homeowners",
    status: "Active",
    premium: "$1,250/year",
    coverage: "$500,000",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: null,
    tags: ["homeowners", "active"]
  },
  {
    id: 2,
    name: "Flood Insurance Policy",
    policyNumber: "FL-2024-005678", 
    provider: "FEMA",
    type: "Flood",
    status: "Active",
    premium: "$450/year",
    coverage: "$250,000",
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["flood", "active"]
  },
  {
    id: 3,
    name: "Umbrella Policy",
    policyNumber: "UM-2024-009876",
    provider: "Allstate",
    type: "Umbrella",
    status: "Active", 
    premium: "$300/year",
    coverage: "$1,000,000",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 2,
    tags: ["umbrella", "liability"]
  }
];


type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'premium-desc' | 'premium-asc';
type ViewMode = 'grid' | 'list';

const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState(mockInsurancePolicies);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<number | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const handleBack = () => {
    navigate('/account');
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'date-asc':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'premium-desc':
        return parseFloat(b.premium.replace(/[^0-9.]/g, '')) - parseFloat(a.premium.replace(/[^0-9.]/g, ''));
      case 'premium-asc':
        return parseFloat(a.premium.replace(/[^0-9.]/g, '')) - parseFloat(b.premium.replace(/[^0-9.]/g, ''));
      default:
        return 0;
    }
  });

  const togglePolicySelection = (policyId: number) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const selectAll = () => {
    setSelectedPolicies(sortedPolicies.map(policy => policy.id));
  };

  const unselectAll = () => {
    setSelectedPolicies([]);
  };

  const handleDeletePolicy = (policyId: number) => {
    setPolicyToDelete(policyId);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    setBulkDeleteMode(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (bulkDeleteMode) {
      setPolicies(prev => prev.filter(policy => !selectedPolicies.includes(policy.id)));
      setSelectedPolicies([]);
    } else if (policyToDelete) {
      setPolicies(prev => prev.filter(policy => policy.id !== policyToDelete));
      setSelectedPolicies(prev => prev.filter(id => id !== policyToDelete));
    }
    setShowDeleteDialog(false);
    setPolicyToDelete(null);
    setBulkDeleteMode(false);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPolicyToDelete(null);
    setBulkDeleteMode(false);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
                  <Shield className="h-6 w-6 mr-2 text-brand-blue" />
                  Insurance Policies
                </h1>
                <p className="text-sm text-gray-500">
                  {sortedPolicies.length} polic{sortedPolicies.length !== 1 ? 'ies' : 'y'} 
                  {selectedPolicies.length > 0 && ` • ${selectedPolicies.length} selected`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={selectedPolicies.length === sortedPolicies.length ? unselectAll : selectAll} 
                variant="outline" 
                size="sm"
              >
                {selectedPolicies.length === sortedPolicies.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Unselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              
              {selectedPolicies.length > 0 && (
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedPolicies.length})
                </Button>
              )}

              <Button asChild size="sm">
                <a href="/account/insurance/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Policy
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
                placeholder="Search policies..."
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

          <div className="w-full">
            {/* Policies Grid */}
            <div className="w-full">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedPolicies.map((policy) => (
                    <Card key={policy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{policy.name}</h3>
                              <p className="text-sm text-gray-500">{policy.provider}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedPolicies.includes(policy.id)}
                            onChange={() => togglePolicySelection(policy.id)}
                            className="h-4 w-4"
                          />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Policy #:</span>
                            <span className="text-sm font-medium">{policy.policyNumber}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm font-medium">{policy.type}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Coverage:</span>
                            <span className="text-sm font-medium">{policy.coverage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Premium:</span>
                            <span className="text-sm font-medium">{policy.premium}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge className={getStatusColor(policy.status)}>
                              {policy.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedPolicies.map((policy) => (
                    <Card key={policy.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedPolicies.includes(policy.id)}
                              onChange={() => togglePolicySelection(policy.id)}
                              className="h-4 w-4 mr-3"
                            />
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                              <Shield className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{policy.name}</h3>
                              <p className="text-sm text-gray-500">
                                {policy.provider} • {policy.policyNumber} • {policy.premium}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(policy.status)}>
                              {policy.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeletePolicy(policy.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      <Footer />
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? "Delete Selected Policies" : "Delete Policy"}
        itemCount={bulkDeleteMode ? selectedPolicies.length : 1}
      />
    </div>
  );
};

export default Insurance;