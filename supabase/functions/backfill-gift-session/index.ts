// backfill-gift-session — admin-only repair tool.
// Verifies a Stripe Checkout Session, marks gift as paid, then sends the tokenized recipient email.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userRes } = await supabase.auth.getUser(jwt);
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_app_role", { _user_id: userRes.user.id, _role: "admin" });
    if (isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "stripe_not_paid", status: session.payment_status }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rows } = await supabase
      .from("gift_subscriptions").select("*").eq("stripe_session_id", sessionId).limit(1);
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "gift_not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const gift = rows[0];

    const expiresAt = gift.expires_at ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const sub = session.subscription as any;
    const subId = typeof sub === "string" ? sub : sub?.id ?? null;

    // 1. Mark paid first (required by send-gift-email)
    await supabase.from("gift_subscriptions").update({
      payment_status: "paid",
      status: gift.status === "pending" ? "paid" : gift.status,
      paid_at: gift.paid_at ?? new Date().toISOString(),
      stripe_payment_intent_id: (session.payment_intent as string) ?? gift.stripe_payment_intent_id,
      stripe_subscription_id: subId ?? gift.stripe_subscription_id,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq("id", gift.id);

    // 2. Acquire sending lock + new token
    const newToken = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const newHash = await sha256Hex(newToken);
    const { data: locked } = await supabase.from("gift_subscriptions").update({
      delivery_status: "sending",
      delivery_attempted_at: new Date().toISOString(),
      claim_token_hash: newHash,
      updated_at: new Date().toISOString(),
    }).eq("id", gift.id).select("id");
    if (!locked || locked.length === 0) {
      return new Response(JSON.stringify({ error: "lock_failed" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Invoke send-gift-email
    const internalSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sendUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-gift-email`;
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
        Authorization: `Bearer ${internalSecret}`,
      },
      body: JSON.stringify({ giftId: gift.id, claimToken: newToken, resend: true }),
    });
    const sendBody = await res.json().catch(() => ({}));

    await supabase.from("audit_logs").insert({
      user_id: userRes.user.id,
      action: "gift_backfill",
      table_name: "gift_subscriptions",
      record_id: gift.id,
      new_values: { sessionId, send_ok: res.ok },
    });

    return new Response(JSON.stringify({ success: res.ok, send: sendBody }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
