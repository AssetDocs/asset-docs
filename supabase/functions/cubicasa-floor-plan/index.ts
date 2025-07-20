import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = await req.json()
    const cubicasaApiKey = Deno.env.get('CUBICASA_API_KEY')

    if (!cubicasaApiKey) {
      return new Response(
        JSON.stringify({ error: 'Cubicasa API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (method) {
      case 'upload_image':
        return await handleImageUpload(req, cubicasaApiKey, user.id)
      case 'get_floor_plan':
        return await getFloorPlan(req, cubicasaApiKey)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid method' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleImageUpload(req: Request, apiKey: string, userId: string) {
  const { imageData, propertyId } = await req.json()
  
  // Convert base64 to blob
  const base64Data = imageData.split(',')[1]
  const imageBlob = new Blob([
    new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)))
  ], { type: 'image/jpeg' })

  // Create form data for Cubicasa API
  const formData = new FormData()
  formData.append('image', imageBlob, 'floor_plan.jpg')
  formData.append('property_type', 'residential')
  formData.append('unit_system', 'imperial')

  try {
    // Upload to Cubicasa
    const response = await fetch('https://api.cubicasa.com/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Cubicasa API error: ${response.statusText}`)
    }

    const result = await response.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        upload_id: result.id,
        status: result.status,
        message: 'Image uploaded successfully to Cubicasa'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Cubicasa upload error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload to Cubicasa', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getFloorPlan(req: Request, apiKey: string) {
  const { uploadId } = await req.json()

  try {
    // Get floor plan status from Cubicasa
    const response = await fetch(`https://api.cubicasa.com/v1/uploads/${uploadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Cubicasa API error: ${response.statusText}`)
    }

    const result = await response.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        status: result.status,
        floor_plan_url: result.floor_plan_url,
        measurements: result.measurements,
        rooms: result.rooms
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Cubicasa fetch error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch from Cubicasa', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}