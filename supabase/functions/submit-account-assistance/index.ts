// Public intake for External Account Assistance
// Anyone (no auth) can submit a request. Uses service-role client so we can
// always log audit events and queue owner notifications without exposing any
// information about whether an account exists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Asset Safe <continuity@assetsafe.net>";

const RELATIONSHIPS = ["spouse","child","parent","sibling","executor","caregiver","attorney","friend","other"];
const REASONS = ["billing","closure_inquiry","deceased","incapacitated","continuity_support","memorialization","export_inquiry","unsure"];

function clean(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

async function sendOwnerEmail(toEmail: string, requestId: string) {
  if (!RESEND_API_KEY) return { skipped: true };
  const subject = "Asset Safe Account Assistance Inquiry Received";
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="color:#0c2340">Account Assistance Inquiry Received</h2>
      <p>Asset Safe received a continuity or account assistance inquiry that may relate to your account. <strong>No account changes have been made.</strong></p>
      <p>Our team will manually review this request before any action is considered. If you did not expect this inquiry, please let us know.</p>
      <div style="margin:24px 0">
        <a href="https://www.getassetsafe.com/account" style="background:#0c2340;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;margin-right:8px">View Security Notice</a>
        <a href="https://www.getassetsafe.com/contact" style="background:#fff;color:#0c2340;border:1px solid #0c2340;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Contact Support</a>
      </div>
      <p style="color:#666;font-size:12px">Reference: ${requestId}</p>
    </div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [toEmail], subject, html, text: `Asset Safe received an account assistance inquiry that may relate to your account. No changes have been made. Reference: ${requestId}` }),
  });
  return { ok: r.ok, status: r.status };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const requester_name = clean(body.requester_name, 200);
    const requester_email = clean(body.requester_email, 320);
    const requester_phone = clean(body.requester_phone, 60);
    const requester_relationship = clean(body.requester_relationship, 40);
    const account_holder_name = clean(body.account_holder_name, 200);
    const account_holder_email = clean(body.account_holder_email, 320);
    const account_holder_phone = clean(body.account_holder_phone, 60);
    const account_holder_other_info = clean(body.account_holder_other_info, 2000);
    const reason_for_contact = clean(body.reason_for_contact, 40);
    const explanation = clean(body.explanation, 5000);
    const acknowledgements = body.acknowledgements ?? {};
    const documents: Array<{ file_name: string; file_path: string; file_type?: string; file_size?: number; document_category?: string }> = Array.isArray(body.documents) ? body.documents : [];

    if (!requester_name || !requester_email || !requester_relationship || !account_holder_name || !reason_for_contact || !explanation) {
      return new Response(JSON.stringify({ error: "missing_required_fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requester_email)) {
      return new Response(JSON.stringify({ error: "invalid_email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!RELATIONSHIPS.includes(requester_relationship)) {
      return new Response(JSON.stringify({ error: "invalid_relationship" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!REASONS.includes(reason_for_contact)) {
      return new Response(JSON.stringify({ error: "invalid_reason" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const required = ["manual_review","no_access_granted","no_confirmation","accurate"];
    for (const k of required) {
      if (acknowledgements[k] !== true) {
        return new Response(JSON.stringify({ error: "missing_acknowledgements" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Light risk heuristic
    const risk_level = ["deceased","incapacitated"].includes(reason_for_contact) ? "moderate" : "low";

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
    const ua = req.headers.get("user-agent") || null;

    const { data: inserted, error: insertErr } = await supa
      .from("external_account_assistance_requests")
      .insert({
        requester_name, requester_email, requester_phone,
        requester_relationship,
        account_holder_name, account_holder_email, account_holder_phone, account_holder_other_info,
        reason_for_contact, explanation,
        risk_level, status: "submitted",
        acknowledgements,
        ip_address: ip, user_agent: ua,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("insert error", insertErr);
      return new Response(JSON.stringify({ error: "submission_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const requestId = inserted.id;

    // Attach uploaded docs (already uploaded client-side to submission/<temp>/)
    if (documents.length) {
      const rows = documents.slice(0, 10).map((d) => ({
        request_id: requestId,
        file_name: clean(d.file_name, 255) || "document",
        file_path: clean(d.file_path, 500) || "",
        file_size: typeof d.file_size === "number" ? d.file_size : null,
        file_type: clean(d.file_type, 100),
        document_category: clean(d.document_category, 100),
      })).filter((d) => d.file_path);
      if (rows.length) {
        await supa.from("external_assistance_documents").insert(rows);
      }
    }

    // Audit: submission
    await supa.from("external_assistance_audit_logs").insert({
      request_id: requestId,
      actor_type: "public_requester",
      action_type: "external_assistance_submitted",
      action_details: { reason_for_contact, relationship: requester_relationship, document_count: documents.length },
      ip_address: ip,
      device_info: ua,
    });

    // Internal-only owner notification: try to match an account by email.
    // We never reveal anything to the requester about what we found.
    if (account_holder_email) {
      const { data: prof } = await supa
        .from("profiles")
        .select("user_id")
        .ilike("email", account_holder_email)
        .maybeSingle();
      if (prof?.user_id) {
        const sendResult = await sendOwnerEmail(account_holder_email, requestId);
        await supa.from("external_assistance_notifications").insert({
          request_id: requestId,
          recipient_type: "owner",
          recipient_email: account_holder_email,
          notification_type: "owner_inquiry_alert",
          delivery_status: sendResult?.ok ? "sent" : sendResult?.skipped ? "skipped" : "failed",
        });
        await supa.from("external_assistance_audit_logs").insert({
          request_id: requestId,
          actor_type: "system",
          action_type: "owner_notified",
          action_details: { matched_user_id: prof.user_id, delivery: sendResult },
        });
        await supa.from("external_assistance_account_matches").insert({
          request_id: requestId,
          matched_user_id: prof.user_id,
          match_confidence: "email_exact",
          match_method: "auto_email_lookup",
        });
      }
    }

    return new Response(JSON.stringify({ success: true, reference: requestId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-account-assistance error", e);
    return new Response(JSON.stringify({ error: "unexpected_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
