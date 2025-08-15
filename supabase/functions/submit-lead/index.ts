import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadSubmission {
  name: string;
  email: string;
  city: string;
  state: string;
  how_heard: string;
  marketing_consent?: boolean;
  honeypot?: string; // Hidden field to catch bots
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const HOW_HEARD_OPTIONS = [
  'Google Search',
  'Social Media', 
  'Referral from Friend/Family',
  'Real Estate Agent',
  'Insurance Company',
  'Advertisement',
  'Word of Mouth',
  'Other'
];

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function validateInput(data: LeadSubmission): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for honeypot - if filled, it's likely a bot
  if (data.honeypot && data.honeypot.length > 0) {
    errors.push('Bot submission detected');
  }

  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name is too long');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  } else if (data.email.length > 255) {
    errors.push('Email is too long');
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push('City is required');
  } else if (data.city.length > 100) {
    errors.push('City is too long');
  }

  if (!data.state || !US_STATES.includes(data.state)) {
    errors.push('Valid US state is required');
  }

  if (!data.how_heard || !HOW_HEARD_OPTIONS.includes(data.how_heard)) {
    errors.push('Valid source selection is required');
  }

  // Basic spam detection - check for suspicious patterns
  const suspiciousPatterns = [
    /https?:\/\//i, // URLs in name/city
    /\b(viagra|cialis|casino|poker|loan|debt|crypto|bitcoin)\b/i,
    /.{200,}/, // Very long text
  ];

  const textFields = [data.name, data.city];
  for (const field of textFields) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(field)) {
        errors.push('Content contains suspicious patterns');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function checkRateLimit(email: string, ip: string): Promise<{ allowed: boolean; error?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Check for duplicate submissions from same email in last hour
    const { data: emailCheck, error: emailError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .gte('submitted_at', oneHourAgo.toISOString());

    if (emailError) {
      console.error('Rate limit check error:', emailError);
      return { allowed: true }; // Allow on error to not block legitimate users
    }

    if (emailCheck && emailCheck.length > 0) {
      return { 
        allowed: false, 
        error: 'A submission from this email was already received recently. Please try again later.' 
      };
    }

    // Check for too many submissions from same IP in last hour (max 5)
    const { data: ipCheck, error: ipError } = await supabase
      .from('leads')
      .select('id')
      .eq('ip_address', ip)
      .gte('submitted_at', oneHourAgo.toISOString());

    if (ipError) {
      console.error('IP rate limit check error:', ipError);
      return { allowed: true }; // Allow on error
    }

    if (ipCheck && ipCheck.length >= 5) {
      return { 
        allowed: false, 
        error: 'Too many submissions from this location. Please try again later.' 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const leadData: LeadSubmission = await req.json();
    
    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Lead submission attempt:', {
      email: leadData.email,
      ip: clientIP,
      userAgent: userAgent.substring(0, 100)
    });

    // Validate input
    const validation = validateInput(leadData);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting
    const rateLimit = await checkRateLimit(leadData.email, clientIP);
    if (!rateLimit.allowed) {
      console.log('Rate limit exceeded:', leadData.email, clientIP);
      return new Response(
        JSON.stringify({ error: rateLimit.error }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert lead data
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: leadData.name.trim(),
        email: leadData.email.toLowerCase().trim(),
        city: leadData.city.trim(),
        state: leadData.state,
        how_heard: leadData.how_heard,
        marketing_consent: leadData.marketing_consent || false,
        submitted_at: new Date().toISOString(),
        ip_address: clientIP,
        user_agent: userAgent
      }])
      .select('id');

    if (error) {
      console.error('Database insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save lead information' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Lead saved successfully:', data[0]?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead information saved successfully',
        leadId: data[0]?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in submit-lead function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);