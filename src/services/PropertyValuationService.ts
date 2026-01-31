
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
  async getPropertyValuationByAddress(addressInfo: PropertyAddress): Promise<PropertyValuation | null> {
    try {
      const { data, error } = await supabase.functions.invoke('mls-property-lookup', {
        body: addressInfo
      });

      if (error) {
        console.error('MLS lookup error:', error);
        return null;
      }

      if (!data) {
        return null;
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
      return null;
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user.id)
        .single();

      if (error || !property) {
        console.error('Error fetching property:', error);
        return null;
      }

      return {
        propertyId: property.id,
        estimatedValue: property.estimated_value || 0,
        appraisalValue: undefined,
        propertyTaxes: 0,
        lastUpdated: property.last_updated || property.created_at || new Date().toISOString(),
        source: 'User Input',
        confidence: property.estimated_value ? 'medium' : 'low',
        address: property.address,
      };
    } catch (error) {
      console.error('Error fetching property valuation:', error);
      return null;
    }
  }

  async getAllPropertyValuations(): Promise<PropertyValuation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[PropertyValuation] No authenticated user');
        return [];
      }

      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }

      if (!properties || properties.length === 0) {
        return [];
      }

      // Convert properties to PropertyValuation format
      return properties.map(property => ({
        propertyId: property.id,
        estimatedValue: property.estimated_value || 0,
        appraisalValue: undefined,
        propertyTaxes: 0,
        lastUpdated: property.last_updated || property.created_at || new Date().toISOString(),
        source: 'User Input',
        confidence: property.estimated_value ? 'medium' as const : 'low' as const,
        address: property.address,
      }));
    } catch (error) {
      console.error('Error fetching all property valuations:', error);
      return [];
    }
  }

  async refreshPropertyData(propertyId: string): Promise<PropertyValuation | null> {
    console.log(`Refreshing property data for property ${propertyId}`);
    
    const valuation = await this.getPropertyValuation(propertyId);
    
    if (valuation && valuation.address) {
      // Parse address for API call
      const addressParts = valuation.address.split(', ');
      const addressInfo: PropertyAddress = {
        address: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2]?.split(' ')[0] || '',
        zipCode: addressParts[2]?.split(' ')[1] || '',
      };

      const updated = await this.getPropertyValuationByAddress(addressInfo);
      
      if (updated) {
        toast({
          title: "Property Data Updated",
          description: "Latest valuation and tax information retrieved from MLS.",
        });
        
        return { ...updated, propertyId };
      }
    }
    
    toast({
      title: "Update Failed",
      description: "Unable to refresh property data at this time.",
      variant: "destructive",
    });
    
    return valuation;
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
