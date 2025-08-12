import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIAnalysisResult {
  name: string;
  description: string;
  estimatedValue: number;
  confidence: number;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { base64Image } = await req.json();

    if (!base64Image) {
      throw new Error('No image data provided');
    }

    console.log('Analyzing image with OpenAI Vision API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert appraiser. Analyze the image and provide a JSON response with:
            - name: specific item name
            - description: detailed description
            - estimatedValue: estimated dollar value (number only)
            - confidence: confidence level 0-100
            - category: item category
            - condition: condition assessment
            - brand: brand name if visible
            - model: model if identifiable`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this item and provide valuation information in JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response:', content);

    let analysisResult: AIAnalysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Return a fallback response
      analysisResult = {
        name: 'Unidentified Item',
        description: 'Item could not be properly analyzed',
        estimatedValue: 0,
        confidence: 10,
        category: 'Unknown',
        condition: 'Unknown'
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Analysis failed',
      name: 'Analysis Failed',
      description: 'Could not analyze the image',
      estimatedValue: 0,
      confidence: 0,
      category: 'Unknown',
      condition: 'Unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});