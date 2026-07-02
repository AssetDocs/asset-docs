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

const emptyHealth = {
  monitor_name: "stripe-webhook",
  description: "Stripe webhook processing lag and error monitor",
  total_events: 0,
  events_24h: 0,
  pending_events: 0,
  oldest_pending_at: null,
  oldest_pending_minutes: null,
  latest_event_at: null,
  latest_processed_at: null,
  error_events_24h: 0,
  latest_error_event_id: null,
  latest_error_event_type: null,
  latest_error_at: null,
  latest_error_message: null,
  health_status: "no_events",
};

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

    const { data: webhookHealth, error: healthError } = await supabase
      .from("stripe_webhook_health_status")
      .select("*")
      .maybeSingle();

    if (healthError) {
      return json({ error: "health_query_failed", details: healthError.message }, 500);
    }

    const { data: erroredEvents, error: eventsError } = await supabase
      .from("stripe_events")
      .select("stripe_event_id, event_type, outcome, created_at, processed_at, error_message, replay_status, replay_requested_at, replay_request_count")
      .eq("outcome", "error")
      .order("created_at", { ascending: false })
      .limit(5);

    if (eventsError) {
      return json({ error: "error_events_query_failed", details: eventsError.message }, 500);
    }

    return json({
      webhookHealth: webhookHealth ?? emptyHealth,
      erroredEvents: erroredEvents ?? [],
    });
  } catch (error) {
    const err = error as Error;
    return json({ error: "unexpected_error", details: err.message }, 500);
  }
});
