import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// RETIRED PATH (Stage 2B): Authorized-User / "administrator contributor"
// initiated account deletion requests no longer exist. No Authorized User role
// may request deletion of another person's account — only the account owner can
// close their own account. This endpoint remains deployed but inert so any stale
// client fails closed with a 403 instead of hitting a missing function.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[SUBMIT-DELETION-REQUEST] Retired endpoint called by', user.id);
    return new Response(
      JSON.stringify({
        error: 'This request path has been retired. Only the account owner can request deletion of their account.',
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[SUBMIT-DELETION-REQUEST] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});
