
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyManagement from '@/components/PropertyManagement';
import PropertyHeader from '@/components/PropertyHeader';
import PropertySummary from '@/components/PropertySummary';

import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

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
    floorPlans: []
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
  const navigate = useNavigate();
  const [properties, setProperties] = useState(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);

  const handleViewPhotoGallery = () => {
    navigate('/account/photos');
  };

  const handlePropertyUpdate = (updatedProperties: typeof mockProperties) => {
    setProperties(updatedProperties);
  };

  const handleSelectedPropertyUpdate = (updatedProperty: typeof mockProperties[0]) => {
    const updatedProperties = properties.map(prop => 
      prop.id === updatedProperty.id ? updatedProperty : prop
    );
    setProperties(updatedProperties);
    setSelectedProperty(updatedProperty);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-blue mb-2">My Properties</h1>
              <p className="text-gray-600">View and manage all your property documentation</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleViewPhotoGallery}
                className="flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                View Photo Gallery
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Management */}
            <div className="lg:col-span-1">
              <PropertyManagement
                properties={properties}
                onPropertyUpdate={handlePropertyUpdate}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
              />
            </div>

            {/* Property Details */}
            <div className="lg:col-span-2">
              <Card>
                <PropertyHeader 
                  property={selectedProperty} 
                  onPropertyUpdate={handleSelectedPropertyUpdate}
                />
                <CardContent>
                  <PropertySummary property={selectedProperty} />
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
