import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[NOTIFY-MANUAL-REVIEW-BACKLOG] ${step}`, details === undefined ? "" : JSON.stringify(details));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const cutoffOldBacklog = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const cutoffStuckProcessing = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: manualReview, error: e1 } = await supabaseAdmin
      .from("checkout_fulfillments")
      .select("id, stripe_session_id, email, plan_lookup_key, manual_review_reason, created_at, status")
      .in("status", ["manual_review", "fulfilled_email_failed"])
      .lt("created_at", cutoffOldBacklog)
      .order("created_at", { ascending: true })
      .limit(100);
    if (e1) throw e1;

    const { data: stuckProcessing, error: e2 } = await supabaseAdmin
      .from("checkout_fulfillments")
      .select("id, stripe_session_id, email, plan_lookup_key, processing_started_at")
      .eq("status", "processing")
      .lt("processing_started_at", cutoffStuckProcessing)
      .lt("created_at", cutoffOldBacklog)
      .order("processing_started_at", { ascending: true })
      .limit(100);
    if (e2) throw e2;

    const { data: anomalies } = await supabaseAdmin
      .from("admin_fulfillment_overrides")
      .select("id, created_at, stripe_session_id, stripe_email, override_user_email, override_reason")
      .eq("outcome", "fulfilled_with_email_mismatch")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    const totalIssues =
      (manualReview?.length ?? 0) + (stuckProcessing?.length ?? 0) + (anomalies?.length ?? 0);

    log("Backlog snapshot", {
      manualReview: manualReview?.length ?? 0,
      stuckProcessing: stuckProcessing?.length ?? 0,
      anomalies: anomalies?.length ?? 0,
    });

    if (totalIssues === 0) {
      return new Response(JSON.stringify({ status: "no_backlog" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const recipients = (Deno.env.get("ADMIN_BACKLOG_EMAILS") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ status: "no_recipients", totalIssues }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ status: "no_resend_key", totalIssues }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const fmtList = (label: string, rows: any[] | null | undefined) => {
      if (!rows || rows.length === 0) return "";
      const items = rows
        .map((r) =>
          `<li><code>${r.stripe_session_id}</code> · ${r.email ?? r.stripe_email ?? ""} · ${
            r.plan_lookup_key ?? r.override_reason ?? ""
          }</li>`,
        )
        .join("");
      return `<h3>${label} (${rows.length})</h3><ul>${items}</ul>`;
    };

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
        <h2>Asset Safe — Fulfillment backlog</h2>
        <p>${totalIssues} issue(s) need attention.</p>
        ${fmtList("Manual review / email delivery failures > 24h", manualReview)}
        ${fmtList("Stuck processing > 24h", stuckProcessing)}
        ${fmtList("Email-mismatch overrides (last 24h)", anomalies)}
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
        subject: `Asset Safe — ${totalIssues} fulfillment issue(s) require review`,
        html,
      }),
    });

    return new Response(
      JSON.stringify({
        status: res.ok ? "sent" : "send_failed",
        totalIssues,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const errorId = crypto.randomUUID();
    log("ERROR", { errorId, message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: "Backlog notify failed", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
