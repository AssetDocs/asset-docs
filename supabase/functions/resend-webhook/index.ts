// Resend webhook receiver -> public.email_deliverability_events
// Verifies Svix signature when RESEND_WEBHOOK_SECRET is set, otherwise
// accepts events (useful while wiring up the webhook in Resend for the
// first time). Stores hash + domain of recipient, never plaintext.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { Webhook } from "npm:svix@1.40.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TRACKED_EVENT_TYPES = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.opened",
  "email.clicked",
]);

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function pickRecipient(payload: any): string | null {
  const to = payload?.data?.to ?? payload?.to;
  if (!to) return null;
  if (Array.isArray(to)) return typeof to[0] === "string" ? to[0] : null;
  return typeof to === "string" ? to : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const rawBody = await req.text();
  let event: any;

  // Verify signature when secret is configured; otherwise just parse.
  if (WEBHOOK_SECRET) {
    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      event = wh.verify(rawBody, {
        "svix-id": req.headers.get("svix-id") ?? "",
        "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
        "svix-signature": req.headers.get("svix-signature") ?? "",
      });
    } catch (err) {
      console.error("resend-webhook: signature verification failed", err);
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } else {
    console.warn("resend-webhook: RESEND_WEBHOOK_SECRET not set — accepting unverified event");
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "invalid json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const eventType: string = event?.type ?? "unknown";
  if (!TRACKED_EVENT_TYPES.has(eventType)) {
    // Acknowledge unknown types so Resend stops retrying.
    return new Response(JSON.stringify({ ok: true, skipped: eventType }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const data = event?.data ?? {};
  const recipient = pickRecipient(event);
  const recipient_email_hash = recipient ? await sha256Hex(recipient) : null;
  const recipient_domain = recipient && recipient.includes("@")
    ? recipient.split("@")[1].toLowerCase()
    : null;

  const occurredAtRaw = event?.created_at ?? data?.created_at;
  const occurred_at = occurredAtRaw ? new Date(occurredAtRaw).toISOString() : new Date().toISOString();

  const providerEventId =
    req.headers.get("svix-id") ?? event?.id ?? data?.id ?? null;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("email_deliverability_events")
    .upsert(
      {
        provider: "resend",
        provider_event_id: providerEventId,
        provider_message_id: data?.email_id ?? data?.id ?? null,
        event_type: eventType,
        email_stream: data?.tags?.stream ?? data?.tags?.category ?? null,
        recipient_email_hash,
        recipient_domain,
        from_email: data?.from ?? null,
        subject: data?.subject ?? null,
        occurred_at,
        raw_payload: event,
      },
      { onConflict: "provider,provider_event_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("resend-webhook: insert failed", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, event_type: eventType }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
