import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordVerificationRequest {
  password: string;
}

// In-memory rate limiting (per isolate instance)
const rateLimitMap = new Map<string, { attempts: number; windowStart: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (record) {
    if (now - record.windowStart > WINDOW_MS) {
      // Window expired, reset
      rateLimitMap.set(identifier, { attempts: 1, windowStart: now });
      return { allowed: true };
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      const retryAfterMs = WINDOW_MS - (now - record.windowStart);
      return { allowed: false, retryAfterMs };
    }
    record.attempts++;
    return { allowed: true };
  }
  
  rateLimitMap.set(identifier, { attempts: 1, windowStart: now });
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      const retryAfterSeconds = Math.ceil((rateCheck.retryAfterMs || WINDOW_MS) / 1000);
      return new Response(
        JSON.stringify({ valid: false, error: 'Too many attempts. Please try again later.' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds)
          },
          status: 429 
        }
      );
    }

    const { password }: PasswordVerificationRequest = await req.json();
    
    if (!password) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Password is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Get admin password from environment variable
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD secret not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const isValid = password === adminPassword;
    
    if (!isValid) {
      console.warn(`Failed admin password attempt from IP: ${clientIp}`);
    }
    
    return new Response(
      JSON.stringify({ 
        valid: isValid,
        message: isValid ? 'Access granted' : 'Invalid password'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error verifying admin password:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
