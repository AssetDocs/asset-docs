
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Camera, 
  Video, 
  FileText, 
  FileImage, 
  Plus, 
  Edit,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Download
} from 'lucide-react';

// Mock data for demonstration
const mockProperties = [
  {
    id: 1,
    name: "Main Residence",
    address: "123 Oak Street, Springfield, IL 62701",
    type: "Single Family Home",
    squareFootage: 2500,
    yearBuilt: 1995,
    estimatedValue: 385000,
    lastUpdated: "2024-06-15",
    photos: [
      { id: 1, name: "Living Room", url: "/placeholder.svg", uploadDate: "2024-06-10" },
      { id: 2, name: "Kitchen", url: "/placeholder.svg", uploadDate: "2024-06-10" },
      { id: 3, name: "Master Bedroom", url: "/placeholder.svg", uploadDate: "2024-06-12" }
    ],
    videos: [
      { id: 1, name: "Property Walkthrough", duration: "5:30", uploadDate: "2024-06-08" },
      { id: 2, name: "Basement Tour", duration: "2:15", uploadDate: "2024-06-09" }
    ],
    documents: [
      { id: 1, name: "Property Deed", type: "PDF", uploadDate: "2024-05-20" },
      { id: 2, name: "Home Inspection Report", type: "PDF", uploadDate: "2024-05-25" },
      { id: 3, name: "Insurance Policy", type: "PDF", uploadDate: "2024-06-01" }
    ],
    floorPlans: [
      { id: 1, name: "First Floor Plan", uploadDate: "2024-06-05" },
      { id: 2, name: "Second Floor Plan", uploadDate: "2024-06-05" }
    ]
  },
  {
    id: 2,
    name: "Vacation Cabin",
    address: "456 Pine Trail, Lake Tahoe, CA 96150",
    type: "Cabin",
    squareFootage: 1200,
    yearBuilt: 1988,
    estimatedValue: 275000,
    lastUpdated: "2024-06-10",
    photos: [
      { id: 4, name: "Exterior View", url: "/placeholder.svg", uploadDate: "2024-06-01" },
      { id: 5, name: "Lake View", url: "/placeholder.svg", uploadDate: "2024-06-01" }
    ],
    videos: [
      { id: 3, name: "Cabin Overview", duration: "3:45", uploadDate: "2024-05-28" }
    ],
    documents: [
      { id: 4, name: "Property Tax Records", type: "PDF", uploadDate: "2024-05-15" }
    ],
    floorPlans: [
      { id: 3, name: "Cabin Layout", uploadDate: "2024-05-30" }
    ]
  }
];

const Properties: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-blue mb-2">My Properties</h1>
              <p className="text-gray-600">View and manage all your property documentation</p>
            </div>
            <Button className="bg-brand-blue hover:bg-brand-lightBlue">
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Properties ({mockProperties.length})</h2>
              {mockProperties.map((property) => (
                <Card 
                  key={property.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProperty.id === property.id ? 'ring-2 ring-brand-blue' : ''
                  }`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Home className="h-5 w-5 mr-2 text-brand-blue" />
                      {property.name}
                    </CardTitle>
                    <CardDescription className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      {property.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{property.type}</span>
                      <Badge variant="secondary">{formatCurrency(property.estimatedValue)}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Property Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-brand-blue">{selectedProperty.name}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedProperty.address}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Property
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Property Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-blue">{selectedProperty.squareFootage.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Sq Ft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-blue">{selectedProperty.yearBuilt}</div>
                      <div className="text-sm text-gray-600">Year Built</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-blue">{formatCurrency(selectedProperty.estimatedValue)}</div>
                      <div className="text-sm text-gray-600">Est. Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-blue">{formatDate(selectedProperty.lastUpdated)}</div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                    </div>
                  </div>

                  {/* Content Tabs */}
                  <Tabs defaultValue="photos" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="photos" className="flex items-center">
                        <Camera className="h-4 w-4 mr-1" />
                        Photos ({selectedProperty.photos.length})
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        Videos ({selectedProperty.videos.length})
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Documents ({selectedProperty.documents.length})
                      </TabsTrigger>
                      <TabsTrigger value="floorplans" className="flex items-center">
                        <FileImage className="h-4 w-4 mr-1" />
                        Floor Plans ({selectedProperty.floorPlans.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="photos" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedProperty.photos.map((photo) => (
                          <Card key={photo.id} className="overflow-hidden">
                            <div className="aspect-video bg-gray-200 flex items-center justify-center">
                              <Camera className="h-8 w-8 text-gray-400" />
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm">{photo.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded {formatDate(photo.uploadDate)}
                              </p>
                              <div className="flex gap-2 mt-2">
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
                    </TabsContent>

                    <TabsContent value="videos" className="mt-6">
                      <div className="space-y-4">
                        {selectedProperty.videos.map((video) => (
                          <Card key={video.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                    <Video className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{video.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      Duration: {video.duration} • Uploaded {formatDate(video.uploadDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Watch
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
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                      <div className="space-y-4">
                        {selectedProperty.documents.map((document) => (
                          <Card key={document.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{document.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {document.type} • Uploaded {formatDate(document.uploadDate)}
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
                    </TabsContent>

                    <TabsContent value="floorplans" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProperty.floorPlans.map((floorPlan) => (
                          <Card key={floorPlan.id} className="overflow-hidden">
                            <div className="aspect-video bg-gray-200 flex items-center justify-center">
                              <FileImage className="h-8 w-8 text-gray-400" />
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm">{floorPlan.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded {formatDate(floorPlan.uploadDate)}
                              </p>
                              <div className="flex gap-2 mt-2">
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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Properties;
