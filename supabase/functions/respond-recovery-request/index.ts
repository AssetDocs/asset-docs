import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RespondRecoveryRequestData {
  recoveryRequestId: string;
  action: 'approve' | 'reject';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { recoveryRequestId, action }: RespondRecoveryRequestData = await req.json();

    console.log(`Processing recovery request ${action}:`, recoveryRequestId);

    // Get the recovery request
    const { data: recoveryRequest, error: fetchError } = await supabaseClient
      .from("recovery_requests")
      .select("*, legacy_locker_id")
      .eq("id", recoveryRequestId)
      .single();

    if (fetchError || !recoveryRequest) {
      console.error("Error fetching recovery request:", fetchError);
      return new Response(
        JSON.stringify({ error: "Recovery request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user is the owner
    if (recoveryRequest.owner_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not authorized to respond to this request" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update recovery request
    const { error: updateRequestError } = await supabaseClient
      .from("recovery_requests")
      .update({
        status: newStatus,
        responded_at: new Date().toISOString()
      })
      .eq("id", recoveryRequestId);

    if (updateRequestError) {
      console.error("Error updating recovery request:", updateRequestError);
      return new Response(
        JSON.stringify({ error: "Failed to update recovery request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update legacy locker status
    const { error: updateLockerError } = await supabaseClient
      .from("legacy_locker")
      .update({
        recovery_status: newStatus
      })
      .eq("id", recoveryRequest.legacy_locker_id);

    if (updateLockerError) {
      console.error("Error updating legacy locker:", updateLockerError);
    }

    // Get user details for email
    const { data: ownerProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    const { data: delegateProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", recoveryRequest.delegate_user_id)
      .single();

    const { data: { user: delegateUser } } = await supabaseClient.auth.admin.getUserById(recoveryRequest.delegate_user_id);

    // Send email to delegate
    const emailFunction = action === 'approve' 
      ? "send-recovery-approved-email" 
      : "send-recovery-rejected-email";

    await supabaseClient.functions.invoke(emailFunction, {
      body: {
        delegateEmail: delegateUser?.email,
        delegateName: `${delegateProfile?.first_name || ''} ${delegateProfile?.last_name || ''}`.trim() || 'Recovery Delegate',
        ownerName: `${ownerProfile?.first_name || ''} ${ownerProfile?.last_name || ''}`.trim() || 'User'
      }
    });

    console.log(`Recovery request ${action}ed successfully`);

    return new Response(
      JSON.stringify({ success: true, action, status: newStatus }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in respond-recovery-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
