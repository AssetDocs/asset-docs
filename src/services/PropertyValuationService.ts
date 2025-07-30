
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyValuation {
  propertyId: string;
  estimatedValue: number;
  appraisalValue?: number;
  propertyTaxes: number;
  lastUpdated: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  address?: string;
  propertyType?: string;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PropertyTaxInfo {
  annualTax: number;
  taxRate: number;
  assessedValue: number;
  millageRate?: number;
}

interface PropertyAddress {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

class PropertyValuationService {
  // Fallback mock data for demo purposes
  private mockData: PropertyValuation[] = [
    {
      propertyId: '1',
      estimatedValue: 485000,
      appraisalValue: 492000,
      propertyTaxes: 8200,
      lastUpdated: '2024-05-15',
      source: 'Zillow/MLS Composite',
      confidence: 'high',
      address: '123 Main St, San Francisco, CA 94102'
    },
    {
      propertyId: '2',
      estimatedValue: 325000,
      appraisalValue: 318000,
      propertyTaxes: 5400,
      lastUpdated: '2024-05-10',
      source: 'County Assessment',
      confidence: 'medium',
      address: '456 Oak Ave, Austin, TX 78701'
    }
  ];

  async getPropertyValuationByAddress(addressInfo: PropertyAddress): Promise<PropertyValuation | null> {
    try {
      const { data, error } = await supabase.functions.invoke('mls-property-lookup', {
        body: addressInfo
      });

      if (error) {
        console.error('MLS lookup error:', error);
        return this.getFallbackData(addressInfo);
      }

      if (!data) {
        return this.getFallbackData(addressInfo);
      }

      // Fetch tax data separately
      const taxData = await this.getPropertyTaxData(addressInfo);

      return {
        propertyId: data.propertyId,
        estimatedValue: data.estimatedValue,
        appraisalValue: data.appraisalValue,
        propertyTaxes: taxData?.annualTax || data.propertyTaxes || 0,
        lastUpdated: data.lastUpdated,
        source: data.source,
        confidence: data.confidence,
        address: `${addressInfo.address}, ${addressInfo.city}, ${addressInfo.state} ${addressInfo.zipCode}`,
        propertyType: data.propertyType,
        yearBuilt: data.yearBuilt,
        squareFootage: data.squareFootage,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
      };
    } catch (error) {
      console.error('Error fetching property valuation:', error);
      return this.getFallbackData(addressInfo);
    }
  }

  async getPropertyTaxData(addressInfo: PropertyAddress): Promise<PropertyTaxInfo | null> {
    try {
      const { data, error } = await supabase.functions.invoke('property-tax-lookup', {
        body: addressInfo
      });

      if (error || !data) {
        console.error('Tax lookup error:', error);
        return null;
      }

      return {
        annualTax: data.annualTax,
        taxRate: data.taxRate,
        assessedValue: data.assessedValue,
        millageRate: data.millageRate,
      };
    } catch (error) {
      console.error('Error fetching tax data:', error);
      return null;
    }
  }

  async getPropertyValuation(propertyId: string): Promise<PropertyValuation | null> {
    // For backward compatibility, return mock data if propertyId matches
    const mockValuation = this.mockData.find(v => v.propertyId === propertyId);
    if (mockValuation) {
      return mockValuation;
    }
    
    // In a real implementation, you'd look up the property by ID from a database
    // and then call the MLS API with the stored address
    return null;
  }

  async getAllPropertyValuations(): Promise<PropertyValuation[]> {
    // Return mock data for now - in production this would fetch from database
    // where properties are stored with their addresses, then call MLS APIs
    return this.mockData;
  }

  async refreshPropertyData(propertyId: string): Promise<PropertyValuation | null> {
    console.log(`Refreshing property data for property ${propertyId}`);
    
    // Find the mock property to get its address
    const mockProperty = this.mockData.find(v => v.propertyId === propertyId);
    if (mockProperty && mockProperty.address) {
      // Parse address for API call
      const addressParts = mockProperty.address.split(', ');
      const addressInfo: PropertyAddress = {
        address: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2]?.split(' ')[0] || '',
        zipCode: addressParts[2]?.split(' ')[1] || '',
      };

      const updated = await this.getPropertyValuationByAddress(addressInfo);
      
      if (updated) {
        // Update mock data array
        const index = this.mockData.findIndex(v => v.propertyId === propertyId);
        if (index !== -1) {
          this.mockData[index] = { ...updated, propertyId };
        }
        
        toast({
          title: "Property Data Updated",
          description: "Latest valuation and tax information retrieved from MLS.",
        });
        
        return updated;
      }
    }
    
    toast({
      title: "Update Failed",
      description: "Unable to refresh property data at this time.",
      variant: "destructive",
    });
    
    return this.getPropertyValuation(propertyId);
  }

  private getFallbackData(addressInfo: PropertyAddress): PropertyValuation | null {
    // Return mock data as fallback
    const fallback = this.mockData[0];
    return {
      ...fallback,
      address: `${addressInfo.address}, ${addressInfo.city}, ${addressInfo.state} ${addressInfo.zipCode}`,
      source: 'Demo Data (API Unavailable)',
      confidence: 'low',
      lastUpdated: new Date().toISOString(),
    };
  }

  calculateTotalPropertyValue(valuations: PropertyValuation[]): number {
    return valuations.reduce((total, valuation) => {
      return total + (valuation.appraisalValue || valuation.estimatedValue);
    }, 0);
  }

  calculateTotalPropertyTaxes(valuations: PropertyValuation[]): number {
    return valuations.reduce((total, valuation) => total + valuation.propertyTaxes, 0);
  }
}

export const propertyValuationService = new PropertyValuationService();
