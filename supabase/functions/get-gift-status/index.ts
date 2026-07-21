// get-gift-status - public, guest-safe gift status lookup + resend action.
// Requires (sessionId, successToken). Never exposes raw row, gift id, or Stripe IDs.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPreferredInternalSecret } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) =>
  console.log(`[GET-GIFT-STATUS] ${s}${d ? " " + JSON.stringify(d) : ""}`);

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
    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body.sessionId;
    const successToken: string | undefined = body.successToken;
    const action: string = body.action || "status";

    if (!sessionId || !successToken) {
      return new Response(JSON.stringify({ error: "sessionId and successToken required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenHash = await sha256Hex(successToken);

    if (action === "status") {
      const { data, error } = await supabase.rpc("get_gift_status_by_session_and_token", {
        _session_id: sessionId,
        _token_hash: tokenHash,
      });
      if (error) {
        log("RPC error", error);
        return new Response(JSON.stringify({ error: "lookup_failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data ?? { found: false }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "resend") {
      // Rate limit: 3 per 15 min per (sessionId, IP)
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      const rlKey = `gift_resend:${sessionId}:${ip}`;
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("rate_limits")
        .select("id", { count: "exact", head: true })
        .eq("identifier", rlKey)
        .gte("created_at", since);
      if ((count ?? 0) >= 3) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("rate_limits").insert({ identifier: rlKey, action: "gift_resend" });

      // Re-query verified pair via service role to obtain gift id
      const { data: rows, error: rowErr } = await supabase
        .from("gift_subscriptions")
        .select("id, payment_status, delivery_status, delivery_attempted_at, delivery_date")
        .eq("stripe_session_id", sessionId)
        .eq("success_token_hash", tokenHash)
        .gt("success_token_expires_at", new Date().toISOString())
        .limit(1);
      if (rowErr || !rows || rows.length === 0) {
        return new Response(JSON.stringify({ error: "not_found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const gift = rows[0];
      if (gift.payment_status !== "paid") {
        return new Response(JSON.stringify({ error: "not_paid" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (gift.delivery_date && new Date(gift.delivery_date).getTime() > Date.now()) {
        return new Response(JSON.stringify({ error: "scheduled", delivery_date: gift.delivery_date }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Stuck-recovery guard
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const eligible =
        ["not_sent", "failed"].includes(gift.delivery_status) ||
        (gift.delivery_status === "sending" && gift.delivery_attempted_at && gift.delivery_attempted_at < tenMinAgo);
      if (!eligible) {
        return new Response(JSON.stringify({ error: "in_progress" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Acquire sending lock + rotate claim token
      const newToken = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const newHash = await sha256Hex(newToken);
      let lockQuery = supabase
        .from("gift_subscriptions")
        .update({
          delivery_status: "sending",
          delivery_attempted_at: new Date().toISOString(),
          claim_token_hash: newHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gift.id)
        .eq("delivery_status", gift.delivery_status);
      if (gift.delivery_status === "sending" && gift.delivery_attempted_at) {
        lockQuery = lockQuery.eq("delivery_attempted_at", gift.delivery_attempted_at);
      }
      const { data: lockedRows, error: lockErr } = await lockQuery.select("id");
      if (lockErr || !lockedRows || lockedRows.length === 0) {
        return new Response(JSON.stringify({ error: "lock_failed" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const internalSecret = getPreferredInternalSecret() ?? serviceRoleKey;
      const sendUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-gift-email`;
      try {
        const res = await fetch(sendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": internalSecret,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ giftId: gift.id, claimToken: newToken, resend: true }),
        });
        const sendBody = await res.json().catch(() => ({}));
        if (!res.ok) {
          await supabase.from("gift_subscriptions").update({
            delivery_status: "failed",
            last_delivery_error: `send-gift-email ${res.status}: ${JSON.stringify(sendBody)}`.slice(0, 500),
            updated_at: new Date().toISOString(),
          }).eq("id", gift.id);
        }
        return new Response(JSON.stringify({ success: res.ok, send: sendBody }), {
          status: res.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (sendError) {
        const message = (sendError as Error).message;
        await supabase.from("gift_subscriptions").update({
          delivery_status: "failed",
          last_delivery_error: `send-gift-email fetch failed: ${message}`.slice(0, 500),
          updated_at: new Date().toISOString(),
        }).eq("id", gift.id);
        return new Response(JSON.stringify({ success: false, error: "delivery_failed" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "unknown_action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log("ERROR", (e as Error).message);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
