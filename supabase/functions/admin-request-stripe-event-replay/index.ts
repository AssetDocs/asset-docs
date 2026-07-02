import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return json({ error: "missing_configuration" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userRes, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userRes?.user) {
      return json({ error: "unauthorized" }, 401);
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_app_role", {
      _user_id: userRes.user.id,
      _role: "admin",
    });
    if (roleError) {
      return json({ error: "role_check_failed", details: roleError.message }, 500);
    }
    if (!isAdmin) {
      return json({ error: "forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const stripeEventId = String(body.stripeEventId ?? body.stripe_event_id ?? "").trim();
    const notes = typeof body.notes === "string" ? body.notes : null;

    if (!stripeEventId) {
      return json({ error: "stripe_event_id_required" }, 400);
    }

    const { data: requestId, error: replayError } = await supabase.rpc("request_stripe_event_replay", {
      p_stripe_event_id: stripeEventId,
      p_requested_by: userRes.user.id,
      p_notes: notes,
    });

    if (replayError) {
      const message = replayError.message || "";
      if (message.includes("stripe_event_not_found")) {
        return json({ error: "stripe_event_not_found" }, 404);
      }
      if (message.includes("stripe_event_not_error")) {
        return json({ error: "stripe_event_not_error" }, 409);
      }
      return json({ error: "replay_request_failed", details: message }, 500);
    }

    return json({
      ok: true,
      requestId,
      stripeEventId,
      nextStep: "Redeliver the Stripe event from the Stripe Dashboard so the signed webhook can process it again.",
    });
  } catch (error) {
    const err = error as Error;
    return json({ error: "unexpected_error", details: err.message }, 500);
  }
});
