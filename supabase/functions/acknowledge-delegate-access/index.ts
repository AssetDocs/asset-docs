import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcknowledgeAccessData {
  legacyLockerId: string;
  delegateUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { legacyLockerId, delegateUserId }: AcknowledgeAccessData = await req.json();

    console.log("Processing delegate acknowledgment for locker:", legacyLockerId);

    // Verify the user is the delegate
    if (userData.user.id !== delegateUserId) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to acknowledge this access" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the legacy locker exists and has this delegate
    const { data: locker, error: lockerError } = await supabase
      .from('legacy_locker')
      .select('id, delegate_user_id, user_id, recovery_status')
      .eq('id', legacyLockerId)
      .single();

    if (lockerError || !locker) {
      return new Response(
        JSON.stringify({ error: "Secure Vault not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (locker.delegate_user_id !== delegateUserId) {
      return new Response(
        JSON.stringify({ error: "You are not the designated delegate for this account" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the legacy locker to grant full access
    const { error: updateError } = await supabase
      .from('legacy_locker')
      .update({ 
        recovery_status: 'delegate_acknowledged',
        updated_at: new Date().toISOString()
      })
      .eq('id', legacyLockerId);

    if (updateError) {
      console.error("Error updating legacy locker:", updateError);
      throw updateError;
    }

    // Update any pending recovery requests
    const { error: requestError } = await supabase
      .from('recovery_requests')
      .update({ 
        status: 'acknowledged',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('legacy_locker_id', legacyLockerId)
      .eq('delegate_user_id', delegateUserId)
      .eq('status', 'grace_period_expired');

    if (requestError) {
      console.error("Error updating recovery request:", requestError);
      // Continue anyway - not critical
    }

    // Get owner info for logging
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', locker.user_id)
      .single();

    const ownerName = ownerProfile 
      ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() 
      : 'the account owner';

    console.log(`Delegate ${delegateUserId} acknowledged access to ${ownerName}'s Secure Vault`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `You now have full access to ${ownerName}'s Secure Vault. Please handle this responsibility with care.`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error acknowledging delegate access:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
