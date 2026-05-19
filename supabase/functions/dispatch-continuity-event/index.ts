// Server-side dispatcher for Legacy Continuity notifications.
// Resolves recipients (owner / legacy admin / internal admins), enforces
// idempotency via continuity_email_audit_log, creates owner dispute tokens,
// sends emails through Resend, and records every attempt (including failures).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "Asset Safe <continuity@assetsafe.net>";
const SITE_ORIGIN = Deno.env.get("PUBLIC_SITE_URL") || "https://assetsafe.net";
const INTERNAL_FALLBACK = "support@assetsafe.net";

type Event =
  | "request_submitted"
  | "under_review"
  | "additional_docs_requested"
  | "owner_disputed"
  | "freeze_applied"
  | "approved_next_step"
  | "transfer_pending_execution"
  | "transfer_completed"
  | "denied";

type Role = "owner" | "legacy_admin" | "internal_admin" | "new_owner" | "previous_owner";

interface Body {
  requestId: string;
  event: Event;
  meta?: Record<string, unknown>;
}

const SUBJECT: Record<Event, string> = {
  request_submitted: "A Legacy Continuity request has been submitted for review",
  under_review: "A Legacy Continuity request is now under review",
  additional_docs_requested: "Additional documentation requested for a Legacy Continuity case",
  owner_disputed: "Your dispute has been recorded — Asset Safe has paused the workflow",
  freeze_applied: "An account freeze has been applied to your Asset Safe account",
  approved_next_step: "Legacy Continuity request approved for the next review step",
  transfer_pending_execution: "Legacy Continuity transfer scheduled — action available",
  transfer_completed: "Asset Safe account ownership update",
  denied: "Legacy Continuity request denied",
};

