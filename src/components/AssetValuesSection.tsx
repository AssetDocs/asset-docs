
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign, TrendingUp, Package } from 'lucide-react';

// Mock data - in a real app, this would come from your database
const mockAssetData = [
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
  'Tools & Equipment': { label: 'Tools & Equipment', color: '#F97316' }
};

const AssetValuesSection: React.FC = () => {
  const totalValue = mockAssetData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = 147; // This would come from your actual item count

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Item Value</p>
                <p className="text-2xl font-bold">${Math.round(totalValue / totalItems).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Value by Category</CardTitle>
            <CardDescription>
              Distribution of asset values across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAssetData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ category, value }) => `${category}: $${value.toLocaleString()}`}
                  >
                    {mockAssetData.map((entry, index) => (
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

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Values Comparison</CardTitle>
            <CardDescription>
              Compare asset values across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAssetData}>
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

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Breakdown</CardTitle>
          <CardDescription>
            Complete breakdown of asset values by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAssetData.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">${category.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {((category.value / totalValue) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetValuesSection;
