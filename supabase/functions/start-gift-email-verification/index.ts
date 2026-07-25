// start-gift-email-verification - sends a one-time code to the gifted email
// when the signed-in claimant uses a different auth email.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CODE_TTL_MINUTES = 15;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "the gifted email";
  const prefix = local.slice(0, 1);
  return `${prefix}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    if (!code || !token) return json({ error: "code_and_token_required" }, 400);

    const tokenHash = await sha256Hex(token);
    const { data: gift, error: giftErr } = await supabase
      .from("gift_subscriptions")
      .select("id, gift_code, recipient_email, claim_token_hash, delivery_method, payment_status, redemption_status, redeemed, status, refunded_at, cancelled_at, manually_voided_at")
      .eq("gift_code", code)
      .maybeSingle();

    if (giftErr) return json({ error: "lookup_failed", detail: giftErr.message }, 500);
    if (!gift) return json({ success: false, reason: "invalid_token" });
    if (gift.payment_status !== "paid") return json({ success: false, reason: "not_paid" });
    if (gift.refunded_at || gift.cancelled_at || gift.manually_voided_at || ["refunded", "cancelled", "canceled", "voided"].includes(gift.status)) {
      return json({ success: false, reason: "not_claimable" });
    }
    if (gift.redemption_status === "redeemed" || gift.redeemed === true) {
      return json({ success: false, reason: "already_redeemed" });
    }
    if ((gift.delivery_method ?? "recipient_email") !== "recipient_email") {
      return json({ success: false, reason: "verification_not_required" });
    }
    if (!gift.claim_token_hash || gift.claim_token_hash !== tokenHash) {
      return json({ success: false, reason: "invalid_token" });
    }

    const recipientEmail = normalizeEmail(gift.recipient_email);
    const authEmail = normalizeEmail(user.email);
    if (!recipientEmail) return json({ success: false, reason: "invalid_input" });
    if (recipientEmail === authEmail) {
      return json({ success: true, verification_required: false });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rlKey = `gift_verify_start:${user.id}:${gift.id}:${ip}`;
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("identifier", rlKey)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) return json({ error: "rate_limited" }, 429);
    await supabase.from("rate_limits").insert({
      identifier: rlKey,
      action: "gift_email_verification_start",
      window_start: new Date().toISOString(),
    });

    const verificationId = crypto.randomUUID();
    const verificationCode = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    const codeHash = await sha256Hex(`${verificationId}:${user.id}:${gift.id}:${verificationCode}`);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
    const ipHash = await sha256Hex(ip);
    const uaHash = await sha256Hex(req.headers.get("user-agent") ?? "unknown");

    const { data: verificationStart, error: verificationErr } = await supabase.rpc("start_gift_email_verification", {
      _verification_id: verificationId,
      _gift_subscription_id: gift.id,
      _claiming_user_id: user.id,
      _recipient_email: recipientEmail,
      _claim_token_hash: tokenHash,
      _code_hash: codeHash,
      _expires_at: expiresAt,
      _request_ip_hash: ipHash,
      _user_agent_hash: uaHash,
    });

    if (verificationErr) {
      return json({ error: "verification_create_failed", detail: verificationErr.message }, 500);
    }

    if (verificationStart?.success === false) {
      return json({ success: false, reason: verificationStart.reason || "verification_create_failed" }, 409);
    }

    const cancelVerification = async () => {
      await supabase
        .from("gift_email_verifications")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", verificationId);
      await supabase
        .from("gift_subscriptions")
        .update({ claim_status: "verification_required", updated_at: new Date().toISOString() })
        .eq("id", gift.id);
    };

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      await cancelVerification();
      return json({ error: "missing_resend_key" }, 500);
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#1f2937;">Verify your Asset Safe gift email</h2>
        <p style="color:#374151; line-height:1.6;">
          Someone is signed in to Asset Safe as <strong>${escapeHtml(authEmail)}</strong> and is trying to redeem the gift reserved for <strong>${escapeHtml(recipientEmail)}</strong>.
        </p>
        <p style="color:#374151; line-height:1.6;">Enter this code to apply the gift to that signed-in account:</p>
        <p style="font-size:32px; font-weight:700; letter-spacing:6px; color:#1e40af; margin:24px 0;">${verificationCode}</p>
        <p style="color:#6b7280; font-size:13px; line-height:1.5;">This code expires in ${CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `;
    const text = `Verify your Asset Safe gift email

Someone is signed in to Asset Safe as ${authEmail} and is trying to redeem the gift reserved for ${recipientEmail}.

Enter this code to apply the gift to that signed-in account:

${verificationCode}

This code expires in ${CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Asset Safe <noreply@assetsafe.net>",
        to: [recipientEmail],
        subject: "Verify your Asset Safe gift email",
        html,
        text,
      }),
    });

    if (!emailRes.ok) {
      const detail = await emailRes.text().catch(() => "");
      await cancelVerification();
      return json({ error: "email_send_failed", detail: detail.slice(0, 300) }, 502);
    }

    return json({
      success: true,
      verification_required: true,
      verification_id: verificationId,
      recipient_email_masked: maskEmail(recipientEmail),
      expires_at: expiresAt,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
