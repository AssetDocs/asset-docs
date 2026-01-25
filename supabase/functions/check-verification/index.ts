import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's token to validate auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log(`Computing verification status for user: ${userId}`);

    // Create service role client to call security definer function and update table
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Compute verification status using the SQL function
    const { data: verificationData, error: computeError } = await serviceClient
      .rpc('compute_user_verification', { target_user_id: userId });

    if (computeError) {
      console.error('Error computing verification:', computeError);
      return new Response(
        JSON.stringify({ error: 'Failed to compute verification status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verification computed:', verificationData);

    // Upsert the verification record
    const now = new Date().toISOString();
    const isVerified = verificationData.is_verified;

    const { data: upsertData, error: upsertError } = await serviceClient
      .from('account_verification')
      .upsert({
        user_id: userId,
        is_verified: isVerified,
        verified_at: isVerified ? now : null,
        email_verified: verificationData.email_verified,
        account_age_met: verificationData.account_age_met,
        upload_count_met: verificationData.upload_count_met,
        upload_count: verificationData.upload_count,
        profile_complete: verificationData.profile_complete,
        has_property: verificationData.has_property,
        last_checked_at: now,
        updated_at: now
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting verification:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save verification status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verification status saved for user ${userId}: is_verified=${isVerified}`);

    return new Response(
      JSON.stringify({
        is_verified: isVerified,
        criteria: {
          email_verified: verificationData.email_verified,
          account_age_met: verificationData.account_age_met,
          upload_count_met: verificationData.upload_count_met,
          upload_count: verificationData.upload_count,
          profile_complete: verificationData.profile_complete,
          has_property: verificationData.has_property
        },
        verified_at: upsertData?.verified_at || null,
        last_checked_at: now
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
