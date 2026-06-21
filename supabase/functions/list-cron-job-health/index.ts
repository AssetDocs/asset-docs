import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CronHealthRow = {
  job_name: string;
  description: string | null;
  expected_interval_minutes: number;
  warn_after_minutes: number;
  page_after_minutes: number;
  last_started_at: string | null;
  last_succeeded_at: string | null;
  last_failed_at: string | null;
  last_duration_ms: number | null;
  last_status: "never_run" | "running" | "succeeded" | "failed";
  last_error: string | null;
  consecutive_failures: number;
  last_result: Record<string, unknown>;
  updated_at: string;
  health_status: "never_run" | "ok" | "warn" | "page" | "failed";
  minutes_since_success: number | null;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function redactError(message: string | null) {
  if (!message) return null;
  return message.slice(0, 500);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json(500, { error: "missing_environment" });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json(401, { error: "missing_auth" });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: userData, error: userError } = await admin.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return json(401, { error: "invalid_auth" });
    }

    const { data: hasAccess, error: accessError } = await admin.rpc(
      "has_dev_workspace_access",
      { _user_id: userData.user.id },
    );
    if (accessError) {
      console.error("[LIST-CRON-JOB-HEALTH] Access RPC failed", accessError);
      return json(500, { error: "access_check_failed" });
    }
    if (hasAccess !== true) {
      return json(403, { error: "forbidden" });
    }

    const { data, error } = await admin
      .from("cron_job_health_status")
      .select("*")
      .order("health_status", { ascending: true })
      .order("job_name", { ascending: true });

    if (error) {
      console.error("[LIST-CRON-JOB-HEALTH] Query failed", error);
      return json(500, { error: "query_failed" });
    }

    const summary = {
      ok: 0,
      warn: 0,
      page: 0,
      failed: 0,
      never_run: 0,
    };

    const items = ((data ?? []) as CronHealthRow[]).map((row) => {
      summary[row.health_status] += 1;
      return {
        job_name: row.job_name,
        description: row.description,
        expected_interval_minutes: row.expected_interval_minutes,
        warn_after_minutes: row.warn_after_minutes,
        page_after_minutes: row.page_after_minutes,
        health_status: row.health_status,
        last_status: row.last_status,
        last_started_at: row.last_started_at,
        last_succeeded_at: row.last_succeeded_at,
        last_failed_at: row.last_failed_at,
        minutes_since_success: row.minutes_since_success,
        last_duration_ms: row.last_duration_ms,
        consecutive_failures: row.consecutive_failures,
        has_error: !!row.last_error,
        last_error: redactError(row.last_error),
        last_result: row.last_result,
        updated_at: row.updated_at,
      };
    });

    return json(200, { summary, items });
  } catch (error) {
    console.error("[LIST-CRON-JOB-HEALTH] Unhandled", error);
    return json(500, { error: "internal_error" });
  }
});
