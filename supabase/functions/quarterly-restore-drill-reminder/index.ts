import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { isAuthorizedInternalCall, getSupabaseServiceRoleKey } from "../_shared/internalSecret.ts";

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
    p_job_name: "quarterly-restore-drill-reminder",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[RESTORE-DRILL-REMINDER] Cron health update failed", error);
  }
}

function parseRecipients(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function daysSince(dateText: string | null | undefined) {
  if (!dateText) return null;
  const timestamp = new Date(dateText).getTime();
  if (Number.isNaN(timestamp)) return null;
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
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
  const dryRun = body.dry_run === true;
  const force = body.force === true;
  const dueAfterDays = Math.min(370, Math.max(1, Number(body.due_after_days ?? 90)));

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  await admin.rpc("record_cron_job_started", {
    p_job_name: "quarterly-restore-drill-reminder",
  });

  try {
    const { data: latestPassed, error: passedError } = await admin
      .from("restore_drill_runs")
      .select("id, completed_at, rpo_minutes, rto_minutes, findings")
      .eq("status", "passed")
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (passedError) throw passedError;

    const { data: openDrills, error: openError } = await admin
      .from("restore_drill_runs")
      .select("id, status, environment, drill_type, started_at, created_at")
      .in("status", ["planned", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (openError) throw openError;

    const daysSincePassed = daysSince(latestPassed?.completed_at);
    const due = force || daysSincePassed === null || daysSincePassed >= dueAfterDays;
    const result = {
      due,
      dry_run: dryRun,
      force,
      due_after_days: dueAfterDays,
      days_since_last_passed_drill: daysSincePassed,
      open_drill_count: openDrills?.length ?? 0,
      latest_passed_drill_id: latestPassed?.id ?? null,
    };

    if (!due) {
      await recordCronJobResult(admin, startedAt, "succeeded", result);
      return json(200, { status: "not_due", ...result });
    }

    const recipients = parseRecipients(Deno.env.get("RESTORE_DRILL_REMINDER_EMAILS") ?? Deno.env.get("ADMIN_BACKLOG_EMAILS"));
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (dryRun) {
      await recordCronJobResult(admin, startedAt, "succeeded", { ...result, email_status: "dry_run" });
      return json(200, { status: "dry_run_due", ...result });
    }

    if (recipients.length === 0) {
      await recordCronJobResult(admin, startedAt, "failed", result, "no_reminder_recipients");
      return json(200, { status: "no_recipients", ...result });
    }

    if (!resendKey) {
      await recordCronJobResult(admin, startedAt, "failed", result, "no_resend_key");
      return json(200, { status: "no_resend_key", ...result });
    }

    const latestText = latestPassed?.completed_at
      ? `${new Date(latestPassed.completed_at).toISOString()} (${daysSincePassed} days ago)`
      : "No passed restore drill is recorded.";
    const openItems = (openDrills ?? [])
      .map((drill) => `<li><code>${drill.id}</code> - ${drill.status} ${drill.drill_type} (${drill.environment})</li>`)
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
        <h2>Asset Safe - Restore drill due</h2>
        <p>A quarterly backup/restore drill is due for production operations.</p>
        <p><strong>Last passed drill:</strong> ${latestText}</p>
        <p><strong>Target:</strong> PITR restore to scratch, DB RPO <= 5 minutes, DB RTO <= 4 hours.</p>
        ${openItems ? `<h3>Open drill records</h3><ul>${openItems}</ul>` : ""}
        <p>Runbook: <code>docs/AssetSafe_Backup_Restore_Runbook.md</code></p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Asset Safe Ops <noreply@assetsafe.net>",
        to: recipients,
        subject: "Asset Safe - quarterly restore drill due",
        html,
      }),
    });

    const emailStatus = res.ok ? "sent" : "send_failed";
    const response = { status: emailStatus, ...result };

    await recordCronJobResult(
      admin,
      startedAt,
      res.ok ? "succeeded" : "failed",
      response,
      res.ok ? null : `resend_http_${res.status}`,
    );

    return json(res.ok ? 200 : 502, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[RESTORE-DRILL-REMINDER] ERROR", message);
    await recordCronJobResult(admin, startedAt, "failed", {}, message);
    return json(500, { error: "restore_drill_reminder_failed" });
  }
});
