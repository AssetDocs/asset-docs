import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StorageDeletionJob = {
  id: string;
  bucket: string;
  object_path: string;
  source: string | null;
  source_table: string | null;
  owner_user_id: string | null;
  account_id: string | null;
  deleted_account_id: string | null;
  status: "pending" | "processing" | "succeeded" | "failed";
  attempt_count: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  processing_started_at: string | null;
  completed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseLimit(req: Request) {
  const raw = new URL(req.url).searchParams.get("limit");
  const parsed = raw ? Number(raw) : 100;
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(250, Math.max(1, Math.trunc(parsed)));
}

function olderThan(value: string | null, minutes: number) {
  if (!value) return false;
  return Date.parse(value) <= Date.now() - minutes * 60 * 1000;
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
      console.error("[LIST-STORAGE-DELETION-JOBS] Access RPC failed", accessError);
      return json(500, { error: "access_check_failed" });
    }
    if (hasAccess !== true) {
      return json(403, { error: "forbidden" });
    }

    const limit = parseLimit(req);
    const statuses = ["pending", "failed", "processing"] as const;

    const { data: jobs, error: jobsError } = await admin
      .from("storage_deletion_jobs")
      .select("*")
      .in("status", statuses)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (jobsError) {
      console.error("[LIST-STORAGE-DELETION-JOBS] Query failed", jobsError);
      return json(500, { error: "query_failed" });
    }

    const { data: allJobs, error: countError } = await admin
      .from("storage_deletion_jobs")
      .select("status,created_at,processing_started_at,updated_at");

    if (countError) {
      console.error("[LIST-STORAGE-DELETION-JOBS] Count query failed", countError);
      return json(500, { error: "count_failed" });
    }

    const summary = {
      pending: 0,
      processing: 0,
      succeeded: 0,
      failed: 0,
      stuck_pending: 0,
      stuck_processing: 0,
      stuck_failed: 0,
    };

    for (const row of (allJobs ?? []) as Array<{
      status: keyof typeof summary;
      created_at: string | null;
      processing_started_at: string | null;
      updated_at: string | null;
    }>) {
      if (row.status in summary) summary[row.status] += 1;
      if (row.status === "pending" && olderThan(row.created_at, 60)) summary.stuck_pending += 1;
      if (row.status === "processing" && olderThan(row.processing_started_at, 15)) summary.stuck_processing += 1;
      if (row.status === "failed" && olderThan(row.updated_at, 120)) summary.stuck_failed += 1;
    }

    const items = ((jobs ?? []) as StorageDeletionJob[]).map((job) => {
      const stuckPending = job.status === "pending" && olderThan(job.created_at, 60);
      const stuckProcessing = job.status === "processing" && olderThan(job.processing_started_at, 15);
      const stuckFailed = job.status === "failed" && olderThan(job.updated_at, 120);

      return {
        id: job.id,
        bucket: job.bucket,
        object_path: job.object_path,
        source: job.source,
        source_table: job.source_table,
        owner_user_id: job.owner_user_id,
        account_id: job.account_id,
        deleted_account_id: job.deleted_account_id,
        status: job.status,
        attempt_count: job.attempt_count,
        last_attempt_at: job.last_attempt_at,
        next_attempt_at: job.next_attempt_at,
        processing_started_at: job.processing_started_at,
        completed_at: job.completed_at,
        created_at: job.created_at,
        updated_at: job.updated_at,
        has_error: !!job.last_error,
        last_error: redactError(job.last_error),
        is_stuck: stuckPending || stuckProcessing || stuckFailed,
      };
    });

    return json(200, {
      summary,
      thresholds: {
        stuck_pending_minutes: 60,
        stuck_processing_minutes: 15,
        stuck_failed_minutes: 120,
      },
      items,
    });
  } catch (error) {
    console.error("[LIST-STORAGE-DELETION-JOBS] Unhandled", error);
    return json(500, { error: "internal_error" });
  }
});
