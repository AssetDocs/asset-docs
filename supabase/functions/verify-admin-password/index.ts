import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PasswordVerificationRequest {
  password: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Admin password
    const adminPassword = "AssetDocs2025";
    
    const isValid = password === adminPassword;
    
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
