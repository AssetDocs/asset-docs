import { supabase } from '@/integrations/supabase/client';

export interface PropertyDetails {
  propertyType?: string;
  yearBuilt?: number;
  squareFootage?: number;
  estimatedValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  confidence?: 'high' | 'medium' | 'low';
  source?: string;
}

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

class RealEstateDataService {
  private static instance: RealEstateDataService;
  private apiKey: string = '';

  static getInstance(): RealEstateDataService {
    if (!RealEstateDataService.instance) {
      RealEstateDataService.instance = new RealEstateDataService();
    }
    return RealEstateDataService.instance;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  extractAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
    const components: AddressComponents = {};
    
    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
          components.street_number = component.long_name;
        } else if (types.includes('route')) {
          components.route = component.long_name;
        } else if (types.includes('locality')) {
          components.locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          components.administrative_area_level_1 = component.short_name;
        } else if (types.includes('postal_code')) {
          components.postal_code = component.long_name;
        } else if (types.includes('country')) {
          components.country = component.short_name;
        }
      });
    }
    
    return components;
  }

  async fetchPropertyDetails(address: string, addressComponents: AddressComponents): Promise<PropertyDetails> {
    try {
      // First try to get real data from MLS API
      const realData = await this.fetchFromMLSAPI(address, addressComponents);
      if (realData && realData.estimatedValue) {
        return realData;
      }
      
      // Fallback to mock data if API fails
      console.log('MLS API unavailable, using generated property data');
      const mockData = this.generateMockPropertyData(addressComponents);
      
      return {
        ...mockData,
        confidence: 'low',
        source: 'Generated Data (API Unavailable)'
      };
    } catch (error) {
      console.error('Error fetching property details:', error);
      return this.generateMockPropertyData(addressComponents);
    }
  }

  private async fetchFromMLSAPI(address: string, addressComponents: AddressComponents): Promise<PropertyDetails | null> {
    try {
      const { data, error } = await supabase.functions.invoke('mls-property-lookup', {
        body: {
          address,
          city: addressComponents.locality,
          state: addressComponents.administrative_area_level_1,
          zipCode: addressComponents.postal_code,
        }
      });

      if (error || !data) {
        console.error('MLS API error:', error);
        return null;
      }

      return {
        propertyType: data.propertyType,
        yearBuilt: data.yearBuilt,
        squareFootage: data.squareFootage,
        estimatedValue: data.estimatedValue,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        confidence: data.confidence,
        source: data.source
      };
    } catch (error) {
      console.error('Error calling MLS API:', error);
      return null;
    }
  }

  private generateMockPropertyData(components: AddressComponents): PropertyDetails {
    const city = components.locality || '';
    const state = components.administrative_area_level_1 || '';
    const zipCode = components.postal_code || '';
    
    // Generate realistic data based on location and current year
    const currentYear = new Date().getFullYear();
    const yearBuilt = Math.floor(Math.random() * (currentYear - 1950) + 1950);
    
    // Base property values on rough real-world data
    let baseValue = 350000; // Default base value
    
    // Adjust base value by state (simplified)
    const highCostStates = ['CA', 'NY', 'WA', 'MA', 'HI'];
    const mediumCostStates = ['FL', 'TX', 'NV', 'CO', 'OR'];
    
    if (highCostStates.includes(state)) {
      baseValue = 750000;
    } else if (mediumCostStates.includes(state)) {
      baseValue = 450000;
    }
    
    // Add some randomness
    const variation = 0.3; // 30% variation
    const multiplier = 1 + (Math.random() * variation * 2 - variation);
    const estimatedValue = Math.round(baseValue * multiplier);
    
    // Generate square footage (typically 1000-4000 sq ft)
    const squareFootage = Math.floor(Math.random() * 3000 + 1000);
    
    // Determine property type based on area characteristics
    const propertyTypes = ['Single Family Home', 'Condo', 'Townhouse'];
    const weights = city.toLowerCase().includes('downtown') || city.toLowerCase().includes('center') 
      ? [0.3, 0.5, 0.2] : [0.7, 0.15, 0.15];
    
    const random = Math.random();
    let propertyType = 'Single Family Home';
    let cumulative = 0;
    for (let i = 0; i < propertyTypes.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        propertyType = propertyTypes[i];
        break;
      }
    }
    
    return {
      propertyType,
      yearBuilt,
      squareFootage,
      estimatedValue,
      bedrooms: Math.floor(Math.random() * 4 + 2), // 2-5 bedrooms
      bathrooms: Math.floor(Math.random() * 3 + 1), // 1-3 bathrooms
    };
  }

  // Method to integrate with real estate APIs (placeholder)
  async fetchFromRealEstateAPI(address: string): Promise<PropertyDetails> {
    // This would integrate with real APIs like:
    // - Attom Data API: Property details, valuations
    // - Rentspree API: Rental and property data
    // - Local MLS APIs: Market data
    
    console.log('Would fetch from real estate API for:', address);
    return {};
  }
}

export default RealEstateDataService;