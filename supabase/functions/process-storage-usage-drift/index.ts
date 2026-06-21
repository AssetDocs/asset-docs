import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function recordCronJobResult(
  admin: ReturnType<typeof createClient>,
  startedAt: number,
  status: "succeeded" | "failed",
  result: Record<string, unknown> = {},
  errorMessage: string | null = null,
) {
  const { error } = await admin.rpc("record_cron_job_result", {
    p_job_name: "process-storage-usage-drift",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-STORAGE-USAGE-DRIFT] Cron health update failed", error);
  }
}

serve(async (req) => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!internalSecret || internalSecret !== expectedSecret) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(1000, Math.max(1, Number(body.limit ?? 100)));
  const minAbsoluteBytes = Math.max(0, Number(body.min_absolute_bytes ?? 52_428_800));
  const minRelativeRatio = Math.max(0, Number(body.min_relative_ratio ?? 0.05));

  const admin = createClient(supabaseUrl, serviceKey);
  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-storage-usage-drift",
  });

  const { data, error } = await admin.rpc("reconcile_storage_usage_drift", {
    p_limit: limit,
    p_min_absolute_bytes: minAbsoluteBytes,
    p_min_relative_ratio: minRelativeRatio,
  });

  if (error) {
    console.error("[PROCESS-STORAGE-USAGE-DRIFT] RPC failed", error);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { limit, min_absolute_bytes: minAbsoluteBytes, min_relative_ratio: minRelativeRatio },
      error.message,
    );
    return json(500, { error: "storage_usage_reconciliation_failed", details: error.message });
  }

  const result = {
    limit,
    min_absolute_bytes: minAbsoluteBytes,
    min_relative_ratio: minRelativeRatio,
    result: data,
  };

  await recordCronJobResult(admin, startedAt, "succeeded", result);

  return json(200, {
    ok: true,
    ...result,
  });
});
