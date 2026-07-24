// validate-gift-signup-email - public check used before creating a new
// recipient account from a direct gift claim link.
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

function normalizeEmail(email: unknown): string {
  return String(email ?? "").trim().toLowerCase();
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const code = String(body.code ?? "").trim().toUpperCase();
    const token = typeof body.token === "string" ? body.token : "";
    const email = normalizeEmail(body.email);

    if (!code || !token || !email) {
      return json({ success: false, reason: "invalid_input" }, 400);
    }

    const tokenHash = await sha256Hex(token);
    const { data: gift, error } = await supabase
      .from("gift_subscriptions")
      .select("recipient_email, claim_token_hash, delivery_method, payment_status, redemption_status, redeemed, status, refunded_at, cancelled_at, manually_voided_at")
      .eq("gift_code", code)
      .maybeSingle();

    if (error) return json({ success: false, reason: "lookup_failed" }, 500);
    if (!gift || gift.claim_token_hash !== tokenHash) return json({ success: false, reason: "invalid_token" });
    if ((gift.delivery_method ?? "recipient_email") !== "recipient_email") return json({ success: true, allowed: true });
    if (gift.payment_status !== "paid") return json({ success: false, reason: "not_paid" });
    if (gift.redemption_status === "redeemed" || gift.redeemed === true) return json({ success: false, reason: "already_redeemed" });
    if (gift.refunded_at || gift.cancelled_at || gift.manually_voided_at || ["refunded", "cancelled", "canceled", "voided"].includes(gift.status)) {
      return json({ success: false, reason: "not_claimable" });
    }

    const recipientEmail = normalizeEmail(gift.recipient_email);
    return json({
      success: true,
      allowed: recipientEmail === email,
      reason: recipientEmail === email ? undefined : "wrong_email",
    });
  } catch (e) {
    return json({ success: false, reason: (e as Error).message }, 500);
  }
});
