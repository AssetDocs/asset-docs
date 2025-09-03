import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  identifier: string; // IP or user ID
  action: string; // login, signup, export, etc.
  windowMinutes?: number; // Time window (default 15 minutes)
  maxAttempts?: number; // Max attempts per window (default 5)
}

interface RateLimitRecord {
  id: string;
  identifier: string;
  action: string;
  attempts: number;
  window_start: string;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { identifier, action, windowMinutes = 15, maxAttempts = 5 }: RateLimitRequest = await req.json();

    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Missing identifier or action' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const windowStart = new Date(Date.now() - (windowMinutes * 60 * 1000)).toISOString();

    // Check existing rate limit record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_start', windowStart)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      return new Response(
        JSON.stringify({ allowed: true, error: 'Rate limit check failed, allowing request' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (existingRecord) {
      if (existingRecord.attempts >= maxAttempts) {
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            error: `Rate limit exceeded. Try again in ${Math.ceil((new Date(existingRecord.window_start).getTime() + (windowMinutes * 60 * 1000) - Date.now()) / 60000)} minutes.`,
            retryAfter: Math.ceil((new Date(existingRecord.window_start).getTime() + (windowMinutes * 60 * 1000) - Date.now()) / 1000)
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        );
      }

      // Increment attempts
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ 
          attempts: existingRecord.attempts + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
    } else {
      // Create new rate limit record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          identifier,
          action,
          attempts: 1,
          window_start: new Date().toISOString()
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        allowed: true,
        remainingAttempts: maxAttempts - ((existingRecord?.attempts || 0) + 1)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ allowed: true, error: 'Rate limit check failed, allowing request' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});