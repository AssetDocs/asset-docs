// send-gift-email - single writer for gift email delivery.
// Auth: x-internal-secret (SUPABASE_SERVICE_ROLE_KEY) or admin JWT.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedInternalCall } from "../_shared/internalSecret.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const log = (s: string, d?: any) =>
  console.log(`[SEND-GIFT-EMAIL] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function logoHeader(): string {
  return `
    <div style="text-align: center; padding: 30px 20px 20px;">
      <img src="https://getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
    </div>
  `;
}

function emailShell(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
      ${logoHeader()}
      <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
        ${content}
      </div>
      <div style="padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
        </p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let authorized = false;
    if (isAuthorizedInternalCall(req)) {
      authorized = true;
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const { data: hasAdmin } = await supabase.rpc("has_app_role", {
            _user_id: data.user.id,
            _role: "admin",
          });
          if (hasAdmin === true) authorized = true;
        }
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { giftId, giftCode, claimToken, resend: isResend } = body ?? {};
    if (!giftId && !giftCode) {
      throw new Error("giftId or giftCode is required");
    }

    let query = supabase.from("gift_subscriptions").select("*").limit(1);
    query = giftId ? query.eq("id", giftId) : query.eq("gift_code", giftCode);
    const { data: rows, error: fetchError } = await query;
    if (fetchError || !rows || rows.length === 0) throw new Error("Gift subscription not found");
    const gift = rows[0];

    const deliveryMethod = gift.delivery_method || "recipient_email";
    const isPurchaserCode = deliveryMethod === "purchaser_code";

    if (gift.payment_status !== "paid") throw new Error("Gift not paid yet");
    if (!isPurchaserCode && !claimToken) throw new Error("claimToken is required for recipient-email gifts");

    if (
      !isResend &&
      ((isPurchaserCode && gift.purchaser_email_sent_at) ||
        (!isPurchaserCode && gift.recipient_email_sent_at))
    ) {
      log("Idempotent skip - already sent", { id: gift.id });
      return new Response(JSON.stringify({ skipped: "already_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planLabel =
      (gift.plan_type || "standard").charAt(0).toUpperCase() + (gift.plan_type || "standard").slice(1);
    const claimUrl = isPurchaserCode
      ? `https://getassetsafe.com/gift-claim?code=${encodeURIComponent(gift.gift_code)}`
      : `https://getassetsafe.com/gift-claim?code=${encodeURIComponent(gift.gift_code)}&token=${encodeURIComponent(claimToken)}`;

    let recipientEmailId: string | null = null;
    let purchaserEmailId: string | null = null;
    let lastError: string | null = null;

    if (isPurchaserCode) {
      try {
        const purRes = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [gift.purchaser_email],
          subject: "Your Asset Safe Gift Code is ready",
          html: emailShell(`
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Your Asset Safe Gift Code is ready</h2>
            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Your Asset Safe Gift Code is ready. You can share this code or claim link whenever you're ready. The recipient will use it to claim their one-year Asset Safe gift subscription.
            </p>
            <div style="background: #f8fafc; border: 1px solid #dbeafe; padding: 16px; border-radius: 6px; margin: 0 0 20px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: .04em;">Gift Code</p>
              <p style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0;">${escapeHtml(gift.gift_code)}</p>
            </div>
            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${claimUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Open Claim Link
              </a>
            </div>
            <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li>Send the Gift Code or claim link to your recipient.</li>
              <li>They sign in or create an account.</li>
              <li>Their one-year Asset Safe gift subscription activates when they claim it.</li>
            </ol>
            ${gift.gift_message ? `
              <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${escapeHtml(gift.gift_message)}"</p>
              </div>
            ` : ""}
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
              Gift Codes do not expire unless refunded, cancelled, or manually voided.
            </p>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 16px 0 0;">
              Fallback claim link:<br/>
              <a href="${claimUrl}" style="color: #1e40af; word-break: break-all;">${claimUrl}</a>
            </p>
          `),
          text: `Your Asset Safe Gift Code is ready.

Gift Code: ${gift.gift_code}
Claim Link: ${claimUrl}

Share this code or claim link whenever you're ready. The recipient will use it to claim their one-year Asset Safe gift subscription.

Gift Codes do not expire unless refunded, cancelled, or manually voided.

Questions? Contact support@assetsafe.net.`,
        });
        purchaserEmailId = purRes.data?.id ?? null;
        if (purRes.error) lastError = `purchaser: ${purRes.error.message}`;
        log("Purchaser Gift Code email send result", { id: purchaserEmailId, error: purRes.error });
      } catch (e) {
        lastError = `purchaser_throw: ${(e as Error).message}`;
        log("Purchaser Gift Code email throw", { error: lastError });
      }
    } else {
      try {
        const recRes = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [gift.recipient_email],
          subject: "You've received a gift subscription to Asset Safe!",
          html: emailShell(`
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Received a Gift!</h2>
            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              <strong>${escapeHtml(gift.purchaser_name)}</strong> has gifted you a <strong>${escapeHtml(planLabel)} Plan</strong> subscription to Asset Safe.
            </p>
            ${gift.gift_message ? `
              <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${escapeHtml(gift.gift_message)}"</p>
              </div>
            ` : ""}
            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">How to redeem:</p>
            <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Click the secure button below</li>
              <li>Sign in (or create an account) using <strong>${escapeHtml(gift.recipient_email)}</strong></li>
              <li>Your gift will be applied automatically</li>
            </ol>
            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${claimUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Redeem Your Gift
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              This secure link is unique to you. For your protection, the gift can only be redeemed by ${escapeHtml(gift.recipient_email)}.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This gift subscription is valid for 12 months from activation.
            </p>
          `),
        });
        recipientEmailId = recRes.data?.id ?? null;
        if (recRes.error) lastError = `recipient: ${recRes.error.message}`;
        log("Recipient email send result", { id: recipientEmailId, error: recRes.error });
      } catch (e) {
        lastError = `recipient_throw: ${(e as Error).message}`;
        log("Recipient email throw", { error: lastError });
      }

      if (!isResend && gift.purchaser_email && !gift.purchaser_email_sent_at) {
        try {
          const purRes = await resend.emails.send({
            from: "Asset Safe <noreply@assetsafe.net>",
            to: [gift.purchaser_email],
            subject: `Gift Subscription Sent - ${gift.recipient_email}`,
            html: emailShell(`
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Gift Sent Successfully!</h2>
              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
                Your gift of a <strong>${escapeHtml(planLabel)} Plan</strong> has been delivered to <strong>${escapeHtml(gift.recipient_email)}</strong>.
              </p>
              <p style="color: #374151; line-height: 1.6;">Thank you for giving the gift of Asset Safe!</p>
            `),
          });
          purchaserEmailId = purRes.data?.id ?? null;
          if (purRes.error && !lastError) lastError = `purchaser: ${purRes.error.message}`;
        } catch (e) {
          if (!lastError) lastError = `purchaser_throw: ${(e as Error).message}`;
        }
      }
    }

    const now = new Date().toISOString();
    const sent = isPurchaserCode ? purchaserEmailId !== null : recipientEmailId !== null;
    const updates: Record<string, unknown> = {
      delivery_status: sent ? "sent" : "failed",
      delivery_attempted_at: now,
      last_delivery_error: sent ? null : lastError,
      updated_at: now,
    };
    if (sent) {
      updates.delivered_at = now;
      updates.status = isPurchaserCode ? "active_unclaimed" : "delivered";
      if (isPurchaserCode) {
        updates.purchaser_email_sent_at = now;
        updates.resend_purchaser_email_id = purchaserEmailId;
      } else {
        updates.recipient_email_sent_at = now;
        updates.resend_recipient_email_id = recipientEmailId;
      }
    }
    if (!isPurchaserCode && purchaserEmailId) {
      updates.purchaser_email_sent_at = now;
      updates.resend_purchaser_email_id = purchaserEmailId;
    }

    const { error: updErr } = await supabase
      .from("gift_subscriptions")
      .update(updates)
      .eq("id", gift.id);
    if (updErr) {
      log("Failed to update gift row", updErr);
      return new Response(JSON.stringify({ error: "Gift email was accepted but delivery state could not be saved" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: sent, recipientEmailId, purchaserEmailId, error: sent ? null : lastError }),
      { status: sent ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
