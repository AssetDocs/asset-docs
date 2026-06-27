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
    p_job_name: "process-retention-expirations",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-RETENTION-EXPIRATIONS] Cron health update failed", error);
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
  const dryRun = body.dry_run !== false;
  const limit = Math.min(500, Math.max(1, Number(body.limit ?? 100)));

  const admin = createClient(supabaseUrl, serviceKey);
  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-retention-expirations",
  });

  const { data, error } = await admin.rpc("process_deleted_account_retention", {
    p_dry_run: dryRun,
    p_limit: limit,
  });

  if (error) {
    console.error("[PROCESS-RETENTION-EXPIRATIONS] RPC failed", error);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { dry_run: dryRun, limit },
      error.message,
    );
    return json(500, { error: "retention_processing_failed", details: error.message });
  }

  await recordCronJobResult(admin, startedAt, "succeeded", {
    dry_run: dryRun,
    limit,
    result: data,
  });

  return json(200, {
    ok: true,
    dry_run: dryRun,
    result: data,
  });
});
