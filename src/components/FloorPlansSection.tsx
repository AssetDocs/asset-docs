
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PropertySelector from '@/components/PropertySelector';
import { Building, Download, Eye, Plus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Mock floor plan data - in production, this would come from CubiCasa API
const mockFloorPlans = {
  '1': [
    {
      id: 'fp1',
      name: '1st Floor Plan',
      url: '/lovable-uploads/c2744c0b-391a-44b1-9133-004db899c866.png',
      type: 'Main Floor',
      squareFootage: 1200,
      rooms: 6,
      createdDate: '2024-01-15'
    },
    {
      id: 'fp2',
      name: '2nd Floor Plan',
      url: '/lovable-uploads/c2744c0b-391a-44b1-9133-004db899c866.png',
      type: 'Upper Floor',
      squareFootage: 900,
      rooms: 4,
      createdDate: '2024-01-15'
    }
  ],
  '2': [
    {
      id: 'fp3',
      name: 'Vacation Home Floor Plan',
      url: '/lovable-uploads/c2744c0b-391a-44b1-9133-004db899c866.png',
      type: 'Single Level',
      squareFootage: 1800,
      rooms: 8,
      createdDate: '2024-02-10'
    }
  ],
  '3': [
    {
      id: 'fp4',
      name: 'Rental Property Floor Plan',
      url: '/lovable-uploads/c2744c0b-391a-44b1-9133-004db899c866.png',
      type: 'Single Level',
      squareFootage: 950,
      rooms: 4,
      createdDate: '2024-03-05'
    }
  ]
};

const FloorPlansSection: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string | null>(null);
  const { subscriptionTier } = useSubscription();
  
  const showCubiCasa = subscriptionTier === 'basic';

  const currentFloorPlans = selectedProperty ? mockFloorPlans[selectedProperty as keyof typeof mockFloorPlans] || [] : [];

  const handleCreateFloorPlan = () => {
    console.log('Create Floor Plan clicked - will connect to CubiCasa');
    // TODO: Integrate with CubiCasa software
  };

  const handleViewFloorPlan = (floorPlanId: string) => {
    setSelectedFloorPlan(floorPlanId);
  };

  const selectedFloorPlanData = currentFloorPlans.find(fp => fp.id === selectedFloorPlan);

  return (
    <div className="space-y-6">
      {/* Header with Property Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue">Floor Plans</h2>
          <p className="text-gray-600">View and manage {showCubiCasa ? 'floor plans from CubiCasa' : 'your uploaded floor plans'}</p>
        </div>
        <div className="flex gap-2">
          {showCubiCasa && (
            <Button 
              onClick={handleCreateFloorPlan}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              <Building className="h-4 w-4 mr-2" />
              Create with CubiCasa
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/account/floorplans/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Floor Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to view its floor plans</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertySelector
            value={selectedProperty}
            onChange={setSelectedProperty}
            placeholder="Select a property to view floor plans"
          />
        </CardContent>
      </Card>

      {/* Floor Plans Display */}
      {selectedProperty && (
        <>
          {currentFloorPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFloorPlans.map((floorPlan) => (
                <Card key={floorPlan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{floorPlan.name}</CardTitle>
                    <CardDescription>{floorPlan.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={floorPlan.url} 
                        alt={floorPlan.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Square Footage:</span>
                        <span className="font-medium">{floorPlan.squareFootage.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rooms:</span>
                        <span className="font-medium">{floorPlan.rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{new Date(floorPlan.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleViewFloorPlan(floorPlan.id)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Floor Plans Found</h3>
                <p className="text-gray-600 mb-4">
                  This property doesn't have any floor plans yet. {showCubiCasa ? 'Create one with CubiCasa or upload' : 'Upload'} an existing floor plan.
                </p>
                <div className="flex justify-center gap-2">
                  {showCubiCasa && (
                    <Button onClick={handleCreateFloorPlan} className="bg-brand-orange hover:bg-brand-orange/90">
                      <Building className="h-4 w-4 mr-2" />
                      Create with CubiCasa
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link to="/account/floorplans/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Floor Plan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Detailed Floor Plan View Modal/Overlay */}
      {selectedFloorPlan && selectedFloorPlanData && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedFloorPlanData.name}</CardTitle>
                <CardDescription>Detailed view</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedFloorPlan(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={selectedFloorPlanData.url} 
                alt={selectedFloorPlanData.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{selectedFloorPlanData.type}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Square Footage</p>
                <p className="font-medium">{selectedFloorPlanData.squareFootage.toLocaleString()} sq ft</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Rooms</p>
                <p className="font-medium">{selectedFloorPlanData.rooms}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(selectedFloorPlanData.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CubiCasa Integration Info */}
      {showCubiCasa && (
        <Card className="bg-blue-50 border-brand-blue/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-brand-blue mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-brand-blue mb-1">CubiCasa Integration</p>
                <p className="text-sm text-gray-700">
                  Create professional floor plans instantly with CubiCasa's AI-powered technology. 
                  Simply take photos with your smartphone and get accurate floor plans in minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloorPlansSection;
