
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Package, Home, ToggleLeft, ToggleRight } from 'lucide-react';
import { PropertyValuation, propertyValuationService } from '@/services/PropertyValuationService';
import PropertyValuesSection from '@/components/PropertyValuesSection';

// Mock data for personal assets - in a real app, this would come from your database
const mockPersonalAssetData = [
  { category: 'Electronics', value: 12500, color: '#0EA5E9' },
  { category: 'Furniture', value: 8200, color: '#10B981' },
  { category: 'Jewelry & Watches', value: 15600, color: '#F59E0B' },
  { category: 'Appliances', value: 6800, color: '#EF4444' },
  { category: 'Art & Collectibles', value: 3200, color: '#8B5CF6' },
  { category: 'Tools & Equipment', value: 1950, color: '#F97316' }
];

const AssetValuesSection: React.FC = () => {
  const [propertyValuations, setPropertyValuations] = useState<PropertyValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIndividualProperties, setShowIndividualProperties] = useState(false);

  useEffect(() => {
    loadPropertyData();
  }, []);

  const loadPropertyData = async () => {
    try {
      const valuations = await propertyValuationService.getAllPropertyValuations();
      setPropertyValuations(valuations);
    } catch (error) {
      console.error('Error loading property valuations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total property value
  const totalPropertyValue = propertyValuationService.calculateTotalPropertyValue(propertyValuations);
  
  // Combine personal assets with real estate
  const combinedAssetData = [
    ...mockPersonalAssetData,
    { 
      category: 'Real Estate', 
      value: totalPropertyValue, 
      color: '#059669' 
    }
  ];

  const totalPersonalAssets = mockPersonalAssetData.reduce((sum, item) => sum + item.value, 0);
  const totalAllAssets = totalPersonalAssets + totalPropertyValue;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Property View Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
            if (isOnSampleDashboard) {
              alert('AssetDocs.net says\n\nDemo: This toggles between combined asset view and individual property details view.');
              return;
            }
            setShowIndividualProperties(!showIndividualProperties);
          }}
          className="flex items-center gap-2"
        >
          {showIndividualProperties ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {showIndividualProperties ? 'Show Combined View' : 'Show Individual Properties'}
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
                <p className="text-2xl font-bold">${totalAllAssets.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Real Estate Value</p>
                <p className="text-2xl font-bold">${totalPropertyValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Personal Assets</p>
                <p className="text-2xl font-bold">${totalPersonalAssets.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Real Estate %</p>
                <p className="text-2xl font-bold">{Math.round((totalPropertyValue / totalAllAssets) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Asset Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Asset Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of all asset values by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {combinedAssetData.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.category}</span>
                  {category.category === 'Real Estate' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {propertyValuations.length} properties
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold">${category.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {((category.value / totalAllAssets) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Values Detailed Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-brand-blue">
          {showIndividualProperties ? 'Individual Property Details' : 'Combined Property Summary'}
        </h3>
        {showIndividualProperties ? (
          <PropertyValuesSection />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Total Real Estate Portfolio</CardTitle>
              <CardDescription>
                Combined value of all properties in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-blue">
                    ${totalPropertyValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-blue">
                    {propertyValuations.length}
                  </div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-blue">
                    ${Math.round(totalPropertyValue / Math.max(propertyValuations.length, 1)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Avg Property Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssetValuesSection;
