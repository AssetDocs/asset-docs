import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropertyLookupRequest {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface MLSPropertyData {
  propertyId: string;
  estimatedValue: number;
  appraisalValue?: number;
  propertyTaxes: number;
  propertyType: string;
  yearBuilt: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { address, city, state, zipCode }: PropertyLookupRequest = await req.json()

    console.log(`Looking up property: ${address}, ${city}, ${state} ${zipCode}`)

    // Get API credentials from Supabase secrets
    const mlsApiKey = Deno.env.get('MLS_API_KEY')
    const mlsApiEndpoint = Deno.env.get('MLS_API_ENDPOINT') || 'https://api.mlsgrid.com'
    const zillowApiKey = Deno.env.get('ZILLOW_API_KEY')

    if (!mlsApiKey && !zillowApiKey) {
      throw new Error('No MLS or Zillow API keys configured')
    }

    let propertyData: MLSPropertyData | null = null

    // Try MLS API first if available
    if (mlsApiKey) {
      try {
        propertyData = await fetchFromMLSGrid(address, city, state, zipCode, mlsApiKey, mlsApiEndpoint)
      } catch (error) {
        console.error('MLS API failed:', error)
      }
    }

    // Fallback to Zillow API if MLS fails or unavailable
    if (!propertyData && zillowApiKey) {
      try {
        propertyData = await fetchFromZillow(address, city, state, zipCode, zillowApiKey)
      } catch (error) {
        console.error('Zillow API failed:', error)
      }
    }

    // If both APIs fail, return error
    if (!propertyData) {
      throw new Error('Unable to fetch property data from any available source')
    }

    return new Response(
      JSON.stringify(propertyData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in mls-property-lookup:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function fetchFromMLSGrid(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string,
  apiKey?: string,
  endpoint?: string
): Promise<MLSPropertyData | null> {
  if (!apiKey || !endpoint) return null

  const searchParams = new URLSearchParams({
    access_token: apiKey,
    $filter: `UnparsedAddress eq '${address}'`,
    $top: '1'
  })

  if (city) searchParams.append('City', city)
  if (state) searchParams.append('StateOrProvince', state)
  if (zipCode) searchParams.append('PostalCode', zipCode)

  const response = await fetch(`${endpoint}/v2/Property?${searchParams}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`MLS API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.value || data.value.length === 0) {
    return null
  }

  const property = data.value[0]

  return {
    propertyId: property.ListingKey || property.PropertyId || 'unknown',
    estimatedValue: property.ListPrice || property.ClosePrice || 0,
    appraisalValue: property.ClosePrice,
    propertyTaxes: property.TaxAnnualAmount || 0,
    propertyType: property.PropertyType || 'Unknown',
    yearBuilt: property.YearBuilt || new Date().getFullYear() - 30,
    squareFootage: property.LivingArea || property.BuildingAreaTotal || 0,
    bedrooms: property.BedroomsTotal || 0,
    bathrooms: property.BathroomsTotal || 0,
    lastSaleDate: property.CloseDate,
    lastSalePrice: property.ClosePrice,
    source: 'MLS Grid',
    confidence: 'high',
    lastUpdated: new Date().toISOString(),
  }
}

async function fetchFromZillow(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string,
  apiKey?: string
): Promise<MLSPropertyData | null> {
  if (!apiKey) return null

  // Note: Zillow's official API was discontinued, but this structure shows
  // how to integrate with Zillow-like services or third-party Zillow data providers
  const searchAddress = `${address}, ${city}, ${state} ${zipCode}`.trim()
  
  // This would integrate with a Zillow data provider service
  // For now, we'll simulate the structure
  console.log(`Would call Zillow API for: ${searchAddress}`)
  
  // In a real implementation, you'd call a Zillow data service here
  return null
}