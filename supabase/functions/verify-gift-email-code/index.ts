// verify-gift-email-code - validates the gifted-email OTP, then redeems the gift.
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const jwt = authHeader.replace("Bearer ", "");
    const { data: userRes, error: userErr } = await supabase.auth.getUser(jwt);
    const user = userRes?.user;
    if (userErr || !user?.id || !user.email) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const code = String(body.code ?? "").trim().toUpperCase();
    const token = typeof body.token === "string" ? body.token : "";
    const verificationCode = String(body.verificationCode ?? "").replace(/\D/g, "");
    if (!code || !token || verificationCode.length !== 6) {
      return json({ success: false, reason: "invalid_verification_code" }, 400);
    }

    const tokenHash = await sha256Hex(token);
    const { data: gift, error: giftErr } = await supabase
      .from("gift_subscriptions")
      .select("id, gift_code, recipient_email, claim_token_hash, payment_status, redemption_status, redeemed")
      .eq("gift_code", code)
      .maybeSingle();

    if (giftErr) return json({ error: "lookup_failed", detail: giftErr.message }, 500);
    if (!gift || gift.claim_token_hash !== tokenHash) return json({ success: false, reason: "invalid_token" });
    if (gift.payment_status !== "paid") return json({ success: false, reason: "not_paid" });
    if (gift.redemption_status === "redeemed" || gift.redeemed === true) {
      return json({ success: false, reason: "already_redeemed" });
    }

    const { data: verification, error: verificationErr } = await supabase
      .from("gift_email_verifications")
      .select("id, code_hash, attempt_count, max_attempts, expires_at, status")
      .eq("gift_subscription_id", gift.id)
      .eq("claiming_user_id", user.id)
      .eq("claim_token_hash", tokenHash)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationErr) return json({ error: "verification_lookup_failed", detail: verificationErr.message }, 500);
    if (!verification) return json({ success: false, reason: "verification_required" });

    if (new Date(verification.expires_at).getTime() <= Date.now()) {
      await supabase
        .from("gift_email_verifications")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", verification.id);
      await supabase
        .from("gift_subscriptions")
        .update({ claim_status: "expired_verification", updated_at: new Date().toISOString() })
        .eq("id", gift.id);
      return json({ success: false, reason: "verification_expired" });
    }

    if ((verification.attempt_count ?? 0) >= (verification.max_attempts ?? 5)) {
      await supabase
        .from("gift_email_verifications")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", verification.id);
      return json({ success: false, reason: "too_many_attempts" }, 429);
    }

    const expectedHash = await sha256Hex(`${verification.id}:${user.id}:${gift.id}:${verificationCode}`);
    if (expectedHash !== verification.code_hash) {
      await supabase
        .from("gift_email_verifications")
        .update({
          attempt_count: (verification.attempt_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verification.id);
      return json({ success: false, reason: "invalid_verification_code" });
    }

    const { error: markErr } = await supabase
      .from("gift_email_verifications")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", verification.id)
      .eq("status", "pending");

    if (markErr) return json({ error: "verification_update_failed", detail: markErr.message }, 500);

    const { data, error } = await supabase.rpc("redeem_gift", {
      _code: code,
      _token_hash: tokenHash,
      _user_email: user.email,
      _user_id: user.id,
    });

    if (error) return json({ error: "redemption_failed", detail: error.message }, 500);
    return json({ ...(data ?? { success: false }), verified: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
