import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { isAuthorizedInternalCall, getPreferredInternalSecret, getSupabaseServiceRoleKey } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type ClosureRequest = {
  id: string;
  owner_user_id: string;
  deletion_scheduled_date: string;
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
    p_job_name: "process-account-closures",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-ACCOUNT-CLOSURES] Cron health update failed", error);
  }
}

async function invokeDeleteAccount(
  supabaseUrl: string,
  serviceKey: string,
  targetAccountId: string,
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      "x-internal-secret": getPreferredInternalSecret() ?? serviceKey,
    },
    body: JSON.stringify({ target_account_id: targetAccountId }),
  });

  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

async function hasActiveContinuityFreeze(
  admin: ReturnType<typeof createClient>,
  ownerUserId: string,
) {
  const { data: accounts, error: accountsError } = await admin
    .from("accounts")
    .select("id,account_freeze_status")
    .eq("owner_user_id", ownerUserId);

  if (accountsError) {
    throw new Error(`failed_to_check_account_freeze_state:${accountsError.message}`);
  }

  if ((accounts ?? []).some((account: { account_freeze_status?: string | null }) => account.account_freeze_status === "active")) {
    return true;
  }

  const accountIds = (accounts ?? []).map((account: { id: string }) => account.id);
  if (accountIds.length === 0) return false;

  const { count, error: freezeError } = await admin
    .from("continuity_account_freezes")
    .select("id", { count: "exact", head: true })
    .in("account_id", accountIds)
    .eq("status", "active");

  if (freezeError) {
    throw new Error(`failed_to_check_continuity_freeze:${freezeError.message}`);
  }

  return (count ?? 0) > 0;
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
  const serviceKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(50, Math.max(1, Number(body.limit ?? 10)));
  const admin = createClient(supabaseUrl, serviceKey);

  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-account-closures",
  });

  const { data: dueClosures, error: queryError } = await admin
    .from("account_closure_requests")
    .select("id,owner_user_id,deletion_scheduled_date")
    .eq("status", "scheduled")
    .eq("legal_hold", false)
    .not("owner_user_id", "is", null)
    .lte("deletion_scheduled_date", new Date().toISOString())
    .order("deletion_scheduled_date", { ascending: true })
    .limit(limit);

  if (queryError) {
    console.error("[PROCESS-ACCOUNT-CLOSURES] Query failed", queryError);
    await recordCronJobResult(admin, startedAt, "failed", { limit }, queryError.message);
    return json(500, { error: "query_failed" });
  }

  const results = {
    fetched: dueClosures?.length ?? 0,
    skipped_legal_hold: 0,
    skipped_continuity_freeze: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    failures: [] as Array<{ closure_request_id: string; status: number; error: unknown }>,
  };

  const { count: heldDueCount, error: heldCountError } = await admin
    .from("account_closure_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "scheduled")
    .eq("legal_hold", true)
    .not("owner_user_id", "is", null)
    .lte("deletion_scheduled_date", new Date().toISOString());

  if (heldCountError) {
    console.error("[PROCESS-ACCOUNT-CLOSURES] Legal hold count failed", heldCountError);
  } else {
    results.skipped_legal_hold = heldDueCount ?? 0;
  }

  for (const closure of (dueClosures ?? []) as ClosureRequest[]) {
    try {
      if (await hasActiveContinuityFreeze(admin, closure.owner_user_id)) {
        results.skipped_continuity_freeze++;
        console.log("[PROCESS-ACCOUNT-CLOSURES] Skipping closure blocked by active continuity freeze", {
          closure_request_id: closure.id,
          owner_user_id: closure.owner_user_id,
        });
        continue;
      }
    } catch (freezeError) {
      results.failed++;
      results.failures.push({
        closure_request_id: closure.id,
        status: 500,
        error: freezeError instanceof Error ? freezeError.message : String(freezeError),
      });
      console.error("[PROCESS-ACCOUNT-CLOSURES] Continuity freeze check failed", {
        closure_request_id: closure.id,
        owner_user_id: closure.owner_user_id,
        error: freezeError,
      });
      continue;
    }

    results.processed++;

    const deletionResult = await invokeDeleteAccount(
      supabaseUrl,
      serviceKey,
      closure.owner_user_id,
    );

    if (deletionResult.ok) {
      results.succeeded++;
      continue;
    }

    results.failed++;
    results.failures.push({
      closure_request_id: closure.id,
      status: deletionResult.status,
      error: deletionResult.body,
    });
    console.error("[PROCESS-ACCOUNT-CLOSURES] Delete-account invocation failed", {
      closure_request_id: closure.id,
      owner_user_id: closure.owner_user_id,
      status: deletionResult.status,
      body: deletionResult.body,
    });
  }

  const cronStatus = results.failed > 0 ? "failed" : "succeeded";
  await recordCronJobResult(
    admin,
    startedAt,
    cronStatus,
    results,
    results.failed > 0 ? "one_or_more_account_closures_failed" : null,
  );

  return json(results.failed > 0 ? 207 : 200, {
    ok: results.failed === 0,
    ...results,
  });
});
