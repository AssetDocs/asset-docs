import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid lifetime gift codes - ASL = Asset Safe Lifetime
const LIFETIME_CODES = ["ASL2025"];

interface ValidateCodeRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const user_id = claimsData.claims.sub as string;

    // Use service role client for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code }: ValidateCodeRequest = await req.json();

    console.log('Validating lifetime code:', code, 'for authenticated user:', user_id);

    // Validate code
    if (!code || !LIFETIME_CODES.includes(code.toUpperCase().trim())) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid gift code' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user?.email) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userEmail = userData.user.email;

    // Update or create subscriber record with lifetime premium access
    const { error: upsertError } = await supabase
      .from('subscribers')
      .upsert({
        user_id,
        email: userEmail,
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: '2099-12-31T23:59:59Z',
        trial_end: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error updating subscriber:', upsertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to activate subscription' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update profile with premium limits
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan_id: 'premium_lifetime',
        plan_status: 'active',
        property_limit: 10,
        storage_quota_gb: 50,
        current_period_end: '2099-12-31T23:59:59Z',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Send welcome email
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user_id)
        .single();

      await supabase.functions.invoke('send-welcome-email', {
        body: {
          user_id,
          email: userEmail,
          first_name: profile?.first_name || 'Valued',
          last_name: profile?.last_name || 'Customer'
        }
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    console.log('Successfully activated lifetime subscription for user:', user_id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Lifetime subscription activated!',
      subscription_tier: 'premium',
      expires: '2099-12-31'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in validate-lifetime-code function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
