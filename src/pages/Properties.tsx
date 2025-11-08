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
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/services/PropertyService';

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;

  const handleViewPhotoGallery = () => {
    navigate('/account/photos');
  };

  const handlePropertySelect = (property: Property | null) => {
    setSelectedPropertyId(property?.id || null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          <EmailVerificationNotice />
          
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
                onPropertySelect={handlePropertySelect}
                selectedPropertyId={selectedPropertyId}
              />
            </div>

            {/* Property Details */}
            <div className="lg:col-span-2">
              {selectedProperty ? (
                <Card>
                  <PropertyHeader property={selectedProperty} />
                  <CardContent>
                    <PropertySummary propertyId={selectedProperty.id} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <Plus className="h-12 w-12 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
                        <p className="text-gray-600 mb-4">Get started by adding your first property to begin documenting your valuable assets.</p>
                        <Button onClick={() => navigate('/account/property-form')}>
                          Add Your First Property
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Properties;
