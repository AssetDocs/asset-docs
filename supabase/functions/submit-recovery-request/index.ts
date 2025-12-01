import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitRecoveryRequestData {
  legacyLockerId: string;
  relationship?: string;
  reason?: string;
  documentationUrl?: string;
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

    const { legacyLockerId, relationship, reason, documentationUrl }: SubmitRecoveryRequestData = await req.json();

    console.log("Submitting recovery request for Legacy Locker:", legacyLockerId);

    // Get the legacy locker details
    const { data: legacyLocker, error: fetchError } = await supabaseClient
      .from("legacy_locker")
      .select("user_id, delegate_user_id, recovery_grace_period_days, recovery_status")
      .eq("id", legacyLockerId)
      .single();

    if (fetchError || !legacyLocker) {
      console.error("Error fetching legacy locker:", fetchError);
      return new Response(
        JSON.stringify({ error: "Legacy Locker not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user is the designated delegate
    if (legacyLocker.delegate_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not the designated recovery delegate" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if there's already a pending request
    if (legacyLocker.recovery_status === 'pending') {
      return new Response(
        JSON.stringify({ error: "A recovery request is already pending" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const gracePeriodDays = legacyLocker.recovery_grace_period_days || 14;
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + gracePeriodDays);

    // Create recovery request
    const { data: recoveryRequest, error: createError } = await supabaseClient
      .from("recovery_requests")
      .insert({
        legacy_locker_id: legacyLockerId,
        delegate_user_id: user.id,
        owner_user_id: legacyLocker.user_id,
        relationship,
        reason,
        documentation_url: documentationUrl,
        grace_period_ends_at: gracePeriodEndsAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating recovery request:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create recovery request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update legacy locker status
    const { error: updateError } = await supabaseClient
      .from("legacy_locker")
      .update({
        recovery_status: 'pending',
        recovery_requested_at: new Date().toISOString()
      })
      .eq("id", legacyLockerId);

    if (updateError) {
      console.error("Error updating legacy locker:", updateError);
    }

    // Get owner and delegate details for email
    const { data: ownerProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", legacyLocker.user_id)
      .single();

    const { data: delegateProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    const { data: { user: ownerUser } } = await supabaseClient.auth.admin.getUserById(legacyLocker.user_id);

    // Send notification email to owner
    await supabaseClient.functions.invoke("send-recovery-request-email", {
      body: {
        ownerEmail: ownerUser?.email,
        ownerName: `${ownerProfile?.first_name || ''} ${ownerProfile?.last_name || ''}`.trim() || 'User',
        delegateName: `${delegateProfile?.first_name || ''} ${delegateProfile?.last_name || ''}`.trim() || 'Recovery Delegate',
        gracePeriodDays,
        requestReason: reason
      }
    });

    console.log("Recovery request submitted successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        recoveryRequest,
        gracePeriodEndsAt: gracePeriodEndsAt.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-recovery-request function:", error);
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
