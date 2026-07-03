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

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) {
      return json({ error: "role_check_failed", details: roleError.message }, 500);
    }
    if (!roleData) {
      return json({ error: "forbidden" }, 403);
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [
      totalResult,
      events24Result,
      pendingResult,
      latestEventResult,
      latestProcessedResult,
      errors24Result,
      latestErrorResult,
      erroredEventsResult,
    ] = await Promise.all([
      supabase.from("stripe_events").select("stripe_event_id", { count: "exact", head: true }),
      supabase.from("stripe_events").select("stripe_event_id", { count: "exact", head: true }).gte("created_at", since24h),
      supabase.from("stripe_events").select("created_at", { count: "exact" }).eq("outcome", "pending").order("created_at", { ascending: true }).limit(1),
      supabase.from("stripe_events").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("stripe_events").select("processed_at").in("outcome", ["success", "skipped", "error"]).order("processed_at", { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
      supabase.from("stripe_events").select("stripe_event_id", { count: "exact", head: true }).eq("outcome", "error").gte("created_at", since24h),
      supabase.from("stripe_events").select("stripe_event_id, event_type, created_at, error_message").eq("outcome", "error").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase
      .from("stripe_events")
      .select("stripe_event_id, event_type, outcome, created_at, processed_at, error_message, replay_status, replay_requested_at, replay_request_count")
      .eq("outcome", "error")
      .order("created_at", { ascending: false })
      .limit(5),
    ]);

    const queryError = [
      totalResult.error,
      events24Result.error,
      pendingResult.error,
      latestEventResult.error,
      latestProcessedResult.error,
      errors24Result.error,
      latestErrorResult.error,
      erroredEventsResult.error,
    ].find(Boolean);

    if (queryError) {
      return json({
        webhookHealth: emptyHealth,
        erroredEvents: [],
        error: "health_query_failed",
        details: queryError.message,
      });
    }

    const oldestPendingAt = pendingResult.data?.[0]?.created_at ?? null;
    const oldestPendingMinutes = oldestPendingAt
      ? Math.floor((Date.now() - new Date(oldestPendingAt).getTime()) / 60000)
      : null;
    const errorEvents24h = errors24Result.count ?? 0;
    let healthStatus = "ok";
    if ((totalResult.count ?? 0) === 0) healthStatus = "no_events";
    else if (oldestPendingMinutes !== null && oldestPendingMinutes > 30) healthStatus = "page";
    else if (errorEvents24h >= 5) healthStatus = "page";
    else if (oldestPendingMinutes !== null && oldestPendingMinutes > 10) healthStatus = "warn";
    else if (errorEvents24h > 0) healthStatus = "warn";

    const latestError = latestErrorResult.data;
    const webhookHealth = {
      monitor_name: "stripe-webhook",
      description: "Stripe webhook processing lag and error monitor",
      total_events: totalResult.count ?? 0,
      events_24h: events24Result.count ?? 0,
      pending_events: pendingResult.count ?? 0,
      oldest_pending_at: oldestPendingAt,
      oldest_pending_minutes: oldestPendingMinutes,
      latest_event_at: latestEventResult.data?.created_at ?? null,
      latest_processed_at: latestProcessedResult.data?.processed_at ?? null,
      error_events_24h: errorEvents24h,
      latest_error_event_id: latestError?.stripe_event_id ?? null,
      latest_error_event_type: latestError?.event_type ?? null,
      latest_error_at: latestError?.created_at ?? null,
      latest_error_message: latestError?.error_message ?? null,
      health_status: healthStatus,
    };

    return json({
      webhookHealth,
      erroredEvents: erroredEventsResult.data ?? [],
    });
  } catch (error) {
    const err = error as Error;
    return json({ error: "unexpected_error", details: err.message }, 500);
  }
});
