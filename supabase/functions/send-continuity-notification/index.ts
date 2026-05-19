import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Compatible with the project's Resend setup (assetsafe.net sender domain).
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "Asset Safe <continuity@assetsafe.net>";

interface Body {
  emailType:
    | "request_submitted"
    | "under_review"
    | "additional_docs_requested"
    | "approved_next_step"
    | "transfer_pending_execution"
    | "transfer_completed";
  requestId: string;
  recipientEmail: string;
  recipientUserId?: string | null;
  recipientRole: "owner" | "legacy_admin" | "internal_admin";
  meta?: Record<string, unknown>;
  includeDisputeLink?: boolean;
}

const SUBJECTS: Record<string, string> = {
  request_submitted: "Asset Safe Continuity Request Submitted",
  under_review: "Your Asset Safe continuity request is under review",
  additional_docs_requested: "Additional documentation requested",
  approved_next_step: "Continuity request approved for the next review step",
  transfer_pending_execution: "Continuity transfer scheduled for execution",
  transfer_completed: "Asset Safe account ownership update",
};

const BODIES: Record<string, (siteOrigin: string, disputeUrl?: string) => string> = {
  request_submitted: (_o, d) => `
    <p>A Legacy Continuity request involving your account has been submitted and is currently under review by Asset Safe. No ownership changes have occurred.</p>
    ${d ? `<p>If you do not recognize this request, you can <a href="${d}">dispute it now</a>. Asset Safe will pause the workflow while we investigate.</p>` : ""}
    <p>You may continue using your account as normal.</p>
  `,
  under_review: () => `
    <p>Asset Safe has begun reviewing the submitted Legacy Continuity request. No ownership changes have occurred. Additional verification or documentation may be required before any action is taken.</p>
  `,
  additional_docs_requested: () => `
    <p>Asset Safe is reviewing the continuity request and needs additional documentation before it can proceed. Please reply with the requested items.</p>
  `,
  approved_next_step: () => `
    <p>The continuity request has been approved for the next review step. No ownership transfer has occurred.</p>
  `,
  transfer_pending_execution: (_o, d) => `
    <p>A Legacy Continuity transfer has been approved and is scheduled for execution. If you believe this request is unauthorized, dispute it immediately.</p>
    ${d ? `<p><a href="${d}">Dispute this request</a></p>` : ""}
  `,
  transfer_completed: () => `
    <p>The Legacy Continuity workflow for this Asset Safe account has been completed. Please review your account settings, billing information, authorized users, and Legacy Continuity preferences.</p>
  `,
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json();
    if (!body?.requestId || !body?.recipientEmail || !body?.emailType) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Look up account & request
    const { data: request } = await supabase.from("account_continuity_requests").select("id, account_id").eq("id", body.requestId).maybeSingle();
    if (!request) {
      return new Response(JSON.stringify({ error: "Request not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Optional dispute token for owner emails
    let disputeUrl: string | undefined;
    let tokenExpires: string | undefined;
    if (body.includeDisputeLink && body.recipientRole === "owner" && body.recipientUserId) {
      const raw = crypto.randomUUID() + crypto.randomUUID();
      const hash = await sha256(raw);
      const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("continuity_owner_dispute_tokens").insert({
        token_hash: hash,
        request_id: body.requestId,
        account_id: request.account_id,
        owner_user_id: body.recipientUserId,
        expires_at: expires,
      });
      const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://assetsafe.net";
      disputeUrl = `${origin}/continuity/dispute?token=${encodeURIComponent(raw)}`;
      tokenExpires = expires;
    }

    const subject = SUBJECTS[body.emailType] || "Asset Safe continuity update";
    const html = `
      <div style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="font-size:18px;margin:0 0 16px;">${subject}</h2>
        ${BODIES[body.emailType]?.("", disputeUrl) || ""}
        <p style="font-size:12px;color:#777;margin-top:24px;">Asset Safe — continuity@assetsafe.net</p>
      </div>
    `;

    // Send via Resend
    let providerId: string | null = null;
    let delivery = "queued";
    if (RESEND_API_KEY) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [body.recipientEmail], subject, html }),
      });
      const j = await r.json();
      providerId = j?.id || null;
      delivery = r.ok ? "sent" : "failed";
    }

    // Record notification + audit
    await supabase.from("continuity_owner_notifications").insert({
      request_id: body.requestId,
      account_id: request.account_id,
      recipient_email: body.recipientEmail,
      recipient_user_id: body.recipientUserId || null,
      recipient_role: body.recipientRole,
      email_type: body.emailType,
      subject,
      delivery_status: delivery,
      sent_at: new Date().toISOString(),
      token_expires_at: tokenExpires || null,
      provider_message_id: providerId,
      metadata: body.meta || {},
    });
    await supabase.from("continuity_email_audit_log").insert({
      request_id: body.requestId,
      email_type: body.emailType,
      recipient_email: body.recipientEmail,
      recipient_role: body.recipientRole,
      delivery_status: delivery,
      token_expires_at: tokenExpires || null,
      provider_message_id: providerId,
    });

    return new Response(JSON.stringify({ success: true, delivery, providerId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[send-continuity-notification]", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