function body(event: Event, role: Role, ctx: { disputeUrl?: string; scheduledAt?: string; meta?: any }) {
  const cta = ctx.disputeUrl
    ? `<p style="margin:16px 0;"><a href="${ctx.disputeUrl}" style="background:#0f172a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Dispute this request</a></p>`
    : "";
  const scheduled = ctx.scheduledAt
    ? `<p><strong>Scheduled execution:</strong> ${new Date(ctx.scheduledAt).toLocaleString()}</p>`
    : "";

  switch (event) {
    case "request_submitted":
      if (role === "owner")
        return `<p>A Legacy Continuity request has been submitted for review on your Asset Safe account. <strong>No ownership transfer has occurred.</strong> Asset Safe will manually review this request before any action is taken.</p>
        <p>What stays the same: your account, billing, vault, and authorized users remain fully under your control.</p>
        <p>If you do not recognize this request, dispute it immediately. Asset Safe will pause the workflow while we investigate.</p>${cta}`;
      if (role === "legacy_admin")
        return `<p>Your Legacy Continuity request has been received and submitted for manual review by Asset Safe. <strong>No ownership transfer has occurred.</strong> A reviewer will follow up if additional information is needed.</p>`;
      return `<p>A new Legacy Continuity request requires triage.</p>`;
    case "under_review":
      if (role === "owner")
        return `<p>Asset Safe has begun reviewing a Legacy Continuity request related to your account. <strong>No ownership transfer has occurred.</strong> You may continue using your account normally.</p>${cta}`;
      if (role === "legacy_admin")
        return `<p>Your Legacy Continuity request is now under active review. We will reach out if we need additional documentation.</p>`;
      return `<p>Case moved to Under Review.</p>`;
    case "additional_docs_requested":
      if (role === "legacy_admin")
        return `<p>Asset Safe is reviewing your continuity request and needs additional supporting documentation before it can proceed. Please reply to this email with the requested items.</p>`;
      if (role === "owner")
        return `<p>Asset Safe has requested additional documentation from the requester for a Legacy Continuity case related to your account. <strong>No ownership transfer has occurred.</strong></p>${cta}`;
      return `<p>Additional documents have been requested.</p>`;
    case "owner_disputed":
      if (role === "owner")
        return `<p>We have recorded your dispute. The Legacy Continuity workflow on your account has been <strong>paused immediately</strong>. An Asset Safe reviewer will investigate and follow up.</p>
        <p>No ownership changes will occur while a dispute is in progress.</p>`;
      return `<p>The account owner has disputed this continuity request. Execution is now blocked. Please review the case in the Owner & Risk tab.</p>`;
    case "freeze_applied":
      if (role === "owner")
        return `<p>Asset Safe has applied an account freeze in connection with a Legacy Continuity case. Sensitive account changes will be restricted while the freeze is in effect.</p>
        <p>If you did not expect this, please reply to this email or contact support.</p>${cta}`;
      return `<p>Account freeze applied. Execution is blocked while the freeze is active.</p>`;
    case "approved_next_step":
      if (role === "owner")
        return `<p>A Legacy Continuity case on your account has been approved for the next review step. <strong>No ownership transfer has occurred.</strong> Asset Safe will contact you if any further action is required from you.</p>${cta}`;
      if (role === "legacy_admin")
        return `<p>The continuity case has been approved for the next review step. <strong>No ownership transfer has occurred.</strong> Asset Safe will communicate the next steps separately.</p>`;
      return `<p>Case approved for the next step.</p>`;
    case "transfer_pending_execution":
      if (role === "owner")
        return `<p>A Legacy Continuity transfer related to your account has been approved and is scheduled for execution.</p>${scheduled}
        <p><strong>You can still stop this transfer.</strong> If you believe this request is unauthorized, dispute it immediately and Asset Safe will pause the workflow.</p>${cta}`;
      if (role === "legacy_admin")
        return `<p>The continuity transfer is scheduled and is awaiting the end of the waiting/challenge period before execution.</p>${scheduled}`;
      return `<p>Transfer entered waiting/challenge period.</p>${scheduled}`;
    case "transfer_completed":
      if (role === "new_owner")
        return `<p>The Legacy Continuity transfer is complete. You are now the account holder for this Asset Safe account. Please review billing, authorized users, and Legacy Continuity preferences at your earliest convenience.</p>`;
      if (role === "previous_owner" || role === "owner")
        return `<p>The Legacy Continuity workflow for this Asset Safe account has been completed. The account is no longer under the prior ownership configuration.</p>`;
      return `<p>Transfer completed and recorded in the audit log.</p>`;
    case "denied":
      if (role === "legacy_admin")
        return `<p>After review, Asset Safe was unable to approve your Legacy Continuity request at this time. Please contact us if you have additional information.</p>`;
      if (role === "owner")
        return `<p>A Legacy Continuity request related to your account was denied. No changes have been made to your account.</p>`;
      return `<p>Case denied.</p>`;
  }
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { requestId, event, meta }: Body = await req.json();
    if (!requestId || !event) {
      return new Response(JSON.stringify({ error: "Missing requestId or event" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Load case + account + legacy admin
    const { data: caseRow, error: caseErr } = await supabase
      .from("account_continuity_requests")
      .select("id, account_id, requested_by_user_id, contact_email, scheduled_execution_at, risk_level")
      .eq("id", requestId)
      .maybeSingle();
    if (caseErr || !caseRow) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("id, owner_user_id, account_name")
      .eq("id", caseRow.account_id)
      .maybeSingle();

    // Resolve owner email
    let ownerEmail: string | null = null;
    let ownerUserId: string | null = account?.owner_user_id ?? null;
    if (ownerUserId) {
      const { data: au } = await supabase.auth.admin.getUserById(ownerUserId);
      ownerEmail = au?.user?.email ?? null;
    }

    // Resolve legacy admin (requester) email
    let legacyAdminEmail: string | null = caseRow.contact_email || null;
    let legacyAdminUserId: string | null = caseRow.requested_by_user_id ?? null;
    if (legacyAdminUserId && !legacyAdminEmail) {
      const { data: la } = await supabase.auth.admin.getUserById(legacyAdminUserId);
      legacyAdminEmail = la?.user?.email ?? null;
    }

    // Resolve internal admins (owner + admin roles)
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["owner", "admin"]);
    const internalAdminEmails: string[] = [];
    for (const r of adminRoles || []) {
      const { data: u } = await supabase.auth.admin.getUserById((r as any).user_id);
      if (u?.user?.email) internalAdminEmails.push(u.user.email);
    }
    if (internalAdminEmails.length === 0) internalAdminEmails.push(INTERNAL_FALLBACK);

    // Decide recipients per event
    type R = { email: string; role: Role; userId?: string | null; includeDispute?: boolean };
    const recipients: R[] = [];
    const ownerR = (includeDispute = true) =>
      ownerEmail && recipients.push({ email: ownerEmail, role: "owner", userId: ownerUserId, includeDispute });
    const legacyR = () =>
      legacyAdminEmail && recipients.push({ email: legacyAdminEmail, role: "legacy_admin", userId: legacyAdminUserId });
    const adminsR = () =>
      internalAdminEmails.forEach((e) => recipients.push({ email: e, role: "internal_admin" }));

    switch (event) {
      case "request_submitted": ownerR(true); legacyR(); break;
      case "under_review": ownerR(true); legacyR(); break;
      case "additional_docs_requested":
        legacyR();
        if (caseRow.risk_level === "elevated" || caseRow.risk_level === "critical" || (meta as any)?.disputed) ownerR(true);
        break;
      case "owner_disputed": ownerR(false); adminsR(); break;
      case "freeze_applied": ownerR(true); adminsR(); break;
      case "approved_next_step": ownerR(true); legacyR(); break;
      case "transfer_pending_execution": ownerR(true); legacyR(); break;
      case "transfer_completed":
        if (legacyAdminEmail) recipients.push({ email: legacyAdminEmail, role: "new_owner", userId: legacyAdminUserId });
        if (ownerEmail) recipients.push({ email: ownerEmail, role: "previous_owner", userId: ownerUserId });
        adminsR();
        break;
      case "denied":
        legacyR();
        ownerR(true);
        break;
    }

    const results: any[] = [];
    for (const r of recipients) {
      // Idempotency check via audit log unique index (request_id, email_type, recipient_email)
      const { data: existing } = await supabase
        .from("continuity_email_audit_log")
        .select("id, delivery_status")
        .eq("request_id", requestId)
        .eq("email_type", event)
        .eq("recipient_email", r.email)
        .maybeSingle();
      if (existing && existing.delivery_status === "sent") {
        results.push({ to: r.email, skipped: "already_sent" });
        continue;
      }

      // Optional owner dispute token
      let disputeUrl: string | undefined;
      let tokenExpires: string | undefined;
      if (r.role === "owner" && r.includeDispute && r.userId) {
        const raw = crypto.randomUUID() + crypto.randomUUID();
        const hash = await sha256(raw);
        tokenExpires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("continuity_owner_dispute_tokens").insert({
          token_hash: hash,
          request_id: requestId,
          account_id: caseRow.account_id,
          owner_user_id: r.userId,
          expires_at: tokenExpires,
        });
        disputeUrl = `${SITE_ORIGIN}/continuity/dispute?token=${encodeURIComponent(raw)}`;
      }

      const subject = SUBJECT[event];
      const html = `
        <div style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="font-size:18px;margin:0 0 16px;">${subject}</h2>
          ${body(event, r.role, { disputeUrl, scheduledAt: caseRow.scheduled_execution_at as any, meta })}
          <p style="font-size:12px;color:#777;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
            Asset Safe — continuity@assetsafe.net<br/>
            ${account?.account_name ? `Account: ${account.account_name}<br/>` : ""}
            Reference: ${requestId.slice(0, 8)}
          </p>
        </div>
      `;

      let providerId: string | null = null;
      let delivery: "sent" | "failed" | "queued" = "queued";
      let errorMessage: string | null = null;
      if (RESEND_API_KEY) {
        try {
          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: FROM, to: [r.email], subject, html }),
          });
          const j = await resp.json().catch(() => ({}));
          providerId = j?.id ?? null;
          delivery = resp.ok ? "sent" : "failed";
          if (!resp.ok) errorMessage = j?.message || `HTTP ${resp.status}`;
        } catch (e) {
          delivery = "failed";
          errorMessage = e instanceof Error ? e.message : String(e);
        }
      }

      // Always log to owner_notifications and audit log
      const meta2 = { ...(meta || {}), error: errorMessage || undefined };
      await supabase.from("continuity_owner_notifications").insert({
        request_id: requestId,
        account_id: caseRow.account_id,
        recipient_email: r.email,
        recipient_user_id: r.userId ?? null,
        recipient_role: r.role,
        email_type: event,
        subject,
        delivery_status: delivery,
        sent_at: new Date().toISOString(),
        token_expires_at: tokenExpires ?? null,
        provider_message_id: providerId,
        metadata: meta2,
      });
      // Audit log uses unique index for idempotency. Upsert so retries update the
      // delivery_status (e.g., failed -> sent) without violating the unique key.
      await supabase
        .from("continuity_email_audit_log")
        .upsert(
          {
            request_id: requestId,
            email_type: event,
            recipient_email: r.email,
            recipient_role: r.role,
            delivery_status: delivery,
            token_expires_at: tokenExpires ?? null,
            provider_message_id: providerId,
            metadata: meta2,
          },
          { onConflict: "request_id,email_type,recipient_email" }
        );

      results.push({ to: r.email, role: r.role, delivery, providerId, error: errorMessage });
    }

    return new Response(JSON.stringify({ success: true, event, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[dispatch-continuity-event]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
