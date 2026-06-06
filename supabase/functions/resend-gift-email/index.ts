// resend-gift-email — authenticated resend for purchaser or admin.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const token = authHeader.replace("Bearer ", "");
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userRes.user;
    const { data: isAdmin } = await supabase.rpc("has_app_role", { _user_id: user.id, _role: "admin" });

    const body = await req.json().catch(() => ({}));
    const giftId: string | undefined = body.giftId;
    if (!giftId) {
      return new Response(JSON.stringify({ error: "giftId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: 5/15min per user
    const rlKey = `gift_resend_auth:${user.id}`;
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("identifier", rlKey)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await supabase.from("rate_limits").insert({ identifier: rlKey, action: "gift_resend_auth" });

    const { data: rows, error: rowErr } = await supabase
      .from("gift_subscriptions").select("*").eq("id", giftId).limit(1);
    if (rowErr || !rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const gift = rows[0];

    const matchesPurchaser =
      gift.purchaser_user_id === user.id ||
      (gift.purchaser_email && user.email && gift.purchaser_email.toLowerCase() === user.email.toLowerCase());
    if (!isAdmin && !matchesPurchaser) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (gift.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "not_paid" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const eligible =
      ["not_sent", "failed"].includes(gift.delivery_status) ||
      (gift.delivery_status === "sending" && gift.delivery_attempted_at && gift.delivery_attempted_at < tenMinAgo);
    if (!eligible) {
      return new Response(JSON.stringify({ error: "in_progress" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newToken = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const newHash = await sha256Hex(newToken);
    const { data: locked, error: lockErr } = await supabase
      .from("gift_subscriptions")
      .update({
        delivery_status: "sending",
        delivery_attempted_at: new Date().toISOString(),
        claim_token_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gift.id)
      .in("delivery_status", ["not_sent", "failed", "sending"])
      .select("id");
    if (lockErr || !locked || locked.length === 0) {
      return new Response(JSON.stringify({ error: "lock_failed" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      user_id: user.id,
      action: "gift_email_resent",
      table_name: "gift_subscriptions",
      record_id: gift.id,
      new_values: { actor_role: isAdmin ? "admin" : "purchaser", success: res.ok },
    });

    return new Response(JSON.stringify({ success: res.ok, send: sendBody }), {
      status: res.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
