import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { isAuthorizedInternalCall, getPreferredInternalSecret } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type SupabaseAdminClient = ReturnType<typeof createClient>;

type StorageDeletionJob = {
  id: string;
  bucket: string;
  object_path: string;
  attempt_count: number | null;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNotFoundStorageError(
  err: { message?: string; statusCode?: string | number } | null,
) {
  if (!err) return false;
  const message = (err.message ?? "").toLowerCase();
  const statusCode = String(err.statusCode ?? "");
  return statusCode === "404"
    || message.includes("not found")
    || message.includes("object does not exist")
    || message.includes("not_found");
}

function nextRetryAt(attemptCount: number) {
  const minutes = Math.min(24 * 60, 15 * Math.max(1, attemptCount));
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function markJob(
  admin: SupabaseAdminClient,
  job: StorageDeletionJob,
  status: "processing" | "succeeded" | "failed",
  errorMessage?: string,
) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    last_attempt_at: now,
    processing_started_at: status === "processing" ? now : null,
  };

  if (status === "succeeded") {
    patch.attempt_count = (job.attempt_count ?? 0) + 1;
    patch.completed_at = now;
    patch.last_error = null;
  } else if (status === "failed") {
    const nextAttemptCount = (job.attempt_count ?? 0) + 1;
    patch.attempt_count = nextAttemptCount;
    patch.next_attempt_at = nextRetryAt(nextAttemptCount);
    patch.last_error = (errorMessage ?? "storage_delete_failed").slice(0, 1000);
  }

  await admin
    .from("storage_deletion_jobs")
    .update(patch)
    .eq("id", job.id);
}

async function recordCronJobResult(
  admin: SupabaseAdminClient,
  startedAt: number,
  status: "succeeded" | "failed",
  result: Record<string, unknown> = {},
  errorMessage: string | null = null,
) {
  const { error } = await admin.rpc("record_cron_job_result", {
    p_job_name: "process-storage-deletion-jobs",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-STORAGE-DELETION-JOBS] Cron health update failed", error);
  }
}

serve(async (req: Request): Promise<Response> => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAuthorizedInternalCall(req)) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getPreferredInternalSecret();
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const limit = Math.min(
    250,
    Math.max(1, Number(new URL(req.url).searchParams.get("limit") ?? "100")),
  );
  const admin = createClient(supabaseUrl, serviceKey);
  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-storage-deletion-jobs",
  });

  const now = new Date().toISOString();

  const { data: jobs, error } = await admin
    .from("storage_deletion_jobs")
    .select("id,bucket,object_path,attempt_count")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", now)
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[PROCESS-STORAGE-DELETION-JOBS] Fetch failed", error);
    await recordCronJobResult(admin, startedAt, "failed", {}, error.message);
    return json(500, { error: "job_fetch_failed" });
  }

  const results = {
    fetched: jobs?.length ?? 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
  };

  for (const job of (jobs ?? []) as StorageDeletionJob[]) {
    const { data: claimed, error: claimError } = await admin
      .from("storage_deletion_jobs")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .in("status", ["pending", "failed"])
      .select("id")
      .maybeSingle();

    if (claimError || !claimed) {
      continue;
    }

    results.processed++;
    const { error: removeError } = await admin.storage
      .from(job.bucket)
      .remove([job.object_path]);

    if (removeError && !isNotFoundStorageError(removeError)) {
      results.failed++;
      console.error("[PROCESS-STORAGE-DELETION-JOBS] Remove failed", {
        job_id: job.id,
        bucket: job.bucket,
        error: removeError.message,
      });
      await markJob(admin, job, "failed", removeError.message);
    } else {
      results.succeeded++;
      await markJob(admin, job, "succeeded");
    }
  }

  await recordCronJobResult(admin, startedAt, "succeeded", results);

  return json(200, results);
});
