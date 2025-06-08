
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign, TrendingUp, Package, Home } from 'lucide-react';
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

const chartConfig = {
  Electronics: { label: 'Electronics', color: '#0EA5E9' },
  Furniture: { label: 'Furniture', color: '#10B981' },
  'Jewelry & Watches': { label: 'Jewelry & Watches', color: '#F59E0B' },
  Appliances: { label: 'Appliances', color: '#EF4444' },
  'Art & Collectibles': { label: 'Art & Collectibles', color: '#8B5CF6' },
  'Tools & Equipment': { label: 'Tools & Equipment', color: '#F97316' },
  'Real Estate': { label: 'Real Estate', color: '#059669' }
};

const AssetValuesSection: React.FC = () => {
  const [propertyValuations, setPropertyValuations] = useState<PropertyValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const totalItems = 147; // This would come from your actual item count + properties

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Value Distribution</CardTitle>
            <CardDescription>
              Complete breakdown including real estate and personal assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={combinedAssetData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ category, value }) => `${category}: $${value.toLocaleString()}`}
                  >
                    {combinedAssetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Enhanced Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Values Comparison</CardTitle>
            <CardDescription>
              Compare all asset categories including real estate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedAssetData}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Bar dataKey="value" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Category Breakdown Table */}
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
        <h3 className="text-xl font-semibold mb-4 text-brand-blue">Property Details</h3>
        <PropertyValuesSection />
      </div>
    </div>
  );
};

export default AssetValuesSection;
