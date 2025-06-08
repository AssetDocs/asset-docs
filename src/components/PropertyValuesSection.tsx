
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, RefreshCw, TrendingUp, Receipt, Calendar } from 'lucide-react';
import { PropertyValuation, propertyValuationService } from '@/services/PropertyValuationService';
import { useToast } from '@/hooks/use-toast';

const PropertyValuesSection: React.FC = () => {
  const [propertyValuations, setPropertyValuations] = useState<PropertyValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPropertyValuations();
  }, []);

  const loadPropertyValuations = async () => {
    try {
      setIsLoading(true);
      const valuations = await propertyValuationService.getAllPropertyValuations();
      setPropertyValuations(valuations);
    } catch (error) {
      console.error('Error loading property valuations:', error);
      toast({
        title: "Error",
        description: "Failed to load property valuations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all properties
      const refreshPromises = propertyValuations.map(valuation => 
        propertyValuationService.refreshPropertyData(valuation.propertyId)
      );
      
      await Promise.all(refreshPromises);
      await loadPropertyValuations();
      
      toast({
        title: "Data Refreshed",
        description: "All property valuations have been updated with the latest data.",
      });
    } catch (error) {
      console.error('Error refreshing property data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh property data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalPropertyValue = propertyValuationService.calculateTotalPropertyValue(propertyValuations);
  const totalPropertyTaxes = propertyValuationService.calculateTotalPropertyTaxes(propertyValuations);

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Property Value</p>
                <p className="text-2xl font-bold">${totalPropertyValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Annual Property Taxes</p>
                <p className="text-2xl font-bold">${totalPropertyTaxes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-brand-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties Tracked</p>
                <p className="text-2xl font-bold">{propertyValuations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Property Valuations & Taxes</CardTitle>
              <CardDescription>
                Current market values, appraisals, and property tax information
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefreshAll} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property ID</TableHead>
                <TableHead>Market Value</TableHead>
                <TableHead>Appraisal Value</TableHead>
                <TableHead>Annual Taxes</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyValuations.map((valuation) => (
                <TableRow key={valuation.propertyId}>
                  <TableCell className="font-medium">
                    Property {valuation.propertyId}
                  </TableCell>
                  <TableCell>
                    ${valuation.estimatedValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {valuation.appraisalValue ? (
                      <span className="font-medium">
                        ${valuation.appraisalValue.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    ${valuation.propertyTaxes.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {valuation.source}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getConfidenceBadgeVariant(valuation.confidence)}>
                      {valuation.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(valuation.lastUpdated).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data Sources Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources & Methodology</CardTitle>
          <CardDescription>
            Information about how property values and taxes are calculated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Market Value Sources:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• MLS (Multiple Listing Service) data</li>
                <li>• Zillow Zestimate API</li>
                <li>• Realtor.com market analysis</li>
                <li>• Recent comparable sales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tax Information Sources:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• County tax assessor records</li>
                <li>• Municipal tax databases</li>
                <li>• Historical tax payment records</li>
                <li>• Current millage rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyValuesSection;
