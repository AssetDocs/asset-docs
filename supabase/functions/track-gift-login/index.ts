import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackGiftLoginRequest {
  gift_code: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { gift_code, user_id }: TrackGiftLoginRequest = await req.json();

    console.log('Tracking gift login for code:', gift_code, 'user:', user_id);

    // Find the gift subscription
    const { data: giftSub, error: queryError } = await supabase
      .from('gift_subscriptions')
      .select('*')
      .eq('gift_code', gift_code)
      .eq('redeemed', true)
      .single();

    if (queryError) {
      console.error('Error finding gift subscription:', queryError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Gift code not found or not redeemed' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update first_login_at and set recipient_user_id if not already set
    if (!giftSub.first_login_at) {
      const { error: updateError } = await supabase
        .from('gift_subscriptions')
        .update({
          first_login_at: new Date().toISOString(),
          redeemed_by_user_id: user_id,
          recipient_user_id: user_id // Set recipient_user_id for secure access
        })
        .eq('id', giftSub.id);

      if (updateError) {
        console.error('Error updating gift subscription:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to track gift login' 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      console.log('Successfully tracked first login for gift:', gift_code);
    } else {
      console.log('Gift code already has first login tracked:', gift_code);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Gift login tracked successfully',
      first_login: !giftSub.first_login_at
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in track-gift-login function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);