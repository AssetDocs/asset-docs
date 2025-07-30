import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaxLookupRequest {
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyId?: string;
}

interface PropertyTaxData {
  annualTax: number;
  taxRate: number;
  assessedValue: number;
  millageRate?: number;
  taxYear: number;
  exemptions?: string[];
  source: string;
  lastUpdated: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, city, state, zipCode, propertyId }: TaxLookupRequest = await req.json()

    console.log(`Looking up property taxes for: ${address}, ${city}, ${state} ${zipCode}`)

    // Get API credentials for various county/state tax assessor APIs
    const attomApiKey = Deno.env.get('ATTOM_DATA_API_KEY')
    const propertyRadarApiKey = Deno.env.get('PROPERTY_RADAR_API_KEY')

    let taxData: PropertyTaxData | null = null

    // Try ATTOM Data API first
    if (attomApiKey) {
      try {
        taxData = await fetchFromAttomData(address, city, state, zipCode, attomApiKey)
      } catch (error) {
        console.error('ATTOM Data API failed:', error)
      }
    }

    // Fallback to PropertyRadar API
    if (!taxData && propertyRadarApiKey) {
      try {
        taxData = await fetchFromPropertyRadar(address, city, state, zipCode, propertyRadarApiKey)
      } catch (error) {
        console.error('PropertyRadar API failed:', error)
      }
    }

    // If APIs fail, try state-specific county assessor APIs
    if (!taxData && state) {
      try {
        taxData = await fetchFromCountyAssessor(address, city, state, zipCode)
      } catch (error) {
        console.error('County assessor lookup failed:', error)
      }
    }

    if (!taxData) {
      throw new Error('Unable to fetch property tax data from any available source')
    }

    return new Response(
      JSON.stringify(taxData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in property-tax-lookup:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function fetchFromAttomData(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string,
  apiKey?: string
): Promise<PropertyTaxData | null> {
  if (!apiKey) return null

  const searchParams = new URLSearchParams({
    address1: address,
    address2: `${city}, ${state} ${zipCode}`,
  })

  const response = await fetch(`https://search.onboard-apis.com/propertyapi/v1.0.0/taxhistory/detail?${searchParams}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'apikey': apiKey,
    }
  })

  if (!response.ok) {
    throw new Error(`ATTOM Data API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.property || data.property.length === 0) {
    return null
  }

  const property = data.property[0]
  const taxHistory = property.taxhistory?.[0] || {}

  return {
    annualTax: taxHistory.taxamt || 0,
    taxRate: taxHistory.taxratecodearea || 0,
    assessedValue: taxHistory.assessedvalue || 0,
    millageRate: taxHistory.millrate,
    taxYear: taxHistory.taxyear || new Date().getFullYear(),
    exemptions: taxHistory.exemptions || [],
    source: 'ATTOM Data',
    lastUpdated: new Date().toISOString(),
  }
}

async function fetchFromPropertyRadar(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string,
  apiKey?: string
): Promise<PropertyTaxData | null> {
  if (!apiKey) return null

  const searchParams = new URLSearchParams({
    address: `${address}, ${city}, ${state} ${zipCode}`,
  })

  const response = await fetch(`https://app.propertyradar.com/api/v1/property/search?${searchParams}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }
  })

  if (!response.ok) {
    throw new Error(`PropertyRadar API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    return null
  }

  const property = data.results[0]

  return {
    annualTax: property.taxes?.annual_amount || 0,
    taxRate: property.taxes?.rate || 0,
    assessedValue: property.assessment?.total_assessed_value || 0,
    millageRate: property.taxes?.mill_rate,
    taxYear: property.taxes?.tax_year || new Date().getFullYear(),
    exemptions: property.taxes?.exemptions || [],
    source: 'PropertyRadar',
    lastUpdated: new Date().toISOString(),
  }
}

async function fetchFromCountyAssessor(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string
): Promise<PropertyTaxData | null> {
  // This would implement state-specific county assessor API calls
  // Each state/county has different APIs and data formats
  
  console.log(`Would attempt county assessor lookup for ${state}`)
  
  // For now, return null - this would be implemented with specific
  // county assessor APIs based on the state
  return null
}