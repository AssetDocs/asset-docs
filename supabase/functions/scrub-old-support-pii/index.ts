import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { isAuthorizedInternalCall } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type SupportIssue = {
  id: string;
  type: string;
  priority: string;
  status: string;
  updated_at: string;
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
    p_job_name: "scrub-old-support-pii",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[SCRUB-OLD-SUPPORT-PII] Cron health update failed", error);
  }
}

async function recordScrubRun(
  admin: ReturnType<typeof createClient>,
  startedAt: number,
  params: {
    status: "succeeded" | "failed";
    dryRun: boolean;
    retentionDays: number;
    cutoff: string;
    eligible: number;
    scrubbed: number;
    ids: string[];
    errorMessage?: string | null;
  },
) {
  const { error } = await admin
    .from("support_pii_scrub_runs")
    .insert({
      status: params.status,
      dry_run: params.dryRun,
      retention_days: params.retentionDays,
      cutoff_at: params.cutoff,
      eligible_count: params.eligible,
      scrubbed_count: params.scrubbed,
      issue_ids: params.ids,
      error_message: params.errorMessage ?? null,
      duration_ms: Date.now() - startedAt,
      started_at: new Date(startedAt).toISOString(),
      completed_at: new Date().toISOString(),
    });

  if (error) {
    console.error("[SCRUB-OLD-SUPPORT-PII] Scrub run ledger insert failed", error);
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
  const retentionDays = Math.min(3650, Math.max(30, Number(body.retention_days ?? 1095)));
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  await admin.rpc("record_cron_job_started", {
    p_job_name: "scrub-old-support-pii",
  });

  const { data: issues, error: queryError } = await admin
    .from("dev_support_issues")
    .select("id,type,priority,status,updated_at")
    .in("status", ["resolved", "wont_fix"])
    .is("pii_scrubbed_at", null)
    .lte("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (queryError) {
    console.error("[SCRUB-OLD-SUPPORT-PII] Query failed", queryError);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { dry_run: dryRun, limit, retention_days: retentionDays },
      queryError.message,
    );
    await recordScrubRun(admin, startedAt, {
      status: "failed",
      dryRun,
      retentionDays,
      cutoff,
      eligible: 0,
      scrubbed: 0,
      ids: [],
      errorMessage: queryError.message,
    });
    return json(500, { error: "support_pii_query_failed", details: queryError.message });
  }

  const rows = (issues ?? []) as SupportIssue[];
  const result = {
    dry_run: dryRun,
    retention_days: retentionDays,
    cutoff,
    eligible: rows.length,
    scrubbed: 0,
    ids: rows.map((issue) => issue.id),
  };

  if (dryRun || rows.length === 0) {
    await recordCronJobResult(admin, startedAt, "succeeded", result);
    await recordScrubRun(admin, startedAt, {
      status: "succeeded",
      dryRun,
      retentionDays,
      cutoff,
      eligible: result.eligible,
      scrubbed: result.scrubbed,
      ids: result.ids,
    });
    return json(200, { ok: true, ...result });
  }

  for (const issue of rows) {
    const { error: updateError } = await admin
      .from("dev_support_issues")
      .update({
        title: `[PII scrubbed] ${issue.type}`,
        description: "[PII scrubbed after support retention window]",
        reported_by: null,
        resolution: issue.status === "resolved"
          ? "[PII scrubbed after support retention window]"
          : null,
        pii_scrubbed_at: new Date().toISOString(),
        pii_scrub_metadata: {
          retention_days: retentionDays,
          scrubbed_fields: ["title", "description", "reported_by", "resolution"],
          original_type: issue.type,
          original_priority: issue.priority,
          original_status: issue.status,
        },
      })
      .eq("id", issue.id)
      .is("pii_scrubbed_at", null);

    if (updateError) {
      console.error("[SCRUB-OLD-SUPPORT-PII] Update failed", {
        id: issue.id,
        message: updateError.message,
      });
      await recordCronJobResult(admin, startedAt, "failed", result, updateError.message);
      await recordScrubRun(admin, startedAt, {
        status: "failed",
        dryRun,
        retentionDays,
        cutoff,
        eligible: result.eligible,
        scrubbed: result.scrubbed,
        ids: result.ids,
        errorMessage: updateError.message,
      });
      return json(500, { error: "support_pii_update_failed", details: updateError.message });
    }

    result.scrubbed++;
  }

  await recordCronJobResult(admin, startedAt, "succeeded", result);
  await recordScrubRun(admin, startedAt, {
    status: "succeeded",
    dryRun,
    retentionDays,
    cutoff,
    eligible: result.eligible,
    scrubbed: result.scrubbed,
    ids: result.ids,
  });
  return json(200, { ok: true, ...result });
});
