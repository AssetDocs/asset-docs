// check-gift-deliveries — sends paid gift emails once delivery_date is due.
// Auth: x-internal-secret. Intended for scheduler use.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPreferredInternalSecret, isAuthorizedInternalCall } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isAuthorizedServiceKeyCall(req: Request): Promise<boolean> {
  const apiKey = req.headers.get("apikey");
  const authorization = req.headers.get("authorization");
  if (!apiKey || authorization !== `Bearer ${apiKey}`) return false;

  try {
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: { apikey: apiKey, Authorization: authorization },
    });
    await response.text();
    return response.ok;
  } catch {
    return false;
  }
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!isAuthorizedInternalCall(req) && !(await isAuthorizedServiceKeyCall(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const internalSecret = getPreferredInternalSecret() ?? serviceRoleKey;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceRoleKey,
    { auth: { persistSession: false } },
  );

  try {
    const now = new Date().toISOString();
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: gifts, error: queryError } = await supabase
      .from("gift_subscriptions")
      .select("id, gift_code, delivery_status, delivery_attempted_at")
      .eq("payment_status", "paid")
      .eq("redemption_status", "unredeemed")
      .lte("delivery_date", now)
      .or(`delivery_status.in.(not_sent,failed),and(delivery_status.eq.sending,delivery_attempted_at.lt.${tenMinAgo})`)
      .order("delivery_date", { ascending: true })
      .limit(50);

    if (queryError) throw queryError;

    const results: Array<Record<string, unknown>> = [];
    for (const gift of gifts ?? []) {
      const claimToken = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const claimTokenHash = await sha256Hex(claimToken);

      const { data: locked, error: lockError } = await supabase
        .from("gift_subscriptions")
        .update({
          delivery_status: "sending",
          delivery_attempted_at: new Date().toISOString(),
          claim_token_hash: claimTokenHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gift.id)
        .or(`delivery_status.in.(not_sent,failed),and(delivery_status.eq.sending,delivery_attempted_at.lt.${tenMinAgo})`)
        .select("id");

      if (lockError || !locked || locked.length === 0) {
        results.push({ gift_id: gift.id, success: false, error: lockError?.message || "lock_failed" });
        continue;
      }

      const sendUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-gift-email`;
      try {
        const res = await fetch(sendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": internalSecret,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ giftId: gift.id, claimToken }),
        });
        const sendBody = await res.json().catch(() => ({}));
        if (!res.ok) {
          await supabase.from("gift_subscriptions").update({
            delivery_status: "failed",
            last_delivery_error: `send-gift-email ${res.status}: ${JSON.stringify(sendBody)}`.slice(0, 500),
            updated_at: new Date().toISOString(),
          }).eq("id", gift.id);
        }
        results.push({ gift_id: gift.id, success: res.ok, send: sendBody });
      } catch (sendError) {
        const message = (sendError as Error).message;
        await supabase.from("gift_subscriptions").update({
          delivery_status: "failed",
          last_delivery_error: `send-gift-email fetch failed: ${message}`.slice(0, 500),
          updated_at: new Date().toISOString(),
        }).eq("id", gift.id);
        results.push({ gift_id: gift.id, success: false, error: message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: results.filter((r) => r.success === true).length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
