import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { isAuthorizedInternalCall } from "../_shared/internalSecret.ts";

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
    p_job_name: "process-storage-orphans",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-STORAGE-ORPHANS] Cron health update failed", error);
  }
}

serve(async (req) => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAuthorizedInternalCall(req)) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(5000, Math.max(1, Number(body.limit ?? 500)));
  const minAgeDays = Math.min(90, Math.max(1, Number(body.min_age_days ?? 7)));
  const queueApproved = body.queue_approved !== false;

  const admin = createClient(supabaseUrl, serviceKey);
  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-storage-orphans",
  });

  const { data, error } = await admin.rpc("reconcile_storage_orphans", {
    p_limit: limit,
    p_min_age: `${minAgeDays} days`,
    p_queue_approved: queueApproved,
  });

  if (error) {
    console.error("[PROCESS-STORAGE-ORPHANS] RPC failed", error);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { limit, min_age_days: minAgeDays, queue_approved: queueApproved },
      error.message,
    );
    return json(500, { error: "storage_orphan_reconciliation_failed", details: error.message });
  }

  const result = {
    limit,
    min_age_days: minAgeDays,
    queue_approved: queueApproved,
    result: data,
  };

  await recordCronJobResult(admin, startedAt, "succeeded", result);

  return json(200, {
    ok: true,
    ...result,
  });
});
